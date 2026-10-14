// Shared rules for the Progress page, My Activity, and Bishopric reporting (DEC-017).
// Pure functions: the same inputs always give the same badges, streaks, and counts.
import { keys, groups } from "./data.js";

// Groups that can be explored and completed (not the "Additional Keys" shelf).
export const GROUPS = groups.filter(group => group.kind !== "additional");
// A group is complete when every badge on its poster has a Key and all are earned.
const completable = group => group.keys.length === group.size;
export const required = key => key.lessons.filter(lesson => !lesson.optional);

// Completion date of each earned Key: the latest of its required lessons.
export function keyDates(completions) {
  const dates = new Map(completions.map(item => [item.lessonId, item.completedAt]));
  const out = new Map();
  for (const key of keys) {
    const lessons = required(key);
    if (lessons.length && lessons.every(lesson => dates.has(lesson.id))) out.set(key.id, lessons.map(lesson => dates.get(lesson.id)).sort().at(-1));
  }
  return out;
}
export function groupDates(earned) {
  const out = new Map();
  for (const group of GROUPS) if (completable(group) && group.keys.every(key => earned.has(key.id))) out.set(group.id, group.keys.map(key => earned.get(key.id)).sort().at(-1));
  return out;
}
export const keyProgress = (key, done) => { const lessons = required(key); const count = lessons.filter(lesson => done.has(lesson.id)).length; return { done: count, total: lessons.length, fraction: lessons.length ? count / lessons.length : 0 }; };

// ---- Calendar helpers on local "YYYY-MM-DD" days --------------------------------------
export const localDay = (date = new Date()) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const toDate = day => new Date(`${day}T12:00:00`);
export const addDays = (day, n) => { const d = toDate(day); d.setDate(d.getDate() + n); return localDay(d); };
export const weekStart = day => { const d = toDate(day); d.setDate(d.getDate() - d.getDay()); return localDay(d); }; // weeks run Sunday–Saturday
const monthOf = day => day.slice(0, 7);
const prevMonth = month => { const [y, m] = month.split("-").map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`; };
const nextMonth = month => { const [y, m] = month.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; };

// Longest and current runs of consecutive periods. `active` is a sorted list of period
// keys. `reachedAt` maps a run length n to the first period at which any run reached n.
// A run is current if it includes this period or the one before (today may not be done yet).
function runs(active, prev, next, current) {
  const set = new Set(active), reachedAt = new Map();
  let best = 0;
  for (const start of active) {
    if (set.has(prev(start))) continue;
    let length = 0;
    for (let p = start; set.has(p); p = next(p)) { length++; if (!reachedAt.has(length) || p < reachedAt.get(length)) reachedAt.set(length, p); }
    best = Math.max(best, length);
  }
  let now = 0;
  for (let p = set.has(current) ? current : prev(current); set.has(p); p = prev(p)) now++;
  return { best, current: now, reachedAt };
}
const DAYS = [day => addDays(day, -1), day => addDays(day, 1)], WEEKS = [week => addDays(week, -7), week => addDays(week, 7)], MONTHS = [prevMonth, nextMonth];

const TIME_BADGES = [["First Steps", 5], ["Settling In", 30], ["Committed", 120], ["Steady Climber", 300], ["Trail Regular", 600], ["Seasoned", 900], ["Summit Seeker", 1500], ["Mountain Mover", 3000]];
const STREAKS = { days: [2, 5, 10, 20], weeks: [2, 4, 8, 12], months: [2, 3, 6, 12] };
const GOAL_BADGES = [1, 5, 15];
export const formatMinutes = minutes => { const h = Math.floor(minutes / 60), m = Math.round(minutes % 60); return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m} min`; };
const hoursLabel = minutes => minutes >= 60 ? `${minutes / 60} hr${minutes > 60 ? "s" : ""}` : `${minutes} min`;

// Everything on the My Activity page for one member and one calendar year.
export function computeActivity({ days, completions, revisits, goal, year, today = localDay() }) {
  const minutesByDay = new Map(days.map(item => [item.day, item.minutes]));
  const isCurrentYear = Number(today.slice(0, 4)) === year;
  const inYear = day => day.startsWith(`${year}-`) && day <= today;
  const yearDays = days.filter(item => inYear(item.day) && item.minutes > 0).map(item => item.day).sort();
  const reference = isCurrentYear ? today : `${year}-12-31`;
  const total = yearDays.reduce((sum, day) => sum + minutesByDay.get(day), 0);

  const daily = runs(yearDays, ...DAYS, reference);
  const weeks = [...new Set(yearDays.map(weekStart))].sort();
  const weekly = runs(weeks, ...WEEKS, weekStart(reference));
  const months = [...new Set(yearDays.map(monthOf))].sort();
  const monthly = runs(months, ...MONTHS, monthOf(reference));
  const current = { days: isCurrentYear ? daily.current : 0, weeks: isCurrentYear ? weekly.current : 0, months: isCurrentYear ? monthly.current : 0 };
  const best = { days: daily.best, weeks: weekly.best, months: monthly.best };

  // Weekly minutes and goal weeks within the year.
  const weekMinutes = new Map();
  for (const day of yearDays) weekMinutes.set(weekStart(day), (weekMinutes.get(weekStart(day)) || 0) + minutesByDay.get(day));
  const goalWeeks = [...weekMinutes].filter(([, minutes]) => minutes >= goal).map(([week]) => week).sort();

  const badge = (name, sub, icon, fraction, earnedOn, toGo) => ({ name, sub, icon, fraction: earnedOn ? 1 : Math.min(fraction, 0.99), earned: Boolean(earnedOn), earnedOn: earnedOn || null, toGo });
  // Learning time: date the running total crossed each threshold.
  let running = 0; const crossed = new Map();
  for (const day of yearDays) { running += minutesByDay.get(day); for (const [, need] of TIME_BADGES) if (running >= need && !crossed.has(need)) crossed.set(need, day); }
  const time = TIME_BADGES.map(([name, need]) => badge(name, crossed.has(need) ? hoursLabel(need) : `${hoursLabel(need)} · ${formatMinutes(total)} so far`, "clock", total / need, crossed.get(need), `${formatMinutes(need - total)} to go`));

  const streakRow = (unit, run, label, icon) => STREAKS[unit].map(n => {
    const reached = run.reachedAt.get(n), at = reached ? (unit === "days" ? reached : unit === "weeks" ? addDays(reached, 6) : `${reached}-28`) : null;
    const sub = at ? "Earned" : isCurrentYear ? `Now: ${current[unit]}${best[unit] > current[unit] ? ` · best ${best[unit]}` : ""}` : `Best: ${best[unit]}`;
    return badge(`${n} ${label} in a Row`, sub, icon, (isCurrentYear ? current[unit] : best[unit]) / n, at && at <= today ? at : at ? today : null, `${n - (isCurrentYear ? current[unit] : best[unit])} more ${label.toLowerCase()}`);
  });
  const streaks = { days: streakRow("days", daily, "Days", "flame"), weeks: streakRow("weeks", weekly, "Weeks", "week"), months: streakRow("months", monthly, "Months", "month") };

  const goals = GOAL_BADGES.map(n => badge(`Goal Met ${n}x`, goalWeeks.length >= n ? "Weekly goal" : `${goalWeeks.length} of ${n}`, "target", goalWeeks.length / n, goalWeeks[n - 1] ? addDays(goalWeeks[n - 1], 6) : null, `${n - goalWeeks.length} more goal week${n - goalWeeks.length === 1 ? "" : "s"}`));

  // Exploration (lifetime): started and earned Keys across Groups, and revisits.
  const ordered = [...completions].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const groupOf = new Map(GROUPS.flatMap(group => group.keys.map(key => [key.id, group.id])));
  const lessonKey = new Map(keys.flatMap(key => key.lessons.map(lesson => [lesson.id, key.id])));
  const startedGroups = new Map(), startedKeys = new Map();
  for (const item of ordered) { const keyId = lessonKey.get(item.lessonId); if (!keyId) continue; if (!startedKeys.has(keyId)) startedKeys.set(keyId, item.completedAt.slice(0, 10)); const g = groupOf.get(keyId); if (!startedGroups.has(g)) startedGroups.set(g, item.completedAt.slice(0, 10)); }
  const earned = keyDates(completions), earnedGroups = new Map();
  for (const [keyId, at] of [...earned].sort((a, b) => a[1].localeCompare(b[1]))) { const g = groupOf.get(keyId); if (!earnedGroups.has(g)) earnedGroups.set(g, at.slice(0, 10)); }
  const revisited = [...new Map(revisits.filter(item => earned.has(item.keyId)).map(item => [item.keyId, item.day])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const nth = (map, n) => [...map.values()].sort()[n - 1] || null;
  const groupCount = GROUPS.length;
  startedGroups.delete(undefined); earnedGroups.delete(undefined); // Additional Keys don't belong to a group
  const exploration = [
    badge("Trailblazer", "Start a Key in a second Group", "compass", startedGroups.size / 2, nth(startedGroups, 2), "Start a Key in another Group"),
    badge("Explorer", `Start Keys in 3 Groups · ${Math.min(startedGroups.size, 3)} of 3`, "compass", startedGroups.size / 3, nth(startedGroups, 3), `Start a Key in ${3 - startedGroups.size} more Group${3 - startedGroups.size === 1 ? "" : "s"}`),
    badge("Well Rounded", `Earn a Key in every Group · ${earnedGroups.size} of ${groupCount}`, "compass", earnedGroups.size / groupCount, earnedGroups.size >= groupCount ? nth(earnedGroups, groupCount) : null, `Earn a Key in ${groupCount - earnedGroups.size} more Group`),
    badge("Second Look", "Revisit an earned Key", "back", revisited.length, revisited[0]?.[1] || null, "Revisit an earned Key"),
    badge("Return Trip", `Revisit 3 earned Keys · ${Math.min(revisited.length, 3)} of 3`, "back", revisited.length / 3, revisited[2]?.[1] || null, `Revisit ${3 - revisited.length} more earned Key${3 - revisited.length === 1 ? "" : "s"}`)
  ];

  const all = [...time, ...streaks.days, ...streaks.weeks, ...streaks.months, ...goals, ...exploration];
  const recent = all.filter(item => item.earned && (item.earnedOn.startsWith(`${year}-`) || exploration.includes(item))).sort((a, b) => b.earnedOn.localeCompare(a.earnedOn)).slice(0, 3);
  const upcoming = all.filter(item => !item.earned && item.fraction > 0).sort((a, b) => b.fraction - a.fraction).slice(0, 3);

  // This week (Sunday–Saturday) for the current year.
  const thisWeek = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => { const day = addDays(thisWeek, i); return { day, label: toDate(day).toLocaleDateString("en-US", { weekday: "short" }), minutes: day > today ? null : minutesByDay.get(day) || 0, today: day === today }; });
  const weekTotal = week.reduce((sum, item) => sum + (item.minutes || 0), 0);

  return { year, total, current, best, streaks, time, goals, exploration, recent, upcoming, week, weekTotal, goal, goalWeeks: goalWeeks.length, counts: { time: time.filter(b => b.earned).length, streaks: [...streaks.days, ...streaks.weeks, ...streaks.months].filter(b => b.earned).length, goals: goals.filter(b => b.earned).length, exploration: exploration.filter(b => b.earned).length } };
}
