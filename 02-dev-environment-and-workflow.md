# Topic 02 — Dev Environment, Git & Delivery Workflow
Scope: machines, Git/GitHub, Codex, branching, CI/CD, staging, project tooling, and Dave's skills refresh.

## Current setup (done)
- Laptop **LT-01**, Ubuntu, Linux user `mike`. Also a desktop PC that will clone the same repo; same Git identity on both.
- SSH: unique Ed25519 key for LT-01 added to GitHub.
- Repo: **github.com/MalibuDave/CY-Program-Framework**, cloned to `~/dev/CY-Program-Framework`.
- Codex CLI **0.155.1** installed via the standalone installer (`curl -fsSL https://chatgpt.com/codex/install.sh | sh`, not snap, not the .deb), signed in with ChatGPT Plus. Launch from the repo root.
- First Codex task created README.md, AGENTS.md, .gitignore, docs/architecture.md, docs/decisions.md. Committed ("Initialize project repository") and pushed to `main`. Working tree clean.
- AGENTS.md rules: read docs before changing architecture; simple maintainable solutions; justify new frameworks/deps; never commit secrets/env files; preserve functionality; run checks; document decisions; no pushing unless told.

## Branching
- `main` = known-good baseline; no direct development on main.
- Feature branches (e.g., `docs/product-requirements`); possibly a `develop` integration branch later.
- `devtest` = Git-fundamentals sandbox. Local `devtest` deleted (was 57d92ca); `origin/devtest` still exists on GitHub (next lesson: remote branch deletion).

## Learning approach (Dave's request)
- Prioritize Git fundamentals over shortcuts: working tree → index → local repo → remote; fetch vs merge/rebase; `-d` vs `-D`; local vs remote-tracking branches; `git status` as the go-to.
- Interactive style: Dave types commands, pastes output, predicts results.

## Staging / review for Bishop Porter
- No Spectrum port forwarding. Use a **local VM + Cloudflare Quick Tunnel** (`cloudflared tunnel --url http://localhost:3000`) for a temporary HTTPS URL; kill when done. ~$0.
- Push reviewable checkpoints only; Bishop sees a stable version while dev continues.
- Staging data is fully synthetic (fake youth, wards, progress).
- Move to inexpensive real hosting only once continuous availability is needed.

## Tooling roadmap
- Phase 1: GitHub as backbone — Issues (Epic/Story/Bug/Tech debt), Projects board (Backlog/Ready/In Progress/Review/Done), Actions (lint, test, build, deploy staging).
- Phase 2: real lifecycle — Feedback → Requirement → Issue → Feature branch → Codex → CI → PR → develop → Staging → Bishop acceptance → main.
- Phase 3: add Jira/Confluence/Slack only when GitHub stops being enough (Confluence likely earliest, for curriculum/knowledge).
- Collaboration: shared ChatGPT project was the old "shared brain"; GitHub is the shared source of truth for code. (Now moving to Claude project "CY Web App".)

## Next steps
- Decide whether to delete `origin/devtest` or reuse it.
- Set up GitHub Issues/Projects and the first Actions workflow.
- Document the VM + tunnel setup in docs/.
