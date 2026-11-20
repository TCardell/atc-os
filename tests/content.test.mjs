import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map(m=>m[1]);
const sandbox={window:{},console};sandbox.AtCOS=sandbox.window.AtCOS={};
for(const file of scripts.filter(s=>s.startsWith('data/')))vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const D=sandbox.AtCOS.Data;
test('base data has six pilot cases and five virtual channels',()=>{assert.equal(D.cases.length,6);assert.equal(new Set(D.cases.map(x=>x.channel)).size,5);assert.ok(D.cases.some(x=>x.channel==='desk'))});
test('scenario ids are unique and cross-reference real clients and orders',()=>{
 assert.equal(new Set(D.cases.map(x=>x.id)).size,D.cases.length);
 for(const c of D.cases){assert.ok(D.clients[c.client],c.id);assert.ok(!c.order||D.orders[c.order],c.id)}
});
test('all incoming messages and prompts translated',()=>{
 for(const c of D.cases)for(const step of c.steps){assert.ok(step.incoming.es&&step.incoming.ca,c.id);assert.ok(step.prompt.es&&step.prompt.ca,c.id)}
});
test('registry rejects duplicate scenario IDs',()=>{
 const duplicate=D.cases[0];assert.throws(()=>D.addCases([duplicate]),/Duplicate scenario ID/)
});
test('all resources in HTML exist',()=>{
 for(const p of scripts)assert.ok(fs.existsSync(path.join(root,p)),p)
});
