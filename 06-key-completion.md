# Topic 06 — Key Completion Requirements
Scope: what "completing" a lesson and a Key means, how much enforcement to stop click-through, and what happens on completion.

## Why it matters
- Kids will speedrun Next → Next → Complete. Completion triggers bishopric notification and a certificate to present, so it should mean something.
- Tension: enough friction that completion is meaningful, without becoming an LMS monstrosity.

## Order of work (agreed)
1. Completion philosophy → 2. Key/Lesson state machine → 3. Enforcement rules → 4. UI and technical requirements.

## Questions to answer
- **Lesson completion:** reading? minimum time? answering questions? activity? self-attestation?
- **Key completion:** automatic when all lessons are done, or a final activity/reflection/acknowledgment?
- **Integrity:** how much do we prevent click-through vs. accept an honor system?
- **Time minimums:** hard gate, soft nudge, or just telemetry? Page-open time isn't evidence (kid opens First Aid, plays Xbox 20 minutes).
- **States:** more than true/false — Not Started → In Progress → Completed, with lesson state underneath.
- **Who can change completion:** youth, parent, bishopric, system? Can it be reversed?
- **Evidence:** some Keys need real-world activity outside the site.
- **Recognition:** badge state, certificate, leader notification, dashboard.
- **Audit/history:** store when things were completed? Immutable?
- **Content changes** after someone already completed a Key.
- **Revisiting** completed lessons.
- **Offline/book equivalency:** digital credit for work done from the printed book.

## Leading idea
- No single global rule. **Each Key gets its own completion policy** set by the content author:
  Required lessons ✓ · Minimum engagement (optional) · Knowledge check (optional) · Reflection (optional) · Activity confirmation (optional) · Parent/leader confirmation (optional).
- First Aid might need knowledge/skill checks; personal Keys (prayer, friendship) shouldn't have timers.

## V1 stance
- Valid V1: youth clicks "Complete" and we trust them. Cheap; find out whether cheating is a real problem, then add the smallest fix (60-second minimum, 3 questions, bishopric confirmation…).
- Open question for Bishop Porter: what does completion mean in his program?
