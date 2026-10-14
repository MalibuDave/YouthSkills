// Bishopric reporting (topic 07, DEC-017): the ward's last N months, from real records.
// Every figure here is derived from lesson completions, activity minutes, sign-ins, and
// membership decisions for one ward. Nothing is estimated.
import { keys } from "./data.js";
import { GROUPS, keyDates, groupDates, localDay, addDays, weekStart } from "./achievements.js";
import { ageFrom } from "./account-rules.js";

const monthKey = date => localDay(date).slice(0, 7);
const monthLabel = month => new Date(`${month}-15T12:00:00`).toLocaleDateString("en-US", { month: "short" });

export function wardReport(db, wardId, { months = 12, now = new Date() } = {}) {
  const ward = db.prepare("SELECT id,name FROM wards WHERE id=?").get(wardId);
  // Month buckets ending with the current month, and the last 12 Sunday-start weeks.
  const monthList = []; { const d = new Date(now); d.setDate(15); for (let i = months - 1; i >= 0; i--) { const m = new Date(d); m.setMonth(d.getMonth() - i); monthList.push(monthKey(m)); } }
  const today = localDay(now), weekList = Array.from({ length: 12 }, (_, i) => addDays(weekStart(today), -7 * (11 - i)));
  const from = `${monthList[0]}-01`;
  const mIndex = new Map(monthList.map((m, i) => [m, i])), wIndex = new Map(weekList.map((w, i) => [w, i]));
  const bucket = () => Array(months).fill(0), weekBucket = () => Array(12).fill(0), years = new Map();
  const addTo = (series, iso) => { const day = localDay(new Date(iso)), m = mIndex.get(day.slice(0, 7)), w = wIndex.get(weekStart(day)); if (m !== undefined) series.month[m]++; if (w !== undefined) series.week[w]++; if (day >= from) series.year.set(day.slice(0, 4), (series.year.get(day.slice(0, 4)) || 0) + 1); return m; };
  const series = () => ({ month: bucket(), week: weekBucket(), year: new Map() });

  const youth = db.prepare("SELECT id,first_name AS firstName,last_name AS lastName,birth_year AS birthYear,birth_month AS birthMonth FROM users WHERE ward_id=? AND role='member' AND status='active' ORDER BY last_name,first_name").all(wardId)
    .map(row => ({ ...row, age: ageFrom(row.birthYear, row.birthMonth, now) })).filter(row => row.age !== null && row.age < 18);
  const completionsOf = db.prepare("SELECT lesson_id AS lessonId,completed_at AS completedAt FROM lesson_completions WHERE user_id=?");
  const minutesOf = db.prepare("SELECT day,key_id AS keyId,minutes FROM activity_minutes WHERE user_id=?");
  const loginsOf = db.prepare("SELECT at FROM logins WHERE user_id=?");
  const keyName = new Map(keys.map(key => [key.id, key.name]));

  const keySeries = series(), groupSeries = series(), loginSeries = series();
  const groupTypes = new Map(GROUPS.map(group => [group.id, 0]));
  const keyTimes = [], groupTimes = [];
  const people = youth.map(person => {
    const completions = completionsOf.all(person.id), activity = minutesOf.all(person.id);
    const stats = { logins: bucket(), minutes: bucket(), keys: bucket(), groups: bucket() };
    for (const { at } of loginsOf.all(person.id)) { const m = addTo(loginSeries, at); if (m !== undefined) stats.logins[m]++; }
    for (const item of activity) { const m = mIndex.get(item.day.slice(0, 7)); if (m !== undefined) stats.minutes[m] += item.minutes; }
    const minutesForKey = (keyId, until) => activity.filter(item => item.keyId === keyId && item.day <= until).reduce((sum, item) => sum + item.minutes, 0);
    const earned = keyDates(completions);
    for (const [keyId, at] of earned) {
      const m = addTo(keySeries, at); if (m === undefined) continue;
      stats.keys[m]++;
      keyTimes.push({ month: m, minutes: minutesForKey(keyId, localDay(new Date(at))) });
    }
    for (const [groupId, at] of groupDates(earned)) {
      const m = addTo(groupSeries, at); if (m === undefined) continue;
      stats.groups[m]++; groupTypes.set(groupId, groupTypes.get(groupId) + 1);
      const group = GROUPS.find(item => item.id === groupId);
      groupTimes.push({ month: m, minutes: group.keys.reduce((sum, key) => sum + minutesForKey(key.id, localDay(new Date(at))), 0) });
    }
    const keyMinutes = new Map();
    for (const item of activity) if (item.keyId && item.day >= from) keyMinutes.set(item.keyId, (keyMinutes.get(item.keyId) || 0) + item.minutes);
    return { id: person.id, name: `${person.firstName} ${person.lastName}`, age: person.age, months: stats,
      keyMinutes: [...keyMinutes].map(([keyId, minutes]) => ({ keyId, name: keyName.get(keyId) || keyId, minutes })).sort((a, b) => b.minutes - a.minutes) };
  });

  const average = (items, m) => { const list = m === undefined ? items : items.filter(item => item.month === m); return list.length ? Math.round(list.reduce((sum, item) => sum + item.minutes, 0) / list.length) : null; };
  const decisions = db.prepare(`SELECT e.to_status AS status,e.from_status AS fromStatus,e.note,e.created_at AS at,u.first_name||' '||u.last_name AS name
    FROM membership_events e JOIN users u ON u.id=e.user_id WHERE e.ward_id=? AND u.role!='bishopric' AND e.to_status IN ('active','rejected') AND e.created_at>=?`).all(wardId, new Date(`${from}T00:00:00`).toISOString());
  const approvals = bucket(), rejections = bucket(), notes = [];
  for (const item of decisions) { const m = mIndex.get(monthKey(new Date(item.at))); if (m === undefined) continue; if (item.status === "active") approvals[m]++; else { rejections[m]++; notes.push({ name: item.name, note: item.note, at: item.at }); } }
  const sum = list => list.reduce((a, b) => a + b, 0);
  const asYears = map => [...map].sort().map(([label, value]) => ({ label, value }));

  return {
    ward: { id: ward.id, name: ward.name },
    period: { from, to: today, months: monthList.map(month => ({ key: month, label: monthLabel(month) })), weeks: weekList.map(week => ({ key: week, label: new Date(`${week}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) })) },
    totals: { youth: people.length, keys: sum(keySeries.month), groups: sum(groupSeries.month), logins: sum(loginSeries.month) },
    keys: { month: keySeries.month, week: keySeries.week, year: asYears(keySeries.year) },
    groups: { month: groupSeries.month, types: GROUPS.map(group => ({ name: group.name, value: groupTypes.get(group.id) })) },
    keyTime: { average: average(keyTimes), month: monthList.map((_, m) => average(keyTimes, m)) },
    groupTime: { average: average(groupTimes), month: monthList.map((_, m) => average(groupTimes, m)) },
    approvals: { total: sum(approvals), month: approvals },
    rejections: { total: sum(rejections), month: rejections, notes: notes.sort((a, b) => b.at.localeCompare(a.at)) },
    logins: { month: loginSeries.month, week: loginSeries.week, year: asYears(loginSeries.year) },
    youth: people
  };
}
