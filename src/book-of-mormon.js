// Each supplied page is one lesson in the Book of Mormon Key.
const pages = [
  [1,"Purpose","purpose","covenantyouthprogram4","Pg 1 - BOM Purpose.png"],
  [2,"Doctrinal Mastery Scriptures A","scripture","covenantyouthprogram4","Pg 2 - BOM Scriptures A.png"],
  [3,"Doctrinal Mastery Scriptures B","scripture","covenantyouthprogram4","Pg 3 - BOM Scriptures B.png"],
  [4,"Doctrinal Mastery Scriptures C","scripture","covenantyouthprogram4","Pg 4 - BOM Scriptures C.png"],
  [5,"Doctrinal Mastery Scriptures D","scripture","covenantyouthprogram4","Pg 5 - BOM Scriptures D.png"],
  [6,"Doctrinal Mastery Scriptures E","scripture","covenantyouthprogram4","Pg 6 - BOM Scriptures E.png"],
  [7,"Doctrinal Mastery Scriptures F","scripture","covenantyouthprogram4","Pg 7 - BOM Scriptures F.png"],
  [8,"Doctrinal Sermons A","sermon","covenantyouthprogram4","Pg 8 - BOM Sermons A.png"],
  [9,"Doctrinal Sermons B","sermon","covenantyouthprogram5","Pg 9 - BOM Sermons B.png"],
  [10,"Doctrinal Sermons C","sermon","covenantyouthprogram5","Pg 10 - BOM Sermons C.png"],
  [11,"Doctrinal Stories A","story","covenantyouthprogram5","Pg 11 - BOM Stories A.png"],
  [12,"Doctrinal Stories B","story","covenantyouthprogram5","Pg 12 - BOM Stories B.png"],
  [13,"Doctrinal Stories C","story","covenantyouthprogram5","Pg 13 - BOM Stories C.png"],
  [14,"Doctrinal Stories D","story","covenantyouthprogram5","Pg 14 - BOM Stories D.png"],
  [15,"Book of Mormon Experience","experience","covenantyouthprogram5","Pg 15 - BOM Experience.png"],
  [16,"Book of Mormon Challenge","challenge","covenantyouthprogram5","Pg 16 - BOM Challenge.png"],
  [17,"Covenant Key Requirements","requirements","covenantyouthprogram5","Pg 17 - BOM Requirements.png"]
];
const taskCopy = {
  purpose:["Read the purpose page.","Write one reason you want to study the Book of Mormon."],
  scripture:["Study the four passages on this page in your Book of Mormon.","Record what you learned in a scripture journal and share it with a parent or guardian."],
  sermon:["Read the two sermons on this page in your Book of Mormon.","Record a teaching that stood out and share it with a parent or guardian."],
  story:["Read the two accounts on this page in your Book of Mormon.","Record a lesson from the stories and retell one to a parent or guardian."],
  experience:["Review the six-part reading plan on this page.","Read the six parts in your Book of Mormon and discuss them with a parent or guardian."],
  challenge:["Review the optional invitation from Moroni 10.","If you choose to take the challenge, ponder and pray as the page describes."],
  requirements:["Review the requirements summary.","Reflect on what you learned and discuss your journey with a parent or guardian."]
};
export const bookOfMormonLessons = pages.map(([number,title,category,folder,file])=>({
  id:`bom-page-${number}`, keyId:"book-of-mormon", number, title, category,
  description:category==="challenge" ? "Optional invitation based on Moroni 10." : `Page ${number} of the supplied Book of Mormon study sequence.`,
  estimatedDuration:"At your own pace",
  sourcePage:`/${folder}/${file}`,
  tasks:taskCopy[category],
  optional:category==="challenge",
  sections:[]
}));
export const bookOfMormonCover = "/covenantyouthprogram4/IMAGE - BOM Cover.png";

