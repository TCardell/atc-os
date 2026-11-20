/* Deterministic, dependency-safe selection from independent case packs.
   Keeps the public API choose(cases,{limit,seed}) -> IDs unchanged. */
window.AtCOS=window.AtCOS||{};
AtCOS.ScenarioSelector=(()=>{
 const CHANNELS=['email','messages','phone','social'];
 function random(seed){let x=seed>>>0||34241;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function choose(catalogue,{limit=12,seed=Date.now()}={}){
  if(!Array.isArray(catalogue))throw Error('Scenario catalogue must be an array');
  const cap=Math.max(0,Math.floor(Number(limit)||0));
  if(!cap)return [];
  const rand=random(seed),all=catalogue.filter(c=>c&&CHANNELS.includes(c.channel));
  const byId=new Map(all.map(c=>[c.id,c])),chosen=[],selected=new Set();
  const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items};
  // Compute the WHOLE dependency chain before accepting a case. Never add
  // half a chain when only one free slot remains.
  function closure(candidate){
   const visiting=new Set(),added=new Set(),chain=[];
   function visit(item){
    if(!item)return false;
    if(selected.has(item.id))return true;
    if(visiting.has(item.id))throw Error('Dependencia circular entre casos: '+item.id);
    if(Number.isInteger(item.arrival)&&item.arrival>=cap&&item.arrival!==0)return false;
    visiting.add(item.id);
    if(typeof item.arrival==='string'&&!visit(byId.get(item.arrival))){visiting.delete(item.id);return false}
    visiting.delete(item.id);
    if(!added.has(item.id)){added.add(item.id);chain.push(item)}
    return true;
   }
   return visit(candidate)?chain:null;
  }
  function add(item){
   const chain=closure(item);
   if(!chain||!chain.length||chosen.length+chain.length>cap)return false;
   for(const c of chain){selected.add(c.id);chosen.push(c)}
   return true;
  }
  // At least one immediately visible task is needed to begin the session.
  const starters=shuffle(all.filter(c=>c.arrival===0));
  if(starters.length)add(starters[0]);
  // Quotas: one case per available channel when capacity/dependencies permit.
  // Start with random candidates, then prefer the cheapest complete chain.
  for(const channel of CHANNELS){
   if(chosen.some(c=>c.channel===channel))continue;
   const candidates=shuffle(all.filter(c=>c.channel===channel));
   candidates.sort((a,b)=>(closure(a)?.length??Infinity)-(closure(b)?.length??Infinity));
   for(const c of candidates)if(add(c))break;
  }
  // Randomized filling keeps runs varied while preserving their prerequisites.
  for(const c of shuffle([...all])){if(chosen.length>=cap)break;add(c)}
  return chosen.map(c=>c.id);
 }
 return {choose,CHANNELS};
})();
