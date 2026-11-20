window.AtCOS=window.AtCOS||{};
AtCOS.Engine=(()=>{
 let state=null;
 const X=()=>state,loc=v=>typeof v==='object'&&v!==null&&'es'in v?v[state.lang]:String(v??'');
 const label=k=>AtCOS.Data.labels[state?.lang||'es'][k]||k;
 function now(){return new Date().toISOString()}
 function stamp(){return String(Math.floor(state.simMinutes/60)).padStart(2,'0')+':'+String(state.simMinutes%60).padStart(2,'0')}
 function event(type,title,caseId){state.events.unshift({type,title,caseId:caseId||null,at:stamp()});state.events=state.events.slice(0,60)}
 function create({student,company,lang,theme,mode,emoji}){
  const start=Date.now(),newState={version:1,session:`ATC-${start.toString(36).toUpperCase().slice(-6)}`,student:student.trim(),company:company.trim(),lang,theme,mode,emoji:emoji||'△',selectedByView:{},startedAt:now(),endedAt:null,finalized:false,simMinutes:540,view:'dashboard',selectedCase:null,events:[],cases:AtCOS.Data.cases.map(data=>({id:data.id,revealed:data.arrival===0,complete:false,step:0,messages:[{role:'client',text:data.steps[0].incoming,at:'09:00',kind:data.kind}],draft:'',actions:[],note:'',flags:{},lastLookup:null,startedAt:null,finishedAt:null})),openedManual:[],lastTick:Date.now()};
  state=newState;event('start',lang==='ca'?'Comença la jornada':'Comienza la jornada');save();return state;
 }
 function restore(s){if(!AtCOS.Store.validate(s))throw Error('Invalid session');state=s;state.lastTick=Date.now();state.view=state.view||'dashboard';state.selectedByView=state.selectedByView||{};state.emoji=state.emoji||'△';state.openedManual=state.openedManual||[];save();return state}
 function save(){AtCOS.Store.save(state)}
 function caseData(id){return AtCOS.Data.cases.find(c=>c.id===id)}
 function caseState(id){return state.cases.find(c=>c.id===id)}
 function completedCount(){return state.cases.filter(c=>c.complete).length}
 function visibleCases(){return state.cases.filter(c=>c.revealed)}
 function availableCount(channel){return visibleCases().filter(c=>!c.complete&&(!channel||caseData(c.id).channel===channel)).length}
 function checkArrivals(){let incoming=[];const done=completedCount();for(const c of state.cases){if(c.revealed)continue;const d=caseData(c.id);if((typeof d.arrival==='number'&&done>=d.arrival)||(typeof d.arrival==='string'&&caseState(d.arrival)?.complete)){
    c.revealed=true;incoming.push(d.id);event('arrival',loc(d.title),d.id);
  }}return incoming}
 function advance(mins=2){state.simMinutes=Math.min(20*60,state.simMinutes+mins);save()}
 function select(id){const c=caseState(id),d=caseData(id);if(!c||!c.revealed)return false;state.selectedCase=id;state.selectedByView=state.selectedByView||{};state.selectedByView[d.channel]=id;state.view=d.channel;if(!c.startedAt)c.startedAt=now();save();return true}
 function view(v){state.view=v;state.selectedCase=state.selectedByView?.[v]||null;save()}
 function draft(id,text){const c=caseState(id);if(c&&!c.complete){c.draft=String(text).slice(0,3200);save()}}
 function note(id,text){const c=caseState(id);if(c){c.note=String(text).slice(0,1400);save()}}
 function action(id,type){const c=caseState(id),d=caseData(id);if(!c||!c.revealed||c.complete||state.finalized)return null;
  let info=null;
  if(type==='consultOrder')info=d.order?AtCOS.Data.orders[d.order]:null;
  if(type==='consultFile')info=d.order?{title:AtCOS.Data.orders[d.order].file,description:AtCOS.Data.orders[d.order].fileInfo}:null;
  if(type==='consultProduction')info=d.order?{title:{es:'Producción',ca:'Producció'},description:AtCOS.Data.orders[d.order].production}:null;
  if(type==='viewClient')info=AtCOS.Data.clients[d.client];
  if(type==='catalog')info=AtCOS.Data.catalog;
  if(type==='logIncident'){c.flags.incidentLogged=true;info={title:{es:'Incidencia registrada',ca:'Incidència registrada'},description:{es:'La incidencia ha quedado registrada en esta simulación. Aún debes explicar al cliente qué comprobarás.',ca:'La incidència ha quedat registrada en aquesta simulació. Encara has d’explicar al client què comprovaràs.'}}}
  if(type==='openPrivate'){c.flags.openPrivate=true;info={title:{es:'Canal privado preparado',ca:'Canal privat preparat'},description:{es:'Después de publicar la respuesta pública podrás redactar un mensaje privado.',ca:'Després de publicar la resposta pública podràs redactar un missatge privat.'}}}
  if(type==='consultOrder'&&!info)info={title:label('order'),description:label('noOrder')};
  if(type==='consultFile'&&!info)info={title:label('file'),description:label('noFile')};
  if(type==='consultProduction'&&!info)info={title:label('production'),description:label('noOrder')};
  if(!c.actions.some(a=>a.type===type)){c.actions.push({type,at:stamp()});event('action',label(type==='catalog'?'catalog':type),id)}
  c.lastLookup=type;advance(2);save();return info;
 }
 function send(id,text){const c=caseState(id),d=caseData(id);if(!c||!c.revealed||c.complete||state.finalized)return {ok:false};
  const body=String(text||'').trim();if(body.length<12)return {ok:false,message:label('notEnough')};
  const at=stamp();const step=d.steps[c.step];if(!step)return {ok:false};
  c.messages.push({role:'student',text:body,at,kind:step.requiresFlag?'private':d.kind});c.draft='';c.step+=1;c.lastLookup=null;advance(9);
  while(c.step<d.steps.length&&d.steps[c.step].requiresFlag&&!c.flags[d.steps[c.step].requiresFlag])c.step++;
  if(c.step>=d.steps.length){c.complete=true;c.finishedAt=now();event('resolved',loc(d.title),id)}
  else {const next=d.steps[c.step];c.messages.push({role:next.requiresFlag?'system':'client',text:next.incoming,at:stamp(),kind:next.requiresFlag?'private':d.kind});event('followup',loc(d.title),id)}
  const arrivals=checkArrivals();save();return {ok:true,complete:c.complete,arrivals};
 }
 function finish(){state.finalized=true;state.endedAt=now();event('finish',state.lang==='ca'?'Jornada finalitzada':'Jornada finalizada');state.view='report';state.selectedCase=null;save()}
 function unfinish(){state.finalized=false;state.endedAt=null;state.view='dashboard';save()}
 function tick(){if(!state||state.finalized)return false;const delta=Date.now()-(state.lastTick||Date.now());if(delta<30000)return false;const inc=Math.min(4,Math.floor(delta/30000));state.lastTick=Date.now();state.simMinutes=Math.min(20*60,state.simMinutes+inc);save();return true}
 function counts(){return {done:completedCount(),total:state.cases.length,open:visibleCases().filter(c=>!c.complete).length,hidden:state.cases.filter(c=>!c.revealed).length,replies:state.cases.reduce((n,c)=>n+c.messages.filter(m=>m.role==='student').length,0)}}
 return {get:X,create,restore,save,loc,label,stamp,select,view,draft,note,action,send,finish,unfinish,tick,counts,caseState,caseData,visibleCases,availableCount,completedCount};
})();
