# CLAUDE.md

Project instructions for Claude. The shared agent rules live in `AGENTS.md` so
Codex and Claude follow the same guidance; edit them there, not here.

@AGENTS.md

## Where things stand

Read `docs/status.md` first: current state, branches, open questions, and the
recommended next work. Then `README.md`, `docs/architecture.md`, and
`docs/decisions.md` before changing architecture.

Note: the `AGENTS.md` line saying the stack is undecided predates the
wireframe. The prototype now uses plain JavaScript modules, hash routes, and a
Node.js server with built-in SQLite (DEC-001, DEC-009). Production choices
(identity provider, hosted database, hosting) are still undecided.

## Commands

- Run: `node server.mjs`, then open http://127.0.0.1:4173 (Node.js 24+)
- Test: `node --test`
- Syntax check: `npm run build`

## Working rules

- Active development is on `wf-dev-1`, not `main`.
- Never put real youth information into the app or test data.
- Propose new technology choices as a `DEC-<n>` entry in `docs/decisions.md`
  (status: Proposed) and wait for approval before building on them.
- Keep `docs/status.md` current when open questions are resolved or next steps
  change.

## Pushing and merging

The project owner has standing permission for Claude to push and merge; this
overrides the "do not push" line in `AGENTS.md` for Claude only.

- Do each task on its own branch, open a pull request into `wf-dev-1`, and
  merge it yourself once `node --test` and `npm run build` pass. Say in the
  pull request what was checked.
- If checks fail, do not merge; fix the problem or report it.
- Still ask first before merging into `main`, rewriting or deleting branches,
  or making a technology choice (see DEC entries above).
