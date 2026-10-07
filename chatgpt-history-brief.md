# CY Web App / YouthSkills — context brief from ChatGPT project
Source: ChatGPT project "YouthSkills-Dev-Bishop Porter" (11 chats, Sep 19 – Oct 1, 2026). Captured Oct 2, 2026. Topic list updated Oct 7, 2026.

## Topic docs (one per working chat)
Each topic has its own doc with full detail. Start a chat per topic and point it at its doc.
- `topics/01-product-and-content-model.md` — product vision, Groups/Keys/Lessons, badge visuals, Bishop's source material
- `topics/02-dev-environment-and-workflow.md` — LT-01, Git/GitHub, Codex, branching, VM + tunnel staging, tooling roadmap
- `topics/03-wireframe-build.md` — the site itself: pages, components, current state
- `topics/04-bishop-ward-onboarding.md` — Bishop claims ward, youth ward membership, account approval
- `topics/05-minors-under-13-compliance.md` — parent/bishopric sign-up flow, COPPA/state research, state-to-state moves
- `topics/06-key-completion.md` — what completion means, enforcement, recognition
- `topics/07-reporting.md` — who sees what and why
- `topics/08-bishopric-account-maintenance.md` — bishopric account lifecycle
- `topics/09-site-admin-accounts.md` — platform admin roles, MFA, audit
- `topics/10-governance-moderation-privacy.md` — moderation, data requests/deletion, ToS, who operates it
- `topics/11-account-creation-requirements.md` — V1 sign-up, email verification, ward approval states, bishopric role request, account types
- `topics/12-ward-forum.md` — proposed ward forum (General + Bishop boards), moderation, safeguarding (undecided)
- `topics/13-ward-profiles.md` — proposed ward-only member profiles and search
- `topics/14-ward-progress-page.md` — proposed cross-ward page with aggregate Group/Key completion counts
- `topics/15-trophy-case-and-progress-timeline.md` — Progress page: Keys by Group, recently earned, up next, yearly timeline (mockup approved)
- `topics/16-achievements-page.md` — Achievements page: time in app, day/week/month streaks, weekly goals, exploration badges (mockup approved)

## Product
- Web app (wireframe → beta) teaching LDS youth practical life skills. Owner/visionary: Bishop Porter. Builder: Dave.
- Core hierarchy: Program → Group → Key → Lesson → Section/Activity → Progress.
- A **Key** is a collectible badge-style achievement (circular emblem, gold border, illustrated subject; forest green/gold/cream heritage-outdoor look). Example group: Outdoors (Bird Watching, Mountain Biking, Kayaking, River Rafting, Camping, Hiking, Fishing, Astronomy, Horseback Riding).
- Lesson reference: Book of Mormon Key — purpose, benefits, doctrinal-mastery scriptures (e.g., 1 Nephi 3:7 with Scripture / Background / Why It Matters), reflection, completion.
- Content must be structured data separate from presentation so new Keys can be added without building pages.
- Bishop has hundreds–thousands of pages of iterated material; plan a source hierarchy (Canonical → Active Draft → Historical) before ingesting.
- Long-term: 501(c)(3), low-cost printed books, other charitable work — justifies some professional structure now.

## Dev environment & workflow (decided)
- Repo: github.com/MalibuDave/CY-Program-Framework (main pushed with README.md, AGENTS.md, .gitignore, docs/architecture.md, docs/decisions.md).
- Machines: Ubuntu laptop LT-01 (Linux user `mike`, SSH Ed25519 key to GitHub) + a desktop. Codex CLI 0.155.1 installed via standalone installer, signed in with ChatGPT Plus.
- Branching: main = known-good; work on feature branches / `devtest` (devtest used as a Git-fundamentals sandbox; local devtest deleted, origin/devtest still exists).
- Review/staging: local VM + Cloudflare Quick Tunnel (no Spectrum port forwarding, ~$0 hosting). Synthetic data only in staging.
- Tooling plan: GitHub Issues/Projects/Actions first; Jira/Confluence/Slack only once they earn their keep (Dave also wants to sharpen TPM/DevOps skills).
- Principle: requirements → data model → architecture before letting Codex pick a stack.

## Wireframe status
- As of ~Oct 1: wireframe has account creation, profiles, Keys grouped into Groups, progress/completion signals.

## Guiding themes
- Scope creep is the main enemy. Bucket everything: must-have for launch / important-can-follow / future-scale.
- Hide complexity from users; don't build for ward #7,842 before ward #1 works.
- Bishopric authorization ≠ parental consent. Ward bishoprics can never weaken legal/safety controls.
