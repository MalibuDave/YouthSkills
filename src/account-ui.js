import { keys } from "./data.js";
import { setProgressAccount, readGuestProgressSnapshot } from "./progress.js";
import { ageFrom, ageGroup, MONTHS, PASSWORD_MIN, PASSWORD_MAX, STATUS } from "./account-rules.js";

const escape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const state={user:null,wards:[],completions:[],error:"",message:"",verifyLink:"",ready:false};
const request=async(path,method="GET",body)=>{const response=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined,credentials:"same-origin",cache:"no-store"});const result=await response.json();if(!response.ok)throw Error(result.error||"Request failed.");return result;};
const legacyProgress=()=>new Promise(resolve=>{
  if(typeof window==="undefined"||location.hostname!=="127.0.0.1"||location.port==="4173"){resolve([]);return;}
  const source="http://127.0.0.1:4173",frame=document.createElement("iframe");
  frame.hidden=true;frame.title="Local progress transfer";
  const finish=value=>{window.removeEventListener("message",receive);frame.remove();clearTimeout(timer);resolve(value);};
  const receive=event=>{if(event.origin===source&&event.data?.type==="cy-legacy-progress")finish(Array.isArray(event.data.completions)?event.data.completions:[]);};
  const timer=setTimeout(()=>finish([]),2000);
  window.addEventListener("message",receive);
  frame.src=`${source}/progress-bridge.html?target=${encodeURIComponent(location.origin)}`;
  document.body.append(frame);
});
const applySession=result=>{state.user=result.user;state.completions=result.completions||[];setProgressAccount(state.user?.id,state.completions);};
export async function loadAccount(){try{const [session,wardList]=await Promise.all([request("/api/session"),request("/api/wards")]);applySession(session);state.wards=wardList.wards;}catch{state.error="Account service is unavailable. Your lesson wireframe still works.";}state.ready=true;}
export function currentAccount(){return state.user;}
export function accountReady(){return state.ready;}
export async function saveLessonToAccount(lessonId){if(!state.user)return;try{const result=await request("/api/completions","POST",{lessonId});state.completions=result.completions;}catch{state.message="This lesson was saved in this browser, but account sync did not finish.";}}
const field=(label,name,type="text",extra="",required=true)=>`<label class="account-field">${label}<input name="${name}" type="${type}" ${extra}${required?" required":""}></label>`;
const wardOptions=()=>`<option value="">Choose your ward</option>${state.wards.map(ward=>`<option value="${ward.id}">${escape(ward.name)}</option>`).join("")}`;
const notice=()=>`${state.error?`<p class="account-error" role="alert">${escape(state.error)}</p>`:""}${state.message?`<p class="account-message" role="status">${escape(state.message)}</p>`:""}`;
const monthOptions=()=>`<option value="">Month</option>${MONTHS.map((month,index)=>`<option value="${index+1}">${month}</option>`).join("")}`;
const registration=()=>`<section class="account-page"><div class="account-heading"><p class="eyebrow">START YOUR JOURNEY</p><h1>Create an account</h1><p>Covenant Youth is for youth ages 13–17 and the adults who support them.</p></div><div class="account-layout"><form id="register-form" class="account-panel" novalidate>
<fieldset class="account-fieldset"><legend>When were you born?</legend><div class="account-form-grid"><label class="account-field">Birth month<select name="birthMonth" required>${monthOptions()}</select></label>${field("Birth year","birthYear","number",`min="1900" max="${new Date().getFullYear()}" inputmode="numeric" placeholder="YYYY"`)}</div></fieldset>
<div id="under13-notice" class="account-stop" role="status" hidden><h2>Accounts aren't available yet</h2><p>Covenant Youth accounts are for ages 13 and up right now. Nothing you entered has been saved.</p></div>
<div id="signup-details" hidden>
<div class="account-form-grid">${field("First name","firstName","text",'autocomplete="given-name" maxlength="80"')}${field("Last name","lastName","text",'autocomplete="family-name" maxlength="80"')}</div>
<fieldset id="parent-fields" class="account-fieldset" hidden><legend>Parent or guardian</legend><p class="field-help">List at least one parent or guardian. This helps your bishopric recognize you.</p><div class="account-form-grid">${field("First name","parent1First","text",'maxlength="80" autocomplete="off"')}${field("Last name","parent1Last","text",'maxlength="80" autocomplete="off"')}</div><p class="account-subhead">Second parent or guardian <span>(optional)</span></p><div class="account-form-grid">${field("First name","parent2First","text",'maxlength="80" autocomplete="off"',false)}${field("Last name","parent2Last","text",'maxlength="80" autocomplete="off"',false)}</div></fieldset>
${field("Email address","email","email",'autocomplete="email" maxlength="254"')}
<div class="account-form-grid">${field("Password","password","password",`autocomplete="new-password" minlength="${PASSWORD_MIN}" maxlength="${PASSWORD_MAX}"`)}${field("Confirm password","confirmPassword","password",`autocomplete="new-password" minlength="${PASSWORD_MIN}" maxlength="${PASSWORD_MAX}"`)}</div><p class="field-help">${PASSWORD_MIN}–${PASSWORD_MAX} characters.</p>
<label class="account-field">Ward<select name="wardId" required>${wardOptions()}</select></label><p class="field-help">Choosing a ward sends a request. Your bishopric approves it before lessons open.</p>
<fieldset id="bishopric-fields" class="account-fieldset account-option" hidden><label class="account-check"><input type="checkbox" name="requestBishopric" id="request-bishopric"> I serve in my ward's bishopric and want bishopric access</label><div id="bishopric-phone" hidden>${field("Phone number","bishopricPhone","tel",'autocomplete="tel" maxlength="20"')}<p class="field-help">A site admin will call to confirm your calling. Bishopric access is reviewed separately from your ward membership.</p></div></fieldset>
<div id="account-feedback" aria-live="polite">${notice()}</div><button class="account-primary" type="submit">Create account</button>
</div><p class="account-switch">Already have an account? <a href="#/account/login">Sign in</a></p></form><aside class="account-aside"><h2>What happens next?</h2><ol><li><strong>Verify your email.</strong> We'll send you a link.</li><li><strong>Your bishopric approves your request.</strong> You'll get an email when they do.</li><li><strong>Start learning.</strong> Keys, lessons, and progress open once you're approved.</li></ol></aside></div></section>`;
const login=()=>`<section class="account-page account-narrow"><div class="account-heading"><p class="eyebrow">WELCOME BACK</p><h1>Sign in</h1><p>Return to your Covenant Key profile.</p></div><form id="login-form" class="account-panel">${field("Email address","email","email",'autocomplete="username"')}${field("Password","password","password",'autocomplete="current-password"')}<div id="account-feedback" aria-live="polite">${notice()}</div><button class="account-primary" type="submit">Sign in</button><p class="account-switch">New here? <a href="#/account/register">Create an account</a></p></form></section>`;
const milestoneRows=()=>{
  const dates=new Map(state.completions.map(item=>[item.lessonId,item.completedAt]));
  const finished=keys.map(key=>{const required=key.lessons.filter(lesson=>!lesson.optional);if(!required.length||required.some(lesson=>!dates.has(lesson.id)))return null;return {key,date:new Date(Math.max(...required.map(lesson=>Date.parse(dates.get(lesson.id))))).toISOString()};}).filter(Boolean);
  const milestones=finished.map(item=>({name:item.key.name,kind:"Key",date:item.date,href:`#/keys/${item.key.id}`}));
  for(const group of [1,2]){const groupKeys=keys.filter(key=>key.icon.sheet===group);if(groupKeys.every(key=>finished.some(item=>item.key.id===key.id))){const when=Math.max(...groupKeys.map(key=>Date.parse(finished.find(item=>item.key.id===key.id).date)));milestones.push({name:`Required Group ${group}`,kind:"Group",date:new Date(when).toISOString(),href:"#/groups"});}}
  const cutoff=Date.now()-45*86400000;
  return milestones.filter(item=>Date.parse(item.date)>=cutoff).sort((a,b)=>b.date.localeCompare(a.date)).map(item=>`<li><a href="${item.href}"><span class="milestone-kind">${item.kind}</span><strong>${escape(item.name)}</strong><time datetime="${item.date}">${new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(new Date(item.date))}</time></a></li>`).join("");
};
const statusPanel=user=>{
  const info=STATUS[user.status]||STATUS.pending;
  const verify=user.status==="unverified"?`<div class="account-actions"><button id="resend-verification" class="account-secondary" type="button">Resend verification email</button></div>${state.verifyLink?`<p class="account-demo-note">Prototype: no email is sent. <a href="${escape(state.verifyLink)}">Open the verification link</a> to continue.</p>`:""}`:"";
  return `<section class="account-status status-${escape(user.status)}" role="status"><p class="eyebrow">ACCOUNT STATUS</p><h2>${escape(info.label)}</h2><p>${escape(info.text.replace("{ward}",user.wardName))}</p>${verify}</section>`;
};
const bishopricRequestText={requested:"Requested — a site admin will call to verify",verified:"Verified — waiting for access",granted:"Granted",denied:"Not granted"};
const profile=()=>{const user=state.user,active=user.status==="active",initials=`${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),bishopric=user.bishopric.length?user.bishopric.map(person=>`${person.firstName} ${person.lastName}`).join(", "):"No Bishopric member listed yet",rows=active?milestoneRows():"",parents=(user.parents||[]).map(person=>`${person.firstName} ${person.lastName}`).join(", ");
return `<section class="account-page"><div class="profile-top"><div class="profile-avatar">${user.photoData?`<img src="${escape(user.photoData)}" alt="Profile picture for ${escape(user.firstName)}">`:escape(initials)}</div><div><p class="eyebrow">${user.role==="bishopric"?"BISHOPRIC PROFILE":"MEMBER PROFILE"}</p><h1>${escape(user.firstName)} ${escape(user.lastName)}</h1><p>${escape(user.wardName)}${active?"":` · ${escape((STATUS[user.status]||STATUS.pending).label)}`}</p></div></div>${active?"":statusPanel(user)}<div class="profile-grid"><section class="account-panel"><h2>About you</h2><dl class="profile-details"><div><dt>Name</dt><dd>${escape(user.firstName)} ${escape(user.lastName)}</dd></div>${user.age!==null&&user.age!==undefined?`<div><dt>Age</dt><dd>${user.age}</dd></div>`:""}${parents?`<div><dt>Parent or guardian</dt><dd>${escape(parents)}</dd></div>`:""}<div><dt>Email</dt><dd>${escape(user.email)}${user.emailVerifiedAt?"":" <span class=\"profile-flag\">Not verified</span>"}</dd></div><div><dt>Ward</dt><dd>${escape(user.wardName)}</dd></div><div><dt>Bishopric</dt><dd>${escape(bishopric)}</dd></div>${user.bishopricRequest?`<div><dt>Bishopric access</dt><dd>${escape(bishopricRequestText[user.bishopricRequest]||user.bishopricRequest)}</dd></div>`:""}</dl>${active?`<label class="photo-control">${user.photoData?"Change":"Add"} profile picture<input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp"></label>${user.photoData?'<button class="account-text-button" id="remove-photo" type="button">Remove picture</button>':""}<p class="field-help">Optional. PNG, JPEG, or WebP under 250 KB.</p>`:""}</section><section class="account-panel"><h2>Ward details</h2><p><strong>${escape(user.wardName)}</strong><br>${escape(user.wardAddress)}<br>${escape(user.wardPhone)}</p></section></div>${active?`<section class="account-panel profile-activity"><div class="profile-activity-heading"><div><p class="eyebrow">LAST 45 DAYS</p><h2>Recent milestones</h2></div><a href="#/progress">View all progress →</a></div>${rows?`<ul class="milestone-list">${rows}</ul>`:'<p class="profile-empty">No Key or group completions in the last 45 days. Your next milestone will appear here.</p>'}<p class="field-help">Progress completed while signed in is saved to this prototype account. Progress from the earlier browser-only wireframe can be imported once.</p><button id="import-progress" class="account-secondary" type="button">Import progress from this browser</button></section>`:""}${notice()}<button id="sign-out" class="account-text-button" type="button">Sign out</button></section>`;};
export async function verifyEmailLink(token){try{const result=await request("/api/verify-email","POST",{token});if(state.user?.id===result.user.id)state.user=result.user;state.verifyLink="";state.error="";state.message=`Email verified. Your request has been sent to ${result.user.wardName}.`;}catch(error){state.message="";state.error=error.message;}}
export function accountPage(route){if(!state.ready)return `<section class="account-page"><h1>Loading account…</h1></section>`;if(route==="login")return login();if(route==="register")return registration();return state.user?profile():`<section class="account-page account-narrow"><div class="account-heading"><p class="eyebrow">YOUR JOURNEY</p><h1>Your account</h1><p>Create a profile to save account milestones in this prototype.</p></div><div class="account-panel account-actions"><a class="account-primary" href="#/account/register">Create an account</a><a class="account-secondary" href="#/account/login">Sign in</a></div>${notice()}</section>`;}
export function bindAccount(rerender){
  const form=document.querySelector("#register-form");
  if(form){
    const $=selector=>form.querySelector(selector),details=$("#signup-details"),stop=$("#under13-notice"),parents=$("#parent-fields"),bishopric=$("#bishopric-fields"),phone=$("#bishopric-phone"),request_=$("#request-bishopric");
    const update=()=>{
      const group=ageGroup(ageFrom($('[name="birthYear"]').value,$('[name="birthMonth"]').value));
      stop.hidden=group!=="under13";details.hidden=!group||group==="under13";
      parents.hidden=group!=="youth";for(const name of ["parent1First","parent1Last"])$(`[name="${name}"]`).required=group==="youth";
      bishopric.hidden=group!=="adult";if(group!=="adult")request_.checked=false;
      phone.hidden=!request_.checked;$('[name="bishopricPhone"]').required=request_.checked;
    };
    form.addEventListener("input",update);form.addEventListener("change",update);update();
    form.addEventListener("submit",async event=>{
      event.preventDefault();state.error="";
      const feedback=$("#account-feedback");
      if(!form.checkValidity()){state.error="Please fill in the highlighted fields.";form.classList.add("show-invalid");feedback.innerHTML=notice();form.querySelector(":invalid")?.focus();return;}
      const data=Object.fromEntries(new FormData(form));
      if(data.password!==data.confirmPassword){state.error="Passwords do not match.";feedback.innerHTML=notice();return;}
      delete data.confirmPassword;
      const payload={...data,birthYear:Number(data.birthYear),birthMonth:Number(data.birthMonth),wardId:Number(data.wardId),requestBishopric:data.requestBishopric==="on"};
      try{const result=await request("/api/register","POST",payload);applySession(result);state.verifyLink=result.verifyLink||"";state.message="";location.hash="#/account";rerender();}
      catch(error){state.error=error.message;feedback.innerHTML=notice();}
    });
  }
  document.querySelector("#resend-verification")?.addEventListener("click",async()=>{try{state.verifyLink=(await request("/api/resend-verification","POST",{})).verifyLink;state.error="";state.message="We sent a new verification link.";}catch(error){state.error=error.message;}rerender();});
  document.querySelector("#login-form")?.addEventListener("submit",async event=>{event.preventDefault();state.error="";const form=event.currentTarget;try{applySession(await request("/api/login","POST",Object.fromEntries(new FormData(form))));location.hash=state.user.status==="active"?"#/keys":"#/account";rerender();}catch(error){state.error=error.message;form.querySelector("#account-feedback").innerHTML=notice();}});
  document.querySelector("#sign-out")?.addEventListener("click",async()=>{await request("/api/logout","POST",{});applySession({user:null,completions:[]});state.verifyLink="";state.message="Signed out.";location.hash="#/";rerender();});
  document.querySelector("#import-progress")?.addEventListener("click",async()=>{try{const snapshot=[...readGuestProgressSnapshot(),...await legacyProgress()];const unique=[...new Map(snapshot.map(item=>[item.lessonId,item])).values()];if(!unique.length){state.message="No earlier browser progress was found.";}else{const before=new Set(state.completions.map(item=>item.lessonId));const result=await request("/api/import-progress","POST",{completions:unique});state.completions=result.completions;setProgressAccount(state.user.id,state.completions);const added=result.completions.filter(item=>!before.has(item.lessonId)).length;state.message=added?`Imported ${added} lesson records from this browser.`:"No new lesson records were available to import.";}state.error="";}catch(error){state.error=error.message;}rerender();});
  const photo=document.querySelector("#profile-photo");photo?.addEventListener("change",async()=>{const file=photo.files?.[0];if(!file)return;if(file.size>250000||!["image/png","image/jpeg","image/webp"].includes(file.type)){state.error="Choose a PNG, JPEG, or WebP image under 250 KB.";rerender();return;}const reader=new FileReader();reader.onload=async()=>{try{state.user=(await request("/api/photo","POST",{photoData:reader.result})).user;state.error="";state.message="Profile picture saved.";}catch(error){state.error=error.message;}rerender();};reader.readAsDataURL(file);});
  document.querySelector("#remove-photo")?.addEventListener("click",async()=>{state.user=(await request("/api/photo","POST",{photoData:null})).user;state.message="Profile picture removed.";rerender();});
}


