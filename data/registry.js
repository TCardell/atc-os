/** AtC/OS content registry. Packs are validated before being committed to the catalogue. */
window.AtCOS=window.AtCOS||{};
AtCOS.Data={
 L:(es,ca)=>({es,ca}),
 CHANNELS:['email','messages','phone','social'],
 names:{},labels:{es:{},ca:{}},clients:{},orders:{},catalog:[],cases:[],packs:[],
 bilingual(value){return !!(value&&typeof value==='object'&&['es','ca'].every(lang=>typeof value[lang]==='string'&&value[lang].trim()))},
 // Atomic registration: one invalid case must not leave a half-imported pack.
 prepareCases(items){
  if(!Array.isArray(items))throw Error('AtCOS.Data.addCases expects an array');
  const seen=new Set(this.cases.map(c=>c.id));
  return items.map(item=>{
   if(!item||typeof item.id!=='string'||!item.id.trim())throw Error('Scenario has no ID');
   if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(item.id))throw Error('Invalid scenario ID: '+item.id);
   if(seen.has(item.id))throw Error('Duplicate scenario ID: '+item.id);
   seen.add(item.id);
   if(!this.CHANNELS.includes(item.channel))throw Error('Invalid scenario channel: '+item.id);
   if(!Array.isArray(item.steps)||item.steps.length===0)throw Error('Scenario has no steps: '+item.id);
   if(!item.client||!('arrival' in item))throw Error('Scenario lacks required fields: '+item.id);
   if(!this.bilingual(item.title))throw Error('Scenario title must be bilingual: '+item.id);
   if(item.subject!=null&&!this.bilingual(item.subject))throw Error('Scenario subject must be bilingual: '+item.id);
   if(!(typeof item.arrival==='string'&&item.arrival.trim())&&
      !(Number.isInteger(item.arrival)&&item.arrival>=0))throw Error('Invalid arrival: '+item.id);
   for(const [i,step] of item.steps.entries()){
    if(!this.bilingual(step?.incoming)||!this.bilingual(step?.prompt))throw Error('Incomplete ES/CA step: '+item.id+'/'+i);
   }
   const difficulty=item.difficulty??2,ra=item.ra??'RA2',tags=item.tags??[];
   if(!Number.isInteger(difficulty)||difficulty<1||difficulty>3)throw Error('Difficulty must be 1–3: '+item.id);
   if(!/^RA[1-4]$/.test(ra))throw Error('Invalid RA: '+item.id);
   if(!Array.isArray(tags)||tags.some(tag=>typeof tag!=='string'||!tag.trim()))throw Error('Invalid tags: '+item.id);
   return {...item,pack:item.pack||'pilot',difficulty,ra,tags:[...tags]};
  });
 },
 addCases(items){const prepared=this.prepareCases(items);this.cases.push(...prepared);return prepared},
 addPack({id,version=1,cases=[]}={}){
  if(typeof id!=='string'||!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)||this.packs.some(p=>p.id===id))throw Error('Duplicate or invalid pack '+id);
  if(!Number.isInteger(version)||version<1)throw Error('Invalid pack version: '+id);
  if(!Array.isArray(cases)||!cases.length)throw Error('Empty or invalid pack: '+id);
  const prepared=this.prepareCases(cases.map(item=>({...item,pack:id})));
  this.cases.push(...prepared);
  this.packs.push({id,version,count:prepared.length});
  return prepared;
 },
 // Audit is the single source of truth for cross-pack relationships.
 // The build validator invokes this after all data files have been loaded.
 audit(){
  const problems=[],byId=new Map(this.cases.map(c=>[c.id,c]));
  const seen=new Set();
  for(const c of this.cases){
   if(seen.has(c.id))problems.push('Duplicate scenario: '+c.id);
   seen.add(c.id);
   if(!this.clients[c.client])problems.push('Unknown client for '+c.id);
   if(c.order&&!this.orders[c.order])problems.push('Unknown order for '+c.id);
   if(c.order&&this.orders[c.order]?.client!==c.client)problems.push('Client/order mismatch for '+c.id);
   if(typeof c.arrival==='string'&&!byId.has(c.arrival))problems.push('Unknown arrival dependency for '+c.id);
   if(!this.CHANNELS.includes(c.channel))problems.push('Invalid channel for '+c.id);
   if(!this.bilingual(c.title)||c.subject!=null&&!this.bilingual(c.subject))problems.push('Untranslated case header: '+c.id);
   for(const [i,step] of c.steps.entries())if(!this.bilingual(step.incoming)||!this.bilingual(step.prompt))problems.push('Untranslated step: '+c.id+'/'+i);
  }
  const visiting=new Set(),visited=new Set();
  const dependency=id=>{
   if(visited.has(id))return;
   if(visiting.has(id)){problems.push('Cyclic scenario dependency: '+id);return}
   const c=byId.get(id);if(!c)return;
   visiting.add(id);
   if(typeof c.arrival==='string')dependency(c.arrival);
   visiting.delete(id);visited.add(id);
  };
  for(const id of byId.keys())dependency(id);
  if(this.cases.length&&!this.cases.some(c=>c.arrival===0))problems.push('No initial case (arrival 0) in catalogue');
  const fileIds=new Set();
  for(const file of this.receivedFiles||[]){
   if(!file.id||fileIds.has(file.id))problems.push('Duplicate or missing received file ID: '+file.id);
   fileIds.add(file.id);
   if(!this.orders[file.orderId])problems.push('Received file with unknown order: '+file.id);
   if(!this.clients[file.clientId])problems.push('Received file with unknown client: '+file.id);
   if(this.orders[file.orderId]&&this.orders[file.orderId].client!==file.clientId)problems.push('Received file client/order mismatch: '+file.id);
   if(!this.bilingual(file.content))problems.push('Missing bilingual received file content: '+file.id);
  }
  return problems;
 },
 // Useful for designing and inspecting a 25–30 case bank; never mutates data.
 summary(items=this.cases){
  const counts={total:items.length,channels:Object.fromEntries(this.CHANNELS.map(k=>[k,0])),ra:{},difficulty:{},packs:{}};
  for(const c of items){
   counts.channels[c.channel]=(counts.channels[c.channel]||0)+1;
   counts.ra[c.ra]=(counts.ra[c.ra]||0)+1;
   counts.difficulty[c.difficulty]=(counts.difficulty[c.difficulty]||0)+1;
   counts.packs[c.pack]=(counts.packs[c.pack]||0)+1;
  }
  return counts;
 }
};
