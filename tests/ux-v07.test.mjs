import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('v0.7: login is centered, Start fixed at taskbar midpoint and search button removed',()=>{
 const index=read('index.html'),css=read('css/ux-v07.css');
 assert.match(index,/class="taskbar-center"/);
 assert.match(index,/id="taskStart"/);
 assert.doesNotMatch(index,/id="taskSearch"/);
 assert.match(css,/\.login-screen\{justify-content:center!important/);
 assert.match(css,/\.taskbar-center #taskStart\{position:absolute;left:50%/);
});
test('v0.7: desktop apps and virtual recycle bin coexist',()=>{
 const index=read('index.html'),os=read('js/desktop.js'),app=read('js/app.js');
 assert.match(index,/id="desktopTrash"/);
 assert.match(os,/const shortcuts=\['email','messages','phone','desk','social','directory','tasks','settings','report'\]/);
 assert.match(os,/AtCOS\.VFS\.list\(AtCOS\.VFS\.DESKTOP\)/);
 assert.match(app,/data-os-trash/);
 assert.match(index,/data-vfs-drop="trash"/);
});
test('v0.7: closing windows preserves geometry and Tasks defaults to a smaller size',()=>{
 const os=read('js/desktop.js');
 assert.match(os,/rememberedGeometry\.set\(id,\{\.\.\.v\.rect\}\)/);
 assert.match(os,/rememberedGeometry\.get\(id\)/);
 assert.match(os,/compact\?650/);
 assert.match(os,/compact\?570/);
});
test('v0.7: email reply is explicitly opened and header contains no fabricated corporate email',()=>{
 const mail=read('js/views.js'),app=read('js/app.js');
 assert.match(mail,/data-mail-compose/);
 assert.match(mail,/data-mail-compose-close/);
 assert.match(mail,/Correo corporativo/);
 assert.doesNotMatch(mail,/@oficina\.example/);
 assert.match(app,/V\.setMailCompose\(el\.dataset\.mailCompose,true\)/);
 assert.match(app,/V\.setMailCompose\(id,false\)/);
});
test('v0.7: in-person channel and existing business apps remain connected',()=>{
 const registry=read('data/registry.js'),select=read('js/scenario-selector.js'),views=read('js/views.js');
 assert.match(registry,/\['email','messages','phone','desk','social'\]/);
 assert.match(select,/\['email','messages','phone','desk','social'\]/);
 assert.match(views,/function desk\(\)/);
 assert.match(views,/desk:\['desk','deskTitle','deskLead'\]/);
 assert.match(views,/desk,social,directory,report/);
 assert.match(read('data/scenarios/pilot.js'),/id:'desk01'/);
});
test('v0.7: all modified JavaScript parses without syntax errors',()=>{
 for(const path of ['js/app.js','js/views.js','js/desktop.js','js/icons.js','js/engine.js','js/scenario-selector.js','data/registry.js','data/i18n.js','data/scenarios/pilot.js'])
  assert.doesNotThrow(()=>new Script(read(path),{filename:path}),path);
});
