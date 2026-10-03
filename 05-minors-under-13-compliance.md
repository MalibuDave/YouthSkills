# Topic 05 — Minors: Under-13 Registration & Compliance
Scope: legality of registering children under 13 (federal, California, other states, international), the parent/bishopric sign-up workflow, registration friction, monitoring/moderation of under-13 accounts, and what happens when a youth moves to a different state.

## Agreed sign-up flow (Dave's design)
1. Parent gives their email to the bishopric.
2. Bishopric, in the site, chooses "Authorize Youth Registration" and enters the parent's email.
3. System generates a unique authorization code/link tied to that email and that ward, and emails it to the parent.
4. **Parent** creates the account with their own email and enters the code.
5. Parent completes parental consent and registers the child.
6. Child is automatically associated with that ward (no address or ward search needed for the child; no separate bishopric approval since the bishopric started it).
- **Bishopric authorization is NOT a substitute for parental consent.** It only says "this family is authorized into our ward's program." Consent is a separate step owned by the parent.
- Code vs link, expiry, resend rules: implementation details, decide later.

## Bishop Porter's feedback (captured from a screenshot)
- Consider a **parent-centric model**: parent creates/manages the portal for their children and controls which Bishop/youth leaders can access each child's information.

## Research to do (sourced, primary sources; produce a legal-review checklist, not legal advice)
- Ages: **under 13 → 13–17 → 18+** (not just under 13). COPPA's threshold is under 13; a home address counts as personal information.
- Federal (COPPA/FTC): verifiable parental consent methods, notices, parental review/deletion rights, retention limits, security.
- California and other states that add requirements (COPPA doesn't simply override consistent state law; CA has active minor-privacy rulemaking).
- International.
- Jurisdiction matrix columns: Federal / California / Other states / International. Rows: age thresholds, parental consent, age verification, parent access/control, data collection, retention/deletion, youth communications, profile/user content, leader access to youth data, required disclosures.

## Governance rules
- Separate **legally required** vs **best practice/risk reduction** vs **YouthSkills product decision**.
- Policy authority stack: Federal floor → State floor → YouthSkills org-wide policy → configurable ward/bishopric settings. **A bishopric (in any state or country) can never weaken a legal/safety control** to make sign-up easier.
- Centralized compliance policy layer; wards shouldn't have to know which state's rules apply.

## State-to-state moves
- Jurisdiction isn't fixed at account creation (e.g., register in CA at 12, move to UT at 13, turn 18 on platform).
- Decide: how residence is updated, whether consent/disclosures must be redone, whether account capabilities change. Don't hard-code "state where account was created."
- Also international moves in/out of the US.

## Scope escape hatch
- Launch in a deliberately limited jurisdiction; add states/countries only after their requirements are reviewed and implemented.

## Outputs wanted eventually
Registration UX requirements · Privacy Policy/ToS requirements · parental notice & consent language · admin procedures · engineering requirements · questions for counsel.
