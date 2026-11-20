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
// Analiza TODOS los scripts de la interfaz, no solo los módulos de datos.
for(const rel of scripts){const file=path.join(root,rel);if(!fs.existsSync(file))continue;try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:rel})}catch(e){problems.push(`Invalid JavaScript ${rel}: ${e.message}`)}}
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
// Valida coherencia de los documentos recibidos con los pedidos y clientes.
const seenFiles=new Set();
for(const file of data?.receivedFiles||[]){
 if(!file.id||seenFiles.has(file.id))problems.push('Duplicate or missing received file ID: '+file.id);
 seenFiles.add(file.id);
 if(!data.orders[file.orderId])problems.push('Received file with unknown order: '+file.id);
 if(!data.clients[file.clientId])problems.push('Received file with unknown client: '+file.id);
 if(data.orders[file.orderId]&&data.orders[file.orderId].client!==file.clientId)problems.push('Received file client/order mismatch: '+file.id);
 if(!file.content?.es||!file.content?.ca)problems.push('Missing bilingual received file content: '+file.id);
}
// Las dependencias del futuro catálogo no deben formar ciclos.
const byId=new Map((data?.cases||[]).map(c=>[c.id,c]));
const visiting=new Set(),visited=new Set();
function checkDependency(id){
 if(visited.has(id))return;
 if(visiting.has(id)){problems.push('Cyclic scenario dependency: '+id);return}
 const c=byId.get(id);if(!c)return;
 visiting.add(id);
 if(typeof c.arrival==='string')checkDependency(c.arrival);
 visiting.delete(id);visited.add(id);
}
for(const id of byId.keys())checkDependency(id);

if(!html.includes('AtC/OS')||!html.includes('id="taskbar"'))problems.push('Brand or taskbar missing');
if(problems.length){console.error(problems.map(p=>'✗ '+p).join('\n'));process.exit(1)}
console.log(`✓ AtC/OS assets loaded: ${scripts.length} scripts, ${styles.length} styles, ${data.cases.length} scenarios, ${Object.keys(data.clients).length} clients`);
