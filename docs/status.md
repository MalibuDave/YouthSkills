# Project status

_Last updated: 2026-10-02 (V1 sign-up rebuilt from topic 11 requirements)._

Covenant Youth is a working wireframe, not a production youth platform. See the
[README](../README.md) for what it does, [architecture.md](architecture.md) for
how it is built, and [decisions.md](decisions.md) for why.

## Branches

- `wf-dev-1` holds the current wireframe code. `main` holds only the original
  planning docs.
- The developer's working clone is on the Windows desktop at
  `D:\CY-Skills-Dev\CY-Program-Framework` (moved out of OneDrive). Its local
  `devtest` branch has been reconciled and now tracks `origin/wf-dev-1`.
  `devtest-backup` keeps the old pre-reconciliation history.
- That clone has CRLF line endings from the Windows copy, so `git status` can
  list files as modified when only line endings differ. Check with
  `git diff --ignore-cr-at-eol --stat` before committing.

## Checks

GitHub Actions runs `npm run build` and `node --test` on every pull request and on pushes to `wf-dev-1` and `main` (`.github/workflows/checks.yml`, DEC-011).

As of 2026-10-02, `node --test` passes all 14 tests: V1 sign-up, verification, and membership states, database migration,
account-scoped progress, guest route gating, Groups navigation, and the First
Aid opening sequence. `npm run build` runs syntax checks.

## Open questions

Account creation follows the V1 requirements in `11-account-creation-requirements.md` (DEC-012): no under-13 accounts, parent names for 13–17, email verification, and bishopric approval before lessons open. Bishopric roles are requested, not self-granted, but nothing in the app verifies or grants them yet. Do not enter real youth information into a shared demo instance.

Open from topic 11: what happens to a pending request after 30 days, the rejected-account purge, keeping the bishopric phone number after verification, and parent names when a youth turns 18.

Other decisions still needed:

- What are the approved lessons and individual badge assets for the five themed
  groups?
- Is Gatherer of Israel the permanent replacement for the earlier duplicate
  Communication badge on Group 2?
- Should reflections and checklist steps sync across devices, and what are
  their retention rules?
- How should real Bishopric notification, acknowledgement, and follow-up work?
- What account recovery (forgot password), role administration, and deletion
  controls are required?

## Known limits

- Sign-in gating is client-side only. Static lesson images are reachable by URL
  and need server-side authorization before they can be treated as private.
- Text inside lesson images needs accessible HTML transcription before release.
- Notify Bishopric is a demonstration; no message is sent.

## Recommended next work

1. Build the bishop profile page and approval queue (topic 12) so pending members can be approved, and a site-admin step to grant bishopric requests.
2. Obtain approved content and separate badge artwork for the themed groups.
3. Define the production identity and consent model before adding real
   notifications or using real youth data.
4. Plan account-backed progress and reflections.
5. Accessibility work (lesson image transcription).
6. Account recovery and data retention controls.
7. Hosting.
