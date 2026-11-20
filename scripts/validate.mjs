import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g)].map(m=>m[1]);
const problems=[];
for(const rel of [...scripts,...styles])if(!fs.existsSync(path.join(root,rel)))problems.push(`Resource missing: ${rel}`);
// Analiza TODOS los scripts de la interfaz, no solo los módulos de datos.
for(const rel of scripts){const file=path.join(root,rel);if(!fs.existsSync(file))continue;try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:rel})}catch(e){problems.push(`Invalid JavaScript ${rel}: ${e.message}`)}}
if(scripts.length<10)problems.push('Unexpected script count');
const sandbox={window:{},console};
sandbox.window.AtCOS={};sandbox.AtCOS=sandbox.window.AtCOS;
for(const rel of scripts){if(!rel.startsWith('data/'))break;try{vm.runInNewContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel})}catch(e){problems.push(`${rel}: ${e.message}`)}}
const data=sandbox.AtCOS.Data;
if(!data?.cases?.length)problems.push('No scenarios registered');
else if(typeof data.audit!=='function')problems.push('Scenario bank audit is missing');
else problems.push(...data.audit());
// Validate image references for every content pack, not just the pilot.
for(const scenario of data?.cases||[]){
 if(!scenario.post)continue;
 if(path.basename(scenario.post)!==scenario.post||!fs.existsSync(path.join(root,'assets',scenario.post)))
  problems.push('Image missing or unsafe path: '+scenario.id+' / '+scenario.post);
}
// Prevent README/version drift when shipping a patch release.
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
if(!readme.includes('**v'+pkg.version+'**'))problems.push('README version does not match package.json: '+pkg.version);
if(!html.includes('AtC/OS')||!html.includes('id="taskbar"'))problems.push('Brand or taskbar missing');
if(problems.length){console.error(problems.map(p=>'✗ '+p).join('\n'));process.exit(1)}
console.log(`✓ AtC/OS assets loaded: ${scripts.length} scripts, ${styles.length} styles, ${data.cases.length} scenarios, ${Object.keys(data.clients).length} clients`);
