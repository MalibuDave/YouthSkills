# Topic 10 — Governance, Moderation & Privacy
Scope: operational/legal machinery around running the site — moderation, enforcement, data requests and deletion, retention, ToS/Privacy Policy, and who operates it all.

## Moderation & enforcement
- Once users have names, profile pictures, or any user content, someone must handle: inappropriate usernames, offensive images, impersonation, harassment, language, user reports, compromised accounts, mistaken enforcement, appeals, suspension/removal. With youth involved, some cases can be serious (safeguarding).
- Requirement draft: an admin process to review reported/inappropriate content and behavior, with warnings, content removal, suspension, termination, and appeal/escalation.

## Privacy, data requests & deletion
- "Delete my account" isn't just `DELETE FROM users`. Need defined processes for access requests, correction, parental review, consent withdrawal, account deletion, data deletion, retention, and legitimate exceptions.
- COPPA: parents can review or delete a child's info and stop further collection; keep children's info only as long as reasonably necessary.
- California and other regimes may add rights to know, correct, delete, with response timelines.
- **Privacy and deletion can't be bolted on.** Before the database design: for each personal-data field, record why it's collected, how long it's kept, who can see it, and what happens on deletion → a **data map** to hand to counsel.

## Running list: "what comes with operating this"
Youth/parental consent & onboarding · ward membership verification · bishopric verification & transitions · account approval · moderation · suspension/termination · privacy/data-access requests · account & data deletion · retention · admin audit history · ToS & Privacy Policy · internal SOPs · legal review of all of it.

## Scope control
Bucket everything: **Must exist for launch** / **Important, can follow** / **Future-scale infrastructure**. Don't build for ward #7,842 while Bishop Porter is asking whether Johnny can click First Aid yet.

## Big question for Bishop Porter
Who operates this at scale? Moving from "website with his program" to "online service for minors across many congregations" needs people for admin, moderation, privacy requests, support, verification, safeguarding, and legal/compliance. Present categories gradually rather than all at once.
