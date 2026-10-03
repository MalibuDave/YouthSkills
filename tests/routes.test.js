import test from "node:test";
import assert from "node:assert/strict";
import { keys } from "../src/data.js";

test("Groups and First Aid opening pages follow the supplied sequence",async()=>{
  const app={innerHTML:""};
  const storage=new Map();
  let onHashChange;
  globalThis.document={querySelector:selector=>selector==="#app"?app:null};
  globalThis.window={location:{},addEventListener:(event,handler)=>{if(event==="hashchange")onHashChange=handler;},scrollTo:()=>{}};
  globalThis.location={hash:"#/groups"};
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  globalThis.fetch=async path=>({ok:true,json:async()=>path==="/api/wards"?{wards:[]}:{user:{id:1,role:"member",status:"active",firstName:"Test",lastName:"Learner",age:14,email:"test@example.test",wardId:1,wardName:"Demo Ward",wardAddress:"Prototype location",wardPhone:"(000) 000-0000",photoData:null,bishopric:[]},completions:[]}});
  await import("../src/app.js");
  await new Promise(resolve=>setImmediate(resolve));

  const navigation=app.innerHTML.match(/<nav class="header-nav"[^>]*>(.*?)<\/nav>/)?.[1];
  assert.ok(navigation.indexOf('href="#/groups"')<navigation.indexOf('href="#/keys"'));
  assert.equal((app.innerHTML.match(/class="group-hotspot /g)||[]).length,18);
  assert.equal((app.innerHTML.match(/class="group-section"/g)||[]).length,7);
  assert.match(app.innerHTML,/Group 1 - Required CK.png/);
  assert.match(app.innerHTML,/Group 2 Required CK.png/);
  assert.ok(app.innerHTML.indexOf("Group 1 - Required CK.png") < app.innerHTML.indexOf("Group 2 Required CK.png"));
  assert.match(app.innerHTML,/Sports - Group 1 CK.png/);
  assert.match(app.innerHTML,/Outdoors - Group 1 CK.png/);
  assert.match(app.innerHTML,/Animal Habitats Group 1 CK.png/);
  assert.match(app.innerHTML,/Crafts - Group 1 CK.png/);
  assert.match(app.innerHTML,/Performing Arts Group 1 CK.png/);
  assert.match(app.innerHTML,/href="#\/keys\/gatherer-of-israel"/);
  assert.match(app.innerHTML,/href="#\/keys\/first-aid"[^>]*aria-label="First Aid, not started\. Open Key and lessons"/);
  const firstAid=keys.find(key=>key.id==="first-aid");
  storage.set("cy-program-completed-lessons-v1-account-1",JSON.stringify([firstAid.lessons[0].id]));
  onHashChange();
  assert.match(app.innerHTML,/7% complete/);
  assert.match(app.innerHTML,/role="progressbar"[^>]*aria-valuenow="7"/);
  storage.set("cy-program-completed-lessons-v1-account-1",JSON.stringify(firstAid.lessons.map(lesson=>lesson.id)));
  storage.set("cy-program-lesson-completion-dates-v1-account-1",JSON.stringify(Object.fromEntries(firstAid.lessons.map(lesson=>[lesson.id,"2026-09-30T12:00:00.000Z"]))));
  onHashChange();
  assert.match(app.innerHTML,/class="group-hotspot is-complete" href="#\/keys\/first-aid"/);
  assert.match(app.innerHTML,/aria-label="First Aid, completed /);

  location.hash="#/keys/first-aid";
  onHashChange();
  assert.match(app.innerHTML,/href="#\/keys\/first-aid\/intro"/);

  location.hash="#/keys/first-aid/intro";
  onHashChange();
  assert.match(app.innerHTML,/Badge - First Aid CK.png/);
  assert.match(app.innerHTML,/Certificate2 - First Aid.png/);
  assert.match(app.innerHTML,/href="#\/keys\/first-aid\/cover"/);

  location.hash="#/keys/first-aid/cover";
  onHashChange();
  assert.match(app.innerHTML,/CK - First Aid - Cover Page A.png/);
  assert.match(app.innerHTML,/href="#\/keys\/first-aid\/lessons\/first-aid-page-1"/);
});
