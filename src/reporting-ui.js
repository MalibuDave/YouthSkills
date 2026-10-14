// Bishopric reporting (topic 07, DEC-017): the ward's last 12 months from real records.
// Layout follows the approved bishopric-reporting mock.
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const state = { data: null, loading: false, error: "", keyView: "month", loginView: "month", period: 12, search: "", open: new Set() };
const request = async path => { const response = await fetch(path, { credentials: "same-origin", cache: "no-store" }); const result = await response.json(); if (!response.ok) throw Error(result.error || "Request failed."); return result; };
const number = value => Number(value).toLocaleString("en-US");
const hours = minutes => minutes === null || minutes === undefined ? "—" : minutes >= 600 ? `${Math.round(minutes / 60)} hours` : `${(minutes / 60).toFixed(1)} hours`;
export function resetReporting() { state.data = null; state.error = ""; }

// A labelled bar chart. `values` may contain null for "no data".
function bars(values, labels, { tone = "green", format = number, height = 170, compact = false } = {}) {
  const max = Math.max(1, ...values.map(v => v || 0));
  const cols = `repeat(${values.length},minmax(${compact ? 18 : 30}px,1fr))`;
  return `<div class="rp-chart" role="img" aria-label="${escape(labels.map((label, i) => `${label}: ${values[i] === null ? "no data" : format(values[i])}`).join(", "))}"><div class="rp-bars" style="grid-template-columns:${cols};height:${height}px">${values.map(v => `<div>${compact ? "" : `<b>${v === null ? "" : format(v)}</b>`}<i class="rp-${tone}${!v ? " rp-zero" : ""}" style="height:${v ? Math.max(4, Math.round(v / max * (height - 28))) : 3}px"></i></div>`).join("")}</div><div class="rp-labels" style="grid-template-columns:${cols}">${labels.map((label, i) => `<span>${compact && i % 3 && i !== labels.length - 1 ? "" : escape(label)}</span>`).join("")}</div></div>`;
}
const toggle = (name, current) => `<div class="rp-toggle" role="group" aria-label="Show by">${["week", "month", "year"].map(view => `<button type="button" data-view="${name}" data-value="${view}" aria-pressed="${current === view}">${view[0].toUpperCase() + view.slice(1)}</button>`).join("")}</div>`;
const series = (data, view, period) => view === "week" ? [data.week, period.weeks.map(w => w.label)] : view === "year" ? [data.year.map(y => y.value), data.year.map(y => y.label)] : [data.month, period.months.map(m => m.label)];

export function reportingPage(rerender) {
  if (!state.data && !state.loading && !state.error) { state.loading = true; request("/api/bishopric/report").then(data => { state.data = data; }).catch(error => { state.error = error.message; }).finally(() => { state.loading = false; rerender(); }); }
  if (!state.data) return `<section class="rp"><h1>${state.error ? "Reporting" : "Loading ward reporting…"}</h1>${state.error ? `<p class="account-error" role="alert">${escape(state.error)}</p>` : ""}</section>`;
  const r = state.data, months = r.period.months.map(m => m.label);
  const first = new Date(`${r.period.months[0].key}-15T12:00:00`), last = new Date(`${r.period.months.at(-1).key}-15T12:00:00`);
  const range = `${first.toLocaleDateString("en-US", { month: "long", year: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  const [keyValues, keyLabels] = series(r.keys, state.keyView, r.period), [loginValues, loginLabels] = series(r.logins, state.loginView, r.period);
  const typeMax = Math.max(1, ...r.groups.types.map(t => t.value));

  // Per-youth table for the chosen period (last 12, 3, or 1 months).
  const take = list => list.slice(-state.period), sum = list => take(list).reduce((a, b) => a + b, 0);
  const weeks = state.period * 52 / 12;
  const people = r.youth.filter(p => p.name.toLowerCase().includes(state.search.toLowerCase()));
  const rows = people.map(p => {
    const minutes = sum(p.months.minutes);
    const detail = state.open.has(p.id) ? `<tr class="rp-detail"><td colspan="7">${p.keyMinutes.length ? `<ul>${p.keyMinutes.map(k => `<li><span>${escape(k.name)}</span><b>${hours(k.minutes)}</b></li>`).join("")}</ul><p>Time per Key covers the full 12 months.</p>` : "No learning time recorded."}</td></tr>` : "";
    return `<tr><th scope="row">${escape(p.name)}</th><td>${p.age}</td><td>${sum(p.months.logins)}</td><td>${(minutes / 60 / weeks).toFixed(1)}</td><td>${sum(p.months.keys)}</td><td>${sum(p.months.groups)}</td><td><button type="button" class="rp-link" data-person="${p.id}" aria-expanded="${state.open.has(p.id)}">${state.open.has(p.id) ? "▾ Hide" : "▸ View"}</button></td></tr>${detail}`;
  }).join("");
  const periodName = { 12: "Last 12 months", 3: "Last 3 months", 1: "Last month" };

  return `<section class="rp">
<p class="eyebrow">${escape(r.ward.name.toUpperCase())} · ${escape(range.toUpperCase())}</p><h1>A year of progress</h1>
<p class="rp-intro">How the youth of ${escape(r.ward.name)} are progressing, so the bishopric can recognize progress and see where support is needed. Every figure comes from the ward's own lesson, activity, sign-in and approval records.</p>
<div class="rp-stats"><div><b>${r.totals.youth}</b><span>Youth in the ward</span><small>Active youth today</small></div><div><b>${number(r.totals.keys)}</b><span>Keys completed</span><small>In the last 12 months</small></div><div><b>${number(r.totals.groups)}</b><span>Groups completed</span><small>All nine Keys in a group</small></div><div><b>${number(r.totals.logins)}</b><span>Youth sign-ins</span><small>In the last 12 months</small></div></div>
<div class="rp-grid two"><article class="rp-card"><div class="rp-head"><div><p class="rp-kicker">COMPLETION TREND</p><h2>Keys completed</h2><p class="rp-muted">By ${state.keyView}.</p></div>${toggle("keys", state.keyView)}</div>${bars(keyValues, keyLabels)}<p class="rp-foot">A Key counts in the period when its final required lesson was finished.</p></article>
<article class="rp-card"><p class="rp-kicker">GROUP MILESTONES</p><h2>Groups completed</h2><p class="rp-muted">${r.totals.groups} group completion${r.totals.groups === 1 ? "" : "s"} in 12 months.</p>${bars(r.groups.month, months, { tone: "gold" })}</article></div>
<article class="rp-card"><p class="rp-kicker">GROUP TYPE</p><h2>What youth completed</h2><p class="rp-muted">Completed groups by type in the last 12 months.</p><div class="rp-types">${r.groups.types.map(t => `<div><span>${escape(t.name)}</span><span class="rp-type-track"><i style="width:${Math.round(t.value / typeMax * 100)}%"></i></span><b>${t.value}</b></div>`).join("")}</div><p class="rp-foot">Sports, Outdoors, Animal Habitats, Crafts and Performing Arts appear once their lessons are added.</p></article>
<div class="rp-grid two"><article class="rp-card"><p class="rp-kicker">KEY DATA</p><h2>Time to complete a Key</h2><p class="rp-big">${hours(r.keyTime.average)}</p><p class="rp-muted">Average active learning time per completed Key, by completion month.</p>${bars(r.keyTime.month.map(v => v === null ? null : Math.round(v / 6) / 10), months, { tone: "pale", format: v => `${v}h`, height: 120 })}</article>
<article class="rp-card"><p class="rp-kicker">GROUP DATA</p><h2>Time to complete a group</h2><p class="rp-big">${hours(r.groupTime.average)}</p><p class="rp-muted">Average active learning time across a completed group's nine Keys.</p>${bars(r.groupTime.month.map(v => v === null ? null : Math.round(v / 60)), months, { tone: "pale", format: v => `${v}h`, height: 120 })}</article></div>
<div class="rp-grid two"><article class="rp-card"><p class="rp-kicker">ACCOUNT DECISIONS</p><h2>New approved accounts</h2><p class="rp-big">${r.approvals.total}</p><p class="rp-muted">Membership requests approved each month.</p>${bars(r.approvals.month, months)}</article>
<article class="rp-card"><p class="rp-kicker">ACCOUNT DECISIONS</p><h2>Rejected requests</h2><p class="rp-big">${r.rejections.total}</p><p class="rp-muted">Requests the bishopric did not approve each month.</p>${bars(r.rejections.month, months, { tone: "gold" })}${r.rejections.notes.length ? `<ul class="rp-notes">${r.rejections.notes.slice(0, 5).map(n => `<li><b>${escape(n.name)}</b> · ${new Date(n.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}${n.note ? ` — “${escape(n.note)}”` : ""}</li>`).join("")}</ul>` : ""}</article></div>
<article class="rp-card"><div class="rp-head"><div><p class="rp-kicker">USER ACTIVITY</p><h2>Sign-ins over time</h2><p class="rp-muted">Youth sign-ins by ${state.loginView}.</p></div>${toggle("logins", state.loginView)}</div>${bars(loginValues, loginLabels)}</article>
<article class="rp-card"><div class="rp-head"><div><p class="rp-kicker">INDIVIDUAL ACTIVITY</p><h2>Ward youth activity</h2><p class="rp-muted">Search a name to see their totals and time spent per Key.</p></div><div class="rp-filters"><label class="rp-visually-hidden" for="rp-period">Period</label><select id="rp-period">${[12, 3, 1].map(n => `<option value="${n}"${n === state.period ? " selected" : ""}>${periodName[n]}</option>`).join("")}</select><label class="rp-visually-hidden" for="rp-search">Search youth</label><input id="rp-search" type="search" placeholder="Search youth" value="${escape(state.search)}"><span>${people.length} of ${r.youth.length} youth</span></div></div>
<div class="rp-table-wrap"><table class="rp-table"><thead><tr><th scope="col">Youth</th><th scope="col">Age</th><th scope="col">Sign-ins</th><th scope="col">Hours/week</th><th scope="col">Keys</th><th scope="col">Groups</th><th scope="col">Time per Key</th></tr></thead><tbody>${rows || `<tr><td colspan="7">No youth match that search.</td></tr>`}</tbody></table></div>
<p class="rp-foot">Hours per week counts active time on lessons only (paused when idle or the tab is hidden), averaged over ${periodName[state.period].toLowerCase()}.</p></article>
</section>`;
}

export function bindReporting(rerender) {
  const root = document.querySelector(".rp"); if (!root) return;
  root.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { state[button.dataset.view === "keys" ? "keyView" : "loginView"] = button.dataset.value; rerender(); }));
  root.querySelector("#rp-period")?.addEventListener("change", event => { state.period = Number(event.target.value); rerender(); });
  root.querySelectorAll("[data-person]").forEach(button => button.addEventListener("click", () => { const id = Number(button.dataset.person); state.open.has(id) ? state.open.delete(id) : state.open.add(id); rerender(); }));
  const search = root.querySelector("#rp-search");
  search?.addEventListener("input", () => { state.search = search.value; const at = search.selectionStart; rerender(); const again = document.querySelector("#rp-search"); again?.focus(); again?.setSelectionRange(at, at); });
}
