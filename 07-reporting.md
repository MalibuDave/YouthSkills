# Topic 07 — Reporting Requirements
Scope: what information is visible, to whom, at what detail, and why — scoped early to avoid scope creep.

## Core principle
**Only collect, store, calculate, or expose reporting data when someone has a defined decision or action to take from it.**

## Five questions for every proposed report/metric
1. **Who needs it?** Youth, parent/guardian, bishopric/ward admin, site admin.
2. **What action does it enable?** No action → question it.
3. **What granularity?** "Key completed" may be enough; page views, timestamps, dwell time, retries add cost.
4. **How current?** Real-time vs daily vs on demand (real-time gets expensive fast).
5. **How long kept?** Current state vs history is a huge difference — "progress six months ago" means storing events.

## Operational reporting vs analytics
- Operational (likely core): "Which youth in my ward completed Key X?" "Where is Johnny?"
- Analytics (likely out of MVP): averages by age/ward/month/lesson — becomes a BI platform.
- Push back on anything quietly adding event tracking, snapshots, aggregation infra, exports, arbitrary filters.

## Privacy angle
Less data = simpler engineering and less sensitive youth data to govern, retain, disclose, and delete.

## To define
- Report list per role (youth, parent, bishopric, site admin).
- Completion notifications to bishopric (ties to topic 06).
- Any compliance/audit reporting needs (ties to topics 05, 09, 10).


Number of keys completed
    - week
    - month
    - year

Number of groups completed
    - month
    - year
Number of groups by group type
    - month
    - year

Key Data
    - average time to complete
        - week
        - month
        - year

Group Data
    - average time to complete
        - week
        - month
        - year


Accounts
    - approved
        - month
        - year
    - rejected broken out by reason
        - month
        - year

User Activity
    - individual activity
        - number of logins
            - week
            - month
            - year
        - amount of time spent per key
            - week
            - month
            - year
