import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function setup(){
 const state={lang:'es',company:'Croma',student:'Alumno',fileActions:[],vfs:null};
 const env={window:{},console,Date,Math};env.AtCOS=env.window.AtCOS={};
 for(const path of ['data/registry.js','data/clients.js','data/orders.js','data/received-files.js'])
  runInNewContext(read(path),env,{filename:path});
 const E={
  get:()=>state,save:()=>{},stamp:()=> '09:00',loc:x=>x?.[state.lang]??String(x),
  visibleCases:()=>[],caseState:()=>null,caseData:()=>null
 };
 env.AtCOS.Engine=E;
 runInNewContext(read('js/vfs.js'),env,{filename:'js/vfs.js'});
 env.AtCOS.Icons={svg:()=>'<svg></svg>'};
 env.AtCOS.Views={escape:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),render:()=>{}};
 env.AtCOS.App={toast:()=>{}};
 runInNewContext(read('js/file-app.js'),env,{filename:'js/file-app.js'});
 return {F:env.AtCOS.VFS,FileApp:env.AtCOS.FileApp,state};
}

test('physical download pipeline for virtual files is fully removed, but report remains',()=>{
 const {F}=setup();F.init();
 assert.equal(typeof F.download,'undefined');
 assert.doesNotMatch(read('js/vfs.js'),/URL\.createObjectURL|makePdf\(|\.download\s*=/);
 assert.doesNotMatch(read('js/app.js'),/vfsDownload|VFS\.download/);
 assert.doesNotMatch(read('js/file-app.js'),/data-vfs-download|data-vfs-cmd="download"|F\.download\(/);
 assert.match(read('js/views.js'),/id="pdfDownloadLink"/);
});

test('Opening a received PDF displays the contents inside Archivos',()=>{
 const {F,FileApp,state}=setup();F.init();
 assert.equal(FileApp.openReceived('P-2081'),true);
 const view=FileApp.render();
 assert.match(view,/vfs-document-reader/);
 assert.match(view,/folleto_Fira_FINAL4\.pdf/);
 assert.match(view,/Recepción: CONFIRMADA/);
 assert.match(view,/data-vfs-cmd='closeviewer'/);
 assert.doesNotMatch(view,/data-vfs-download/);
 state.lang='ca';
 assert.match(FileApp.render(),/Recepció: CONFIRMADA/);
 assert.match(FileApp.render(),/Tornar als arxius/);
});

test('Return from viewer and open from Explorer; no file is exported',()=>{
 const {F,FileApp}=setup();F.init();
 const id=F.receivedForOrder('P-1847').id;
 FileApp.act({dataset:{vfsFolder:F.RECEIVED}});
 FileApp.act({dataset:{vfsOpen:id}});
 assert.match(FileApp.render(),/vfs-document-reader/);
 FileApp.act({dataset:{vfsCmd:'closeviewer'}});
 assert.doesNotMatch(FileApp.render(),/vfs-document-reader/);
 assert.match(FileApp.render(),/data-vfs-cmd='open'/);
 FileApp.act({dataset:{vfsCmd:'open'}});
 assert.match(FileApp.render(),/vfs-document-reader/);
});

test('Settings icon is new symmetric gear, fully contained in SVG viewport',()=>{
 const env={window:{},console};env.AtCOS=env.window.AtCOS={};
 runInNewContext(read('js/icons.js'),env,{filename:'js/icons.js'});
 const svg=env.AtCOS.Icons.svg('settings',{size:40});
 assert.match(svg,/viewBox="0 0 24 24"/);
 assert.match(svg,/circle cx="12" cy="12" r="3\.3"/);
 const path=svg.match(/<path d="([^"]+)" stroke-width="1\.65"/)?.[1];
 assert.ok(path,'settings must have a single closed gear-outline path');
 const vertices=[...path.matchAll(/[ML]([0-9.]+) ([0-9.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.equal(vertices.length,48);
 for(const [x,y] of vertices){assert.ok(x>=2&&x<=22,'x outside viewbox');assert.ok(y>=2&&y<=22,'y outside viewbox')}
 for(let i=0;i<24;i++){const [x,y]=vertices[i], [opX,opY]=vertices[i+24];assert.ok(Math.abs((x+opX)-24)<.02);assert.ok(Math.abs((y+opY)-24)<.02)}
});

test('Changes remain parseable and the new style resource is loaded',()=>{
 for(const path of ['js/file-app.js','js/vfs.js','js/app.js','js/icons.js'])
  assert.doesNotThrow(()=>new Script(read(path),{filename:path}),path);
 const html=read('index.html');
 assert.match(html,/css\/ux-v09\.css/);
 assert.match(read('css/ux-v09.css'),/\.vfs-document-reader/);
});
