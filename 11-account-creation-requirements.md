# Topic 11 — Account Creation Requirements (V1 / pre-alpha)
Scope: sign-up, email verification, ward approval, account states, the bishopric-role request, and how admin accounts come to exist. Captured Oct 2, 2026 from the account-creation working chat.
Related: 04 (ward onboarding), 05 (minors), 08 (bishopric lifecycle), 09 (site admins), 10 (privacy/data map).

---

## 1. V1 decisions
| # | Decision | Notes |
|---|---|---|
| D1 | **No accounts for anyone under 13** in this iteration. | Dave to propose to Bishop Porter. Removes COPPA consent flow for now (topic 05 stays parked). Flag: Church youth programs start the year a child turns 12, so some first-year youth are excluded. |
| D2 | **No parent involvement for ages 13+** (no parent accounts, consent, or linking). | Bishopric approval is the only gate. Youth list a parent's name (§2) as information only. |
| D3 | **Email + password only.** No Google/SSO. | Revisit after alpha. |
| D4 | **Site admin (Super User) cannot be created through the app.** Assigned directly in the database. | No in-app audit trail; record this in `docs/decisions.md`. Later: a logged admin-provisioning script. |
| D5 | **Content admins sign up like any user**, then a site admin raises their privilege. | One account with extra privileges, not a separate admin identity (settles topic 09 open decision). |
| D6 | **Rejection stays simple:** "Wrong ward" vs "Rejected". | Any non-ward rejection follows an in-person conversation with the bishopric, so the site doesn't explain it. |
| D7 | **Profile fields stay editable** while pending/rejected; site content is what's locked. | Replaces the earlier "locked profile" idea. |
| D8 | **Every user must belong to a ward**, including content admins. | Content admins go through normal ward approval before promotion. |
| D9 | **One "Bishopric" role** for bishop, counselors, and clerk in V1. | Separate roles can come later (topic 08). |
| D10 | **No Terms/Privacy acceptance at sign-up** in V1. | Needed before any wider release (topic 10). |
| D11 | **No MFA for admins** in V1. | Topic 09 says mandatory long-term; add before real users/data. |
| D12 | **Password max length 12** for V1. | Note: NIST 800-63B recommends allowing ≥64; revisit after V1. |

---

## 2. Sign-up form
Fields in this order:

| Order | Field | Rules |
|---|---|---|
| 1 | Birth date (month/year) | Asked first. If under 13: stop, show that accounts aren't available yet, **save nothing**. Stored as a date, not an age, so youth (13–17) vs adult (18+) is always computed. |
| 2 | First name | Required |
| 3 | Last name | Required |
| 4 | Parent/guardian names | **Youth 13–17 only.** Parent 1 first + last name **required**; Parent 2 optional. Only rule enforced: at least one parent listed. Names only — no parent email, contact, or account. Shown to the bishopric on the approval page. |
| 5 | Email | Required, unique; must be verified (see §3) |
| 6 | Password | 8–12 characters. Stored hashed. |
| 7 | Ward | Required for every user. Dropdown of a small, hand-seeded list of beta wards. Selecting a ward **requests** membership; it does not grant it. |
| 8 | Request bishopric role | **18+ only.** Checkbox; reveals a phone field for out-of-site verification. Starts the separate bishopric track (§6). |

Also required with passwords:
- **Forgot-password flow** via email reset link.

---

## 3. Email verification
- After sign-up the account is **Unverified**; a verification link is emailed.
- The ward approval request goes to the bishopric only after the email is verified.

---

## 4. Account states (ward membership)
```
Unverified email → Pending → Active
                           → See Bishopric → Active / Rejected
                           → Wrong Ward    → (user picks new ward) Pending
                           → Rejected      → (bishop reverses) Active
```

| State | Meaning | What the youth sees | What the youth can do |
|---|---|---|---|
| Unverified | Email not confirmed | Prompt to verify | Resend verification |
| Pending | Waiting for bishopric | "Waiting for approval from [Ward]" | Edit profile; change ward (moves request to new ward's queue) |
| See Bishopric | Bishopric wants to talk first | "Please talk to your bishopric" | Edit profile |
| Wrong Ward | Bishop says user isn't in this ward | Email + banner; **ward field highlighted** | Pick a new ward → Pending in that ward |
| Rejected | Not approved (handled in person) | "Not approved — please talk to your bishopric" + optional bishop note | Edit profile; **cannot resubmit to the same ward**; may choose another ward |
| Active | Approved member | Full site | Everything |

Rules:
- **Content lock:** Lessons, Keys, and progress are available only when Active.
- **Always available in every state:** edit profile, change password, log out, delete own account.
- **Only the bishopric** can move a Rejected account to Active.
- **Pending expiry:** a request nobody acts on expires after **30 days**.
- **Rejected retention:** Rejected accounts are purged after **30 days** (V1 value; final policy pending — topic 10 data map).

### Notifications (email)
- **Bishopric:** email on every new request in their ward.
- **User:** email on every status change.

---

## 5. Bishopric approval page
```
Pending (n) | See Bishopric (n) | Rejected (n) | Active members
  row: name, age, parent name(s), date requested → Approve / See Bishopric / Wrong Ward / Reject
  Rejected tab: Approve (moves to Active)
```
- **Reject** takes an optional short note shown to the youth. The note is youth account data (visible to the youth and site admins; deleted with the account).
- **History:** every decision records who, what, when, and any note. Needed when a new bishop inherits the queue (topic 08).
- Full bishop tool set is being designed in the bishop profile/tools chat.

---

## 6. Bishopric role request (separate track)
Independent of ward membership; a person can be an Active member while their role request is still open.
```
(none) → Requested → Verified → Granted / Denied
```
- Verified by a site admin using the phone number (out-of-site confirmation that the person is real, is in the bishopric, and can commit the ward).
- Grants the single V1 "Bishopric" role (D9).

---

## 7. Account types & permissions (as drafted)
| Type | How it's created | Permissions (draft) |
|---|---|---|
| Super User (site admin) | Database only | Add/modify/delete content admins, users, bishopric, content, wards |
| Content admin | Normal sign-up + ward approval → promoted by site admin | Add/modify/delete content, wards (see §9) |
| Bishopric | Normal sign-up + verified role request | Approve/reject/manage users in assigned ward |
| User (youth 13–17, adult 18+) | Normal sign-up | Own profile; content once Active |

Requirements:
- Promotion to content admin is logged (who, when, old → new privilege).

---

## 8. Open questions (account creation)
1. **Pending expiry:** what happens at 30 days — account deleted, or user prompted to resubmit?
2. **Rejected retention:** confirm the 30-day purge (V1 placeholder).
3. **Phone number** from the bishopric request: keep or delete after verification?
4. **Profile section** (picture, recent completions) — TBC; picture implies moderation (topic 10).
5. **Parent names when a youth turns 18** — keep or delete? TBC for V1. (Topic 10 data map: collected to help the bishopric identify the youth; visible to youth, bishopric, site admins; deleted with the account.)

## 9. Deferred to other chats (not account creation)
- Active youth who changes wards: keep access during re-approval, or drop to Pending?
- Removing an Active member from a ward (moved away / approved by mistake) — "remove from ward" vs "delete account"; can the bishopric delete accounts at all?
- Should content admins manage wards, or is that a site-admin/support job?

## 10. Out of scope for V1
Under-13 accounts and parental consent · parent accounts/linking (parent names are collected as text only) · SSO · profile pictures · moderation states (Suspended/Removed) · invite codes (ward dropdown used instead) · Terms/Privacy acceptance · admin MFA.
