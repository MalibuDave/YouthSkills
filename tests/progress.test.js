import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { keys, allLessons } from "../src/data.js";
import { firstAidBadge, firstAidCertificate, firstAidCover } from "../src/first-aid.js";
import { progressFor, markComplete, readProgress, keyCompletedAt, readBishopricNotification, setBishopricNotification, setProgressAccount } from "../src/progress.js";
test("signed-in progress is isolated by account",()=>{
  const previous=globalThis.localStorage,values=new Map();
  globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  try{
    setProgressAccount(1,[]);markComplete("healthy-habits");assert.equal(readProgress().has("healthy-habits"),true);
    setProgressAccount(2,[]);assert.equal(readProgress().has("healthy-habits"),false);
    setProgressAccount(1,[{lessonId:"healthy-habits",completedAt:"2026-09-30T00:00:00.000Z"}]);assert.equal(readProgress().has("healthy-habits"),true);
  }finally{setProgressAccount(null);globalThis.localStorage=previous;}
});
test("key and overall progress reflect completed lessons",()=>{
  const completed=new Set([keys[0].lessons[0].id,keys[1].lessons[0].id]);
  assert.deepEqual(progressFor(keys[0].lessons,completed),{done:1,total:14,percent:7});
  assert.equal(progressFor(allLessons,completed).done,2);
  assert.equal(progressFor(allLessons,completed).percent,Math.round(2/progressFor(allLessons,completed).total*100));
});
test("required groups contain nine Keys each and First Aid uses all supplied pages",()=>{
  assert.equal(keys.filter(key=>key.icon.sheet===1).length,9);
  assert.equal(keys.filter(key=>key.icon.sheet===2).length,9);
  const firstAid=keys.find(key=>key.id==="first-aid");
  assert.equal(firstAid.lessons.length,14);
  assert.deepEqual(firstAid.lessons.map(lesson=>lesson.number),Array.from({length:14},(_,index)=>index+1));
  const root=fileURLToPath(new URL("../",import.meta.url));
  for(const source of [firstAidBadge,firstAidCertificate,firstAidCover,...firstAid.lessons.map(lesson=>lesson.sourcePage)]) {
    assert.equal(existsSync(join(root,source.slice(1))),true,source);
  }
});
test("supplied Book of Mormon pages are individual lessons",()=>{
  const book=keys.find(key=>key.id==="book-of-mormon");
  assert.equal(book.lessons.length,17);
  assert.equal(book.lessons[0].sourcePage.endsWith("Pg 1 - BOM Purpose.png"),true);
  assert.equal(book.lessons.at(-1).sourcePage.endsWith("Pg 17 - BOM Requirements.png"),true);
  assert.equal(progressFor(book.lessons,new Set()).total,16);
  assert.equal(book.lessons[15].optional,true);
});
test("all lesson ids are unique and belong to their keys",()=>{
  assert.equal(new Set(allLessons.map(lesson=>lesson.id)).size,allLessons.length);
  for(const key of keys) for(const lesson of key.lessons) assert.equal(lesson.keyId,key.id);
});
test("Bishopric notification confirmation is saved per Key",()=>{
  const savedStorage=globalThis.localStorage;
  const values=new Map();
  globalThis.localStorage={
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value)
  };
  try {
    assert.equal(readBishopricNotification("first-aid"),"none");
    assert.equal(readBishopricNotification("scholar"),"none");
    setBishopricNotification("first-aid","confirmed");
    assert.equal(readBishopricNotification("first-aid"),"confirmed");
    setBishopricNotification("first-aid","none");
    assert.equal(readBishopricNotification("first-aid"),"none");
  } finally { globalThis.localStorage=savedStorage; }
});
test("Key completion date records the final required lesson and preserves the first timestamp",()=>{
  const savedStorage=globalThis.localStorage;
  const values=new Map();
  globalThis.localStorage={
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value)
  };
  try {
    const key=keys.find(item=>item.id==="first-aid");
    const lessonId=key.lessons.at(-1).id;
    assert.equal(keyCompletedAt(key,new Set()),null);
    for(const lesson of key.lessons.slice(0,-1)) markComplete(lesson.id);
    assert.equal(keyCompletedAt(key,readProgress()),null);
    markComplete(lessonId);
    const date=keyCompletedAt(key,readProgress());
    assert.ok(Number.isFinite(Date.parse(date)));
    markComplete(lessonId);
    assert.equal(keyCompletedAt(key,readProgress()),date);
    values.delete("cy-program-lesson-completion-dates-v1");
    assert.equal(keyCompletedAt(key,readProgress()),null);
  } finally { globalThis.localStorage=savedStorage; }
});
