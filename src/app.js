import { keys, allLessons } from "./data.js";
import { bookOfMormonCover } from "./book-of-mormon.js";
import { firstAidBadge, firstAidCertificate, firstAidCover } from "./first-aid.js";
import { readProgress, markComplete, progressFor, keyCompletedAt, readSteps, setStep, readReflection, setReflection, readBishopricNotification, setBishopricNotification } from "./progress.js";
import { accountPage, accountReady, currentAccount, bindAccount, loadAccount, saveLessonToAccount, verifyEmailLink } from "./account-ui.js";

const app = document.querySelector("#app");
const html = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const keyUrl = id => `#/keys/${encodeURIComponent(id)}`;
const lessonUrl = (keyId,id) => `#/keys/${encodeURIComponent(keyId)}/lessons/${encodeURIComponent(id)}`;
const firstAidIntroUrl = "#/keys/first-aid/intro";
const firstAidCoverUrl = "#/keys/first-aid/cover";
const icon = (item,large=false) => `<span class="key-icon ${large?"large":""}" aria-hidden="true" style="--sheet:url('../${item.icon.sheet === 1 ? "covenantyouthprogram3/Group 1 - Required CK" : "group-posters/Group 2 Required CK"}.png');--col:${item.icon.col};--row:${item.icon.row}"></span>`;
const progress = (lessons,completed) => {const p=progressFor(lessons,completed);return `<div class="progress-label"><span>${p.done} of ${p.total} lessons complete</span><strong>${p.percent}%</strong></div><div class="track" role="progressbar" aria-valuenow="${p.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress"><span style="width:${p.percent}%"></span></div>`;};
const isKeyComplete = (key,completed) => {const p=progressFor(key.lessons,completed);return p.total>0 && p.percent===100;};
const completionDate = (key,completed) => {
  if(!isKeyComplete(key,completed)) return "";
  const date=keyCompletedAt(key,completed);
  return date ? `<span class="key-completion-date">✓ <time datetime="${date}">Completed ${new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(new Date(date))}</time></span>` : `<span class="key-completion-date">✓ Completed · date unavailable</span>`;
};
const shell = (content,limited=false) => `<header class="site-header"><div class="wrap header-inner"><a class="brand" href="${limited?"#/account":"#/keys"}">✦ Covenant Keys</a><nav class="header-nav" aria-label="Main navigation">${limited?"":`<a href="#/groups">Groups</a><a href="#/keys">Keys</a><a href="#/progress">My progress</a>`}<a href="#/account">My account</a>${currentAccount()?.role==="bishopric"&&currentAccount()?.status==="active"?`<a href="#/bishopric-tools">Bishopric tools</a>`:""}</nav></div></header><main id="main" class="wrap">${content}</main><footer class="wrap footer">Covenant Youth • A working wireframe</footer>`;
const publicShell=(content,wide=false)=>`<header class="public-header"><div class="wrap public-header-inner"><a class="public-brand" href="#/">✦ Covenant Youth</a><nav aria-label="Public navigation"><a href="#/">Home</a><a href="#/account/login">Sign in</a><a class="public-nav-cta" href="#/account/register">Create account</a></nav></div></header><main id="main" class="${wide?"":"wrap"}">${content}</main><footer class="public-footer"><div class="wrap"><strong>Covenant Youth</strong><span>Learn • Practice • Grow</span><span>Working wireframe</span></div></footer>`;
const landingPage=()=>publicShell(`<section class="landing-hero"><div class="landing-hero-copy"><p class="landing-kicker">LEARN • PRACTICE • GROW</p><h1>Grow in faith. Build skills. Remember what you learn.</h1><p>Covenant Youth provides learning material for youth to grow in their faith, develop skills, and track what they have learned.</p><div class="landing-actions"><a class="landing-primary" href="#/account/register">Create an account</a><a class="landing-secondary" href="#/account/login">Sign in</a></div></div><div class="landing-hero-art"><img src="${bookOfMormonCover}" alt="Supplied Book of Mormon Covenant Key artwork"></div></section><section class="landing-overview wrap" aria-labelledby="landing-overview-title"><p class="landing-section-kicker">YOUR COVENANT YOUTH JOURNEY</p><h2 id="landing-overview-title">A place to learn, practice, and grow</h2><p class="landing-overview-intro">Explore lessons at your own pace, put ideas into practice, and see how far you have come.</p><div class="landing-cards"><article class="landing-card"><img src="${bookOfMormonCover}" alt="Book of Mormon Covenant Key cover"><div><h3>Grow in faith</h3><p>Study lesson material and record what you learn.</p></div></article><article class="landing-card"><img src="${firstAidCover}" alt="First Aid Covenant Key cover"><div><h3>Develop skills</h3><p>Practice useful skills through guided Keys and lessons.</p></div></article><article class="landing-card"><img src="/covenantyouthprogram3/Group 1 - Required CK.png" alt="Group 1 Covenant Keys poster"><div><h3>Track your journey</h3><p>See completed Keys, progress, and recent milestones in your profile.</p></div></article></div></section><section class="landing-bottom"><div class="wrap"><div><p class="landing-section-kicker">READY TO BEGIN?</p><h2>Start your Covenant Youth journey.</h2><p>Create a profile to open Covenant Keys and begin learning.</p></div><a class="landing-primary" href="#/account/register">Create an account →</a></div></section>`,true);
const signInGate=()=>publicShell(`<section class="account-page account-narrow"><div class="account-panel account-gate"><p class="eyebrow">COVENANT KEYS</p><h1>Sign in to continue</h1><p>Create an account or sign in to explore Keys, complete lessons, and track your progress.</p><div class="account-actions"><a class="account-primary" href="#/account/login">Sign in</a><a class="account-secondary" href="#/account/register">Create an account</a></div></div></section>`);
const resource = (src,label) => `<a class="reference-link" href="${src}" target="_blank" rel="noopener">Open ${html(label)} at full size <span aria-hidden="true">↗</span></a>`;
function dashboard(completed) {
  return shell(`<section class="hero"><p class="eyebrow">YOUR JOURNEY</p><h1>Grow one Key at a time.</h1><p>Explore life skills, study, and service. Choose a Key to begin.</p><div class="overall"><div><span class="eyebrow">OVERALL PROGRESS</span><h2>Your progress</h2></div><div class="overall-meter">${progress(allLessons,completed)}</div></div></section><section aria-labelledby="keys-heading"><div class="section-heading"><div><p class="eyebrow">EXPLORE</p><h2 id="keys-heading">Covenant Keys</h2></div><p>Choose a Key to see its lessons.</p></div><div class="key-grid">${keys.map(k=>`<a class="key-card ${isKeyComplete(k,completed)?"is-complete":""}" href="${keyUrl(k.id)}">${icon(k)}${completionDate(k,completed)}<h3>${html(k.name)}</h3><p>${html(k.description)}</p>${progress(k.lessons,completed)}<span class="card-action">View lessons <span aria-hidden="true">→</span></span></a>`).join("")}</div></section>`);
}
function groupsPage(completed) {
  const groupHotspot=k=>{
    const state=progressFor(k.lessons,completed);
    const complete=state.total>0&&state.percent===100;
    const date=complete?keyCompletedAt(k,completed):null;
    const shortDate=date?new Intl.DateTimeFormat(undefined,{month:"numeric",day:"numeric",year:"2-digit"}).format(new Date(date)):"date unavailable";
    const status=complete?`<span class="group-hotspot-status"><span>✓ ${html(shortDate)}</span></span>`:state.done>0?`<span class="group-hotspot-status"><span>${state.percent}% complete</span><span class="group-hotspot-track" role="progressbar" aria-label="${html(k.name)} progress" aria-valuenow="${state.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${state.percent}%"></span></span></span>`:"";
    const label=`${k.name}, ${complete?`completed ${shortDate}`:state.done>0?`${state.percent}% complete`:"not started"}. Open Key and lessons`;
    return `<a class="group-hotspot ${complete?"is-complete":""}" href="${keyUrl(k.id)}" style="--col:${k.icon.col};--row:${k.icon.row}" aria-label="${html(label)}">${status}</a>`;
  };
  const posters=[
    {id:"required-1",title:"Group 1",eyebrow:"REQUIRED COVENANT KEYS",src:"/covenantyouthprogram3/Group 1 - Required CK.png",sheet:1},
    {id:"required-2",title:"Group 2",eyebrow:"REQUIRED COVENANT KEYS",src:"/group-posters/Group 2 Required CK.png",sheet:2},
    {id:"sports",title:"Sports · Group 1",src:"/group-posters/Sports - Group 1 CK.png"},
    {id:"outdoors",title:"Outdoors · Group 1",src:"/group-posters/Outdoors - Group 1 CK.png"},
    {id:"animals",title:"Animal Habitats · Group 1",src:"/group-posters/Animal Habitats Group 1 CK.png"},
    {id:"crafts",title:"Crafts · Group 1",src:"/group-posters/Crafts - Group 1 CK.png"},
    {id:"performing",title:"Performing Arts · Group 1",src:"/group-posters/Performing Arts Group 1 CK.png"}
  ];
  return shell(`<section class="groups-page"><div class="groups-heading"><p class="eyebrow">COVENANT KEY PATHS</p><h1>Groups</h1><p>Select a badge in a required group poster to open that Key and its lessons. More group lessons are being prepared.</p></div><div class="groups-grid">${posters.map(group=>`<section class="group-section" aria-labelledby="group-${group.id}-heading"><div class="group-section-heading"><p class="eyebrow">${group.eyebrow||"GROUP PREVIEW"}</p><h2 id="group-${group.id}-heading">${group.title}</h2></div><div class="group-poster"><img src="${group.src}" alt="${group.title} Covenant Keys poster with nine badges">${group.sheet?keys.filter(k=>k.icon.sheet===group.sheet).map(groupHotspot).join(""):""}</div>${group.sheet?"":'<p class="group-preview-note">Key pages and lessons for this group are coming soon.</p>'}</section>`).join("")}</div></section>`);
}
function progressPage(completed) {
  const rows=keys.map(key=>({key,...progressFor(key.lessons,completed),date:keyCompletedAt(key,completed)}));
  const finished=rows.filter(row=>row.total>0&&row.percent===100).sort((a,b)=>{
    if(a.date&&b.date) return b.date.localeCompare(a.date);
    return a.date?-1:b.date?1:a.key.name.localeCompare(b.key.name);
  });
  const underway=rows.filter(row=>row.done>0&&row.percent<100).sort((a,b)=>b.percent-a.percent||a.key.name.localeCompare(b.key.name));
  const notStarted=rows.filter(row=>row.done===0&&row.percent<100);
  const overall=progressFor(allLessons,completed);
  const next=underway[0]||notStarted[0];
  const dateLabel=date=>date?`<time datetime="${date}">${new Intl.DateTimeFormat(undefined,{month:"long",day:"numeric",year:"numeric"}).format(new Date(date))}</time>`:"Date unavailable";
  const activeCard=row=>`<a class="progress-key-card" href="${keyUrl(row.key.id)}">${icon(row.key)}<div class="progress-key-copy"><h3>${html(row.key.name)}</h3>${progress(row.key.lessons,completed)}<span class="progress-card-link">Continue Key →</span></div></a>`;
  return shell(`<section class="progress-page"><div class="progress-page-heading"><p class="eyebrow">YOUR JOURNEY</p><h1>My progress</h1><p>See what you have finished and where you can continue. Progress is saved in this browser.</p></div><div class="progress-summary"><div><strong>${finished.length}</strong><span>Keys completed</span></div><div><strong>${underway.length}</strong><span>Keys in progress</span></div><div><strong>${overall.done}<small> / ${overall.total}</small></strong><span>Required lessons complete</span></div></div><section class="progress-section" aria-labelledby="progress-continue"><div class="section-heading"><div><p class="eyebrow">KEEP GROWING</p><h2 id="progress-continue">In progress</h2></div></div>${underway.length?`<div class="progress-key-grid">${underway.map(activeCard).join("")}</div>`:`<p class="progress-empty">No Keys in progress yet.${next?` <a href="${keyUrl(next.key.id)}">Start ${html(next.key.name)} →</a>`:""}</p>`}</section><section class="progress-section" aria-labelledby="progress-finished"><div class="section-heading"><div><p class="eyebrow">MILESTONES</p><h2 id="progress-finished">Completed Keys</h2></div></div>${finished.length?`<ol class="completed-key-list">${finished.map(row=>`<li><a href="${keyUrl(row.key.id)}">${icon(row.key)}<span class="completed-key-copy"><strong>${html(row.key.name)}</strong><span>All ${row.total} required ${row.total===1?"lesson":"lessons"} complete</span></span><span class="completed-key-date">${dateLabel(row.date)}</span><span aria-hidden="true">→</span></a></li>`).join("")}</ol>`:`<p class="progress-empty">Completed Keys will appear here with their completion dates.</p>`}</section>${notStarted.length?`<section class="progress-section" aria-labelledby="progress-next"><div class="section-heading"><div><p class="eyebrow">EXPLORE</p><h2 id="progress-next">Ready to start</h2></div></div><p class="progress-next-copy">${notStarted.length} ${notStarted.length===1?"Key is":"Keys are"} waiting for you. <a href="#/keys">Explore all Keys →</a></p></section>`:""}</section>`);
}
function lessonRow(k,l,index,completed) {
  return `<a class="lesson-row" href="${lessonUrl(k.id,l.id)}"><span class="lesson-number">${String(l.number||index+1).padStart(2,"0")}</span><span class="lesson-copy"><strong>${html(l.title)}</strong><span>${html(l.description)}</span></span><span class="status">${completed.has(l.id)?"✓ Complete":l.optional?"◇ Optional":"○ Not started"}</span><span aria-hidden="true">→</span></a>`;
}
function bookOfMormonKey(k,completed) {
  return `<section class="bom-cover-frame" aria-label="Book of Mormon cover"><img src="${bookOfMormonCover}" alt="Book of Mormon Covenant Key cover with youth reading and the Book of Mormon icon"></section><section class="bom-path-intro"><p class="eyebrow">BOOK OF MORMON STUDY PATH</p><h2>Explore each page</h2><p>Open the pages below in order. Each lesson presents the supplied page in full, followed by simple steps to record and mark your progress. The Moroni 10 challenge is optional and does not affect Key progress.</p></section><section class="lesson-list lesson-group" aria-labelledby="lessons-heading"><div class="section-heading"><div><p class="eyebrow">${progressFor(k.lessons,completed).done} OF ${progressFor(k.lessons,completed).total} REQUIRED PAGES COMPLETE</p><h2 id="lessons-heading">Lesson pages</h2></div></div>${k.lessons.map((l,index)=>lessonRow(k,l,index,completed)).join("")}</section>`;
}
function firstAidKey(k,completed) {
  const state=progressFor(k.lessons,completed);
  return `<section class="first-aid-path"><p class="eyebrow">FIRST AID STUDY PATH</p><h2>Begin with the badge and certificate</h2><p>View the badge and certificate, continue to the cover, then work through all 14 supplied guide pages in order.</p><a class="first-aid-start" href="${firstAidIntroUrl}">Start the First Aid guide →</a></section><section class="lesson-list lesson-group" aria-labelledby="lessons-heading"><div class="section-heading"><div><p class="eyebrow">${state.done} OF ${state.total} PAGES COMPLETE</p><h2 id="lessons-heading">Guide pages</h2></div></div>${k.lessons.map((l,index)=>lessonRow(k,l,index,completed)).join("")}</section>`;
}
function firstAidOpening(stage) {
  const intro=stage==="intro";
  return shell(`<nav aria-label="Breadcrumb" class="breadcrumb"><a href="#/groups">Groups</a><span aria-hidden="true">/</span><a href="${keyUrl("first-aid")}">First Aid</a></nav><article class="first-aid-opening"><p class="eyebrow">FIRST AID GUIDE · PAGE ${intro?"1":"2"}</p><h1>${intro?"Badge & certificate":"First Aid cover"}</h1><p>${intro?"Preview the First Aid badge and certificate before beginning the guide.":"Begin the First Aid Covenant Key with its supplied cover page."}</p>${intro?`<div class="first-aid-art-pair"><figure><img src="${firstAidBadge}" alt="First Aid Covenant Key badge"><figcaption>First Aid badge</figcaption></figure><figure><img src="${firstAidCertificate}" alt="First Aid certificate of completion template"><figcaption>Certificate preview</figcaption></figure></div>`:`<div class="first-aid-cover"><img src="${firstAidCover}" alt="First Aid Covenant Key cover page"></div>`}<div class="first-aid-page-nav">${intro?`<a href="${firstAidCoverUrl}">Continue to cover page →</a>`:`<a href="${lessonUrl("first-aid","first-aid-page-1")}">Begin page 1 of the guide →</a>`}<a href="${intro?keyUrl("first-aid"):firstAidIntroUrl}">← ${intro?"Back to First Aid":"Badge & certificate"}</a></div></article>`);
}
function keyCompletionCallout(k,completed) {
  const keyProgress=progressFor(k.lessons,completed);
  if(keyProgress.total===0||keyProgress.percent!==100) return "";
  const notification=readBishopricNotification(k.id);
  if(notification==="confirmed") return `<section class="key-complete-callout" aria-labelledby="key-complete-heading"><div><p class="eyebrow">KEY COMPLETE · DEMO</p><h2 id="key-complete-heading">Well done completing ${html(k.name)}!</h2><p class="notification-confirmed" role="status">A notification has been sent to the bishopric of your successful completion of this Key. Please make sure to follow-up at your next Youth meeting or on Sunday.</p></div></section>`;
  return `<section class="key-complete-callout" aria-labelledby="key-complete-heading"><div><p class="eyebrow">KEY COMPLETE · DEMO</p><h2 id="key-complete-heading">Well done completing ${html(k.name)}!</h2><p>Please let the Bishopric know by clicking the <strong>Notify Bishopric</strong> button.</p></div><button class="notify-button" type="button" data-notify-bishopric="${html(k.id)}" aria-label="Demo notification to Bishopric that ${html(k.name)} is complete">Notify Bishopric</button></section>`;
}
function keyPage(k,completed) {
  const lessons=k.id==="book-of-mormon" ? bookOfMormonKey(k,completed) : k.id==="first-aid" ? firstAidKey(k,completed) : `<section class="lesson-list" aria-labelledby="lessons-heading"><div class="section-heading"><div><p class="eyebrow">NEXT STEPS</p><h2 id="lessons-heading">Lessons</h2></div></div>${k.lessons.map((l,i)=>lessonRow(k,l,i,completed)).join("")}</section>`;
  return shell(`<nav aria-label="Breadcrumb" class="breadcrumb"><a href="#/keys">← All Keys</a></nav><section class="detail-hero ${isKeyComplete(k,completed)?"is-complete":""}">${icon(k,true)}<div><p class="eyebrow">COVENANT KEY</p><h1>${html(k.name)}</h1>${completionDate(k,completed)}<p>${html(k.description)}</p><div class="detail-progress">${progress(k.lessons,completed)}</div></div></section>${keyCompletionCallout(k,completed)}${lessons}`);
}
function lessonPage(k,l,completed) {
  const steps=readSteps(l);
  const hasTasks=Boolean(l.tasks?.length);
  const reflection=readReflection(l);
  const requirementsMet=(!hasTasks||steps.every(Boolean))&&reflection.trim().length>0;
  const next=k.lessons[k.lessons.findIndex(item=>item.id===l.id)+1];
  const pageContent=l.sourcePage
    ? `<section class="supplied-page" aria-label="${html(l.title)} page"><a href="${l.sourcePage}" target="_blank" rel="noopener" aria-label="Open ${html(l.title)} at full size"><img src="${l.sourcePage}" alt="Supplied page ${l.number}: ${html(l.title)}"></a><div class="page-toolbar">${resource(l.sourcePage,"this page")}</div></section>`
    : `<div class="sections">${l.sections.map(s=>`<section class="lesson-section"><p class="eyebrow">${html(s.type)}</p><h2>${html(s.title)}</h2><p>${html(s.body)}</p></section>`).join("")}</div>`;
  const taskContent=hasTasks ? `<fieldset class="task-list"><legend>Steps to complete</legend><p>Check each step when you have done it. Your checks are saved in this browser.</p>${l.tasks.map((task,index)=>`<label class="task"><input type="checkbox" data-step="${index}" ${steps[index]?"checked":""}><span><strong>Step ${index+1}</strong>${html(task)}</span></label>`).join("")}</fieldset>` : "";
  const reflectionContent=`<section class="reflection-panel" aria-labelledby="reflection-heading"><label id="reflection-heading" for="lesson-reflection">What did you learn?</label><p>Record what you learned in this lesson and how it will help you grow.</p><textarea id="lesson-reflection" rows="6" placeholder="Write your reflection here…">${html(reflection)}</textarea><span class="saved-note" id="reflection-status" aria-live="polite">${reflection.trim()?"Saved in this browser":""}</span></section>`;
  const completionHelp=completed.has(l.id) ? "This lesson is complete." : hasTasks ? "Complete the steps and reflection above to enable this button." : "Complete the reflection above to enable this button.";
  const completePanel=`<div class="complete-panel"><div><h2>${completed.has(l.id)?"Lesson complete":"Ready to finish?"}</h2><p id="complete-help">${completionHelp}</p></div><button id="complete-button" type="button" ${completed.has(l.id)||!requirementsMet?"disabled":""}>${completed.has(l.id)?"✓ Lesson complete":"Mark Lesson Complete"}</button></div>`;
  const notifyCallout=completed.has(l.id) ? keyCompletionCallout(k,completed) : "";
  return shell(`<nav aria-label="Breadcrumb" class="breadcrumb"><a href="#/keys">All Keys</a><span aria-hidden="true">/</span><a href="${keyUrl(k.id)}">${html(k.name)}</a></nav><article class="lesson-layout ${l.sourcePage?"image-lesson":""}"><div class="lesson-header"><p class="eyebrow">${html(k.name)} • ${l.number?`PAGE ${l.number} • `:""}${html(l.estimatedDuration)}</p><h1>${html(l.title)}</h1><p>${html(l.description)}</p><span class="status">${completed.has(l.id)?"✓ Complete":l.optional?"◇ Optional":"○ Not started"}</span></div>${pageContent}${taskContent}${reflectionContent}${completePanel}${notifyCallout}${completed.has(l.id)&&next?`<a class="next-link" href="${lessonUrl(k.id,next.id)}">Continue to next page →</a>`:""}<a class="back-link" href="${keyUrl(k.id)}">← Back to ${html(k.name)}</a></article>`);
}
function render() {
  const parts=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean).map(decodeURIComponent);
  if(!accountReady()){app.innerHTML=publicShell(`<section class="account-page account-narrow"><h1>Loading Covenant Youth…</h1></section>`);return;}
  const signedIn=Boolean(currentAccount()),active=currentAccount()?.status==="active";
  if(parts[0]==="account"&&parts[1]==="verify"&&parts[2]&&parts.length===3){app.innerHTML=publicShell(`<section class="account-page account-narrow"><h1>Verifying your email…</h1></section>`);void verifyEmailLink(parts[2]).then(()=>{location.hash="#/account";render();});return;}
  if(parts[0]==="account"&&parts.length<=2){app.innerHTML=signedIn?shell(accountPage(),!active):publicShell(accountPage(parts[1]));bindAccount(render);return;}
  if(!signedIn){app.innerHTML=parts.length===0?landingPage():signInGate();return;}
  // Until the ward approves the account, members only see their account page (topic 11 §4).
  if(!active){location.hash="#/account";return;}
  if(parts.length===1&&parts[0]==="bishopric-tools"){if(currentAccount()?.role!=="bishopric"){app.innerHTML=shell(`<section class="not-found"><h1>Bishopric access required</h1><p>This page is for signed-in Bishopric members.</p><a href="#/account">Return to your account</a></section>`);return;}app.innerHTML=shell(`<section class="bishopric-embed"><div class="bishopric-embed-heading"><p class="eyebrow">BISHOPRIC TOOLS</p><h1>Ward requests preview</h1><p>Explore the interactive Bishopric tools mockup with fictional people. Changes here do not affect real accounts.</p></div><iframe id="bishopric-preview" src="/bishopric-tools-mock.html" title="Interactive Bishopric tools preview"></iframe></section>`);const frame=document.querySelector("#bishopric-preview");frame.addEventListener("load",()=>{const resize=()=>{frame.style.height=`${frame.contentDocument.body.scrollHeight+16}px`;};new ResizeObserver(resize).observe(frame.contentDocument.body);resize();});return;}
  const completed=readProgress();
  const k=parts[0]==="keys" ? keys.find(item=>item.id===parts[1]) : null;
  const l=k && parts[2]==="lessons" ? k.lessons.find(item=>item.id===parts[3]) : null;
  if(parts.length===0||(parts.length===1&&parts[0]==="keys")) app.innerHTML=dashboard(completed);
  else if(parts.length===1&&parts[0]==="groups") app.innerHTML=groupsPage(completed);
  else if(parts.length===1&&parts[0]==="progress") app.innerHTML=progressPage(completed);
  else if(k?.id==="first-aid"&&parts.length===3&&["intro","cover"].includes(parts[2])) app.innerHTML=firstAidOpening(parts[2]);
  else if(k && parts.length===2) app.innerHTML=keyPage(k,completed);
  else if(k && l && parts.length===4) app.innerHTML=lessonPage(k,l,completed);
  else app.innerHTML=shell(`<section class="not-found"><h1>Page not found</h1><p>That Key or lesson is not available.</p><a href="#/keys">Return to all Keys</a></section>`);
  const notifyLink=document.querySelector("[data-notify-bishopric]");
  notifyLink?.addEventListener("click",()=>{
    if(progressFor(k.lessons,readProgress()).percent!==100) return;
    setBishopricNotification(k.id,"confirmed");
    render();
  });
  if(l) {
    const button=document.querySelector("#complete-button");
    const updateCompletionState=()=>{button.disabled=completed.has(l.id)||(Boolean(l.tasks?.length)&&!readSteps(l).every(Boolean))||!readReflection(l).trim();};
    for(const checkbox of document.querySelectorAll("[data-step]")) checkbox.addEventListener("change",event=>{
      setStep(l,Number(event.currentTarget.dataset.step),event.currentTarget.checked);
      updateCompletionState();
    });
    const reflectionField=document.querySelector("#lesson-reflection");
    reflectionField?.addEventListener("input",event=>{
      setReflection(l,event.currentTarget.value);
      document.querySelector("#reflection-status").textContent="Saved in this browser";
      updateCompletionState();
    });
    button.addEventListener("click",()=>{
      if((l.tasks?.length&&!readSteps(l).every(Boolean))||!readReflection(l).trim()) return;
      markComplete(l.id);
      void saveLessonToAccount(l.id);
      render();
      document.querySelector("#complete-button")?.focus();
    });
  }
}
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0);});
render();
if(window.location)void loadAccount().then(render);
