import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const sandbox={window:{},console};sandbox.AtCOS=sandbox.window.AtCOS={};
runInNewContext(readFileSync(new URL('../js/scenario-selector.js',import.meta.url),'utf8'),sandbox);
const selector=sandbox.AtCOS.ScenarioSelector;
const channels=['email','messages','phone','desk','social'];
const corpus=Array.from({length:80},(_,i)=>({id:'scenario-'+i,channel:channels[i%5],arrival:0,steps:[{incoming:{es:'X',ca:'X'}}]}));
test('selects 12 unique cases with all five virtual channels',()=>{
 const got=selector.choose(corpus,{limit:12,seed:1234});
 assert.equal(got.length,12);assert.equal(new Set(got).size,got.length);
 assert.equal(new Set(got.map(id=>corpus.find(x=>x.id===id).channel)).size,5);
 assert.deepEqual(got,selector.choose(corpus,{limit:12,seed:1234}));
});
test('includes prerequisites of dependent cases',()=>{
 const catalog=[{id:'main',arrival:0,channel:'email'},{id:'followup',arrival:'main',channel:'phone'}];
 const got=selector.choose(catalog,{limit:2,seed:2});assert.deepEqual(new Set(got),new Set(['main','followup']));
});
test('includes presencial scenarios',()=>{
 const got=selector.choose([{id:'face-to-face',arrival:0,channel:'desk'}],{limit:2,seed:17});assert.ok(got.includes('face-to-face'));
});
