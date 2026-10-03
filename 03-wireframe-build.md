# Topic 03 — Wireframe / Beta Build
Scope: the actual site being built — pages, components, data, and what to build next.

## Current state (as of ~Oct 1, 2026)
- Wireframe is progressing: account creation, user profile, Keys organized into Groups, progress/completion signals.
- Built by Codex in CY-Program-Framework (check the repo for the actual stack chosen).

## Original wireframe spec (Codex prompt, Sep 21)
Core loop to prove: **Dashboard → select Key → select Lesson → mark complete → back to Key → updated progress → Dashboard → overall progress**; survives refresh.

Pages:
1. **Dashboard** — intro, overall progress near top, grid of Key cards (icon, name, short description, progress, lessons done/total). Responsive.
2. **Key detail** — icon, name, description, Key progress, list of lessons (title, summary, status, open). Completed vs incomplete not distinguished by color alone.
3. **Lesson page** — reusable sections: title, introduction, learning objective, instructional content, activities, reflection questions, supporting info, **Mark Lesson Complete**, back to Key.

Rules from the spec:
- Progress in localStorage for the wireframe (no auth/DB at that stage — since superseded by accounts).
- Content separate from UI: Key {id, name, description, icon, lessons[]}; Lesson {id, keyId, title, description, sections[], estimatedDuration?}. Placeholder content clearly marked, never invented "official" material.
- Visual priority: structure > usability > reusable components > polish. Youth-friendly, clean, not corporate; minimal animation.
- Accessibility: semantic HTML, heading order, keyboard access, visible focus, alt text.
- Out of scope then: auth, cloud DB, payments, CMS, social, deployment, LDS account integration, analytics, final branding.
- Reference images should live in the repo (e.g., `docs/reference/key-icons.png`, `docs/reference/lesson-examples/`) so Codex can see them.
- Work on `devtest` or a feature branch, never main.

## Open items
- Confirm stack Codex chose and whether it's the one to keep.
- Where accounts/progress are stored now that accounts exist.
- Next features depend on decisions in topics 04–10 (onboarding, completion rules, roles).
