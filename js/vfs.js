/* Virtual filesystem: session-scoped, deterministic, no access to the host filesystem.
   A single metadata API keeps clients independent from the persistence backend. */
window.AtCOS=window.AtCOS||{};
AtCOS.VFS=(()=>{
 const E=AtCOS.Engine;
 const ROOT='root',DESKTOP='desktop',DOCS='documents',ORDERS='orders',CLIENTS='clients',DOWNLOADS='downloads',RECEIVED='received',TRASH='trash';
 const roots=[{id:ROOT,parent:null,name:'Este equipo',type:'folder'},{id:DESKTOP,parent:ROOT,name:'Escritorio',type:'folder'},{id:DOCS,parent:ROOT,name:'Documentos',type:'folder'},{id:ORDERS,parent:ROOT,name:'Pedidos',type:'folder'},{id:CLIENTS,parent:ROOT,name:'Clientes',type:'folder'},{id:DOWNLOADS,parent:ROOT,name:'Descargas',type:'folder'},{id:RECEIVED,parent:ROOT,name:'Archivos recibidos',type:'folder'},{id:TRASH,parent:ROOT,name:'Papelera',type:'folder'}];
 const get=()=>E.get()?.vfs;
 const node=id=>get()?.nodes?.find(n=>n.id===id)||null;
 const list=(parent=ROOT)=>get()?.nodes?.filter(n=>n.parent===parent).sort((a,b)=>(b.type==='folder')-(a.type==='folder')||a.name.localeCompare(b.name))||[];
 const uid=()=>`vf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
 const persist=()=>E.save();
 const log=(type,name)=>{const s=E.get();if(!s)return;s.fileActions=s.fileActions||[];s.fileActions.push({type,name,at:E.stamp()});s.fileActions=s.fileActions.slice(-150);E.save()};
 function init(){const s=E.get();if(!s)return;let changed=false;
  if(!s.vfs){s.vfs={version:2,nodes:roots.map(n=>({...n,createdAt:new Date().toISOString()}))};changed=true}
  else for(const root of roots)if(!node(root.id)){s.vfs.nodes.push({...root,createdAt:new Date().toISOString()});changed=true}
  // Migración idempotente: documentos de práctica recibidos ANTES de empezar la jornada.
  // El marcador evita volver a crearlos si el alumno los mueve o elimina.
  if(!s.vfs.receivedSeedVersion){
   for(const item of AtCOS.Data.receivedFiles||[]){
    if(s.vfs.nodes.some(n=>n.id===item.id))continue;
    s.vfs.nodes.push({id:item.id,parent:RECEIVED,type:'file',name:item.name,mime:item.mime||'application/pdf',
     content:item.content?.es||'',contentLocales:item.content,createdAt:new Date().toISOString(),
     receivedAt:item.receivedAt,orderId:item.orderId,clientId:item.clientId,source:'customer-received'});
   }
   s.vfs.receivedSeedVersion=1;s.vfs.version=2;changed=true;
  }
  if(changed)persist();
 }
 function validName(s){const n=String(s||'').trim().replace(/[\\/:*?"<>|]/g,'-');if(!n||n.length>80)throw Error('Escribe un nombre de 1 a 80 caracteres');return n}
 function siblings(parent){return list(parent)}
 function unique(name,parent,ignore){const existing=siblings(parent).filter(n=>n.id!==ignore).map(n=>n.name.toLowerCase());if(!existing.includes(name.toLowerCase()))return name;
 const dot=name.lastIndexOf('.');const ext=dot>0?name.slice(dot):'',base=dot>0?name.slice(0,dot):name;
 for(let i=2;i<10000;i++){const candidate=`${base} (${i})${ext}`;if(!existing.includes(candidate.toLowerCase()))return candidate}throw Error('No se puede generar un nombre único')}
 function checkParent(id){const p=node(id);if(!p||p.type!=='folder')throw Error('Carpeta de destino no válida');return p}
 function createFolder(parent,name){checkParent(parent);const n={id:uid(),parent,type:'folder',name:unique(validName(name),parent),createdAt:new Date().toISOString()};get().nodes.push(n);log('create',n.name);persist();return n}
 function createFile(parent,name,content='',mime='text/plain',meta={}){checkParent(parent);const n={id:uid(),parent,type:'file',name:unique(validName(name),parent),mime,content:String(content).slice(0,120000),createdAt:new Date().toISOString(),...meta};get().nodes.push(n);log('create',n.name);persist();return n}
 function isProtected(id){return [ROOT,DESKTOP,DOCS,ORDERS,CLIENTS,DOWNLOADS,RECEIVED,TRASH].includes(id)}
 function rename(id,name){const n=node(id);if(!n||isProtected(id))throw Error('Esta carpeta del sistema no puede renombrarse');n.name=unique(validName(name),n.parent,id);log('rename',n.name);persist();return n}
 function descendant(parent,target){for(let p=node(target);p;p=node(p.parent)){if(p.id===parent)return true}return false}
 function move(id,parent){const n=node(id);checkParent(parent);if(!n||isProtected(id)||id===parent||descendant(id,parent))throw Error('No se puede mover aquí');if(n.parent===TRASH&&parent!==TRASH)delete n.originalParent;if(parent===TRASH&&n.parent!==TRASH)n.originalParent=n.parent;n.parent=parent;n.name=unique(n.name,parent,id);log(parent===TRASH?'trash':'move',n.name+' → '+path(parent));persist();return n}
 function restore(id){const n=node(id);if(!n||n.parent!==TRASH)throw Error('El archivo no está en la papelera');return move(id,node(n.originalParent)?.type==='folder'?n.originalParent:DOCS)}
 function copy(id,parent){const n=node(id);checkParent(parent);if(!n||isProtected(id))throw Error('No se puede copiar este elemento');const c={...n,id:uid(),parent,name:unique(n.name,parent),createdAt:new Date().toISOString()};delete c.originalParent;get().nodes.push(c);if(n.type==='folder'){for(const child of list(id))copy(child.id,c.id)}persist();return c}
 function removeForever(id){if(isProtected(id))throw Error('No se puede eliminar una carpeta del sistema');for(const child of list(id))removeForever(child.id);const i=get().nodes.findIndex(n=>n.id===id);if(i>=0)get().nodes.splice(i,1);persist()}
 function path(id){const parts=[];let p=node(id);let limit=0;while(p&&p.id!==ROOT&&limit++<100){parts.unshift(p.name);p=node(p.parent)}return '/'+parts.join('/')}
 function inTrash(id){let p=node(id),count=0;while(p&&count++<120){if(p.id===TRASH)return true;p=node(p.parent)}return false}
 function receivedForOrder(orderId){return get()?.nodes?.find(n=>n.type==='file'&&n.orderId===orderId&&n.source==='customer-received'&&!inTrash(n.id))||null}
 function fileContent(n){return n?.contentLocales?E.loc(n.contentLocales):n?.content||''}
 function saveAttachment(orderId){const original=receivedForOrder(orderId);if(!original)throw Error('No hay un archivo recibido disponible para este pedido');
  const duplicate=copy(original.id,DOWNLOADS);duplicate.source='download-copy';duplicate.receivedSource=original.id;log('download-copy',duplicate.name);persist();return duplicate}

 function makePdf(content){const clean=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,'?').replace(/([()\\])/g,'\\$1');
  const lines=String(content).split('\n').slice(0,36);const stream=['BT /F1 11 Tf 50 785 Td 15 TL'];for(const line of lines)stream.push(`(${clean(line.slice(0,90))}) Tj T*`);stream.push('ET');const body=stream.join('\n')+'\n';const enc=new TextEncoder(),objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',`<< /Length ${enc.encode(body).length} >>\nstream\n${body}endstream`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];let out='%PDF-1.4\n',at=[0];for(let i=0;i<objs.length;i++){at.push(enc.encode(out).length);out+=`${i+1} 0 obj\n${objs[i]}\nendobj\n`}const xref=enc.encode(out).length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<at.length;i++)out+=String(at[i]).padStart(10,'0')+' 00000 n \n';out+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new Blob([out],{type:'application/pdf'})}
 function download(id){const n=node(id);if(!n||n.type!=='file')throw Error('Selecciona un archivo');const body=fileContent(n);const blob=n.mime==='application/pdf'?makePdf(body) :new Blob([body],{type:n.mime||'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=n.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
 function attach(caseId,fileId){const s=E.caseState(caseId),n=node(fileId),d=E.caseData(caseId);if(!s||!n||n.type!=='file'||inTrash(n.id)||d?.channel!=='email'||s.complete)throw Error('Selecciona un correo pendiente y un archivo');s.attachments=s.attachments||[];if(!s.attachments.includes(fileId))s.attachments.push(fileId);log('attach',n.name+' → '+caseId);persist();return n}
 function detach(caseId,fileId){const s=E.caseState(caseId);if(s){s.attachments=(s.attachments||[]).filter(x=>x!==fileId);persist()}}
 function attachments(caseId){return (E.caseState(caseId)?.attachments||[]).map(node).filter(Boolean)}
 return {init,get,node,list,createFolder,createFile,rename,move,copy,restore,removeForever,path,saveAttachment,receivedForOrder,fileContent,inTrash,download,attach,detach,attachments,ROOT,DESKTOP,DOCS,ORDERS,CLIENTS,DOWNLOADS,RECEIVED,TRASH};
})();
