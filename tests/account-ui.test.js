import test from "node:test";
import assert from "node:assert/strict";
import { accountPage, loadAccount } from "../src/account-ui.js";
import { keys } from "../src/data.js";

test("account pages show registration fields and recent profile milestones",async()=>{
  const oldFetch=globalThis.fetch,oldStorage=globalThis.localStorage;
  const values=new Map();
  globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  globalThis.fetch=async path=>({ok:true,json:async()=>path==="/api/wards"?{wards:[{id:1,name:"Demo Ward"}]}:{user:{id:7,role:"member",status:"active",firstName:"Avery",lastName:"Example",age:14,email:"avery@example.test",wardId:1,wardName:"Demo Ward",wardAddress:"Prototype location",wardPhone:"(000) 000-0000",photoData:null,bishopric:[{firstName:"Demo",lastName:"Leader"}]},completions:[{lessonId:"learning-goal",completedAt:new Date().toISOString()}]}});
  try{
    await loadAccount();
    const register=accountPage("register");
    assert.match(register,/Birth month/);
    assert.match(register,/Accounts aren't available yet/);
    assert.match(register,/Parent or guardian/);
    assert.match(register,/Confirm password/);
    assert.match(register,/8–12 characters/);
    assert.match(register,/bishopric access/);
    assert.doesNotMatch(register,/approval number|Ward name|Account type/i);
    const profile=accountPage();
    assert.match(profile,/Avery Example/);
    assert.match(profile,/Demo Leader/);
    assert.match(profile,/Recent milestones/);
    assert.match(profile,/Scholar/);
    assert.match(profile,/Import progress from this browser/);
    const groupCompletions=keys.filter(key=>key.icon.sheet===1).flatMap(key=>key.lessons.filter(lesson=>!lesson.optional).map(lesson=>({lessonId:lesson.id,completedAt:new Date().toISOString()})));
    globalThis.fetch=async path=>({ok:true,json:async()=>path==="/api/wards"?{wards:[{id:1,name:"Demo Ward"}]}:{user:{id:7,role:"member",status:"active",firstName:"Avery",lastName:"Example",age:14,email:"avery@example.test",wardId:1,wardName:"Demo Ward",wardAddress:"Prototype location",wardPhone:"(000) 000-0000",photoData:null,bishopric:[]},completions:groupCompletions}});
    await loadAccount();
    assert.match(accountPage(),/Required Group 1/);
    globalThis.fetch=async path=>({ok:true,json:async()=>path==="/api/wards"?{wards:[{id:1,name:"Demo Ward"}]}:{user:{id:8,role:"member",status:"pending",firstName:"Riley",lastName:"Example",age:15,parents:[{firstName:"Pat",lastName:"Example"}],email:"riley@example.test",emailVerifiedAt:"2026-10-02T00:00:00.000Z",wardId:1,wardName:"Demo Ward",wardAddress:"Prototype location",wardPhone:"(000) 000-0000",photoData:null,bishopric:[]},completions:[]}});
    await loadAccount();
    const pending=accountPage();
    assert.match(pending,/Waiting for approval/);
    assert.match(pending,/approval from Demo Ward/);
    assert.match(pending,/Pat Example/);
    assert.doesNotMatch(pending,/Recent milestones|Import progress/);
  }finally{globalThis.fetch=oldFetch;globalThis.localStorage=oldStorage;}
});
