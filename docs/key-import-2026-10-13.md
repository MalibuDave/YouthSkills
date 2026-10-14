# Covenant Key import — October 13, 2026

Source: the bishop's shared Google Drive folder, downloaded as one zip
(683 files, 1.7 GB: 635 PNG images, 46 Word documents). Imported by
`scripts/build-themed-keys.mjs` from a manifest built during conversion (DEC-018).

## What was added

| Group | Keys added | Poster badges still without a Key |
|---|---|---|
| Sports | Football, Basketball, Golf, Tennis, Soccer, Baseball, Track & Field | Swimming, Volleyball |
| Outdoors | Bird Watching, Mountain Biking, Kayaking, River Rafting, Camping, Hiking, Fishing, Astronomy | Horseback Riding |
| Animal Habitats | Forest, Jungle, Polar, Ice Age, Insect, Pet, Desert, Ocean, Jurassic Life | — |
| Crafts | Pottery, Woodworking, Metal Work, Sewing, Quilting, Weaving, Leatherwork, Beading, Origami | — |
| Performing Arts | Singing, Brass Instruments | Acting, String Instruments, Percussion, Woodwind, Piano, Electric Instruments, Dancing |
| Additional Keys (no poster) | Geocaching, Savanna Life, Reading | — |

38 Keys, 444 lesson pages. Each Key's cover page opens the Key; every other page is a
lesson, including requirements and sign-off pages. Images were converted from PNG to WebP
at the same resolution (177 MB in total).

**Not imported yet:** the 12 Covenant Advancement sets (Wayfinder, Disciple, Sentinel,
Servant Leader, Ambassador, Man of God / Woman of God, each for Covenant Sons and Covenant
Daughters). They are a new feature (levels with Key minimums and leader sign-offs) that
needs its own design first. The Word documents (the AI image prompts and source text for
each page) were not added; they are a good source for accessible text versions later.

## Questions and fixes for the bishop

**Missing pages**
- *Mountain Biking*: pages 9 and 10 aren't in the folder. The guide goes from "Repairs" (8) to "Sign Offs" (11), so these are probably the two Requirements pages.
- *Insect Life*: page 2 is missing (the other habitats have "Temps & Terrain" or "Joys & Benefits" there).

**Badge choices** (the site uses the first one listed; tell us if another is right)
- *Baseball, Basketball, Football, Tennis, Track & Field*: two designs each. The site uses the newer gold "Covenant Key" design ("Image - … CK"); the Sports poster shows the older plain design.
- *Camping*: two versions; the site uses the newer one (Sep 4).
- *Football*: three versions; the site uses "Image - Football CK".
- *Bird Watching*: the badge is a cardinal; the Outdoors poster shows a robin.
- *Fishing, Soccer, Camping*: the badge only exists under a generic "ChatGPT Image" file name.

**Groups**
- *Geocaching* isn't on the Outdoors poster (Horseback Riding is, but has no Key yet). Is Geocaching an Outdoors Key, a replacement for Horseback Riding, or a second Outdoors group?
- *Savanna Life* isn't on the Animal Habitats poster (which has nine others). Where does it belong?
- *Reading* isn't on any poster. Which group is it in?

**Files to tidy**
- *Pet Life*: the Requirements page is saved as "ChatGPT Image Sep 25, 2026…"; the site places it last.
- *Woman of God* (Covenant Daughters) folder contains the *Man of God* prompt document.
- *Covenant Sons Ambassador* has a "… - Copy" prompt document.
- Mixed page naming (e.g. "Pg 00 - Cover" and "Pg 0 - Benefits", "Pg 4B", "Pg 10B", "11. River Rafting…") was read correctly, but consistent "Pg N - Title" names would make future imports easier.

## Re-importing

When the bishop sends updated folders: convert them with the same script
(`convert-keys.py`, kept with the import on Dave's computer in `Downloads/cy-import/`),
copy `content/keys/` into the repo, then run
`node scripts/build-themed-keys.mjs content/keys/manifest.json`. Group membership,
poster positions and coming-soon badges are set at the top of that script.
