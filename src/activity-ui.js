// My Activity (topic 16, DEC-017): time, streaks, weekly goals, and exploration from the
// member's recorded learning minutes. Badges are copper hexagons so they never look like Keys.
import { keys } from "./data.js";
import { computeActivity, formatMinutes, keyDates, keyProgress, GROUPS, localDay } from "./achievements.js";
import { keyArt } from "./progress-ui.js";

const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const ICON = {
  clock: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l3 2M9 2h6",
  flame: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z",
  week: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4",
  month: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4M7 14h4M7 17h7",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  back: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"
};
const HEX = "42,4 76,23 76,61 42,80 8,61 8,23";
const shortDate = day => new Date(`${day.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Unearned badges fill from the bottom by their progress and keep a dashed outline.
function hexagon(badge, size = 80) {
  const h = Math.round(84 * Math.max(0, Math.min(1, badge.fraction)) * 10) / 10;
  return `<svg width="${size}" height="${size}" viewBox="0 0 84 84" aria-hidden="true"><svg x="0" y="${84 - h}" width="84" height="${h}" viewBox="0 ${84 - h} 84 ${h}"><polygon points="${HEX}" fill="${badge.earned ? "#A65A2A" : "#DFA77B"}"></polygon></svg><polygon points="${HEX}" fill="none" stroke="${badge.earned ? "#7A3F1A" : "#8E968F"}" stroke-width="3" stroke-dasharray="${badge.earned ? "none" : "5 4"}"></polygon><g transform="translate(24 24) scale(1.5)" fill="none" stroke="${badge.earned ? "#FBF3E6" : "#4A3426"}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[badge.icon]}"></path></g></svg>`;
}
const badgeTile = (badge, sub = badge.sub, size) => `<div class="tc-hex${badge.earned ? "" : " not"}" role="img" aria-label="${escape(badge.name)}: ${badge.earned ? "earned" : `${Math.round(badge.fraction * 100)}% of the way`}">${hexagon(badge, size)}<strong>${escape(badge.name)}</strong><small>${escape(sub)}</small></div>`;

const state = { data: null, loading: false, error: "", year: null, editingGoal: false, viewer: null };
const request = async (path, method = "GET", body) => { const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin", cache: "no-store" }); const result = await response.json(); if (!response.ok) throw Error(result.error || "Request failed."); return result; };
export function resetActivity() { state.data = null; state.error = ""; state.editingGoal = false; }

export function activityPage({ user, completions, rerender, today = localDay() }) {
  if (state.viewer !== user.id) { state.viewer = user.id; state.data = null; state.year = null; }
  if (!state.data && !state.loading && !state.error) { state.loading = true; request("/api/activity").then(data => { state.data = data; }).catch(error => { state.error = error.message; }).finally(() => { state.loading = false; rerender(); }); }
  if (!state.data) return `<div class="tc"><div class="tc-wrap tc-main"><h1 class="tc-h2">${state.error ? "My Activity" : "Loading your activity…"}</h1>${state.error ? `<p class="account-error" role="alert">${escape(state.error)}</p>` : ""}</div></div>`;
  const currentYear = Number(today.slice(0, 4));
  const firstYear = state.data.days.length ? Number(state.data.days[0].day.slice(0, 4)) : currentYear;
  const year = state.year || currentYear;
  const a = computeActivity({ days: state.data.days, completions, revisits: state.data.revisits, goal: state.data.goal, year, today });
  const isCurrent = year === currentYear;
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) => currentYear - i).map(y => `<option value="${y}"${y === year ? " selected" : ""}>${y}</option>`).join("");

  const stat = (icon, value, label) => `<div class="tc-stat-wide"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E6CF7A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[icon]}"></path></svg><div><b>${value}</b><span>${label}</span></div></div>`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const stats = isCurrent
    ? stat("flame", plural(a.current.days, "day"), `Current daily streak · best ${a.best.days}`) + stat("week", plural(a.current.weeks, "week"), `Current weekly streak · best ${a.best.weeks}`) + stat("month", plural(a.current.months, "month"), "Current monthly streak") + stat("clock", formatMinutes(a.total), `Learning time in ${year}`)
    : stat("flame", plural(a.best.days, "day"), `Best daily streak in ${year}`) + stat("week", plural(a.best.weeks, "week"), `Best weekly streak in ${year}`) + stat("month", plural(a.best.months, "month"), `Best monthly streak in ${year}`) + stat("clock", formatMinutes(a.total), `Learning time in ${year}`);

  const recent = a.recent.length ? a.recent.map(b => badgeTile(b, `Earned ${shortDate(b.earnedOn)}`, 88)).join("") : `<p class="tc-empty">Badges you earn appear here.</p>`;
  const upcoming = a.upcoming.length ? a.upcoming.map(b => badgeTile(b, b.toGo, 88)).join("") : `<p class="tc-empty">Keep learning to unlock more badges.</p>`;

  const maxWeek = Math.max(15, ...a.week.map(d => d.minutes || 0));
  const weekBars = a.week.map(d => d.minutes === null ? `<div><b></b><i class="future"></i></div>` : `<div><b>${d.minutes ? `${d.minutes}m` : ""}</b><i class="${d.minutes ? (d.today ? "copper" : "") : "zero"}" style="${d.minutes ? `height:${Math.max(6, Math.round(d.minutes / maxWeek * 110))}px;max-width:48px;width:60%` : ""}"></i></div>`).join("");
  const weekLabels = a.week.map(d => `<span class="${d.today ? "now" : ""}">${d.label}${d.today ? " · today" : ""}</span>`).join("");
  const goalPct = Math.min(100, Math.round(a.weekTotal / a.goal * 100));
  const goalControl = state.editingGoal
    ? `<form class="tc-goal-form" id="goal-form"><label for="goal-minutes">Weekly goal</label><select id="goal-minutes" name="minutes">${state.data.goals.map(m => `<option value="${m}"${m === a.goal ? " selected" : ""}>${m} minutes</option>`).join("")}</select><button class="tc-button solid" type="submit">Save</button><button class="tc-button" type="button" data-cancel-goal>Cancel</button></form>`
    : `<button type="button" class="tc-button" data-edit-goal>Change goal</button>`;
  const thisWeek = isCurrent ? `<section class="tc-card" aria-labelledby="tc-week"><div class="tc-head"><div><h2 class="tc-h2 small" id="tc-week">This week</h2><p class="tc-sub">Weekly goal: ${a.goal} minutes · ${a.weekTotal} of ${a.goal} done${a.weekTotal >= a.goal ? " — goal met!" : ""}</p></div>${goalControl}</div><div class="tc-track tall copper" role="progressbar" aria-label="Weekly goal progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goalPct}"><span style="width:${goalPct}%"></span></div><div class="tc-bars tc-week" style="height:150px">${weekBars}</div><div class="tc-bar-labels tc-week">${weekLabels}</div></section>` : "";

  const section = (title, desc, count, total, rows) => `<section class="tc-section"><div class="tc-section-head"><div><h2 class="tc-h2 small">${title}</h2><p class="tc-sub">${desc}</p></div><span>${count} of ${total} earned</span></div>${rows}</section>`;
  const row = (badges, label) => `<div class="tc-hex-row">${label ? `<h3>${label}</h3>` : ""}<div class="tc-badges">${badges.map(b => badgeTile(b)).join("")}</div></div>`;
  const streakBadges = [...a.streaks.days, ...a.streaks.weeks, ...a.streaks.months];

  // Suggestions: Keys not started yet, and earned Keys worth another look.
  const done = new Set(completions.map(item => item.lessonId)), earned = keyDates(completions);
  const notStarted = keys.filter(key => !keyProgress(key, done).done).slice(0, 2);
  const revisitable = [...earned].sort((a, b) => a[1].localeCompare(b[1])).slice(0, 2).map(([id, at]) => [keys.find(key => key.id === id), at]);
  const groupName = key => GROUPS.find(group => group.keys.includes(key))?.name || "";
  const explore = [...notStarted.map(key => `<a href="#/keys/${encodeURIComponent(key.id)}">${keyArt(key, 44, "none")}<span><b>${escape(key.name)}</b><small>New Key · ${escape(groupName(key))}</small></span></a>`),
    ...revisitable.map(([key, at]) => `<a href="#/keys/${encodeURIComponent(key.id)}">${keyArt(key, 44, "earned")}<span><b>${escape(key.name)}</b><small>Revisit · earned ${shortDate(at)}</small></span></a>`)].join("");

  return `<div class="tc">
<header class="tc-hero"><div class="tc-wrap"><div class="tc-hero-inner" style="align-items:flex-end"><div><p class="tc-eyebrow">${escape(user.firstName)} ${escape(user.lastName)}</p><h1>My Activity</h1></div><div class="tc-select"><label for="activity-year">Year</label><select id="activity-year">${years}</select></div></div><div class="tc-stat-row">${stats}</div></div></header>
<div class="tc-wrap tc-main">
${state.error ? `<p class="account-error" role="alert">${escape(state.error)}</p>` : ""}
<div class="tc-row"><section class="tc-card" aria-labelledby="tc-unlocked"><h2 class="tc-label" id="tc-unlocked">Recently unlocked</h2><div class="tc-badges">${recent}</div></section><section class="tc-card" aria-labelledby="tc-almost"><h2 class="tc-label" id="tc-almost">Almost there</h2><div class="tc-badges">${upcoming}</div></section></div>
${thisWeek}
${section("Learning time", `Time spent working through lessons in ${year}. Time counts only while you're active on a lesson.`, a.counts.time, a.time.length, row(a.time))}
${section("Learning streaks", "Learn on back-to-back days, weeks, or months.", a.counts.streaks, streakBadges.length, row(a.streaks.days, "Days") + row(a.streaks.weeks, "Weeks") + row(a.streaks.months, "Months"))}
${section("Weekly goals", `Reach your weekly time goal (${a.goal} minutes).`, a.counts.goals, a.goals.length, row(a.goals))}
${section("Expand your exploration", "Try new Keys and Groups, and come back to the ones you know.", a.counts.exploration, a.exploration.length, row(a.exploration))}
${explore ? `<section class="tc-card" aria-labelledby="tc-explore"><h2 class="tc-h2 small" id="tc-explore">Keep exploring</h2><p class="tc-sub" style="margin-bottom:20px">Start something new, or go back to a Key you've already earned.</p><div class="tc-explore">${explore}</div></section>` : ""}
</div></div>`;
}

export function bindActivityPage(rerender) {
  if (typeof document.querySelector !== "function") return;
  document.querySelector("#activity-year")?.addEventListener("change", event => { state.year = Number(event.target.value); state.editingGoal = false; rerender(); });
  document.querySelector("[data-edit-goal]")?.addEventListener("click", () => { state.editingGoal = true; rerender(); document.querySelector("#goal-minutes")?.focus(); });
  document.querySelector("[data-cancel-goal]")?.addEventListener("click", () => { state.editingGoal = false; rerender(); });
  document.querySelector("#goal-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    try { const { goal } = await request("/api/activity/goal", "POST", { minutes: Number(new FormData(event.currentTarget).get("minutes")) }); state.data.goal = goal; state.error = ""; } catch (error) { state.error = error.message; }
    state.editingGoal = false; rerender();
  });
}
