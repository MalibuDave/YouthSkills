# Technical decision log

### DEC-001: Static wireframe with local progress

- **Date:** 2026-09-21
- **Status:** Accepted
- **Context:** The repository had no app or selected framework. The first wireframe needs navigable Keys, lessons, and persistent progress without accounts or a backend.
- **Decision:** Use browser JavaScript modules, hash routes, structured content in `src/data.js`, and `localStorage` for completion. Serve the files with a small Node.js HTTP server.
- **Rationale:** This fulfills the current flow with no external dependencies and keeps content and progress storage replaceable.
- **Alternatives considered:** A framework and router would add setup and dependencies before the content and design stabilize. A backend would exceed current scope.
- **Consequences:** Progress is limited to one browser/device. The supplied sheets are displayed as icon sources until approved individual assets are available.
- **Related documentation:** [Architecture](architecture.md), [README](../README.md).

### DEC-002: Supplied Book of Mormon pages are the lessons

- **Date:** 2026-09-21
- **Status:** Accepted
- **Context:** The supplied cover and pages establish the intended lesson sequence and visual content.
- **Decision:** Show the cover on the Book of Mormon Key page and treat pages 1–17 as individual lesson pages. Save self-reported step checks before enabling lesson completion. Exclude the optional Moroni 10 challenge from required progress.
- **Rationale:** This preserves the supplied material as the primary learning experience while adding simple navigation and progress.
- **Alternatives considered:** Splitting each page into multiple lesson cards would change the supplied page structure.
- **Consequences:** The full-size image is the source of lesson content. Text within an image is less accessible than HTML, so a later content pass should transcribe and review it.
- **Related documentation:** [Architecture](architecture.md), [README](../README.md).

### DEC-003: Demo Bishopric notification

- **Date:** 2026-09-22
- **Status:** Accepted
- **Context:** The wireframe needs to demonstrate the completion notification flow without sending email.
- **Decision:** Show a Notify Bishopric button after a Key reaches 100%. Clicking it changes the Key's locally saved demo state and displays the follow-up message.
- **Rationale:** This lets reviewers see the intended interaction without requiring contact details or a backend.
- **Alternatives considered:** Opening an email draft could imply a real notification flow and cannot confirm delivery.
- **Consequences:** The on-screen confirmation is a demo state; no message is sent.
- **Related documentation:** [Architecture](architecture.md), [README](../README.md).

### DEC-004: Timestamp completed lessons

- **Date:** 2026-09-22
- **Status:** Accepted
- **Context:** Completed Keys need a date beneath their icon and future progress views may show activity over time.
- **Decision:** Save a timestamp when a lesson is first completed. Derive a Key's completion date from the latest required lesson timestamp.
- **Rationale:** Lesson timestamps support both the current Key display and a later progress history without duplicating Key dates.
- **Alternatives considered:** Saving only a Key date would not support lesson history. Assigning today's date to older completions would misrepresent when they happened.
- **Consequences:** Keys completed before this change show that the date is unavailable. Completion dates stay local to the browser.
- **Related documentation:** [Architecture](architecture.md), [README](../README.md).

### DEC-005: Browser-local progress overview

- **Date:** 2026-09-22
- **Status:** Accepted
- **Context:** Learners need one place to see completed Keys and dates, current Key progress, and an overall summary.
- **Decision:** Add a My progress route that derives these views from the existing lesson completion data. Sort dated completions newest first and label older completions without timestamps as date unavailable.
- **Rationale:** The page reflects the same state as the Key cards without introducing a separate record or account system.
- **Consequences:** Progress is visible only in the browser where it was recorded. This view can later use account-based records when available.

### DEC-006: Grouped Keys and supplied First Aid sequence

- **Date:** 2026-09-30
- **Status:** Accepted
- **Context:** Learners need both an all-Keys view and a view arranged like the two supplied required-group sheets. The First Aid guide provides a badge, certificate, cover, and 14 numbered pages.
- **Decision:** Add a Groups route with shared Key progress, completion dates, and in-progress bars. Selecting First Aid from Groups opens the badge and certificate page, then the cover, then 14 individual guide lessons. Only the numbered guide lessons count toward First Aid completion.
- **Rationale:** Both entry points use the same Key data and browser progress. The opening artwork establishes the sequence without inflating the completion percentage.
- **Alternatives considered:** Counting the opening artwork as lessons would make progress reflect viewing rather than learning. Keeping the old one-page First Aid sample would incorrectly mark the new full guide complete.
- **Consequences:** A previously completed First Aid sample does not complete the new 14-page guide. Its old browser record remains stored but is excluded from current progress. The certificate is shown as a preview, not generated or awarded by the wireframe.

### DEC-007: Use the supplied group posters as navigation

- **Date:** 2026-09-30
- **Status:** Accepted
- **Context:** The Groups page should show each supplied group image as the group, with the badges acting as links.
- **Decision:** Display each full poster with nine positioned, accessible badge links to the existing Key pages. Show a small progress bar or completion date on a badge when applicable.
- **Rationale:** The supplied artwork remains intact while learners can enter each Key and its lessons directly from the poster.
- **Alternatives considered:** Separate cards repeated the badge artwork but did not present the group image as requested.
- **Consequences:** Link positions depend on the fixed layout of the supplied posters and must be adjusted if the artwork changes. Group 1 First Aid now opens its Key page, where the guide starts with the badge and certificate.

### DEC-008: Two-column poster gallery and contained completion highlight

- **Date:** 2026-09-30
- **Status:** Accepted
- **Context:** Seven group posters were supplied for the Groups page. The medallions on the artwork nearly touch, so an outward completion glow overlaps adjacent badges.
- **Decision:** Display the posters in two columns on wide screens and one column on narrow screens, with Required Groups 1 and 2 first. Keep links on the two required posters. Display the five themed posters as labeled previews until their Key lesson content is supplied. Draw the completion highlight inside the linked badge area. Use the updated Group 2 artwork and align its middle-right Key with Gatherer of Israel.
- **Rationale:** This presents all supplied groups without inventing lessons or putting a completion halo over neighboring artwork.
- **Alternatives considered:** Adding placeholder lessons for all 45 themed badges would imply program content exists. Editing the source art to separate medallions would require new approved image assets.
- **Consequences:** The themed badges do not yet navigate. The inset highlight is a wireframe treatment and can be refined when individual badge assets are available. The old sample family communication Key is replaced by Gatherer of Israel; its previous browser completion record is no longer part of current progress.

### DEC-009: Local account and profile prototype

- **Date:** 2026-09-30
- **Status:** Accepted
- **Context:** The next wireframe phase requires learner and Bishopric accounts, wards, under-13 approval numbers, profile pictures, and recent Key or group completions.
- **Decision:** Use Node's built-in SQLite module with a local ignored database, scrypt password hashes, HTTP-only session cookies, one-time ward-bound approval numbers, and server-stored lesson completion timestamps. Show profile milestones from the last 45 days. Keep lesson reflections and checklist state in account-scoped browser storage, with explicit import of earlier guest progress.
- **Rationale:** This adds persistent account flows without external services or dependencies while keeping the prototype easy to run locally.
- **Alternatives considered:** A hosted identity provider and managed database need real organizational identity, privacy, and deployment choices. Browser-only accounts would not exercise database-backed sign-in or approval-number validation.
- **Consequences:** Bishopric roles are self-selected and unverified, so approval numbers are a UI workflow demonstration rather than proof of consent. Do not use real youth data on a shared demo server. A local progress bridge can import records from the prior port-4173 preview when this version runs on another port. A later production design must validate adult roles and parental consent, add recovery and stronger abuse controls, and decide how to store reflections across devices.

### DEC-010: Public Covenant Youth entrance

- **Date:** 2026-09-30
- **Status:** Accepted
- **Context:** Account creation should feel like the entrance to Covenant Youth, while Covenant Keys is the signed-in learning area. The supplied church-site screenshot illustrates a split hero and simple editorial cards, but its event content is unrelated to this program.
- **Decision:** Add a public Covenant Youth landing page at `#/`, use the supplied Book of Mormon, First Aid, and group artwork in a split hero and three introductory cards, and give guests a public navigation with sign-in and account creation. Move the internal Keys overview to `#/keys` and gate Groups, Keys, lessons, and progress in the client until a session loads.
- **Rationale:** Visitors can understand the program before creating an account, and account forms no longer appear inside the signed-in Covenant Keys navigation.
- **Alternatives considered:** Keeping the existing Keys dashboard as the public home made account creation appear to be part of an already signed-in workspace.
- **Consequences:** The route gate illustrates the intended product flow; it is not server-side content authorization. Static lesson images remain directly accessible in this prototype.

### DEC-011: Automated checks with GitHub Actions

- **Date:** 2026-10-02
- **Status:** Accepted
- **Context:** Tests and syntax checks ran only when someone remembered to run them locally. Pull requests into `wf-dev-1` are now merged routinely, so checks need to run on their own. GitHub Actions is Phase 1 of the tooling plan.
- **Decision:** Add `.github/workflows/checks.yml`, which runs `npm run build` and `node --test` on Node.js 24 for every pull request and for pushes to `wf-dev-1` and `main`. The workflow has read-only repository access and installs nothing beyond Node.js.
- **Rationale:** The project has no dependencies, so the workflow stays small and fast, and it uses the same commands developers run locally.
- **Alternatives considered:** Running checks only locally relies on memory and gives reviewers no record. Other CI services add an account and configuration outside GitHub.
- **Consequences:** Each pull request shows a pass or fail result. Branch protection that requires the check before merging is a separate, later choice. Deployment to staging is not part of this workflow.

### DEC-012: V1 sign-up and ward approval states

- **Date:** 2026-10-02
- **Status:** Accepted
- **Context:** The product owner wrote V1 account-creation requirements (topic 11, `11-account-creation-requirements.md`). They drop under-13 accounts, replace self-selected account types with a single sign-up form, and add email verification and bishopric approval before lessons open.
- **Decision:** Sign-up asks for birth month and year first and refuses anyone under 13 without storing anything. Youth 13–17 must list at least one parent or guardian by name; adults may request a bishopric role with a phone number for out-of-site verification, tracked separately from ward membership. Passwords are 8–12 characters. Wards are hand-seeded; members request membership and cannot create wards. Every account has a membership status (`unverified`, `pending`, `see_bishopric`, `wrong_ward`, `rejected`, `active`), each change is logged in `membership_events`, and lessons, Keys, and progress are available only to `active` members. Roles become `member`, `bishopric`, `content_admin`, and `site_admin`. Existing prototype accounts migrate as `active`.
- **Rationale:** Implements the agreed V1 scope with the existing SQLite prototype and no new dependencies.
- **Alternatives considered:** Keeping the under-13 approval-number flow (removed by D1 in the requirements); adding new columns without rebuilding the users table (the old role CHECK constraint would block the new roles).
- **Consequences:** No email is sent: the verification link is shown on screen as a prototype stand-in, and bishopric notification emails are not implemented. Pending accounts stay pending until the bishopric approval page (topic 12) exists. The 30-day pending expiry and rejected-account purge are not implemented while their behavior is open. The 12-character password maximum follows the V1 decision; NIST 800-63B recommends allowing at least 64. Client route gating still is not server-side content authorization, but the lesson-completion APIs now refuse non-active members.


### DEC-013: Bishopric tools preview in the wireframe

- **Date:** 2026-10-03
- **Status:** Accepted
- **Context:** The product owner approved an interactive Bishopric tools mock with expandable youth requests, status actions, counts, and color-labeled recent activity, and asked to see it in the current wireframe.
- **Decision:** Add a `#/bishopric-tools` preview route for signed-in, active Bishopric accounts and embed the existing standalone mock as a same-origin frame. Hide its navigation link from everyone else, and restrict the mock HTML file on the server. Keep all example requests fictional and all changes in memory. Include Wrong Ward in the status tabs so those requests remain visible after a change.
- **Rationale:** Reviewers can reach the approved mock through the wireframe navigation without implying that its actions approve real accounts. Reusing the standalone mock preserves the approved visual layout during design review.
- **Alternatives considered:** Connecting the preview buttons to SQLite now would present unverified Bishopric permissions as a working approval flow; that requires a separate role verification and authorization pass.
- **Consequences:** The preview is navigable and interactive, but real pending accounts remain unchanged. A later implementation should replace the embedded mock with a role-gated, ward-scoped queue and recorded decisions.

### DEC-014: Bishopric reporting concepts preview in the wireframe

- **Date:** 2026-10-04
- **Status:** Accepted
- **Context:** The product owner reviewed a standalone reporting mock with one fictional calendar year for 50 youth and asked to place that unchanged preview in the current wireframe.
- **Decision:** Add a `#/bishopric-reporting` route and navigation link for signed-in, active Bishopric accounts. Embed the existing standalone mock in a same-origin frame, and restrict its HTML file on the server using the same access rule.
- **Rationale:** Reusing the approved page preserves its current layout and interactions while giving Bishopric reviewers a place to reach it from the wireframe.
- **Alternatives considered:** Rebuilding the charts inside the application would duplicate the mock and risk changing the approved presentation before reporting requirements are settled.
- **Consequences:** All displayed figures are fictional and do not reflect the signed-in ward or account records. A later reporting implementation needs defined data collection, ward scoping, and validation of the proposed measures.
