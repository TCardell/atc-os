/** AtC/OS content registry. Static scripts can append scenarios without a bundler. */
window.AtCOS=window.AtCOS||{};
AtCOS.Data={
 L:(es,ca)=>({es,ca}),
 names:{},labels:{es:{},ca:{}},clients:{},orders:{},catalog:[],cases:[],packs:[],
 addPack({id,version=1,cases=[]}){if(!id||this.packs.some(x=>x.id===id))throw Error('Duplicate pack '+id);this.addCases(cases.map(x=>({...x,pack:id})));this.packs.push({id,version,count:cases.length})},
 addCases(items){
  if(!Array.isArray(items))throw Error('AtCOS.Data.addCases expects an array');
  for(const item of items){
   if(!item||typeof item.id!=='string'||!item.id.trim())throw Error('Scenario has no ID');
   if(this.cases.some(c=>c.id===item.id))throw Error('Duplicate scenario ID: '+item.id);
   if(!['email','messages','phone','desk','social'].includes(item.channel))throw Error('Invalid scenario channel: '+item.id);
   if(!Array.isArray(item.steps)||item.steps.length===0)throw Error('Scenario has no steps: '+item.id);
   if(!item.title||!item.client||!('arrival' in item))throw Error('Scenario lacks required fields: '+item.id);
   this.cases.push({...item,pack:item.pack||'pilot',difficulty:item.difficulty||2,tags:item.tags||[],ra:item.ra||'RA2'});
  }
 }
};
