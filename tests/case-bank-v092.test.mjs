import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function env(){
 const sandbox={window:{},console,Date,Math};
 sandbox.AtCOS=sandbox.window.AtCOS={};
 const load=path=>runInNewContext(read(path),sandbox,{filename:path});
 return {sandbox,load};
}
const L=(es,ca)=>({es,ca});
const makeCase=(id,channel='email',arrival=0,extras={})=>({
 id,channel,client:'laura',order:'P-1847',arrival,
 title:L('Caso '+id,'Cas '+id),kind:channel,steps:[{incoming:L('Cliente de prueba','Client de prova'),prompt:L('Redacta tu respuesta','Redacta la resposta')}],
 ...extras
});

test('importing a pack is atomic, including invalid second entries and repeated IDs',()=>{
 const {sandbox,load}=env();
 load('data/registry.js');const D=sandbox.AtCOS.Data;
 const one=makeCase('pack-first');
 const bad=makeCase('pack-bad','desk');
 assert.throws(()=>D.addPack({id:'bad-pack',version:1,cases:[one,bad]}),/Invalid scenario channel/);
 assert.equal(D.cases.length,0);
 assert.equal(D.packs.length,0);
 assert.throws(()=>D.addPack({id:'bad-pack',cases:[one,{...one}]}),/Duplicate scenario ID/);
 assert.equal(D.cases.length,0);
 const added=D.addPack({id:'brand-new',version:2,cases:[one]});
 assert.equal(added.length,1);
 assert.equal(D.cases[0].pack,'brand-new');
 assert.equal(D.cases[0].ra,'RA2');
 assert.equal(D.cases[0].difficulty,2);
 assert.throws(()=>D.addPack({id:'brand-new',cases:[makeCase('other')]}),/Duplicate or invalid pack/);
 assert.equal(D.cases.length,1);
});

test('bank audit reports wrong customer/order and cross-pack dependencies',()=>{
 const {sandbox,load}=env();load('data/registry.js');load('data/clients.js');load('data/orders.js');
 const D=sandbox.AtCOS.Data;
 D.addPack({id:'episode-one',cases:[makeCase('opening')]});
 D.addPack({id:'episode-two',cases:[makeCase('follow-up','phone','opening'),makeCase('wrong','email',0,{client:'julia'})]});
 assert.ok(D.audit().some(x=>x.includes('Client/order mismatch for wrong')));
 D.cases.find(c=>c.id==='wrong').client='laura';
 assert.deepEqual(Array.from(D.audit()),[]);
 assert.equal(D.summary().total,3);
 assert.equal(D.summary().channels.phone,1);
 assert.equal(D.summary().packs['episode-two'],2);
 D.cases.find(c=>c.id==='opening').arrival='follow-up';
 assert.ok(D.audit().some(x=>x.includes('Cyclic scenario dependency')));
});

test('large 32-case catalogue selects reproducible, multi-channel sessions of 12',()=>{
 const {sandbox,load}=env();load('js/scenario-selector.js');
 const chooser=sandbox.AtCOS.ScenarioSelector;
 const channels=['email','messages','phone','social'];
 const cases=Array.from({length:32},(_,i)=>({
  id:'case-'+i,channel:channels[i%4],
  arrival:i>=8&&i%5===0?'case-'+(i-4):0,
  ra:'RA'+(1+i%4),difficulty:1+(i%3)
 }));
 const a=Array.from(chooser.choose(cases,{seed:1777,limit:12}));
 const b=Array.from(chooser.choose(cases,{seed:1777,limit:12}));
 assert.deepEqual(a,b);
 assert.equal(a.length,12);
 assert.equal(new Set(a).size,12);
 assert.equal(new Set(a.map(id=>cases.find(c=>c.id===id).channel)).size,4);
 assert.ok(a.some(id=>cases.find(c=>c.id===id).arrival===0),'session must be actionable at startup');
 for(const id of a){
  const c=cases.find(x=>x.id===id);
  if(typeof c.arrival==='string')assert.ok(a.includes(c.arrival),'prerequisite missing for '+id);
 }
 const other=Array.from(chooser.choose(cases,{seed:18,limit:12}));
 assert.notDeepEqual(a,other,'different seeds should vary the cases');
});

test('limited sessions never admit a partial chain, orphan or invisible-only start',()=>{
 const {sandbox,load}=env();load('js/scenario-selector.js');
 const choose=sandbox.AtCOS.ScenarioSelector.choose;
 const cases=[
  {id:'root',channel:'email',arrival:0},
  {id:'child',channel:'phone',arrival:'root'},
  {id:'grandchild',channel:'social',arrival:'child'},
  {id:'independent',channel:'messages',arrival:0},
  {id:'orphan',channel:'social',arrival:'missing'},
  {id:'delayed',channel:'phone',arrival:9}
 ];
 const picked=Array.from(choose(cases,{limit:2,seed:25}));
 assert.equal(picked.length,2);
 assert.ok(!picked.includes('grandchild'));
 assert.ok(!picked.includes('orphan'));
 assert.ok(!picked.includes('delayed'));
 for(const id of picked){const c=cases.find(v=>v.id===id);if(typeof c.arrival==='string')assert.ok(picked.includes(c.arrival))}
});

test('restoring without a case pack parks answers; reinstalling restores them',()=>{
 const {sandbox,load}=env();
 for(const path of ['data/registry.js','data/clients.js','data/orders.js','data/scenarios/pilot.js','js/scenario-selector.js'])load(path);
 sandbox.AtCOS.Store={save:()=>true,validate:()=>true};
 load('js/engine.js');const E=sandbox.AtCOS.Engine,D=sandbox.AtCOS.Data;
 E.create({student:'Alumno',company:'Taller',lang:'es',theme:'multi',mode:'dark'});
 const original=E.get();
 const savedCase={...original.cases[0],id:'future-case',draft:'Respuesta anterior muy importante',messages:[{role:'student',text:'Mi texto para evaluar',at:'09:30'}]};
 original.cases.push(savedCase);
 E.restore(original);
 assert.equal(E.caseState('future-case'),undefined);
 assert.equal(E.get().parkedCases.length,1);
 assert.equal(E.get().parkedCases[0].draft,'Respuesta anterior muy importante');
 D.addPack({id:'future',version:1,cases:[makeCase('future-case')]});
 E.restore(E.get());
 assert.equal(E.caseState('future-case').draft,'Respuesta anterior muy importante');
 assert.equal(E.get().parkedCases.length,0);
 assert.ok(E.get().scenarioIds.includes('future-case'));
 assert.equal(E.get().bankPacks[0].id,'pilot');
});
