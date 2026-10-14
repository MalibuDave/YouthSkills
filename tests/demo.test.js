import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";
import { seedDemo, DEMO_PASSWORD, DEMO_WARD } from "../scripts/seed-demo.mjs";
import { createAppServer } from "../server.mjs";

test("demo seed: one ward, bishopric, 50 active youth with a year of history, and a queue",()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-demo-"));
  try {
    const dbPath=join(directory,"demo.sqlite"),now=new Date();
    const first=seedDemo(dbPath,{now});
    const db=new DatabaseSync(dbPath);
    const ward=db.prepare("SELECT id FROM wards WHERE name=?").get(DEMO_WARD);
    const count=(where,...args)=>db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ward_id=? AND ${where}`).get(ward.id,...args).n;
    assert.equal(count("role='bishopric' AND status='active'"),4);
    assert.equal(count("role='member' AND status='active'"),50);
    assert.equal(count("status='pending'"),4);
    assert.equal(count("status='see_bishopric'"),1);
    assert.equal(count("status='wrong_ward'"),1);
    assert.equal(count("status='rejected'"),1);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users WHERE email NOT LIKE '%@example.test'").get().n,0,"only reserved example.test emails");
    const range=db.prepare("SELECT MIN(completed_at) AS a,MAX(completed_at) AS b FROM lesson_completions").get();
    assert.ok(range.b<=now.toISOString(),"no completions in the future");
    assert.ok(Date.parse(range.a)>now.getTime()-400*86400000,"history covers about a year");
    const without=db.prepare("SELECT COUNT(*) AS n FROM users u WHERE u.role='member' AND u.status='active' AND NOT EXISTS(SELECT 1 FROM lesson_completions c WHERE c.user_id=u.id)").get().n;
    assert.equal(without,0,"every active youth has lesson history");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM lesson_completions c JOIN users u ON u.id=c.user_id WHERE u.status!='active'").get().n,0,"queued youth have no lessons");
    const months=db.prepare("SELECT COUNT(DISTINCT substr(completed_at,1,7)) AS n FROM lesson_completions").get().n;
    assert.ok(months>=12,"activity in every month of the year");
    db.close();
    const again=seedDemo(dbPath,{now});
    assert.deepEqual(again,first,"a reset rebuilds the same demo ward");
  } finally {rmSync(directory,{recursive:true,force:true});}
});

test("bishopric approval queue: ward-scoped, permissioned, recorded, and the youth sees the result",async()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-queue-"));
  const dbPath=join(directory,"demo.sqlite");
  seedDemo(dbPath);
  const server=createAppServer({dbPath});
  server.listen(0,"127.0.0.1");await once(server,"listening");
  const base=`http://127.0.0.1:${server.address().port}`;
  const send=async(path,method="GET",body,cookie="")=>{const response=await fetch(base+path,{method,headers:{...(body?{"Content-Type":"application/json"}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get("set-cookie")?.split(";")[0]};};
  const login=async email=>(await send("/api/login","POST",{email,password:DEMO_PASSWORD})).cookie;
  try {
    assert.equal((await send("/api/bishopric/queue")).status,401,"guests are refused");
    const bishop=await login("bishop@example.test");assert.ok(bishop,"bishop signs in with the demo password");
    const queue=(await send("/api/bishopric/queue","GET",null,bishop)).data;
    assert.equal(queue.ward.name,DEMO_WARD);
    const by=status=>queue.members.filter(member=>member.status===status);
    assert.equal(by("active").length,50);assert.equal(by("pending").length,4);
    assert.ok(queue.members.every(member=>member.parents.length>=1),"youth list a parent or guardian");
    assert.ok(queue.activity.length>0);
    assert.deepEqual(by("pending")[0].actions,["active","see_bishopric","wrong_ward","rejected"]);
    assert.deepEqual(by("active")[0].actions,[],"no actions on active members in V1");

    const youth=by("pending")[0],youthCookie=await login(youth.email);
    assert.equal((await send("/api/bishopric/queue","GET",null,youthCookie)).status,403,"members cannot open the queue");
    assert.equal((await send("/api/bishopric/decision","POST",{userId:youth.id,status:"active"},youthCookie)).status,403,"members cannot decide");
    assert.equal((await send("/api/completions","POST",{lessonId:"healthy-habits"},youthCookie)).status,403,"pending youth cannot record lessons");

    const invalid=await send("/api/bishopric/decision","POST",{userId:by("active")[0].id,status:"rejected"},bishop);
    assert.equal(invalid.status,409,"active members cannot be rejected from the queue");

    const approved=await send("/api/bishopric/decision","POST",{userId:youth.id,status:"active"},bishop);
    assert.equal(approved.status,200);
    assert.equal(approved.data.members.find(member=>member.id===youth.id).status,"active");
    assert.match(approved.data.activity[0].actor,/Robert Hale/);
    assert.equal((await send("/api/completions","POST",{lessonId:"healthy-habits"},youthCookie)).status,200,"approval opens lessons");

    const second=by("pending")[1];
    const rejected=await send("/api/bishopric/decision","POST",{userId:second.id,status:"rejected",note:"Please come see me on Sunday."},bishop);
    assert.equal(rejected.status,200);
    const secondCookie=await login(second.email);
    const session=(await send("/api/session","GET",null,secondCookie)).data.user;
    assert.equal(session.status,"rejected");assert.equal(session.statusNote,"Please come see me on Sunday.","the youth sees the bishopric's note");
    assert.equal((await send("/api/change-ward","POST",{wardId:session.wardId},secondCookie)).status,400,"cannot resubmit to the same ward after rejection");
    const reversed=await send("/api/bishopric/decision","POST",{userId:second.id,status:"active"},bishop);
    assert.equal(reversed.status,200,"the bishopric can reverse a rejection");

    const wrong=by("wrong_ward")[0],wrongCookie=await login(wrong.email);
    const otherWard=(await send("/api/wards")).data.wards.find(ward=>ward.name==="Demo Ward");
    const moved=await send("/api/change-ward","POST",{wardId:otherWard.id},wrongCookie);
    assert.equal(moved.status,200);assert.equal(moved.data.user.status,"pending");assert.equal(moved.data.user.wardName,"Demo Ward");
    const after=(await send("/api/bishopric/queue","GET",null,bishop)).data;
    assert.ok(!after.members.some(member=>member.id===wrong.id),"a moved request leaves the old ward's queue");

    // A bishopric member in another ward cannot see or change Maple Grove members.
    const db=new DatabaseSync(dbPath);db.prepare("UPDATE users SET role='bishopric',status='active' WHERE id=?").run(wrong.id);db.close();
    const otherQueue=(await send("/api/bishopric/queue","GET",null,wrongCookie)).data;
    assert.equal(otherQueue.ward.name,"Demo Ward");assert.ok(!otherQueue.members.some(member=>member.email.endsWith("@example.test")&&member.id===youth.id));
    assert.equal((await send("/api/bishopric/decision","POST",{userId:by("pending")[2].id,status:"active"},wrongCookie)).status,404,"other wards' members are out of reach");
  } finally {server.close();await once(server,"close");rmSync(directory,{recursive:true,force:true});}
});

test("activity rules: streaks, weeks, learning time and partial badge progress",async()=>{
  const { computeActivity, addDays } = await import("../src/achievements.js");
  const today="2026-10-13",days=[];
  for(let i=0;i<9;i++)days.push({day:addDays("2026-09-20",i),minutes:20});
  for(let i=0;i<4;i++)days.push({day:addDays(today,-3+i),minutes:15});
  const a=computeActivity({days,completions:[],revisits:[],goal:60,year:2026,today});
  assert.deepEqual(a.current,{days:4,weeks:4,months:2});
  assert.equal(a.best.days,9);assert.equal(a.total,240);
  const ten=a.streaks.days.find(b=>b.name==="10 Days in a Row");
  assert.equal(ten.earned,false);assert.equal(ten.fraction,0.4,"fills to 40% at a 4-day streak");assert.match(ten.sub,/Now: 4 · best 9/);
  assert.equal(a.streaks.days.find(b=>b.name==="5 Days in a Row").earnedOn,"2026-09-24");
  assert.equal(a.time.filter(b=>b.earned).length,3,"5 min, 30 min and 2 hrs earned at 4 hours");
  assert.deepEqual(a.week.map(d=>d.minutes),[15,15,15,null,null,null,null],"this week runs Sunday to Saturday");
  const past=computeActivity({days,completions:[],revisits:[],goal:60,year:2025,today});
  assert.equal(past.total,0);assert.deepEqual(past.current,{days:0,weeks:0,months:0});
});

test("activity, goals, revisits and ward reporting APIs",async()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-activity-"));
  const dbPath=join(directory,"demo.sqlite");
  seedDemo(dbPath);
  const server=createAppServer({dbPath});
  server.listen(0,"127.0.0.1");await once(server,"listening");
  const base=`http://127.0.0.1:${server.address().port}`;
  const send=async(path,method="GET",body,cookie="")=>{const response=await fetch(base+path,{method,headers:{...(body?{"Content-Type":"application/json"}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get("set-cookie")?.split(";")[0]};};
  const login=async email=>(await send("/api/login","POST",{email,password:DEMO_PASSWORD})).cookie;
  const day=new Date().toISOString().slice(0,10);
  try {
    const youth=await login("ava.dalton@example.test");
    const before=(await send("/api/activity","GET",null,youth)).data;
    assert.ok(before.days.length>100,"a year of learning days");assert.ok(before.byKey.length>0);assert.ok([30,60,90].includes(before.goal));
    assert.equal((await send("/api/activity/ping","POST",{keyId:"first-aid",day},youth)).data.added,1);
    assert.equal((await send("/api/activity/ping","POST",{keyId:"nope",day},youth)).status,400,"unknown Keys are refused");
    assert.equal((await send("/api/activity/ping","POST",{keyId:"first-aid",day:"2020-01-01"},youth)).status,400,"only today can be recorded");
    assert.equal((await send("/api/activity/goal","POST",{minutes:45},youth)).status,400);
    assert.equal((await send("/api/activity/goal","POST",{minutes:120},youth)).data.goal,120);
    assert.equal((await send("/api/activity/revisit","POST",{keyId:"first-aid",day},youth)).status,400,"First Aid isn't earned yet, so it can't be revisited");
    const { keyDates } = await import("../src/achievements.js");
    const earnedKey=[...keyDates((await send("/api/session","GET",null,youth)).data.completions).keys()][0];
    assert.ok(earnedKey,"Ava has earned Keys");
    assert.equal((await send("/api/activity/revisit","POST",{keyId:earnedKey,day},youth)).status,200,"an earned Key can be revisited");
    assert.ok((await send("/api/activity","GET",null,youth)).data.revisits.some(item=>item.keyId===earnedKey&&item.day===day));
    const after=(await send("/api/activity","GET",null,youth)).data;
    assert.equal(after.goal,120);
    assert.equal(after.days.find(item=>item.day===day)?.minutes,(before.days.find(item=>item.day===day)?.minutes||0)+1,"the ping added one minute");

    const pending=(await send("/api/bishopric/queue","GET",null,await login("bishop@example.test"))).data.members.find(member=>member.status==="pending");
    const pendingCookie=await login(pending.email);
    assert.equal((await send("/api/activity","GET",null,pendingCookie)).status,403,"pending youth have no activity yet");
    assert.equal((await send("/api/activity/ping","POST",{keyId:"first-aid",day},pendingCookie)).status,403);

    assert.equal((await send("/api/bishopric/report","GET",null,youth)).status,403,"youth cannot open ward reporting");
    const report=(await send("/api/bishopric/report","GET",null,await login("bishop@example.test"))).data;
    assert.equal(report.totals.youth,50);assert.equal(report.youth.length,50);
    assert.equal(report.period.months.length,12);assert.equal(report.keys.week.length,12);
    assert.equal(report.totals.keys,report.keys.month.reduce((a,b)=>a+b,0));
    assert.ok(report.totals.keys>100&&report.totals.logins>1000,"a busy year");
    assert.ok(report.keyTime.average>0,"time to complete a Key is measured");
    assert.equal(report.rejections.total,1);assert.match(report.rejections.notes[0].note,/Bishop Hale/);
    assert.ok(report.youth.find(person=>person.name==="Ava Dalton").keyMinutes.length>0,"time per Key for each youth");
  } finally {server.close();await once(server,"close");rmSync(directory,{recursive:true,force:true});}
});
