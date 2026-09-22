import test from "node:test";import assert from "node:assert/strict";import {classifyFeature,isRailway} from "../src/classifier.js";
test("station requires physical railway metadata",()=>{const c=classifyFeature({tags:{railway:"station",name:"Chennai Central"}});assert.equal(c.category,"railway_station");assert.equal(isRailway(c),true);});
test("railway station road is road",()=>assert.equal(classifyFeature({tags:{highway:"residential",name:"Railway Station Road"}}).category,"road"));
test("railway gate road is road",()=>assert.equal(classifyFeature({tags:{highway:"tertiary",name:"Railway Gate Road"}}).category,"road"));
test("level crossing requires metadata",()=>{const c=classifyFeature({tags:{railway:"level_crossing",name:"Level Crossing"}});assert.equal(c.category,"railway_gate");assert.equal(c.railway_symbol,true);});
test("railway hospital is not railway infrastructure",()=>assert.equal(classifyFeature({tags:{amenity:"hospital",name:"Railway Hospital"}}).category,"unknown"));
test("5th Cross Road remains road",()=>assert.equal(classifyFeature({tags:{highway:"residential",name:"5th Cross Road"}}).category,"road"));
