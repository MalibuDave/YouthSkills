// Shared sign-up rules (topic 11, V1). Used by the browser form and the server.
export const MIN_AGE = 13;
export const ADULT_AGE = 18;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 12;
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Age from birth month/year only. A person counts as having had their birthday
// once the current month reaches their birth month.
export function ageFrom(year, month, now = new Date()) {
  const y = Number(year), m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return null;
  const currentYear = now.getFullYear(), currentMonth = now.getMonth() + 1;
  if (y > currentYear || (y === currentYear && m > currentMonth)) return null;
  return currentYear - y - (currentMonth < m ? 1 : 0);
}

export const ageGroup = age => age === null || age === undefined ? null : age < MIN_AGE ? "under13" : age < ADULT_AGE ? "youth" : "adult";

// Ward-membership states (topic 11 §4) and what the member is told in each.
export const STATUS = {
  unverified: { label: "Verify your email", text: "We sent a verification link to your email. Open it to send your request to your ward." },
  pending: { label: "Waiting for approval", text: "Your request is waiting for approval from {ward}. You'll get an email when your bishopric responds." },
  see_bishopric: { label: "Talk to your bishopric", text: "Your bishopric would like to speak with you before approving your account." },
  wrong_ward: { label: "Choose a different ward", text: "The bishopric of {ward} says you aren't in their ward. Choose the correct ward to send a new request." },
  rejected: { label: "Not approved", text: "Your account was not approved. Please talk to your bishopric." },
  active: { label: "Active", text: "" }
};
