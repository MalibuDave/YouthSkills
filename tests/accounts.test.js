import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";
import { createAppServer } from "../server.mjs";
import { openAccountDb } from "../src/account-db.js";
import { ageFrom } from "../src/account-rules.js";

const yearsAgo=(years,monthOffset=0)=>{const date=new Date();date.setMonth(date.getMonth()-monthOffset);return {birthYear:date.getFullYear()-years,birthMonth:date.getMonth()+1};};

test("age is computed from birth month and year",()=>{
  const now=new Date(2026,9,2);
  assert.equal(ageFrom(2013,10,now),13);
  assert.equal(ageFrom(2013,11,now),12);
  assert.equal(ageFrom(2008,10,now),18);
  assert.equal(ageFrom(2027,1,now),null);
  assert.equal(ageFrom(2010,13,now),null);
});

test("V1 sign-up: age gate, parent names, verification, and ward approval states",async()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-accounts-"));
  const dbPath=join(directory,"test.sqlite");
  const server=createAppServer({dbPath});
  server.listen(0,"127.0.0.1");await once(server,"listening");
  const base=`http://127.0.0.1:${server.address().port}`;
  const send=async(path,method="GET",body,cookie="")=>{const response=await fetch(base+path,{method,headers:{...(body?{"Content-Type":"application/json"}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get("set-cookie")?.split(";")[0]};};
  const userCount=()=>{const db=new DatabaseSync(dbPath);try{return db.prepare("SELECT COUNT(*) AS n FROM users").get().n;}finally{db.close();}};
  try {
    const wards=await send("/api/wards");
    assert.deepEqual(wards.data.wards.map(ward=>ward.name),["Demo Ward","Second Demo Ward"]);
    const wardId=wards.data.wards[0].id;
    const youth={...yearsAgo(15),firstName:"Young",lastName:"O'Learner",parent1First:"Pat",parent1Last:"O'Learner",email:"learner@example.test",password:"secret-pass",wardId};

    const under13=await send("/api/register","POST",{...youth,...yearsAgo(12),email:"kid@example.test"});
    assert.equal(under13.status,403);assert.match(under13.data.error,/13 and up/);assert.equal(under13.cookie,undefined);
    assert.equal(userCount(),0,"nothing is stored for under-13");

    const noParent=await send("/api/register","POST",{...youth,parent1First:"",parent1Last:""});assert.equal(noParent.status,400);assert.match(noParent.data.error,/Parent or guardian/);
    const halfParent2=await send("/api/register","POST",{...youth,parent2First:"Sam"});assert.equal(halfParent2.status,400);
    const longPassword=await send("/api/register","POST",{...youth,password:"thirteen-char"});assert.equal(longPassword.status,400);assert.match(longPassword.data.error,/8–12/);
    const shortPassword=await send("/api/register","POST",{...youth,password:"short12"});assert.equal(shortPassword.status,400);
    const noWard=await send("/api/register","POST",{...youth,wardId:999});assert.equal(noWard.status,400);
    const youthBishopric=await send("/api/register","POST",{...youth,requestBishopric:true,bishopricPhone:"555-0100"});assert.equal(youthBishopric.status,400);
    assert.equal(userCount(),0);

    const learner=await send("/api/register","POST",youth);
    assert.equal(learner.status,201);assert.ok(learner.cookie);
    assert.equal(learner.data.user.status,"unverified");assert.equal(learner.data.user.role,"member");assert.equal(learner.data.user.age,15);
    assert.deepEqual(learner.data.user.parents,[{firstName:"Pat",lastName:"O'Learner"}]);
    assert.match(learner.data.verifyLink,/^#\/account\/verify\/[a-f0-9]{48}$/);
    const duplicate=await send("/api/register","POST",youth);assert.equal(duplicate.status,409);

    const locked=await send("/api/completions","POST",{lessonId:"healthy-habits"},learner.cookie);assert.equal(locked.status,403);
    const badToken=await send("/api/verify-email","POST",{token:"nope"});assert.equal(badToken.status,400);
    const resent=await send("/api/resend-verification","POST",{},learner.cookie);assert.equal(resent.status,200);
    const oldLink=await send("/api/verify-email","POST",{token:learner.data.verifyLink.split("/").pop()});assert.equal(oldLink.status,400,"resending replaces the old link");
    const verified=await send("/api/verify-email","POST",{token:resent.data.verifyLink.split("/").pop()});
    assert.equal(verified.status,200);assert.equal(verified.data.user.status,"pending");assert.ok(verified.data.user.emailVerifiedAt);
    const again=await send("/api/resend-verification","POST",{},learner.cookie);assert.equal(again.status,400);
    const stillLocked=await send("/api/completions","POST",{lessonId:"healthy-habits"},learner.cookie);assert.equal(stillLocked.status,403,"pending members cannot record lessons");

    const adult={...yearsAgo(40),firstName:"Demo",lastName:"Leader",email:"leader@example.test",password:"leader-pass",wardId,requestBishopric:true};
    const noPhone=await send("/api/register","POST",adult);assert.equal(noPhone.status,400);assert.match(noPhone.data.error,/phone/);
    const leader=await send("/api/register","POST",{...adult,bishopricPhone:"(555) 010-0200",parent1First:"Ignored",parent1Last:"Parent"});
    assert.equal(leader.status,201);assert.equal(leader.data.user.bishopricRequest,"requested");assert.equal(leader.data.user.role,"member","requesting does not grant the role");
    assert.deepEqual(leader.data.user.parents,[],"adults do not store parent names");

    // Simulate a bishopric approval until the approval page exists.
    const db=new DatabaseSync(dbPath);db.prepare("UPDATE users SET status='active' WHERE email=?").run(youth.email);db.close();
    const completion=await send("/api/completions","POST",{lessonId:"healthy-habits"},learner.cookie);assert.equal(completion.status,200);
    const signedIn=await send("/api/session","GET",null,learner.cookie);assert.equal(signedIn.data.user.lastName,"O'Learner");assert.equal(signedIn.data.completions.length,1);

    const wrongLogin=await send("/api/login","POST",{email:youth.email,password:"wrong"});assert.equal(wrongLogin.status,401);
    const login=await send("/api/login","POST",{email:youth.email,password:youth.password});assert.equal(login.status,200);
    const protectedFile=await fetch(base+"/data/test.sqlite");assert.equal(protectedFile.status,404);
    assert.equal((await fetch(base+"/bishopric-tools-mock.html")).status,403,"guests cannot fetch the Bishopric mock");
    assert.equal((await fetch(base+"/bishopric-tools-mock.html",{headers:{Cookie:learner.cookie}})).status,403,"members cannot fetch the Bishopric mock");
    const grant=new DatabaseSync(dbPath);grant.prepare("UPDATE users SET role='bishopric',status='active' WHERE email=?").run(adult.email);grant.close();
    assert.equal((await fetch(base+"/bishopric-tools-mock.html",{headers:{Cookie:leader.cookie}})).status,200,"active Bishopric accounts can fetch the mock");
    await send("/api/logout","POST",{},learner.cookie);
    const signedOut=await send("/api/session","GET",null,learner.cookie);assert.equal(signedOut.data.user,null);
  } finally {server.close();await once(server,"close");rmSync(directory,{recursive:true,force:true});}
});

test("membership history is recorded",()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-events-"));
  const accounts=openAccountDb(join(directory,"events.sqlite"));
  try{
    const {user,verifyToken}=accounts.register({...yearsAgo(20),firstName:"Ada",lastName:"Adult",email:"ada@example.test",password:"ada-pass1",wardId:accounts.wards()[0].id});
    accounts.verifyEmail(verifyToken);
    assert.deepEqual(accounts.membershipEvents(user.id).map(event=>[event.fromStatus,event.toStatus]),[[null,"unverified"],["unverified","pending"]]);
  }finally{accounts.db.close();rmSync(directory,{recursive:true,force:true});}
});

test("earlier prototype databases migrate with existing accounts kept active",()=>{
  const directory=mkdtempSync(join(tmpdir(),"cy-migrate-"));
  const path=join(directory,"old.sqlite");
  const old=new DatabaseSync(path);
  old.exec(`CREATE TABLE wards(id INTEGER PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE, address TEXT NOT NULL, phone TEXT NOT NULL);
    CREATE TABLE users(id INTEGER PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('youth','bishopric')), first_name TEXT NOT NULL, last_name TEXT NOT NULL, age INTEGER, email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, ward_id INTEGER NOT NULL REFERENCES wards(id), photo_data TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE lesson_completions(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, completed_at TEXT NOT NULL, PRIMARY KEY(user_id,lesson_id));
    INSERT INTO wards(name,address,phone) VALUES('Demo Ward','x','y');
    INSERT INTO users(role,first_name,last_name,age,email,password_hash,ward_id) VALUES('youth','Old','Learner',14,'old@example.test','a:b',1),('bishopric','Old','Leader',NULL,'lead@example.test','a:b',1);
    INSERT INTO lesson_completions VALUES(1,'healthy-habits','2026-09-01T00:00:00.000Z');`);
  old.close();
  const accounts=openAccountDb(path);
  try{
    const learner=accounts.profile(1),leader=accounts.profile(2);
    assert.equal(learner.status,"active");assert.equal(learner.role,"member");assert.equal(learner.age,14);
    assert.equal(leader.role,"bishopric");assert.equal(learner.bishopric[0].lastName,"Leader");
    assert.equal(accounts.completions(1).length,1);
  }finally{accounts.db.close();rmSync(directory,{recursive:true,force:true});}
});
