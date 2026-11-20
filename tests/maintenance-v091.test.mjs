import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const load=(path,env)=>runInNewContext(read(path),env,{filename:path});

function createOffice(){
 const env={window:{},console,Date,Math};
 env.AtCOS=env.window.AtCOS={};
 for(const path of ['data/registry.js','data/branding.js','data/i18n.js','data/clients.js','data/orders.js','data/catalog.js','data/received-files.js','data/scenarios/pilot.js','js/scenario-selector.js'])load(path,env);
 env.AtCOS.Store={save:()=>true,validate:()=>true};
 load('js/engine.js',env);
 load('js/vfs.js',env);
 const E=env.AtCOS.Engine,F=env.AtCOS.VFS;
 E.create({student:'Alumna de prueba',company:'Taller Gràfic',lang:'es',theme:'multi',mode:'dark',emoji:'△'});
 F.init();
 return {E,F,env};
}

test('copying a folder into itself or any descendant is rejected without changing the tree',()=>{
 const {F}=createOffice();
 const parent=F.createFolder(F.DOCS,'Proyecto');
 const child=F.createFolder(parent.id,'Materiales');
 F.createFile(child.id,'nota.txt','Contenido de práctica');
 const before=F.get().nodes.length;
 assert.throws(()=>F.copy(parent.id,parent.id),/dentro de sí misma/);
 assert.throws(()=>F.copy(parent.id,child.id),/dentro de sí misma/);
 assert.equal(F.get().nodes.length,before);
 const copied=F.copy(parent.id,F.ORDERS);
 assert.equal(copied.parent,F.ORDERS);
 const nested=F.list(copied.id)[0];
 assert.equal(nested.name,'Materiales');
 assert.equal(F.list(nested.id)[0].content,'Contenido de práctica');
});

test('trash and permanent deletion invalidate outgoing email attachments',()=>{
 const {E,F}=createOffice();
 const original=F.receivedForOrder('P-1847');
 assert.ok(original);
 const file=F.saveAttachment('P-1847');
 F.attach('email01',file.id);
 assert.equal(F.attachments('email01').length,1);
 F.move(file.id,F.TRASH);
 assert.equal(F.attachments('email01').length,0);
 assert.throws(()=>F.attach('email01',file.id),/correo pendiente/);
 const reply=E.send('email01','Hemos revisado su pedido y responderemos sobre la producción y la fecha prevista.');
 assert.equal(reply.ok,true);
 const sent=E.caseState('email01').messages.find(m=>m.role==='student');
 assert.ok(sent);
 assert.equal(sent.attachments.length,0);
 assert.equal(original.parent,F.RECEIVED);
});

test('restoring an attachment revalidates it; finalized sessions reject new attachments',()=>{
 const {E,F}=createOffice();
 const file=F.saveAttachment('P-1847');
 F.attach('email01',file.id);
 F.move(file.id,F.TRASH);
 F.restore(file.id);
 assert.equal(F.attachments('email01').length,1);
 E.finish();
 assert.throws(()=>F.attach('email01',file.id),/correo pendiente/);
});

test('scenario selector rejects cycles and skips missing prerequisites',()=>{
 const env={window:{},console,Date,Math};env.AtCOS=env.window.AtCOS={};
 load('js/scenario-selector.js',env);
 const selector=env.AtCOS.ScenarioSelector;
 assert.throws(()=>selector.choose([
  {id:'A',channel:'email',arrival:'B'},
  {id:'B',channel:'phone',arrival:'A'}
 ],{limit:2,seed:12}),/circular/);
 const got=selector.choose([
  {id:'orphan',channel:'email',arrival:'missing'},
  {id:'valid',channel:'phone',arrival:0}
 ],{limit:2,seed:11});
 assert.deepEqual(Array.from(got),['valid']);
});

test('prohibited physical file download stays absent, final report remains',()=>{
 const vfs=read('js/vfs.js'),pdf=read('js/pdf.js');
 assert.doesNotMatch(vfs,/URL\\.createObjectURL|function download\\(/);
 assert.match(read('js/views.js'),/pdfDownloadLink/);
 assert.ok(pdf.includes('AtCOS'));
});
