const base = "/first-aid-pages";

export const firstAidBadge = `${base}/Badge - First Aid CK.png`;
export const firstAidCertificate = `${base}/Certificate2 - First Aid.png`;
export const firstAidCover = `${base}/CK - First Aid - Cover Page A.png`;

const pages = [
  [1, "First Aid Introduction"],
  [2, "Call for Help"],
  [3, "Personal Safety & Scene Check"],
  [4, "CPR — Adult"],
  [5, "CPR — Child"],
  [6, "Bleeding Control"],
  [7, "Wound Care"],
  [8, "Burns"],
  [9, "Sprains, Strains & Fractures"],
  [10, "Be Prepared"],
  [11, "Explain & Demonstrate"],
  [12, "Requirements — Part 1"],
  [13, "Requirements — Part 2"],
  [14, "Requirements Summary"]
];

export const firstAidLessons = pages.map(([number,title]) => ({
  id:`first-aid-page-${number}`,
  keyId:"first-aid",
  number,
  title,
  description:`Page ${number} of the supplied First Aid Covenant Key guide.`,
  estimatedDuration:"At your own pace",
  sourcePage:`${base}/CK - First Aid - Page ${number}.png`,
  tasks:number >= 12
    ? ["Review this requirements page with a parent or guardian."]
    : ["Study this page in the supplied First Aid guide.", "Discuss or practice what you learned with a parent or guardian."],
  sections:[]
}));
