import { bookOfMormonLessons } from "./book-of-mormon.js";
import { firstAidLessons } from "./first-aid.js";
// Key names and icons follow the supplied Group 1 and Group 2 reference sheets.
// Lessons marked as samples are wireframe placeholders pending approved program copy.
const sampleSections = (name) => [
  { type: "intro", title: "Introduction", body: `This is a sample starting point for learning about ${name.toLowerCase()}.` },
  { type: "objective", title: "Learning objective", body: `Identify one practical step you can take to strengthen your ${name.toLowerCase()} skills.` },
  { type: "instruction", title: "Learn", body: "Review the ideas with a parent, leader, or trusted adult. Add approved program teaching here." },
  { type: "activity", title: "Try it", body: "Choose one small action to practice this week. Write down what you plan to do." },
  { type: "reflection", title: "Reflect", body: "What did you learn? What would you do differently next time?" }
];
const key = (id,name,description,sheet,col,row,lessons) => ({id,name,description,icon:{sheet,col,row},lessons:lessons.map(([lessonId,title,description,sections])=>({id:lessonId,keyId:id,title,description,estimatedDuration:"10–15 min",sections:sections||sampleSections(name)}))});
export const keys = [
  {...key("first-aid","First Aid","Learn how to respond and help safely.",1,0,0,[]),lessons:firstAidLessons},
  key("physical-fitness","Physical Fitness","Build healthy movement habits.",1,1,0,[["movement-plan","Make a Movement Plan","Sample lesson: set a realistic activity goal."]]),
  key("personal-health","Personal Health","Practice habits that support well-being.",1,2,0,[["healthy-habits","Healthy Habits","Sample lesson: notice daily choices that support health."]]),
  key("emergency-preparedness","Emergency Preparedness","Plan ahead for unexpected situations.",1,0,1,[["emergency-plan","Create an Emergency Plan","Sample lesson: discuss a family plan."]]),
  key("communication","Communication","Speak, listen, and understand others.",1,1,1,[["active-listening","Practice Active Listening","Sample lesson: listen with care and ask a follow-up question."]]),
  key("career-preparation","Career Preparation","Explore interests and future opportunities.",1,2,1,[["strengths","Explore Your Strengths","Sample lesson: name skills you enjoy using."]]),
  {...key("book-of-mormon","Book of Mormon","Study its purpose and teachings of Jesus Christ.",1,0,2,[]),lessons:bookOfMormonLessons},
  key("new-testament","New Testament","Explore the life and teachings of Jesus Christ.",1,1,2,[["new-testament-study","A Study Plan","Sample lesson: plan time to study."]]),
  key("home-management","Home Management","Learn practical ways to care for your home.",1,2,2,[["home-routine","Build a Home Routine","Sample lesson: practice one helpful responsibility."]]),
  key("doctrine-covenants","Doctrine & Covenants","Study latter-day revelations.",2,0,0,[["dc-study","Study a Revelation","Sample lesson: record a question and insight."]]),
  key("leadership","Leadership","Serve and guide with kindness.",2,1,0,[["leadership-service","Lead Through Service","Sample lesson: organize a small act of service."]]),
  key("personal-finance","Personal Finance","Practice wise money decisions.",2,2,0,[["simple-budget","Make a Simple Budget","Sample lesson: plan saving and spending."]]),
  key("old-testament","Old Testament","Explore stories and teachings of faith.",2,0,1,[["old-testament-story","Learn From a Story","Sample lesson: discuss a scripture story."]]),
  key("citizenship","Citizenship","Contribute to your community.",2,1,1,[["community-action","Take Community Action","Sample lesson: find one way to help locally."]]),
  key("gatherer-of-israel","Gatherer of Israel","Learn about gathering Israel and serving others.",2,2,1,[["gathering-israel","Gathering Israel","Sample lesson: explore one way to invite and serve others."]]),
  key("love-at-home","Love at Home","Make home a place of care and belonging.",2,0,2,[["acts-of-kindness","Acts of Kindness","Sample lesson: plan an act of kindness at home."]]),
  key("social-maturity","Social Maturity","Build respectful relationships.",2,1,2,[["respect","Show Respect","Sample lesson: reflect on another person's perspective."]]),
  key("scholar","Scholar","Develop curiosity and study habits.",2,2,2,[["learning-goal","Set a Learning Goal","Sample lesson: choose something new to learn."]])
];
export const allLessons = keys.flatMap(key => key.lessons);
