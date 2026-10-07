# Topic 15 — Progress Page (Keys, recent, up next, yearly timeline)
Scope: the youth's own progress page, centered on Keys: earned / in progress / not started by Group, recently earned, up next, and a month-by-month view of the year. Captured Oct 7, 2026; split from the original "Trophy Case & Progress Timeline" proposal. Time-in-app, streaks, goals, and exploration badges moved to **topic 16 (Achievements page)**.
Related: 01 (Keys as collectible badges), 06 (completion rules), 07 (reporting principle, history = events), 10 (data map), 11 (account states), 13 (ward profiles), 14 (counts), 16 (Achievements page).

**Mockup:** "Trophy Case Mockup" canvas, artboard **Progress page** — https://claude.ai/artifact/Li73nisc6MBGUfonhT2r3Z (private; share from the page's Share menu). Standalone mockup, not part of the site code.

## Status
Direction approved by Dave (Oct 7). Next: review with Bishop Porter, then spec for build.

## What the mockup shows
1. **Profile header:** name, ward, Keys earned, Keys in progress, lessons completed this year. A note that dates and the timeline are visible only to the youth; ward members see earned Keys.
2. **Recently earned:** last three Keys earned, with dates.
3. **Up next:** in-progress Keys closest to done, with "3 of 4 lessons" progress bars, each linking to the Key.
4. **Your [year]:** monthly bar chart, toggle between **Keys earned** and **Lessons completed**; current month highlighted, future months shown empty. Year-in-review row: Keys this year, lessons this year, most active month, first Key of the year.
5. **All Keys by Group:** every Key with three states, each labeled in text (not color alone): **Earned** (green badge, gold ring), **In progress** (plain ring, "2/5"), **Not started** (dashed outline).
6. **Milestones:** small rectangular markers (e.g. "First Key earned", "5 Keys in a year"), styled to never compete with Keys. *(Overlaps with topic 16; decide whether these stay here or move to the Achievements page.)*

Sample/placeholder content: youth "Alex R.", Outdoors Group from topic 01, and a bracketed "[Gospel Study Group]" with "[Gospel Key A–D]" pending Bishop Porter's canonical list. Badge icons are line-drawing stand-ins for his Key artwork.

## Design principles
- **Keys are the achievement** (topic 01). Anything else on the page is visually distinct and never presented as a Key.
- Unearned Keys shown greyed doubles as a catalog and a goal list.
- No comparison with other youth, no leaderboard (topic 14 §5).
- Accessibility: state shown in text as well as color (topic 03); badge rows wrap and the chart scrolls on phones.

## Data needed
- `completed_at` on each lesson completion and each Key completion. Likely needed anyway for bishopric notification and certificates (topic 06).
- Everything on the page comes from completion dates plus current progress. **No page views, dwell time, or session tracking** for this page (time tracking is topic 16's question).
- Reversed completions (topic 06): page shows current state; a reversed completion drops off.
- Offline/book completions (topic 01): which date counts, done or entered?
- Content changes: if a Key gains a lesson, does an earned Key stay earned? (shared with topics 06/14)
- Data map (topic 10): completion timestamps are youth personal data; record purpose, visibility, retention, deletion with account.

## Who sees what
| Viewer | Proposal |
|---|---|
| The youth | Whole page. |
| Ward members (topic 13) | Earned Keys only. No dates, timeline, or in-progress status. |
| Bishopric | Earned Keys. Timeline only if there's a defined action (topic 07), e.g. interviews. Ask Bishop Porter. |
| Parents | None (D2). |
| Other wards (topic 14) | Never; aggregate counts only. |

## Year definition
Calendar year, or a program year tied to the youth's age (the year they turn 12–18)? Keys never reset; the year view only filters.

## Scope buckets
| Bucket | Includes |
|---|---|
| **First build** | All Keys by Group with three states, Recently earned, Up next, header counts, `completed_at` timestamps, private to the youth |
| **After Bishop Porter review** | Monthly chart with Keys/Lessons toggle, Year in review row, bishopric view (if wanted) |
| **Later** | Year selector for past years, printable year summary |
| **Out of scope** | Leaderboards, sharing dates/timeline with the ward |

## Questions for Bishop Porter
1. Is this the page youth land on to see their progress, or does it live inside their profile?
2. Should the bishopric see a youth's timeline, or only earned Keys?
3. Calendar year or program year?
4. Do Milestones belong here, or only on the Achievements page (topic 16)?
5. What is the canonical list of Groups and Keys to replace the placeholders?

## Open decisions (engineering/policy)
- Completion date for offline/book work.
- Earned Key behavior when Key content changes (shared with 06/14).
- Data-map entry and retention for completion timestamps.
