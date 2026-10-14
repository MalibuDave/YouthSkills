import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { keys, allLessons, groups } from "../src/data.js";

const file = url => join(process.cwd(), decodeURI(url).replace(/^\//, ""));

test("themed Keys: every badge, cover and page image exists, ids are unique, groups are consistent",()=>{
  const themed=keys.filter(key=>key.icon.image);
  assert.equal(themed.length,38);
  for(const key of themed){
    assert.ok(existsSync(file(key.icon.image)),`${key.id} badge`);
    assert.ok(key.cover&&existsSync(file(key.cover.src)),`${key.id} cover`);
    assert.ok(key.lessons.length>=8,`${key.id} has its pages`);
    for(const lesson of key.lessons)assert.ok(existsSync(file(lesson.sourcePage)),`${lesson.id} image`);
    assert.ok(key.lessons.some(lesson=>/Requirements/.test(lesson.title)||/Sign-offs/.test(lesson.title)),`${key.id} has a requirements page`);
  }
  assert.equal(new Set(keys.map(key=>key.id)).size,keys.length,"Key ids are unique");
  assert.equal(new Set(allLessons.map(lesson=>lesson.id)).size,allLessons.length,"lesson ids are unique");
  for(const key of keys)assert.equal(groups.filter(group=>group.keys.includes(key)).length,1,`${key.id} is in exactly one group`);
  const counts=Object.fromEntries(groups.map(group=>[group.id,group.keys.length]));
  assert.deepEqual(counts,{"required-1":9,"required-2":9,sports:7,outdoors:8,"animal-habitats":9,crafts:9,"performing-arts":2,additional:3});
  for(const group of groups.filter(group=>group.poster))assert.ok(existsSync(file(group.poster)),`${group.id} poster`);
});
