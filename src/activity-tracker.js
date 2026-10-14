// Active learning time (topic 16, DEC-017). While an Active member is on a Key or lesson
// page, one minute is recorded for each minute with recent interaction (click, key, scroll,
// or touch in the last 2 minutes) and the tab visible. Idle or hidden time is not counted.
import { localDay } from "./achievements.js";

const IDLE_MS = 2 * 60 * 1000;
let keyId = null, lastInput = Date.now(), started = false;
const revisited = new Set();
const post = (path, body) => fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" }).catch(() => {});

function start() {
  if (started || typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  started = true;
  for (const name of ["pointerdown", "keydown", "scroll", "touchstart", "input"]) document.addEventListener(name, () => { lastInput = Date.now(); }, { passive: true, capture: true });
  const timer = setInterval(() => {
    if (!keyId || document.visibilityState === "hidden" || Date.now() - lastInput > IDLE_MS) return;
    void post("/api/activity/ping", { keyId, day: localDay() });
  }, 60 * 1000);
  timer?.unref?.();
}

// Called on every render with the Key being viewed (or null) and whether it is earned.
export function trackKey(id, { active, earned } = {}) {
  keyId = active ? id : null;
  if (!keyId) return;
  start(); lastInput = Date.now();
  const today = `${id}:${localDay()}`;
  if (earned && !revisited.has(today)) { revisited.add(today); void post("/api/activity/revisit", { keyId: id, day: localDay() }); }
}
