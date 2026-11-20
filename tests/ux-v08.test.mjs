import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

function officeFixture(){
 const state={student:'Alumno',company:'Gráfica Demo',lang:'es',simMinutes:540,taskChecks:{},fileActions:[],vfs:null};
 const cases={email01:{id:'email01',complete:false,attachments:[]}};
 const schema={email01:{id:'email01',channel:'email',order:'P-1847'}};
 const environment={window:{},console,Date,Math,TextEncoder,Blob};
 environment.AtCOS=environment.window.AtCOS={};
 for(const path of ['data/registry.js','data/clients.js','data/orders.js','data/received-files.js']) runInNewContext(file(path),environment,{filename:path});
 environment.AtCOS.Engine={get:()=>state,save:()=>{},loc:v=>v?.[state.lang]??String(v??''),stamp:()=> '09:00',caseState:id=>cases[id],caseData:id=>schema[id]};
 runInNewContext(file('js/vfs.js'),environment,{filename:'js/vfs.js'});
 return {F:environment.AtCOS.VFS,D:environment.AtCOS.Data,state,cases};
}

test('four communication channels, no presencial in UI or active scenario bank',()=>{
 for(const path of ['js/desktop.js','data/registry.js','js/scenario-selector.js','js/views.js']) {
  assert.doesNotMatch(file(path),/\bdesk01\b/);
 }
 assert.match(file('js/scenario-selector.js'),/\['email','messages','phone','social'\]/);
 assert.doesNotMatch(file('data/scenarios/pilot.js'),/id:'desk01'/);
});

test('actual received PDF records exist before students reply',()=>{
 const {F,D,state}=officeFixture();F.init();
 assert.equal(D.receivedFiles.length,3);
 assert.equal(F.list(F.RECEIVED).length,3);
 const brochure=F.receivedForOrder('P-2081');
 assert.ok(brochure);
 assert.equal(brochure.name,'folleto_Fira_FINAL4.pdf');
 assert.equal(brochure.mime,'application/pdf');
 assert.equal(brochure.clientId,'julia');
 assert.match(F.fileContent(brochure),/Recepción: CONFIRMADA/);
 state.lang='ca';assert.match(F.fileContent(brochure),/Recepció: CONFIRMADA/);
});

test('received files survive repeated initialization and old-session migration',()=>{
 const {F,state}=officeFixture();
 state.vfs={version:1,nodes:[{id:'root',type:'folder',parent:null,name:'Este equipo'}]};
 F.init();assert.equal(F.list(F.RECEIVED).length,3);
 const n=F.receivedForOrder('P-2081');
 F.move(n.id,F.TRASH);
 assert.equal(F.receivedForOrder('P-2081'),null);
 F.init();assert.equal(F.list(F.RECEIVED).length,2);
 F.restore(n.id);assert.ok(F.receivedForOrder('P-2081'));
 F.init();assert.equal(F.list(F.RECEIVED).length,3);
 assert.equal(state.vfs.receivedSeedVersion,1);
});

test('saving incoming file to Downloads copies existing bytes, not fabricating a new file',()=>{
 const {F,cases}=officeFixture();F.init();
 const original=F.receivedForOrder('P-1847'),copy=F.saveAttachment('P-1847');
 assert.notEqual(original.id,copy.id);
 assert.equal(copy.parent,F.DOWNLOADS);
 assert.equal(copy.name,original.name);
 assert.equal(F.fileContent(copy),F.fileContent(original));
 assert.equal(copy.receivedSource,original.id);
 F.attach('email01',copy.id);
 assert.deepEqual(cases.email01.attachments,[copy.id]);
 F.move(original.id,F.TRASH);
 assert.throws(()=>F.saveAttachment('P-1847'),/No hay un archivo recibido/);
});

test('file navigation and preview are connected to the actual client-record',()=>{
 const views=file('js/views.js'),app=file('js/app.js'),explorer=file('js/file-app.js');
 assert.match(views,/data-vfs-open-received/);
 assert.match(views,/linkedDocument\(c,d\)/);
 assert.match(app,/FileApp\.openReceived/);
 assert.match(explorer,/id='vfsFilePreview'/);
 assert.match(explorer,/F\.fileContent\(n\)/);
 assert.match(app,/dataset\.vfsDownload/);
 assert.doesNotMatch(views,/title="Adjunto"/);
});

test('drop area is physically separate from the trash and Settings has distinct SVG',()=>{
 const css=file('css/ux-v08.css'),icons=file('js/icons.js');
 assert.match(css,/\.desktop-file-drop/);
 assert.match(css,/top:112px!important/);
 assert.match(css,/bottom:auto!important/);
 assert.match(css,/\[data-os-open="settings"\]/);
 assert.match(icons,/settings:'<path d="M10\.2 2\.6/);
});

test('new and modified JS files parse without syntax errors',()=>{
 for(const path of ['js/vfs.js','js/file-app.js','js/views.js','js/app.js','js/icons.js','js/engine.js','data/registry.js','data/i18n.js','data/received-files.js','data/scenarios/pilot.js']){
  assert.doesNotThrow(()=>new Script(file(path),{filename:path}),path);
 }
});
