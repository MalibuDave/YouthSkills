# Topic 14 — Ward Progress Page (proposed)
Scope: a page, reached from search, that shows the aggregate progress of any ward on the platform: youth count, completions per Group and per Key, bishopric names, and ward information. Captured Oct 7, 2026.
Related: 01 (Groups/Keys, badge visuals), 04 (ward directory source), 06 (completion rules), 07 (reporting principle), 08 (bishopric transitions), 10 (data map), 11 (account states, ward list, bishopric phone), 12/13 (ward-only isolation model).

## Proposal
From search, a user opens any ward, for example **Wilshire 3rd Ward**, and sees its progress page:
- **Header:** ward name, bishopric names, ward address and phone, number of youth.
- **Body:** every Group currently on the platform. Next to each Group title is the number of youth who have completed that Group. Under each Key badge is the number of youth who have completed that Key.

## Why it's a bigger decision than it looks
- **It is the first deliberate cross-ward feature.** Topics 12 and 13 set "nothing crosses wards." This page is an exception, and is defensible only because it shows **counts, not individuals**.
- **It shows the location and size of a group of minors.** Ward address plus "14 youth" tells the viewer where a group of teenagers meets.
- **It needs ward data that doesn't exist yet.** The V1 ward list is a hand-seeded dropdown with no address or phone (topic 11 §2). Where an authoritative ward list comes from is still open (topic 04).
- **Small wards re-identify youth.** "1 of 3 completed" tells members of that ward exactly who completed it.

## 1. Access and scoping
Who can open another ward's progress page is the main decision:

| Option | Notes |
|---|---|
| Public (not logged in) | **Not recommended.** It exposes the location and size of a youth group to anyone. |
| Any Active user, any ward | Matches the original idea. Acceptable only if the page shows counts and no individual youth data. |
| Bishoprics only | Safest. Useful for leaders comparing notes across wards. |

- Viewers must be **Active** in their own ward. Unverified, Pending, See Bishopric, Wrong Ward and Rejected accounts get no access, matching the content lock in topic 11 §4.
- Authorization is checked server-side on every request; hiding the search link isn't enough.
- Open question: can a bishopric **opt its ward out** of cross-ward visibility?

## 2. Page contents
| Element | Proposal | Notes |
|---|---|---|
| Ward name | Shown | |
| Bishopric | Names of members holding the granted Bishopric role | Topic 11 §6. Updates on release or call (topic 08). New cross-ward exposure; tell members at role request. |
| Address | Meetinghouse address, **once the ward record has one** | Needs a new ward field and a source (topic 04). |
| Phone | **Not in V1** | The only phone held is the bishopric role-request phone, collected for verification only (topic 11 §8 Q3). It must not be shown here. If added later, it's a contact number the bishopric enters explicitly for this purpose. |
| Youth count (N) | Number of Active youth in the ward | Definition in §3. |
| Group rows | Title + "**X of N** youth completed" | "X of N" rather than a bare count, so wards of different sizes compare fairly. |
| Key badges | Badge art (topic 01) with "**X of N**" under each | Every Group and Key on the platform appears, including those with 0 completions, so the page doubles as a catalog. |
| Not shown | Any individual youth names, profiles, ages, in-progress status, timestamps | Individual detail stays within the ward (topic 13). |

## 3. Counting rules (to define)
- **Who counts in N:** Active youth 13–17 only, or all Active members including adults? Proposal: youth 13–17, since the page is about youth progress.
- **Group completed:** every Key in the Group completed? Depends on topic 06 completion rules.
- **Ward moves and turning 18:** does a completion stay with the old ward or follow the youth? Proposal: count **current Active youth only**, calculated live. Keeping historical counts requires storing events (topic 07 §5).
- **Content changes:** if a Key is added to a Group, youth who had completed that Group may drop back to incomplete. Decide whether that's acceptable.
- **Removed, deleted, or purged accounts** drop out of the counts immediately.

## 4. Small-number suppression
- Below a threshold (proposal: **fewer than 5 youth** in N, or a completion count below 5), show "fewer than 5" instead of the exact number.
- This matters most for spiritual/personal Keys (topic 13 §5). A per-Key "exclude from ward counts" flag set by content authors is an option.
- Confirm the threshold with counsel as part of the topic 05/10 review.

## 5. Display and tone
- **No rankings or leaderboards.** Wards aren't sorted by completion and there's no "top wards" list. Comparisons can shame wards and, in small wards, individual youth. Revisit only if Bishop Porter wants friendly competition and safeguards exist.
- Search returns ward names only; open a ward to see its page.
- Responsive layout: Group rows stack, and Key badges wrap on phones (topic 01).

## 6. Data map & retention (topic 10)
- Add "cross-ward aggregate counts" and "bishopric names visible to other wards" to the data map.
- No new youth personal data is collected. Counts are calculated from existing completion and membership data.
- New ward fields (address, and any contact phone) need entries.
- No view tracking (who viewed which ward) unless a defined action needs it.

## 7. Performance
- At beta scale, calculate the counts on demand from current data.
- Caching or stored summary tables only when there's a measured need.

## 8. Audit
- Log changes to ward information (address, contact phone, opt-out setting): who, what, when, old → new.

## Scope buckets
| Bucket | Includes |
|---|---|
| **Low-risk first step** | Logged-in Active users (or bishoprics only); ward name, bishopric names, youth count; "X of N" per Group and Key; small-number suppression; server-side access checks |
| **Before address is shown** | Ward address field and source (topic 04), data-map entry |
| **Later** | Bishopric-entered contact phone, ward opt-out, per-Key exclusion flag, historical trends |
| **Out of scope** | Public access, rankings/leaderboards, individual youth names, filters by age or date, exports |

## Questions for Bishop Porter
1. What is the purpose: motivation between wards, showing new bishops what the program does, or leadership oversight? (Topic 07: what action does it enable?)
2. Who should see other wards' numbers: all Active users, or bishoprics only?
3. Is it acceptable for bishopric names to be visible to other wards?
4. Should a bishopric be able to opt its ward out?
5. Is friendly competition between wards wanted, or should the page avoid comparisons?

## Open decisions (engineering/policy)
- Access level (§1).
- Definition of N and of "Group completed" (§3).
- Current-only vs historical counts (§3).
- Suppression threshold and per-Key exclusion (§4).
- Ward address source and new ward fields (§2, topic 04).

## Status
Proposal. Recommendation: ship the counts-only version to logged-in Active users or bishoprics, with suppression. Leave out phone. Add address once the ward record has an authoritative source.
