/* Deterministic, balanced selection. State stores selected IDs, never the full catalogue size. */
window.AtCOS=window.AtCOS||{};
AtCOS.ScenarioSelector=(()=>{
 const CHANNELS=['email','messages','phone','social'];
 function random(seed){let x=seed>>>0||34241;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function choose(catalogue,{limit=12,seed=Date.now()}={}){const rand=random(seed);const all=catalogue.filter(x=>CHANNELS.includes(x.channel));const byId=new Map(all.map(c=>[c.id,c]));const chosen=[];
 function add(x){if(!x||chosen.includes(x.id)||chosen.length>=limit)return;if(typeof x.arrival==='string')add(byId.get(x.arrival));if(!chosen.includes(x.id)&&chosen.length<limit)chosen.push(x.id)}
 const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items};
 const groups=CHANNELS.map(channel=>shuffle(all.filter(s=>s.channel===channel))); 
 // Choose at least one case per channel, then distribute any remaining slots.
 for(const group of groups)if(group.length&&chosen.length<limit)add(group.shift());
 let remaining=shuffle(groups.flat());
 for(const x of remaining){if(chosen.length>=limit)break;add(x)}
 return chosen;
 }
 return {choose,CHANNELS};
})();
