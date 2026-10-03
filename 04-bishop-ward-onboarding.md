# Topic 04 — Bishop & Ward Onboarding (and youth ward membership)
Scope: how a Bishop gets an account tied to a ward, how youth/parents join a ward, and account approval. Keep high-level brainstorming until Bishop Porter weighs in.

## Key principles so far
- **A Bishop doesn't create a ward; a verified Bishop claims/manages an existing ward record.**
- Model: **User → RoleAssignment → OrganizationUnit** (Bishop is just one privileged role; leaves room for counselors, clerks, stake leaders, parents, youth). Avoid `is_bishop=true`.
- **Ward membership is part of the trust model** — the program is interactive with ward leadership and the youth as a group. Nobody joins a ward community just by selecting it; affiliation is authenticated.
- Completing a Key notifies the bishopric and lets them generate a certificate to present, so the system must be confident the youth belongs to that ward.
- Hide complexity from the user: backend complexity ≠ user complexity.

## Proposed building blocks
Ward Directory · User Account · Ward Role/Assignment · Ward Claim · Verification Case (evidence, reviewer, timestamps, decision, re-verification) · Admin Console (pending/conflicting claims, transfers, removals, appeals) · Audit Log.

Bishop lifecycle: Register → Find ward → Request Bishop access → Verify → Approve → Assign role → Configure ward → Invite/approve members.

## Youth/parent ward discovery ideas
- Enter home address (used only for lookup, not displayed) → show 3–4 nearby wards → pick one / "I don't see my ward".
- Ward invite link/code from leadership (likely the common path once a ward is set up).
- Bishop-name search: parked (leadership changes, names not unique).
- Rejected: embedding the Church's ward finder.
- Then: membership pending → bishopric approves.
- Option: let unverified youth start learning content while ward features (notifications, certificates) wait for approval — avoids killing adoption.

## Account approval (from Dave's email to Bishop)
- All new accounts need bishopric approval in an admin section before first login. Extra steps can confirm parental approval first.
- Bishopric accounts need outside validation (e.g., phone calls) confirming the person is real, is the Bishop, and can commit the ward — and again **when the bishopric changes**.
- Email noted these processes need administration by someone the site owner authorizes, ToS language, and legal review; scaling multi-state/national/global is a lot of work.

## Edge cases to design for
Bishop released / new Bishop called · false claims · two people claiming one ward · ward split/merged/renamed/discontinued · picking the wrong "Springfield 2nd Ward" · can't reach anyone to verify · counselor or clerk administering without Bishop-level rights.

## Documentation tracks (keep separate)
1. User-facing docs (how claiming/verification works).
2. Internal SOPs (how admins verify, approve, reject, transfer, revoke, escalate).
3. Legal/policy (ToS, Privacy Policy, Bishop representations, disclaimers) — needs counsel review.

## Biggest open question
Where does an authoritative ward list (with locations) come from, and are we allowed to use/maintain it?
Also for Bishop: a few wards informally, or eventually hundreds/thousands? Limit the beta geographically?

Related: topic 05 (minors), 08 (bishopric account maintenance), 09 (site admins), 10 (governance).
