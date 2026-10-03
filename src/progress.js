import { allLessons } from "./data.js";
const STORAGE_KEY = "cy-program-completed-lessons-v1";
const STEPS_KEY = "cy-program-lesson-steps-v1";
const REFLECTIONS_KEY = "cy-program-lesson-reflections-v1";
const BISHOPRIC_KEY = "cy-program-bishopric-notifications-v1";
const COMPLETION_DATES_KEY = "cy-program-lesson-completion-dates-v1";
let accountId=null;
const storageKey=key=>accountId?`${key}-account-${accountId}`:key;
export function setProgressAccount(id,completions=[]) {
  accountId=id||null;
  if(!accountId)return;
  const valid=completions.filter(item=>validIds.has(item.lessonId));
  try {
    localStorage.setItem(storageKey(STORAGE_KEY),JSON.stringify(valid.map(item=>item.lessonId)));
    localStorage.setItem(storageKey(COMPLETION_DATES_KEY),JSON.stringify(Object.fromEntries(valid.map(item=>[item.lessonId,item.completedAt]))));
  } catch {}
}
export function readGuestProgressSnapshot() {
  try {
    const ids=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    const dates=JSON.parse(localStorage.getItem(COMPLETION_DATES_KEY)||"{}");
    return Array.isArray(ids)?ids.filter(id=>validIds.has(id)).map(id=>({lessonId:id,completedAt:dates?.[id]||new Date().toISOString()})):[];
  } catch {return [];}
}
const validIds = new Set(allLessons.map(lesson => lesson.id));
const validKeyIds = new Set(allLessons.map(lesson => lesson.keyId));
export function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(STORAGE_KEY)) || "[]");
    return new Set(Array.isArray(value) ? value.filter(id => validIds.has(id)) : []);
  } catch { return new Set(); }
}
export function markComplete(id) {
  if (!validIds.has(id)) return readProgress();
  const completed = readProgress();
  const wasComplete = completed.has(id);
  completed.add(id);
  try { localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify([...completed])); } catch {}
  if (!wasComplete) {
    try {
      const dates = readCompletionDates();
      dates[id] = new Date().toISOString();
      localStorage.setItem(storageKey(COMPLETION_DATES_KEY), JSON.stringify(dates));
    } catch {}
  }
  return completed;
}
export function readCompletionDates() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(COMPLETION_DATES_KEY)) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export function keyCompletedAt(key,completed) {
  const required = key.lessons.filter(lesson => !lesson.optional);
  if (!required.length || required.some(lesson => !completed.has(lesson.id))) return null;
  const dates = readCompletionDates();
  const timestamps = required.map(lesson => Date.parse(dates[lesson.id]));
  if (timestamps.some(timestamp => !Number.isFinite(timestamp))) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}
export function progressFor(lessons, completed) {
  const required = lessons.filter(lesson => !lesson.optional);
  const done = required.filter(lesson => completed.has(lesson.id)).length;
  return { done, total: required.length, percent: required.length ? Math.round(done / required.length * 100) : 0 };
}
export function readSteps(lesson) {
  const count = lesson.tasks?.length || 0;
  if (!count) return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(STEPS_KEY)) || "{}");
    const saved = value?.[lesson.id];
    return Array.from({length:count},(_,index)=>saved?.[index]===true);
  } catch { return Array(count).fill(false); }
}
export function setStep(lesson,index,checked) {
  if (!lesson.tasks || index < 0 || index >= lesson.tasks.length) return readSteps(lesson);
  const steps = readSteps(lesson);
  steps[index] = checked;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(STEPS_KEY)) || "{}");
    const state = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    state[lesson.id] = steps;
    localStorage.setItem(storageKey(STEPS_KEY),JSON.stringify(state));
  } catch {}
  return steps;
}
export function readReflection(lesson) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(REFLECTIONS_KEY)) || "{}");
    return typeof value?.[lesson.id] === "string" ? value[lesson.id] : "";
  } catch { return ""; }
}
export function setReflection(lesson,text) {
  const reflection = String(text);
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(REFLECTIONS_KEY)) || "{}");
    const state = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    state[lesson.id] = reflection;
    localStorage.setItem(storageKey(REFLECTIONS_KEY),JSON.stringify(state));
  } catch {}
  return reflection;
}
export function readBishopricNotification(keyId) {
  if (!validKeyIds.has(keyId)) return "none";
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(BISHOPRIC_KEY)) || "{}");
    const status = value?.[keyId];
    return status === "confirmed" ? status : "none";
  } catch { return "none"; }
}
export function setBishopricNotification(keyId,status) {
  if (!validKeyIds.has(keyId) || !["none","confirmed"].includes(status)) return;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(BISHOPRIC_KEY)) || "{}");
    const state = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    if(status === "none") delete state[keyId];
    else state[keyId] = status;
    localStorage.setItem(storageKey(BISHOPRIC_KEY),JSON.stringify(state));
  } catch {}
}
