# CY Program Framework

A working Covenant Youth wireframe. Its public landing page introduces the program using supplied artwork. After sign-in, learners enter the Covenant Keys workspace. Key names and icon artwork follow the supplied Group 1 and Group 2 reference sheets. Most lesson text is marked as sample content pending review.

## Run locally

Requires Node.js 24 or newer for built-in SQLite. No package installation is needed.

```sh
node server.mjs
```

Open http://127.0.0.1:4173. Run `node --test` for data and progress checks and `node --check src/app.js` for a syntax check.

## Structure

- `src/data.js`: Keys, lessons, and reusable lesson sections
- `src/book-of-mormon.js`: one lesson per supplied Book of Mormon page, in page order
- `src/first-aid.js`: the 14 supplied First Aid guide pages and opening artwork
- `src/app.js`: dashboard, progress overview, Key detail, lesson views, and hash navigation
- `src/progress.js`: completion storage and progress calculations
- `src/account-db.js`: SQLite account, ward, membership status, session, and completion storage
- `src/account-rules.js`: sign-up rules shared by the form and server (age gate, password length, status text)
- `src/account-ui.js` and `src/account.css`: account creation, sign-in, and profile views
- `src/landing.css`: public Covenant Youth landing page and guest navigation
- `src/styles.css`: responsive wireframe styles
- `covenantyouthprogram3/`: supplied Key reference sheets used as icon sources
- `covenantyouthprogram4/` and `covenantyouthprogram5/`: Book of Mormon cover and lesson pages shown inside the wireframe
- `first-aid-pages/`: supplied First Aid badge, certificate, cover, and guide pages
- `tests/`: basic data and progress checks

Accounts and lesson completion records are saved in an ignored local SQLite file at `data/accounts.sqlite`. The app seeds two fictional wards, **Demo Ward** and **Second Demo Ward**; members cannot add wards. Account passwords are salted and hashed. Each signed-in account has separate browser lesson checks and reflections. Browser-only progress from the earlier wireframe can be imported from the Profile page. Every unfinished lesson requires a reflection before the completion button is enabled; Book of Mormon lessons also require their checklist steps.

The **My account** page provides sign-up, sign-in, sign-out, an optional profile photo, ward and Bishopric details, and Key or group milestones from the last 45 days. Sign-up asks for birth month and year first and stops anyone under 13 without saving anything. Youth 13–17 list at least one parent or guardian; adults can request bishopric access with a phone number. After sign-up the account must verify its email (the prototype shows the link on screen instead of sending it) and then waits for bishopric approval. Until an account is Active it sees only its account page. This is a workflow prototype: the site cannot verify Bishopric identity or a real ward. Do not enter real youth information into a shared demo instance. Only lesson completion dates sync through the local server; reflection text and step checks remain on the current browser.

The public home route (`#/`) shows Covenant Youth information, account creation, and sign-in. The **Bishopric tools preview** at `#/bishopric-tools` is linked only for signed-in, active Bishopric accounts. It embeds the interactive fictional ward queue from `bishopric-tools-mock.html`, including expandable requests, state actions, counts, and color-labeled recent activity. The preview changes only its in-memory example roster; it does not approve real accounts. Keys (`#/keys`), Groups, lessons, and progress are shown in the signed-in wireframe. This is client-side route gating for the prototype; static lesson image URLs are not access-controlled by the server.

The **Bishopric reporting concepts preview** at `#/bishopric-reporting` is also available only to signed-in, active Bishopric accounts. It embeds the unchanged `bishopric-reporting-mock.html` page with fictional results for a year and 50 youth. Its figures do not come from the local account database. Both Bishopric mock HTML files are access-controlled by the local server.

If an older preview is still running on port 4173, set `PORT` to `4174` before running the server and use the Profile page's import button to bring over its browser-only completion records. The local `progress-bridge.html` page supports that one-time preview transition.

New lesson completions also save a timestamp. When the final required lesson in a Key is completed, the dashboard highlights that Key and shows the completion date beneath its icon. Keys completed before date tracking display “date unavailable” because their original completion time was not recorded.

The **My progress** page at `#/progress` summarizes completed Keys, Keys in progress, and required lessons. It lists completed Keys with their recorded dates and links back to each Key. It uses the same browser-local progress as the rest of the wireframe.

The **Groups** page at `#/groups` shows seven supplied posters in two columns, with Required Groups 1 and 2 first. Their badges link to Key pages and lessons. The five themed posters are previews while their Key lessons are being prepared. Completed required Keys have an inset green highlight and date on the poster; Keys in progress show a percentage bar. The First Aid Key page begins its guide with the badge and certificate, then the cover, then the 14 supplied guide pages. Those 14 pages determine First Aid progress. Its earlier one-page sample lesson is no longer counted as completion of the full guide.

When all required lessons in a Key are complete, the Key page and any completed lesson in that Key show a **Notify Bishopric** demo button. Clicking it displays the requested follow-up confirmation and saves that demo state locally for the Key. This wireframe does not send a notification.

## Assumptions

All 18 icons from the two supplied “Required” sheets are shown as Keys. The updated Group 2 poster has Gatherer of Israel in place of the former duplicate Communication badge. The Book of Mormon Key has 17 page-based lessons using the supplied cover and pages. Page 16 is identified as an optional challenge and excluded from percentage calculations. First Aid uses the 14 supplied guide pages. Other required Keys currently have one sample lesson each and need approved program copy. The five themed posters need lesson content before their badges can become Key links.
