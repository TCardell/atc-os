import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('v0.6: two setup stages, boot screen and essential scripts',()=>{
 const html=file('index.html'),app=file('js/app.js');
 for(const id of ['loginName','studentInput','companyInput','setupNext','setupBack','startBtn','bootProgress']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/data-setup-step="1"/);
 assert.match(html,/data-setup-step="2" hidden/);
 assert.match(app,/function setSetupPage\(/);
 assert.match(app,/function startBoot\(/);
 assert.match(app,/startBoot\(enter\)/);
 assert.match(app,/ThemeManager\.apply/);
});

test('v0.6: JS parses and email badges are anchored to their rows',()=>{
 for(const path of ['js/app.js','js/desktop.js','js/engine.js','js/views.js','js/theme-manager.js']) assert.doesNotThrow(()=>new Script(file(path),{filename:path}));
 assert.match(file('js/engine.js'),/if\(d\.channel==='email'\)c\.read=true/);
 assert.match(file('js/views.js'),/!c\.read\?'unread'/);
 assert.match(file('css/desktop.css'),/\.email-row-new\.unread::before\{position:absolute;transform:none/);
});

test('v0.6: desktop files retained, apps launched from Start, split presets work',()=>{
 const desk=file('js/desktop.js');
 assert.match(desk,/AtCOS\.VFS\.list\(AtCOS\.VFS\.DESKTOP\)/);
 assert.match(desk,/const shortcuts=\['email'/);
 assert.match(desk,/snap-menu-presets/);
 assert.match(desk,/ratio\(35\|50\|65\)/);
});

test('v0.6: theme manager isolates OS style and supports a future retro mode',()=>{
 const context={document:{body:{dataset:{}},documentElement:{dataset:{}}}};context.window=context;
 runInNewContext(file('js/theme-manager.js'),context);
 const t=context.AtCOS.ThemeManager;
 assert.equal(t.apply('retro98'),'retro98');
 assert.equal(context.document.body.dataset.osTheme,'retro98');
 assert.equal(t.apply('invalid'),'modern');
 assert.match(file('css/themes/retro98.css'),/data-os-theme="retro98"/);
});
