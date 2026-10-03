import test from "node:test";
import assert from "node:assert/strict";

test("guests see Covenant Youth landing and cannot open Keys",async()=>{
  const app={innerHTML:""};let onHashChange;
  globalThis.document={querySelector:selector=>selector==="#app"?app:null};
  globalThis.window={location:{},addEventListener:(name,handler)=>{if(name==="hashchange")onHashChange=handler;},scrollTo:()=>{}};
  globalThis.location={hash:"#/"};
  globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
  globalThis.fetch=async path=>({ok:true,json:async()=>path==="/api/wards"?{wards:[{id:1,name:"Demo Ward"}]}:{user:null,completions:[]}});
  await import("../src/app.js");
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(app.innerHTML,/Covenant Youth provides learning material/);
  assert.match(app.innerHTML,/class="landing-hero"/);
  assert.match(app.innerHTML,/href="#\/account\/register"/);
  assert.doesNotMatch(app.innerHTML,/class="header-nav"/);
  assert.doesNotMatch(app.innerHTML,/Bishopric tools/);
  location.hash="#/bishopric-tools";onHashChange();
  assert.match(app.innerHTML,/Sign in to continue/);
  assert.doesNotMatch(app.innerHTML,/bishopric-preview/);
  location.hash="#/groups";onHashChange();
  assert.match(app.innerHTML,/Sign in to continue/);
  assert.doesNotMatch(app.innerHTML,/class="group-hotspot /);
  location.hash="#/account/register";onHashChange();
  assert.match(app.innerHTML,/Create an account/);
  assert.match(app.innerHTML,/class="public-header"/);
});
