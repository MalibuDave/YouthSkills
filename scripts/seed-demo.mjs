// Demo data for presentations (DEC-016). Entirely fictional people; emails use the
// reserved example.test domain. Every account's password is DEMO_PASSWORD.
//
//   Maple Grove Ward · 4 bishopric accounts · 50 Active youth with a year of lesson
//   history · 7 more youth in the approval queue (4 Pending, 1 See Bishopric,
//   1 Wrong Ward, 1 Rejected).
//
// The output is deterministic for a given day, and all dates are relative to `now`,
// so the year of history always ends today.
import { rmSync, existsSync } from "node:fs";
import { openAccountDb } from "../src/account-db.js";
import { keys } from "../src/data.js";

export const DEMO_PASSWORD = "carwash1234";
export const DEMO_WARD = "Maple Grove Ward";
const DAY = 86400000;

const BISHOPRIC = [
  ["Robert", "Hale", "bishop@example.test", "Bishop"],
  ["James", "Okafor", "counselor1@example.test", "First Counselor"],
  ["Miguel", "Santos", "counselor2@example.test", "Second Counselor"],
  ["Thomas", "Brennan", "clerk@example.test", "Ward Clerk"]
];
const FIRST = ["Ava","Liam","Emma","Noah","Olivia","Ethan","Sophia","Mason","Isabella","Lucas","Mia","Logan","Amelia","Caleb","Harper","Owen","Evelyn","Wyatt","Abigail","Isaac","Ella","Levi","Scarlett","Eli","Grace","Jonah","Chloe","Gavin","Lily","Hudson","Hannah","Asher","Zoe","Tyler","Nora","Brooks","Ruby","Micah","Leah","Carter","Aria","Landon","Stella","Jace","Naomi","Easton","Hazel","Silas","Clara","Rowan","Ivy","Declan","Maya","Bennett","Elise","Parker"];
const LAST = ["Adams","Bell","Carver","Dalton","Ellis","Fischer","Grant","Hayes","Ingram","Jensen","Keller","Lund","Madsen","Nash","Ortega","Pace","Quinn","Ramos","Sorensen","Tanner","Udall","Vance","Walker","Young","Zamora","Bishop","Christensen","Duran","Erickson","Foley","Gardner","Holt","Iverson","Judd","Kimball","Larsen","Monroe","Nielsen","Olsen","Pratt"];
const PARENT_FIRST = ["Sarah","Michael","Jennifer","David","Rachel","Brian","Amy","Kevin","Melissa","Jason","Heather","Ryan","Megan","Scott","Kristen","Adam","Lindsay","Nathan","Jessica","Mark"];

// Small seeded random generator (mulberry32) so a reset rebuilds the same ward.
function random(seed) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { next, int: (min, max) => min + Math.floor(next() * (max - min + 1)), pick: list => list[Math.floor(next() * list.length)], shuffle: list => { const copy = [...list]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; } };
}

// Afternoon/evening in the Pacific time zone (22:00–04:59 UTC), so activity looks like after-school use.
const atEvening = (rng, day) => { const d = new Date(day); d.setUTCHours(22 + rng.int(0, 6), rng.int(0, 59), rng.int(0, 59), 0); return d; };

// How a youth works through lessons over the year.
const PROFILES = [
  { name: "high", count: 6, lessons: [36, 46] },
  { name: "steady", count: 18, lessons: [18, 32] },
  { name: "bursty", count: 12, lessons: [12, 26] },
  { name: "light", count: 8, lessons: [4, 12] },
  { name: "lapsed", count: 6, lessons: [6, 14] }
];

function completionDays(rng, profile, n, start, end) {
  const span = end - start;
  if (profile === "bursty") {
    const centers = Array.from({ length: rng.int(4, 6) }, () => start + rng.next() * span);
    return Array.from({ length: n }, () => rng.pick(centers) + (rng.next() - 0.5) * 8 * DAY);
  }
  if (profile === "lapsed") return Array.from({ length: n }, () => start + rng.next() * span * 0.4);
  // Steady and high achievers spread out, with a little more activity in recent months.
  return Array.from({ length: n }, () => start + Math.pow(rng.next(), 0.85) * span);
}

export function seedDemo(dbPath, { now = new Date(), reset = true } = {}) {
  if (reset) for (const suffix of ["", "-journal", "-wal", "-shm"]) if (existsSync(dbPath + suffix)) rmSync(dbPath + suffix);
  const accounts = openAccountDb(dbPath);
  const { db } = accounts;
  const today = new Date(now); today.setUTCHours(12, 0, 0, 0);
  const rng = random(Number(today.toISOString().slice(0, 10).replaceAll("-", "")));
  const iso = date => new Date(date).toISOString();
  const yearsAgoBirth = (age, monthBack) => { const d = new Date(today); d.setUTCMonth(d.getUTCMonth() - monthBack); return { birthYear: d.getUTCFullYear() - age, birthMonth: d.getUTCMonth() + 1 }; };

  db.exec("BEGIN");
  try {
    const wardId = Number(db.prepare("INSERT INTO wards(name,address,phone) VALUES(?,?,?)").run(DEMO_WARD, "Prototype location", "(000) 000-0000").lastInsertRowid);
    const event = db.prepare("INSERT INTO membership_events(user_id,ward_id,from_status,to_status,actor_id,note,created_at) VALUES(?,?,?,?,?,?,?)");
    const finish = (id, { status, created, verified, changed }) => db.prepare("UPDATE users SET status=?,created_at=?,email_verified_at=?,status_changed_at=?,verify_token_hash=NULL,verify_expires_at=NULL WHERE id=?").run(status, iso(created), verified ? iso(verified) : null, iso(changed), id);
    const register = input => { const { user } = accounts.register({ password: DEMO_PASSWORD, wardId, ...input }); db.prepare("DELETE FROM membership_events WHERE user_id=?").run(user.id); return user.id; };

    // Bishopric: called and verified before the program started.
    const launch = new Date(today.getTime() - 400 * DAY);
    const leaders = BISHOPRIC.map(([firstName, lastName, email], index) => {
      const id = register({ ...yearsAgoBirth(42 + index * 5, index), firstName, lastName, email, requestBishopric: true, bishopricPhone: `(555) 010-02${index}0` });
      db.prepare("UPDATE users SET role='bishopric',bishopric_request='granted' WHERE id=?").run(id);
      finish(id, { status: "active", created: launch, verified: launch, changed: launch });
      event.run(id, wardId, null, "active", null, "Bishopric role granted by a site admin.", iso(launch));
      return id;
    });
    const approver = () => rng.pick([leaders[0], leaders[0], leaders[1], leaders[2]]);

    // Unique fictional youth names.
    const names = [], used = new Set();
    while (names.length < 57) { const first = FIRST[names.length % FIRST.length], last = rng.pick(LAST), email = `${first}.${last}@example.test`.toLowerCase(); if (!used.has(email)) { used.add(email); names.push([first, last, email]); } }
    const parents = last => { const one = [rng.pick(PARENT_FIRST), last]; return rng.next() < 0.55 ? { parent1First: one[0], parent1Last: one[1], parent2First: rng.pick(PARENT_FIRST), parent2Last: last } : { parent1First: one[0], parent1Last: one[1] }; };

    // Lesson order a youth follows: Keys in a shuffled order, lessons within a Key in sequence.
    const lessonSequence = () => rng.shuffle(keys).flatMap(key => key.lessons.filter(lesson => !lesson.optional || rng.next() < 0.3).map(lesson => lesson.id));
    const record = db.prepare("INSERT INTO lesson_completions(user_id,lesson_id,completed_at) VALUES(?,?,?)");

    // 50 Active youth with a year of history.
    let index = 0;
    const profiles = PROFILES.flatMap(profile => Array(profile.count).fill(profile));
    for (const profile of rng.shuffle(profiles)) {
      const [firstName, lastName, email] = names[index++];
      const id = register({ ...yearsAgoBirth(rng.int(14, 17), rng.int(0, 11)), firstName, lastName, email, ...parents(lastName) });
      const joined = atEvening(rng, today.getTime() - rng.int(366, 395) * DAY);
      const verified = new Date(joined.getTime() + rng.int(5, 90) * 60000);
      const approved = atEvening(rng, verified.getTime() + rng.int(1, 5) * DAY);
      finish(id, { status: "active", created: joined, verified, changed: approved });
      event.run(id, wardId, null, "unverified", id, null, iso(joined));
      event.run(id, wardId, "unverified", "pending", id, null, iso(verified));
      event.run(id, wardId, "pending", "active", approver(), null, iso(approved));
      const start = approved.getTime() + DAY, end = today.getTime() - (profile.name === "light" ? 3 : 0) * DAY;
      const sequence = lessonSequence().slice(0, rng.int(...profile.lessons));
      const dates = completionDays(rng, profile.name, sequence.length, start, end).map(day => Math.min(Math.max(day, start), end)).sort((a, b) => a - b);
      sequence.forEach((lessonId, i) => { const at = atEvening(rng, dates[i]); record.run(id, lessonId, iso(Math.min(at.getTime(), now.getTime() - 60000))); });
    }

    // Newer youth waiting in the approval queue.
    const queue = [
      { status: "pending", daysAgo: 1 }, { status: "pending", daysAgo: 3 }, { status: "pending", daysAgo: 6 }, { status: "pending", daysAgo: 9 },
      { status: "see_bishopric", daysAgo: 12, note: "Let's meet after church on Sunday." },
      { status: "wrong_ward", daysAgo: 8 },
    ];
    for (const item of queue) {
      const [firstName, lastName, email] = names[index++];
      const id = register({ ...yearsAgoBirth(rng.int(13, 16), rng.int(0, 11)), firstName, lastName, email, ...parents(lastName) });
      const joined = atEvening(rng, today.getTime() - item.daysAgo * DAY), verified = new Date(joined.getTime() + 20 * 60000);
      event.run(id, wardId, null, "unverified", id, null, iso(joined));
      event.run(id, wardId, "unverified", "pending", id, null, iso(verified));
      let changed = verified;
      if (item.status !== "pending") { changed = atEvening(rng, joined.getTime() + 2 * DAY); event.run(id, wardId, "pending", item.status, approver(), item.note || null, iso(changed)); }
      finish(id, { status: item.status, created: joined, verified, changed });
    }
    // One rejected request, with the note the youth sees.
    {
      const [firstName, lastName, email] = names[index++];
      const id = register({ ...yearsAgoBirth(15, 4), firstName, lastName, email, ...parents(lastName) });
      const joined = atEvening(rng, today.getTime() - 20 * DAY), verified = new Date(joined.getTime() + 15 * 60000), changed = atEvening(rng, joined.getTime() + 3 * DAY);
      event.run(id, wardId, null, "unverified", id, null, iso(joined));
      event.run(id, wardId, "unverified", "pending", id, null, iso(verified));
      event.run(id, wardId, "pending", "rejected", leaders[0], "Please talk with Bishop Hale before we approve your account.", iso(changed));
      finish(id, { status: "rejected", created: joined, verified, changed });
    }
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); db.close(); throw error; }
  const summary = db.prepare("SELECT status,role,COUNT(*) AS n FROM users GROUP BY status,role ORDER BY role,status").all();
  const lessons = db.prepare("SELECT COUNT(*) AS n FROM lesson_completions").get().n;
  db.close();
  return { summary, lessons };
}
