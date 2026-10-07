# Topic 16 — Achievements Page (time in app, streaks, goals, exploration)
Scope: a gamified page, modeled closely on the Pluralsight Skills trophy case, that rewards how much and how consistently a youth learns: learning time, day/week/month streaks, weekly goals, and exploring new and earned Keys. Captured Oct 7, 2026; split from the original topic 15 proposal. Working title "Achievements" — final name TBD.
Related: 01 (Keys), 05 (minors compliance), 06 (completion; page-open time isn't evidence), 07 (reporting/granularity), 10 (data map), 11 (account states), 13 (ward profiles), 15 (Progress page).

**Mockup:** "Trophy Case Mockup" canvas, artboard **Achievements (time, streaks, exploration)** — https://claude.ai/artifact/Li73nisc6MBGUfonhT2r3Z (private; share from the page's Share menu). Standalone mockup, not part of the site code.

## Status
Direction approved by Dave (Oct 7): "exactly what I was going for." Next: review with Bishop Porter, decide how time is measured, then spec for build.

**Change from the earlier topic 15 stance:** topic 15 originally recommended against view-time badges and daily streaks. Dave has chosen to include both. The concerns are kept below as design and review items, not blockers.

## Reference: Pluralsight trophy case
Recently Unlocked / Upcoming · Completion Achievements · Explore New Things · Annual View Time (5 min → 50 hrs) · Annual Learning Streaks (days, weeks, months) · Annual Weekly Goals (1x/5x/15x) · Expand Your Exploration. Used as a pattern reference; names and artwork are YouthSkills' own.

## What the mockup shows
1. **Header:** page title, year selector, and four stat cards: current daily streak (with best), current weekly streak, current monthly streak, learning time this year.
2. **Recently unlocked** (last three badges, with dates) and **Almost there** (closest badges, with what's left: "6 more days", "6h 20m to go").
3. **This week:** minutes per day (Sun–Sat, today highlighted, future days empty), weekly goal progress bar ("42 of 60 min"), Change goal button.
4. **Learning time** badges: First Steps (5 min), Settling In (30 min), Committed (2 hrs), Steady Climber (5 hrs), Trail Regular (10 hrs), Seasoned (15 hrs), Summit Seeker (25 hrs), Mountain Mover (50 hrs).
5. **Learning streaks:** 2/5/10/20 days in a row; 2/4/8/12 weeks; 2/3/6/12 months. Unearned badges show progress ("Best so far: 9", "Now: 5").
6. **Weekly goals:** Goal Met 1x / 5x / 15x.
7. **Expand your exploration:** Trailblazer (start a Key in a new Group), Explorer (Keys in 3 Groups), Well Rounded (a Key in every Group), Second Look (revisit an earned Key), Return Trip (revisit 3 earned Keys).
8. **Keep exploring:** suggested new Keys plus one or two earned Keys to revisit, each linking to the Key.

Visual rule: these badges are **copper hexagons**; Keys are **round green-and-gold**. The two never look alike, so Keys stay the main achievement (topic 01). Earned vs unearned is shown by fill plus a text label, not color alone.

## Key design question: how is "time" measured?
Page-open time is easy to inflate (topic 06: open First Aid, play Xbox). Options:
| Option | Notes |
|---|---|
| Raw time a lesson page is open | Simplest; easiest to game. |
| **Active time with idle timeout** (recommended starting point) | Count time only while there's interaction (scroll, click, typing) in the last N minutes; tab hidden = paused. |
| Time credited per completed section | Each section has an estimated duration (topic 03 `estimatedDuration`); credit on completion. Hard to game, less "real-time" feel. |
| Hybrid | Active time, capped at a multiple of the section's estimate. |

Also decide: what counts as a "learning day" for streaks (any lesson activity? at least one section completed? minimum minutes?), and the time zone for day boundaries.

## Data needed (new compared to topic 15)
- **Activity/time events** (e.g. daily active-minutes per user, or session start/stop). This is the event tracking topic 07 warns about; keep it to the smallest form that powers the badges, e.g. **one row per user per day with minutes**, not raw clickstream.
- Weekly goal per user (minutes/week) and goal-met history.
- Revisit events for "Second Look" / "Return Trip".
- Badge awards with `earned_at`.
- Data map (topic 10): all of the above are youth personal data; record purpose, visibility, retention (e.g. keep daily totals only for the current and previous year), deletion with account.

## Youth wellbeing & compliance (review items)
- Streaks work by making a break feel like a loss. Mitigations to discuss: no "don't lose your streak" messaging, no streak reminder emails/notifications, a **streak freeze or grace day**, monthly/weekly streaks weighted as much as daily.
- Ask counsel whether time and streak gamification for 13–17-year-olds raises issues under state minor-protection / design-code laws (topic 05 review).
- Spiritual/personal Keys (prayer, scripture study): should time on these count toward time badges and streaks? Possibly exclude per Key (same idea as topics 13 §5, 14 §4).
- Sunday: should streaks pause or treat Sunday differently? (Bishop Porter's call.)

## Who sees what
| Viewer | Proposal |
|---|---|
| The youth | Whole page. |
| Ward members (topic 13) | Nothing from this page by default (no time, streaks, or activity patterns). |
| Bishopric | Decide with Bishop Porter; only if a defined action needs it (topic 07). |
| Parents | None (D2). |
| Other wards | Never. |

## Annual reset
Pluralsight's time, streak, and goal badges are annual. Decide: reset yearly (calendar or program year) or lifetime. Keys never reset. Year selector shows past years if badges are annual.

## Scope buckets
| Bucket | Includes |
|---|---|
| **First build** | Learning time badges (active-time measurement), day/week/month streaks, Recently unlocked / Almost there, header stats, Expand your exploration, Keep exploring |
| **After Bishop Porter + counsel** | Weekly goals and Change goal, This week chart, streak freeze/grace, per-Key exclusion |
| **Later** | Year selector with past years, badge notifications (in-app only) |
| **Out of scope** | Leaderboards, sharing streaks/time with the ward, push/email streak reminders |

## Questions for Bishop Porter
1. What should we call this page? (Working title "Achievements"; other ideas: Trophy Case, Trail Log, Badges.)
2. Is rewarding time in the app the right signal, or should time come from completed lessons?
3. Daily streaks: yes, or weekly/monthly only? Any Sunday rule?
4. Should spiritual Keys count toward time and streak badges?
5. Should the bishopric see any of this (e.g. streaks), or is it private to the youth?
6. Calendar year or program year for annual badges?
7. Do badge names fit the program's tone (outdoor/trail theme)?

## Open decisions (engineering/policy)
- Time measurement method and idle timeout (above).
- Definition of a "learning day"; time zone for day boundaries.
- Storage granularity and retention for activity data.
- Annual vs lifetime badges.
- Whether Milestones (topic 15) merge into this page.
