import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g)].map(m=>m[1]);
const images=[...fs.readFileSync(path.join(root,'data/scenarios/pilot.js'),'utf8').matchAll(/post:\s*'([^']+)'/g)].map(m=>m[1]);
const problems=[];
for(const rel of [...scripts,...styles])if(!fs.existsSync(path.join(root,rel)))problems.push(`Resource missing: ${rel}`);
for(const rel of images)if(!fs.existsSync(path.join(root,'assets',rel)))problems.push(`Image missing: ${rel}`);
if(scripts.length<10)problems.push('Unexpected script count');
const sandbox={window:{},console};
sandbox.window.AtCOS={};sandbox.AtCOS=sandbox.window.AtCOS;
for(const rel of scripts){if(!rel.startsWith('data/'))break;try{vm.runInNewContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel})}catch(e){problems.push(`${rel}: ${e.message}`)}}
const data=sandbox.AtCOS.Data;
if(!data?.cases?.length)problems.push('No scenarios registered');
else{
 for(const s of data.cases){
  if(!data.clients[s.client])problems.push(`Unknown client for ${s.id}`);
  if(s.order&&!data.orders[s.order])problems.push(`Unknown order for ${s.id}`);
  if(typeof s.arrival==='string'&&!data.cases.some(v=>v.id===s.arrival))problems.push(`Unknown arrival dependency for ${s.id}`);
  if(!['email','messages','phone','social'].includes(s.channel))problems.push(`Unknown channel for ${s.id}`);
  for(const k of ['title','subject'])if(s[k]&&!(typeof s[k]==='object'&&s[k].es&&s[k].ca))problems.push(`Untranslated ${k} in ${s.id}`);
  for(const [i,step] of s.steps.entries()){
   if(!step.incoming?.es||!step.incoming?.ca)problems.push(`Missing bilingual incoming: ${s.id}/${i}`);
   if(!step.prompt?.es||!step.prompt?.ca)problems.push(`Missing bilingual prompt: ${s.id}/${i}`);
  }
 }
}
const end=html.indexOf('<script');
if(!html.includes('AtC/OS')||!html.includes('id="taskbar"'))problems.push('Brand or taskbar missing');
if(problems.length){console.error(problems.map(p=>'✗ '+p).join('\n'));process.exit(1)}
console.log(`✓ AtC/OS assets loaded: ${scripts.length} scripts, ${styles.length} styles, ${data.cases.length} scenarios, ${Object.keys(data.clients).length} clients`);
