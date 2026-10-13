// Bishopric tools: the ward approval queue (topic 11 §5, DEC-016).
// Layout follows the approved bishopric-tools mock; data comes from /api/bishopric/queue.
const escape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const TABS=[["pending","Pending"],["see_bishopric","See Bishopric"],["wrong_ward","Wrong Ward"],["rejected","Rejected"],["active","Active members"]];
const LABEL={pending:"Pending",see_bishopric:"See Bishopric",wrong_ward:"Wrong Ward",rejected:"Rejected",active:"Active"};
const ACTION={active:"Approve",see_bishopric:"See Bishopric",wrong_ward:"Wrong Ward",rejected:"Reject"};
const HELP={
  pending:"Select a person to see their details and approve, ask them to meet with you, mark the wrong ward, or reject.",
  see_bishopric:"These members are waiting to meet with the bishopric. Approve or reject after you've talked.",
  wrong_ward:"These people said they belong to this ward but don't. They'll choose another ward.",
  rejected:"Not approved. A member of the bishopric can still approve someone here after talking with them.",
  active:"Approved members of this ward. They can open Keys, lessons and progress."
};
const state={data:null,loading:false,error:"",tab:"pending",open:new Set(),confirm:null,busy:false};
const request=async(path,method="GET",body)=>{const response=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined,credentials:"same-origin",cache:"no-store"});const result=await response.json();if(!response.ok)throw Error(result.error||"Request failed.");return result;};
const shortDate=value=>value?new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:new Date(value).getFullYear()===new Date().getFullYear()?undefined:"numeric"}).format(new Date(value)):"";
const statusClass=status=>`bq-status bq-${status.replace("_","-")}`;
const activityText=item=>{
  const by=item.actor?` by ${escape(item.actor)}`:"";
  if(item.status==="pending")return item.fromStatus==="unverified"||!item.fromStatus?"Requested to join":"Sent a new request";
  if(item.status==="active")return item.fromStatus==="rejected"?`Approved after review${by}`:`Approved${by}`;
  if(item.status==="see_bishopric")return `Asked to meet with the bishopric${by}`;
  if(item.status==="wrong_ward")return `Marked as wrong ward${by}`;
  if(item.status==="rejected")return `Not approved${by}`;
  return escape(LABEL[item.status]||item.status);
};

export function resetBishopric(){state.data=null;state.error="";state.open.clear();state.confirm=null;state.tab="pending";}

export function bishopricPage(rerender){
  if(!state.data&&!state.loading&&!state.error){
    state.loading=true;
    request("/api/bishopric/queue").then(data=>{state.data=data;}).catch(error=>{state.error=error.message;}).finally(()=>{state.loading=false;rerender();});
  }
  if(!state.data)return `<section class="bq"><p class="eyebrow">BISHOPRIC TOOLS</p><h1>${state.error?"Bishopric tools":"Loading your ward…"}</h1>${state.error?`<p class="account-error" role="alert">${escape(state.error)}</p>`:""}</section>`;
  const {ward,members,activity}=state.data;
  const count=status=>members.filter(member=>member.status===status).length;
  const shown=members.filter(member=>member.status===state.tab);
  const row=member=>{
    const parents=member.parents.length?member.parents.map(person=>`${person.firstName} ${person.lastName}`).join(", "):"—";
    const confirming=state.confirm?.id===member.id;
    const actions=member.actions.map(status=>`<button type="button" data-member="${member.id}" data-status="${status}" class="${status==="rejected"?"danger":""}" ${state.busy?"disabled":""}>${ACTION[status]}</button>`).join("");
    const confirm=confirming?`<form class="bq-confirm" data-confirm="${member.id}"><label for="bq-note-${member.id}">${state.confirm.status==="rejected"?"Optional note to the member (they will see it)":"Optional note to the member (for example, when to meet)"}</label><textarea id="bq-note-${member.id}" name="note" maxlength="160" rows="2"></textarea><div class="bq-actions"><button type="submit" class="${state.confirm.status==="rejected"?"danger":""}" ${state.busy?"disabled":""}>${state.confirm.status==="rejected"?"Reject":"Ask to see the bishopric"}</button><button type="button" class="bq-cancel" data-cancel="${member.id}">Cancel</button></div></form>`:"";
    return `<details class="bq-request" data-open="${member.id}"${state.open.has(member.id)?" open":""}><summary><span class="bq-chevron" aria-hidden="true">▸</span><span>${escape(member.firstName)} ${escape(member.lastName)}</span><span class="bq-age">${member.age!==null&&member.age!==undefined?`Age ${member.age}`:""}</span><span class="${statusClass(member.status)}">${LABEL[member.status]}</span></summary><div class="bq-details"><dl><dt>Parent/guardian</dt><dd>${escape(parents)}</dd><dt>Email</dt><dd>${escape(member.email)}</dd><dt>Requested</dt><dd>${shortDate(member.requestedAt)}</dd><dt>Current status</dt><dd>${LABEL[member.status]} since ${shortDate(member.statusChangedAt)}</dd>${member.note?`<dt>Note</dt><dd>${escape(member.note)}</dd>`:""}</dl>${confirm||(actions?`<div class="bq-actions">${actions}</div>`:member.status==="active"?`<p class="bq-muted">Removing a member from the ward isn't available yet.</p>`:"")}</div></details>`;
  };
  const tabs=TABS.map(([status,label])=>`<button type="button" role="tab" data-tab="${status}" aria-selected="${state.tab===status}">${label} <span class="bq-tab-count">${count(status)}</span></button>`).join("");
  const title=state.tab==="active"?"Active members":`${LABEL[state.tab]} requests`;
  return `<section class="bq"><div class="bq-top"><div><p class="eyebrow">BISHOPRIC TOOLS</p><h1>${escape(ward.name)}</h1><p class="bq-muted">Review membership requests and manage your ward.</p></div><div class="bq-count"><b>${count("pending")}</b>Pending requests</div></div>
<nav class="bq-tabs" role="tablist" aria-label="Membership status">${tabs}</nav>
${state.error?`<p class="account-error" role="alert">${escape(state.error)}</p>`:""}
<section class="bq-panel" aria-live="polite"><h2>${title}</h2><p class="bq-muted">${HELP[state.tab]}</p>${shown.length?shown.map(row).join(""):`<p class="bq-empty">No one in this status.</p>`}</section>
<section class="bq-panel bq-activity"><h2>Recent activity</h2>${activity.length?`<ul>${activity.map(item=>`<li><span><strong>${escape(item.name)}</strong> · ${activityText(item)}${item.note?` — “${escape(item.note)}”`:""}</span><span class="${statusClass(item.status)}">${LABEL[item.status]||escape(item.status)}</span><time datetime="${escape(item.createdAt)}">${shortDate(item.createdAt)}</time></li>`).join("")}</ul>`:`<p class="bq-empty">No activity yet.</p>`}</section></section>`;
}

export function bindBishopric(rerender){
  const root=document.querySelector(".bq");if(!root)return;
  root.querySelectorAll("[data-tab]").forEach(button=>button.addEventListener("click",()=>{state.tab=button.dataset.tab;state.confirm=null;rerender();}));
  root.querySelectorAll("details[data-open]").forEach(item=>item.addEventListener("toggle",()=>{const id=Number(item.dataset.open);item.open?state.open.add(id):state.open.delete(id);}));
  const decide=async(id,status,note="")=>{
    state.busy=true;state.error="";rerender();
    try{state.data=await request("/api/bishopric/decision","POST",{userId:id,status,note});state.confirm=null;state.open.delete(id);}
    catch(error){state.error=error.message;}
    state.busy=false;rerender();
  };
  root.querySelectorAll("[data-member]").forEach(button=>button.addEventListener("click",()=>{
    const id=Number(button.dataset.member),status=button.dataset.status;
    if(status==="rejected"||status==="see_bishopric"){state.confirm={id,status};rerender();document.querySelector(`#bq-note-${id}`)?.focus();return;}
    void decide(id,status);
  }));
  root.querySelectorAll("[data-cancel]").forEach(button=>button.addEventListener("click",()=>{state.confirm=null;rerender();}));
  root.querySelectorAll("form[data-confirm]").forEach(form=>form.addEventListener("submit",event=>{event.preventDefault();void decide(Number(form.dataset.confirm),state.confirm.status,new FormData(form).get("note"));}));
}
