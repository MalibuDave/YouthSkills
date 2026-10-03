# Topic 08 — Bishopric Account Creation & Maintenance
Scope: the full lifecycle of bishopric accounts. Extension of topic 04.

## Lifecycle to design
How a bishopric member is verified → who authorizes the account → how it's tied to the correct ward → what permissions it gets → what happens when a calling changes → periodic revalidation → suspension/removal.

## Key principle
Separate **identity verification** ("this is John Smith") from **authorization** ("John Smith is currently authorized to administer Ward X"). Designing around this early prevents permission and lifecycle problems.

## Known requirements so far
- Verification needs something outside the website (e.g., phone call) to confirm the person is real, is the Bishop, and can commit the ward.
- Must re-run when the bishopric changes: reduce/remove the old Bishop's authority, verify the new one, transfer ward administration, preserve youth/progress records.
- Counselors/clerks may administer the program without Bishop-level authority (roles, not a single "bishop" flag).
- Keep separate from: under-13 onboarding, youth/adult accounts, moderation, data deletion, Key completion.

## Open questions
- Who on the platform side performs verification (ties to topic 09)?
- How often is revalidation needed, and what triggers it?
- What happens to pending youth approvals during a leadership change?
