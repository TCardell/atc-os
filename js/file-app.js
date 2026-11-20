/* File Explorer UI: all changes go through AtCOS.VFS, never the host disk. */
window.AtCOS=window.AtCOS||{};
AtCOS.FileApp=(()=>{
 const F=AtCOS.VFS,E=AtCOS.Engine,I=AtCOS.Icons;
 let folder=F.ROOT,selected=null,opened=null,clipboard=null;
 const h=s=>AtCOS.Views.escape(s),icon=(name,size=19)=>I.svg(name,{size}),ca=()=>E.get()?.lang==='ca',tr=(es,cat)=>ca()?cat:es;
 const folders=[[F.DESKTOP,'Escritorio','Escriptori'],[F.RECEIVED,'Archivos recibidos','Arxius rebuts'],[F.DOCS,'Documentos','Documents'],[F.ORDERS,'Pedidos','Comandes'],[F.CLIENTS,'Clientes','Clients'],[F.DOWNLOADS,'Descargas','Baixades'],[F.TRASH,'Papelera','Paperera']];
 const item=n=>`<button class="vfs-item ${selected===n.id?'selected':''}" draggable="true" data-vfs-drag="${n.id}" data-vfs-open="${n.id}" data-vfs-select="${n.id}" title="${h(F.path(n.id))}"><span class="vfs-item-icon">${icon(n.type==='folder'?'folder':'file',31)}</span><span>${h(n.name)}</span><small>${n.type==='folder'?tr('Carpeta','Carpeta'):n.source==='customer-received'?tr('Recibido del cliente','Rebut del client'):tr('Archivo','Fitxer')}</small></button>`;
 function filePreview(n){if(!n||n.type!=='file')return '';
  const received=n.source==='customer-received' ? `<span class='vfs-received-tag'>${tr('Recibido','Rebut')}</span>` : '';
  const meta=n.orderId?`<p class='vfs-preview-meta'>${tr('Pedido','Comanda')}: ${h(n.orderId)} · ${h(n.receivedAt||'')}</p>`:'';
  const disclaimer=n.mime==='application/pdf'?`<p class='vfs-preview-disclaimer'>${tr('PDF de práctica: representación del archivo recibido, no el arte final original.','PDF de pràctica: representació de l’arxiu rebut, no l’art final original.')}</p>`:'';
  return `<div class='vfs-preview' id='vfsFilePreview'><div class='vfs-preview-header'><strong>${h(n.name)}</strong>${received}</div>${meta}${disclaimer}<pre>${h(F.fileContent(n))}</pre><button type='button' class='btn btn-primary btn-small' data-vfs-cmd='open'>${icon('fileSearch',16)} ${tr('Abrir archivo','Obrir arxiu')}</button></div>`;
 }
 function fileReader(n){
  const label=tr('Visor de documentos','Visor de documents');
  const type=n.mime==='application/pdf'?'PDF':n.mime?.startsWith('image/')?'IMAGEN':'TEXTO';
  const description=n.mime==='application/pdf'?tr('Documento de práctica. Es una ficha consultable dentro de AtC/OS, no el arte final original.','Document de pràctica. És una fitxa consultable dins d’AtC/OS, no l’art final original.'):tr('Documento guardado en la oficina virtual.','Document desat a l’oficina virtual.');
  const meta=n.orderId?`<span>${tr('Pedido','Comanda')}: ${h(n.orderId)}</span>`:'';
  return `<section class='vfs-document-reader' role='region' aria-label='${label}'><header class='vfs-reader-toolbar'><button type='button' class='btn btn-small' data-vfs-cmd='closeviewer'>${icon('arrowLeft',17)} ${tr('Volver a los archivos','Tornar als arxius')}</button><span class='vfs-reader-mode'>${icon('fileSearch',17)} ${label}</span></header><div class='vfs-reader-sheet'><div class='vfs-reader-heading'><span class='vfs-reader-file-icon'>${icon('file',35)}</span><div><span class='vfs-reader-type'>${type}</span><h2>${h(n.name)}</h2></div></div><div class='vfs-reader-meta'>${meta}<span>${h(n.receivedAt||tr('Archivo interno','Arxiu intern'))}</span></div><p class='vfs-reader-description'>${description}</p><div class='vfs-reader-body'><pre>${h(F.fileContent(n))}</pre></div></div></section>`;
 }
 function render(){F.init();if(!F.node(folder))folder=F.ROOT;const n=F.node(selected),viewer=!!(n&&n.type==='file'&&opened===n.id&&n.parent===folder),mailCases=E.visibleCases().filter(c=>E.caseData(c.id).channel==='email'&&!c.complete);
 const navigation=folders.map(([id,es,cat])=>`<button data-vfs-folder="${id}" class="vfs-nav ${folder===id?'active':''}">${icon(id===F.TRASH?'trash':id===F.RECEIVED?'inbox':id===F.DOWNLOADS?'download':'folder',18)} ${tr(es,cat)}</button>`).join('');
 const content=F.list(folder).map(item).join('')||`<p class="vfs-empty">${tr('Esta carpeta está vacía.','Aquesta carpeta és buida.')}</p>`;
 const actions=n&&!['root','desktop','documents','orders','clients','downloads','received','trash'].includes(n.id)?`<aside class="vfs-details"><h3>${h(n.name)}</h3><p>${h(F.path(n.id))}</p><button class="btn btn-small" data-vfs-cmd="rename">${tr('Renombrar','Canviar el nom')}</button><button class="btn btn-small" data-vfs-cmd="copy">${tr('Copiar','Copiar')}</button><button class="btn btn-small" data-vfs-cmd="cut">${tr('Cortar','Retallar')}</button><button class="btn btn-small" data-vfs-cmd="trash">${folder===F.TRASH?tr('Eliminar definitivamente','Eliminar definitivament'):tr('Enviar a papelera','Moure a la paperera')}</button>${n.parent===F.TRASH?`<button class="btn btn-small" data-vfs-cmd="restore">${tr('Restaurar','Restaurar')}</button>`:''}${n.type==='file'?`<button class="btn btn-small" data-vfs-cmd="open">${icon('fileSearch',15)} ${tr('Abrir archivo','Obrir arxiu')}</button>${mailCases.length?`<select id="vfsMailTarget" aria-label="${tr('Correo de destino','Correu de destinació')}"><option value="">${tr('Adjuntar a un correo…','Adjuntar a un correu…')}</option>${mailCases.map(c=>`<option value="${h(c.id)}">${h(E.loc(E.caseData(c.id).title))}</option>`).join('')}</select><button class="btn btn-small" data-vfs-cmd="attach">${tr('Adjuntar','Adjuntar')}</button>`:''}`:''}</aside>`:'';
 if(viewer)return `<div class="vfs-app"><nav class="vfs-side"><strong>${tr('Este equipo','Aquest equip')}</strong><button data-vfs-folder="root" class="vfs-nav">${icon('directory',18)} ${tr('Inicio','Inici')}</button>${navigation}</nav><div class="vfs-main">${fileReader(n)}</div></div>`;
 return `<div class="vfs-app"><nav class="vfs-side"><strong>${tr('Este equipo','Aquest equip')}</strong><button data-vfs-folder="root" class="vfs-nav">${icon('directory',18)} ${tr('Inicio','Inici')}</button>${navigation}</nav><div class="vfs-main"><div class="vfs-toolbar"><button data-vfs-cmd="up" title="${tr('Subir','Pujar')}">${icon('arrowLeft')}</button><span>${h(F.path(folder)||'/')}</span><button class="btn btn-small" data-vfs-cmd="newfolder">${icon('folder',15)} ${tr('Nueva carpeta','Carpeta nova')}</button><button class="btn btn-small" data-vfs-cmd="newfile">${icon('file',15)} ${tr('Nota nueva','Nota nova')}</button>${clipboard?`<button class="btn btn-small" data-vfs-cmd="paste">${icon('clipboard',15)} ${tr('Pegar','Enganxar')}</button>`:''}</div><div class="vfs-items" data-vfs-drop="${folder}">${content}</div>${filePreview(n)}</div>${actions}</div>`;
 }
 function refresh(){AtCOS.Views.render()}
 function openReceived(orderId){const n=F.receivedForOrder(orderId);if(!n){AtCOS.App.toast(tr('El archivo no consta como recibido.','L’arxiu no consta com a rebut.'));return false}folder=n.parent;selected=n.id;opened=n.id;refresh();return true}
 function act(el){let cmd=el.dataset.vfsCmd;try{
 if(el.dataset.vfsFolder){folder=el.dataset.vfsFolder;selected=null;opened=null;refresh();return true}
 if(el.dataset.vfsOpen){const n=F.node(el.dataset.vfsOpen);selected=n?.id;if(n?.type==='folder'){folder=n.id;selected=null;opened=null}else opened=n?.type==='file'?n.id:null;refresh();return true}
 if(!cmd)return false;
 if(cmd==='closeviewer'){opened=null;refresh();return true}
 if(cmd==='open'&&selected){const n=F.node(selected);if(!n||n.type!=='file')throw Error(tr('Selecciona un archivo','Selecciona un arxiu'));opened=n.id;refresh();return true}
 if(cmd==='up'){folder=F.node(folder)?.parent||F.ROOT;selected=null;opened=null}
 else if(cmd==='newfolder'){const n=prompt(tr('Nombre de la carpeta','Nom de la carpeta'));if(n)selected=F.createFolder(folder,n).id}
 else if(cmd==='newfile'){const n=prompt(tr('Nombre del documento','Nom del document'),'nota.txt');if(n){const text=prompt(tr('Contenido inicial','Contingut inicial'),'')||'';selected=F.createFile(folder,n,text).id}}
 else if(cmd==='rename'&&selected){const n=prompt(tr('Nuevo nombre','Nom nou'),F.node(selected)?.name);if(n)F.rename(selected,n)}
 else if(cmd==='copy'&&selected)clipboard={id:selected,cut:false};
 else if(cmd==='cut'&&selected)clipboard={id:selected,cut:true};
 else if(cmd==='paste'&&clipboard){const n=clipboard.cut?F.move(clipboard.id,folder):F.copy(clipboard.id,folder);selected=n.id;clipboard=null}
 else if(cmd==='trash'&&selected){if(folder===F.TRASH){if(confirm(tr('¿Eliminar definitivamente?','Eliminar definitivament?')))F.removeForever(selected)}else F.move(selected,F.TRASH);selected=null;opened=null}
 else if(cmd==='restore'&&selected){F.restore(selected);selected=null;opened=null}
 else if(cmd==='attach'&&selected){const id=document.getElementById('vfsMailTarget')?.value;if(!id)throw Error(tr('Selecciona primero un correo','Selecciona primer un correu'));F.attach(id,selected);AtCOS.Desktop.open('email');E.select(id);AtCOS.Desktop.open('email');AtCOS.App.toast(tr('Archivo preparado como adjunto','Fitxer preparat com a adjunt'))}

 refresh();return true;
 }catch(error){AtCOS.App.toast(error.message);return true}}
 function dragStart(e){const el=e.target.closest('[data-vfs-drag]');if(!el)return;document.getElementById('appShell')?.classList.add('is-dragging');e.dataTransfer.setData('text/atc-os-file',el.dataset.vfsDrag);e.dataTransfer.effectAllowed='move'}
 function dragOver(e){if(e.target.closest('[data-vfs-drop],[data-vfs-folder],#desktopFileDrop'))e.preventDefault()}
 function drop(e){document.getElementById('appShell')?.classList.remove('is-dragging');const id=e.dataTransfer?.getData('text/atc-os-file');if(!id)return;const target=e.target.closest('[data-vfs-drop],[data-vfs-folder],#desktopFileDrop');if(!target)return;e.preventDefault();try{const parent=target.id==='desktopFileDrop'?F.DESKTOP:target.dataset.vfsDrop||target.dataset.vfsFolder;F.move(id,parent);folder=parent;selected=id;opened=null;refresh()}catch(x){AtCOS.App.toast(x.message)}}
 return {render,act,openReceived,dragStart,dragOver,drop};
})();
