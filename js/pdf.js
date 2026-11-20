/* PDF 1.4 local, sin servicios externos. Texto seleccionable, A4 y saltos de página. */
window.AtCOS=window.AtCOS||{};
AtCOS.PDF=(()=>{
 let lastUrl=null;
 const WIDTH=595.28,HEIGHT=841.89,margin=42,small=9;
 const map={'‘':0x91,'’':0x92,'“':0x93,'”':0x94,'–':0x96,'—':0x97,'•':0x95,'€':0x80,'…':0x85,'\u00a0':32,'\u200b':32,'→':45,'←':45};
 function hex(text){let out='';for(const ch of String(text??'')){
  const n=ch.codePointAt(0);let b=(n>=32&&n<=126)||(n>=160&&n<=255)?n:(map[ch]??(n===9||n===10||n===13?32:63));
  if(n>65535)continue;out+=b.toString(16).padStart(2,'0');
 }return out.toUpperCase()}
 const color=s=>[1,3,5].map(i=>(parseInt(s.slice(i,i+2),16)/255).toFixed(3)).join(' ');
 const clean=s=>String(s??'').replace(/[\r\t]/g,' ').replace(/\u200b/g,'').replace(/[ ]+/g,' ').trim();
 function build(state){
  const txt=v=>AtCOS.Engine.loc(v),t=k=>AtCOS.Data.labels[state.lang][k]||k;
  const ctx=document.createElement('canvas').getContext('2d');const parts=[];let cmd=[],y=84;const brand=AtCOS.Data.names[state.theme]||'#6d65d9';
  function push(s){cmd.push(s)}
  function rect(x,top,w,h,c){push(`${color(c)} rg ${x.toFixed(2)} ${(HEIGHT-top-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)}
  function text(s,x,top,size=9,bold=false,c='#1d2c3b'){
    if(s===undefined||s===null||s==='')return;
    push(`${color(c)} rg BT /${bold?'F2':'F1'} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${(HEIGHT-top-size).toFixed(2)} Tm <${hex(s)}> Tj ET`);
  }
  function wrap(str,maxWidth,size=9,bold=false){ctx.font=`${bold?'bold ':''}${size}px Arial`;
    const words=String(str).split(/\s+/).filter(Boolean);if(!words.length)return[''];let result=[],cur='';
    for(let word of words){if(ctx.measureText(word).width>maxWidth){if(cur){result.push(cur);cur=''}let chunk='';for(const ch of word){if(ctx.measureText(chunk+ch).width>maxWidth&&chunk){result.push(chunk);chunk=ch}else chunk+=ch}word=chunk}
     const test=cur?cur+' '+word:word;if(cur&&ctx.measureText(test).width>maxWidth){result.push(cur);cur=word}else cur=test}
    if(cur)result.push(cur);return result;
  }
  function newPage(){if(cmd.length)parts.push(cmd.join('\n'));cmd=[];y=90;rect(0,0,WIDTH,50,brand);text('AtC/OS  |  '+(state.lang==='ca'?'OFICINA VIRTUAL':'OFICINA VIRTUAL'),margin,14,12,true,'#FFFFFF');text(`${state.session}  |  ${state.student.slice(0,64)}`,margin,57,8,false,'#597080')}
  function room(h){if(y+h>HEIGHT-48)newPage()}
  function heading(s){room(38);rect(margin,y,4,19,brand);text(s,margin+13,y+1,12,true);y+=32}
  function paragraph(s,options={}){const size=options.size??9,lead=size*1.52,x=options.x??margin,maxWidth=options.maxWidth??(WIDTH-2*margin),c=options.color||'#263644',bold=!!options.bold;
    for(const p of String(s||'').split(/\n/)){if(!p.trim()){room(lead);y+=lead*.6;continue}for(const ln of wrap(clean(p),maxWidth,size,bold)){room(lead+2);text(ln,x,y,size,bold,c);y+=lead}}y+=options.after??7}
  function rule(){room(8);push(`0.870 0.900 0.920 RG 0.7 w ${margin} ${(HEIGHT-y).toFixed(2)} m ${WIDTH-margin} ${(HEIGHT-y).toFixed(2)} l S`);y+=11}
  function kv(a,b){room(17);text(a,margin,y,8.5,true,'#536575');paragraphOnSameLine(b);y+=16}
  function paragraphOnSameLine(b){const lines=wrap(clean(b),WIDTH-2*margin-165,8.5);lines.forEach((a,i)=>{if(i>0){room(13);y+=12}text(a,margin+165,y,8.5,false)})}
  newPage();heading(state.lang==='ca'?'Identificació de la jornada':'Identificación de la jornada');
  kv(state.lang==='ca'?'Nom de l’alumne':'Nombre del alumno',state.student);
  kv(state.lang==='ca'?'Empresa':'Empresa',state.company);
  kv(state.lang==='ca'?'Identificador':'Identificador',state.session);
  kv(state.lang==='ca'?'Inici':'Inicio',new Date(state.startedAt).toLocaleString(state.lang==='ca'?'ca-ES':'es-ES'));
  if(state.endedAt)kv(state.lang==='ca'?'Final':'Fin',new Date(state.endedAt).toLocaleString(state.lang==='ca'?'ca-ES':'es-ES'));
  const done=state.cases.filter(c=>c.complete).length,replies=state.cases.reduce((n,c)=>n+c.messages.filter(m=>m.role==='student').length,0);
  kv(state.lang==='ca'?'Gestiones acabades':'Gestiones completadas',`${done} / ${state.cases.length}`);
  kv(state.lang==='ca'?'Intervencions redactades':'Intervenciones redactadas',String(replies));
  kv(state.lang==='ca'?'Hora simulada':'Hora simulada',String(Math.floor(state.simMinutes/60)).padStart(2,'0')+':'+String(state.simMinutes%60).padStart(2,'0'));
  y+=7;
  rect(margin,y,WIDTH-2*margin,49,'#edf3f5');
  text(state.lang==='ca'?'AVALUACIÓ PENDENT DEL PROFESSOR':'EVALUACIÓN PENDIENTE DEL PROFESOR',margin+15,y+10,10,true,brand);
  text(state.lang==='ca'?'Les respostes s’han transcrit sense una qualificació automàtica.':'Las respuestas se transcriben sin calificación automática.',margin+15,y+29,8.4,false,'#47586a');y+=67;
  heading(state.lang==='ca'?'Converses i gestions':'Conversaciones y gestiones');
  state.cases.forEach((c,index)=>{
   const d=AtCOS.Data.cases.find(v=>v.id===c.id),cl=AtCOS.Data.clients[d.client];
   room(80);text(`${index+1}. ${txt(d.title)}`,margin,y,10.2,true,brand);y+=19;
   paragraph(`${t(d.channel).toUpperCase()}  |  ${cl.name} (${cl.company})  |  ${c.complete?t('done'):t('unfinished')}`,{size:8,color:'#597080',after:5});
   if(!c.revealed){paragraph(state.lang==='ca'?'No ha aparegut durant la jornada.':'No apareció durante la jornada.',{size:8,color:'#597080'});rule();return}
   c.messages.forEach(m=>{
    room(26);const isStudent=m.role==='student';
    const who=isStudent?(state.lang==='ca'?'ALUMNE':'ALUMNO'):(m.role==='system'?(state.lang==='ca'?'INDICACIÓ':'INDICACIÓN'):(state.lang==='ca'?'CLIENT':'CLIENTE'));
    text(`${who} · ${m.at||''}`,margin,y,8,true,isStudent?brand:'#506574');y+=15;
    paragraph(txt(m.text),{size:9,x:margin+9,maxWidth:WIDTH-2*margin-18,after:9});
   });
   if(c.draft.trim()){text(state.lang==='ca'?'ESBORRANY NO ENVIAT':'BORRADOR NO ENVIADO',margin,y,8,true,'#aa713a');y+=16;paragraph(c.draft,{size:8.7,x:margin+9,maxWidth:WIDTH-2*margin-18})}
   if(c.actions.length){paragraph((state.lang==='ca'?'Gestions registrades: ':'Gestiones registradas: ')+c.actions.map(a=>t(a.type==='catalog'?'catalog':a.type)+` (${a.at})`).join(' · '),{size:8.4,color:'#536575'})}
   if(c.note?.trim()){text(state.lang==='ca'?'NOTES INTERNES':'NOTAS INTERNAS',margin,y,8,true,'#536575');y+=14;paragraph(c.note,{size:8.5})}
   rule();
  });
  room(40);paragraph(`${state.session} · ${state.lang==='ca'?'Informe generat en el navegador, sense enviar dades.':'Informe generado en el navegador sin enviar datos.'}`,{size:7.6,color:'#6a7d8b'});
  parts.push(cmd.join('\n'));
  const enc=new TextEncoder(),obj=[],pages=[];const add=s=>(obj.push(s),obj.length);
  const root=add(''),tree=add(''),f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  for(const content of parts){const stream=content+'\n',size=enc.encode(stream).length,cont=add(`<< /Length ${size} >>\nstream\n${stream}endstream`);pages.push(add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cont} 0 R >>`))}
  obj[root-1]=`<< /Type /Catalog /Pages ${tree} 0 R >>`;obj[tree-1]=`<< /Type /Pages /Kids [${pages.map(n=>n+' 0 R').join(' ')}] /Count ${pages.length} >>`;
  let blocks=['%PDF-1.4\n%static-local\n'],offsets=[0],total=enc.encode(blocks[0]).length;
  for(let i=0;i<obj.length;i++){const s=`${i+1} 0 obj\n${obj[i]}\nendobj\n`;offsets.push(total);blocks.push(s);total+=enc.encode(s).length}
  const xref=total;blocks.push(`xref\n0 ${obj.length+1}\n0000000000 65535 f \n`);
  for(let i=1;i<offsets.length;i++)blocks.push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  blocks.push(`trailer\n<< /Size ${obj.length+1} /Root ${root} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(blocks,{type:'application/pdf'});
 }
 function pdfName(s){const norm=s.student.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'_').slice(0,36)||'alumno';return `Informe_Oficina_Virtual_${norm}_${s.session}.pdf`}
 function prepare(s){if(lastUrl)URL.revokeObjectURL(lastUrl);lastUrl=URL.createObjectURL(build(s));return {url:lastUrl,name:pdfName(s)}}
 return {build,prepare,pdfName};
})();
