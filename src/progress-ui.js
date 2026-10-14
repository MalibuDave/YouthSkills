// My progress (topic 15, DEC-017): the Trophy Case design on the member's own lesson history.
import { keys, groups } from "./data.js";
import { keyDates, groupDates, keyProgress } from "./achievements.js";

const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(new Date(iso).getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) });
const keyUrl = key => `#/keys/${encodeURIComponent(key.id)}`;
const sheet = key => key.icon.sheet === 1 ? "covenantyouthprogram3/Group 1 - Required CK" : "group-posters/Group 2 Required CK";

// The Key's own artwork, cropped from its group poster, inside an earned / in-progress / not-started ring.
export function keyArt(key, size, state) {
  const inner = size - (state === "earned" ? 8 : 6);
  if (key.icon.image) return `<span class="tc-ring ${state}" style="width:${size}px;height:${size}px"><img class="tc-art" src="${key.icon.image}" alt="" aria-hidden="true" loading="lazy" style="width:${inner}px;height:${inner}px"></span>`;
  return `<span class="tc-ring ${state}" style="width:${size}px;height:${size}px"><span class="tc-art" aria-hidden="true" style="width:${inner}px;height:${inner}px;--sheet:url('../${sheet(key)}.png');--col:${key.icon.col};--row:${key.icon.row};--k:${(inner / 96).toFixed(4)};--h:${inner / 2}px"></span></span>`;
}

let metric = "keys";
export function progressPageView({ user, completions, now = new Date() }) {
  const year = now.getFullYear(), thisMonth = now.getMonth();
  const done = new Set(completions.map(item => item.lessonId));
  const earned = keyDates(completions), completedGroups = groupDates(earned);
  const stateOf = key => earned.has(key.id) ? "earned" : keyProgress(key, done).done ? "progress" : "none";
  const inProgress = keys.filter(key => stateOf(key) === "progress");
  const lessonsThisYear = completions.filter(item => new Date(item.completedAt).getFullYear() === year);
  const keysThisYear = [...earned].filter(([, at]) => new Date(at).getFullYear() === year).sort((a, b) => a[1].localeCompare(b[1]));
  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

  const recent = [...earned].sort((a, b) => b[1].localeCompare(a[1])).slice(0, 3).map(([id, at]) => { const key = keys.find(item => item.id === id); return `<a class="tc-badge" href="${keyUrl(key)}">${keyArt(key, 92, "earned")}<strong>${escape(key.name)}</strong><small>Earned ${shortDate(at)}</small></a>`; }).join("");
  const next = inProgress.map(key => ({ key, ...keyProgress(key, done) })).sort((a, b) => b.fraction - a.fraction || a.total - b.total).slice(0, 3)
    .map(item => `<a class="tc-next" href="${keyUrl(item.key)}">${keyArt(item.key, 60, "progress")}<div><div class="tc-next-top"><strong>${escape(item.key.name)}</strong><span>${item.done} of ${item.total} lessons</span></div><div class="tc-track" role="progressbar" aria-label="${escape(item.key.name)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(item.fraction * 100)}"><span style="width:${Math.round(item.fraction * 100)}%"></span></div></div></a>`).join("");

  // Month-by-month for the calendar year.
  const keyMonths = Array(12).fill(0), lessonMonths = Array(12).fill(0);
  for (const [, at] of keysThisYear) keyMonths[new Date(at).getMonth()]++;
  for (const item of lessonsThisYear) lessonMonths[new Date(item.completedAt).getMonth()]++;
  const values = metric === "keys" ? keyMonths : lessonMonths, max = Math.max(1, ...values);
  const bars = values.map((value, i) => i > thisMonth ? `<div><b></b><i class="future"></i></div>` : `<div><b>${value}</b><i class="${value === 0 ? "zero" : i === thisMonth ? "now" : ""}" style="${value ? `height:${Math.round(value / max * 150)}px` : ""}"></i></div>`).join("");
  const labels = MONTHS.map((label, i) => `<span class="${i === thisMonth ? "now" : ""}">${label}</span>`).join("");
  const busiest = lessonMonths.indexOf(Math.max(...lessonMonths));
  const firstKey = keysThisYear[0] && keys.find(item => item.id === keysThisYear[0][0]);

  const groupCards = groups.filter(group => group.keys.length).map(group => {
    const count = group.keys.filter(key => earned.has(key.id)).length;
    const badges = group.keys.map(key => { const state = stateOf(key), p = keyProgress(key, done); return `<a class="tc-badge" href="${keyUrl(key)}" aria-label="${escape(key.name)}, ${state === "earned" ? "earned" : state === "progress" ? `in progress, ${p.done} of ${p.total} lessons` : "not started"}">${keyArt(key, 84, state)}<strong${state === "none" ? ' style="color:#4A524C"' : ""}>${escape(key.name)}</strong><small>${state === "earned" ? "Earned" : state === "progress" ? `In progress · ${p.done}/${p.total}` : "Not started"}</small></a>`; }).join("");
    return `<div class="tc-card"><div class="tc-group-head"><h3>${escape(group.name)}</h3><span>${count} of ${group.keys.length} Keys earned${completedGroups.has(group.id) ? ` · Group complete ${shortDate(completedGroups.get(group.id))}` : ""}${group.size && group.keys.length < group.size ? ` · ${group.size - group.keys.length} more coming` : ""}</span></div><div class="tc-badges">${badges}</div></div>`;
  }).join("");

  // Milestones: small markers, never styled like Keys.
  const allEarned = [...earned.values()].sort();
  const byYear = new Map(); for (const at of allEarned) { const y = new Date(at).getFullYear(); byYear.set(y, [...(byYear.get(y) || []), at]); }
  const fiveInYear = [...byYear.values()].map(list => list[4]).filter(Boolean).sort()[0];
  const lessonMonthKeys = [...new Set(completions.map(item => item.completedAt.slice(0, 7)))].sort();
  let threeMonths = null; for (let i = 2; i < lessonMonthKeys.length && !threeMonths; i++) { const [a, b, c] = lessonMonthKeys.slice(i - 2, i + 1).map(m => { const [y, mo] = m.split("-").map(Number); return y * 12 + mo; }); if (b === a + 1 && c === b + 1) threeMonths = `${lessonMonthKeys[i]}-15`; }
  const firstGroup = [...completedGroups.values()].sort()[0];
  const milestone = (name, at) => at ? `<div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F3D2B" stroke-width="2" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg><span><b>${name}</b><small>${new Date(at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</small></span></div>` : `<div class="not"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E968F" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg><span><b>${name}</b><small>Not yet</small></span></div>`;

  return `<div class="tc">
<header class="tc-hero"><div class="tc-wrap tc-hero-inner"><div class="tc-person"><div class="tc-avatar">${user.photoData ? `<img src="${escape(user.photoData)}" alt="">` : escape(initials)}</div><div><p class="tc-eyebrow">My Trophy Case</p><h1>${escape(user.firstName)} ${escape(user.lastName)}</h1><div class="tc-hero-sub">${escape(user.wardName)} · ${user.age !== null && user.age !== undefined && user.age < 18 ? "Youth" : "Adult"}</div></div></div>
<div class="tc-stats"><div class="tc-stat"><b class="gold">${earned.size}</b><span>Keys earned</span></div><div class="tc-stat"><b>${inProgress.length}</b><span>In progress</span></div><div class="tc-stat"><b>${lessonsThisYear.length}</b><span>Lessons in ${year}</span></div></div></div></header>
<div class="tc-wrap tc-main">
<p class="tc-note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>Your dates and timeline are visible only to you and your bishopric.</p>
<div class="tc-row" style="margin-top:-16px"><section class="tc-card" aria-labelledby="tc-recent"><h2 class="tc-label" id="tc-recent">Recently earned</h2>${recent ? `<div class="tc-badges">${recent}</div>` : `<p class="tc-empty">Finish every lesson in a Key to earn it.</p>`}</section>
<section class="tc-card" aria-labelledby="tc-next"><h2 class="tc-label" id="tc-next">Up next</h2>${next ? `<div class="tc-next-list">${next}</div>` : `<p class="tc-empty">Start a Key from Groups or Keys.</p>`}</section></div>
<section class="tc-card" aria-labelledby="tc-year"><div class="tc-head"><div><h2 class="tc-h2" id="tc-year">Your ${year}</h2><p class="tc-sub">${metric === "keys" ? "Keys earned" : "Lessons completed"} each month. ${LONG[thisMonth]} so far is highlighted.</p></div><div class="tc-toggle" role="group" aria-label="Show"><button type="button" data-metric="keys" aria-pressed="${metric === "keys"}">Keys earned</button><button type="button" data-metric="lessons" aria-pressed="${metric === "lessons"}">Lessons completed</button></div></div>
<div class="tc-chart"><div class="tc-bars" style="grid-template-columns:repeat(12,minmax(44px,1fr));height:200px;min-width:600px">${bars}</div><div class="tc-bar-labels" style="grid-template-columns:repeat(12,minmax(44px,1fr));min-width:600px">${labels}</div></div>
<div class="tc-review"><div><span>Keys this year</span><b>${keysThisYear.length}</b></div><div><span>Lessons this year</span><b>${lessonsThisYear.length}</b></div><div><span>Most active month</span><b>${lessonsThisYear.length ? LONG[busiest] : "—"}</b></div><div><span>First Key of the year</span><b>${firstKey ? escape(firstKey.name) : "—"}</b></div></div></section>
<section aria-labelledby="tc-all" style="display:flex;flex-direction:column;gap:24px"><div class="tc-head" style="margin:0"><h2 class="tc-h2" id="tc-all">All Keys</h2><div class="tc-legend"><span><i class="e"></i>Earned</span><span><i class="p"></i>In progress</span><span><i class="n"></i>Not started</span></div></div>${groupCards}
</section>
<section aria-labelledby="tc-milestones"><h2 class="tc-h2" id="tc-milestones">Milestones</h2><p class="tc-sub" style="margin-bottom:16px">Small markers along the way. Keys are the real achievement.</p><div class="tc-milestones">${milestone("First Key earned", allEarned[0])}${milestone("5 Keys in a year", fiveInYear)}${milestone("Lessons 3 months in a row", threeMonths)}${milestone("First Group complete", firstGroup)}</div></section>
</div></div>`;
}
export function bindProgressPage(rerender) {
  if (typeof document.querySelectorAll !== "function") return;
  document.querySelectorAll(".tc [data-metric]").forEach(button => button.addEventListener("click", () => { metric = button.dataset.metric; rerender(); }));
}
