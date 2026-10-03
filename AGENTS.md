# Instructions for AI coding agents

These instructions apply throughout this repository.

- Read existing documentation, including `README.md`, `docs/architecture.md`,
  and `docs/decisions.md`, before modifying architecture.
- Prefer simple, maintainable solutions that meet the current requirements.
- Do not introduce major frameworks or dependencies without explaining why they
  are needed and the relevant tradeoffs.
- The initial repository setup leaves the frontend framework, backend
  architecture, database, authentication provider, hosting platform, and cloud
  infrastructure undecided. Defer these choices until a task calls for them.
- Do not commit secrets, credentials, API keys, or environment files. Ignore
  rules are a safeguard, not a substitute for reviewing changes.
- Preserve existing functionality when modifying code. Identify any intentional
  behavior changes explicitly.
- Run relevant tests and checks before considering work complete. If no test
  tooling exists, perform appropriate manual checks and report what was checked
  and any limitations. Do not claim checks were run if they were not.
- Document important architectural decisions in `docs/decisions.md`, including
  context, rationale, alternatives, and consequences. Keep
  `docs/architecture.md` aligned with accepted decisions.
- Do not push to remote repositories unless explicitly instructed.
