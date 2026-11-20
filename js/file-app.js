/* File Explorer UI: all changes go through AtCOS.VFS, never the host disk. */
window.AtCOS=window.AtCOS||{};
AtCOS.FileApp=(()=>{
 const F=AtCOS.VFS,E=AtCOS.Engine,I=AtCOS.Icons;
 let folder=F.ROOT,selected=null,clipboard=null,attachTo=null;
 const h=s=>AtCOS.Views.escape(s),icon=(name,size=19)=>I.svg(name,{size}),ca=()=>E.get()?.lang==='ca',tr=(es,cat)=>ca()?cat:es;
 const folders=[[F.DESKTOP,'Escritorio','Escriptori'],[F.DOCS,'Documentos','Documents'],[F.ORDERS,'Pedidos','Comandes'],[F.CLIENTS,'Clientes','Clients'],[F.DOWNLOADS,'Descargas','Baixades'],[F.TRASH,'Papelera','Paperera']];
 const item=n=>`<button class="vfs-item ${selected===n.id?'selected':''}" draggable="true" data-vfs-drag="${n.id}" data-vfs-open="${n.id}" data-vfs-select="${n.id}" title="${h(F.path(n.id))}"><span class="vfs-item-icon">${icon(n.type==='folder'?'folder':'file',31)}</span><span>${h(n.name)}</span><small>${n.type==='folder'?tr('Carpeta','Carpeta'):tr('Archivo','Fitxer')}</small></button>`;
 function render(){F.init();if(!F.node(folder))folder=F.ROOT;const n=F.node(selected),p=F.node(folder),mailCases=E.visibleCases().filter(c=>E.caseData(c.id).channel==='email'&&!c.complete);
 const navigation=folders.map(([id,es,cat])=>`<button data-vfs-folder="${id}" class="vfs-nav ${folder===id?'active':''}">${icon(id===F.TRASH?'alert':id===F.DOWNLOADS?'download':'folder',18)} ${tr(es,cat)}</button>`).join('');
 const content=F.list(folder).map(item).join('')||`<p class="vfs-empty">${tr('Esta carpeta está vacía.','Aquesta carpeta és buida.')}</p>`;
 const actions=n&&!['root','desktop','documents','orders','clients','downloads','trash'].includes(n.id)?`<aside class="vfs-details"><h3>${h(n.name)}</h3><p>${h(F.path(n.id))}</p><button class="btn btn-small" data-vfs-cmd="rename">${tr('Renombrar','Canviar el nom')}</button><button class="btn btn-small" data-vfs-cmd="copy">${tr('Copiar','Copiar')}</button><button class="btn btn-small" data-vfs-cmd="cut">${tr('Cortar','Retallar')}</button><button class="btn btn-small" data-vfs-cmd="trash">${folder===F.TRASH?tr('Eliminar definitivamente','Eliminar definitivament'):tr('Enviar a papelera','Moure a la paperera')}</button>${n.parent===F.TRASH?`<button class="btn btn-small" data-vfs-cmd="restore">${tr('Restaurar','Restaurar')}</button>`:''}${n.type==='file'?`<button class="btn btn-small" data-vfs-cmd="download">${tr('Descargar al ordenador','Baixar a l’ordinador')}</button><button class="btn btn-small" data-vfs-cmd="preview">${tr('Abrir','Obrir')}</button>${mailCases.length?`<select id="vfsMailTarget" aria-label="${tr('Correo de destino','Correu de destinació')}"><option value="">${tr('Adjuntar a un correo…','Adjuntar a un correu…')}</option>${mailCases.map(c=>`<option value="${h(c.id)}">${h(E.loc(E.caseData(c.id).title))}</option>`).join('')}</select><button class="btn btn-small" data-vfs-cmd="attach">${tr('Adjuntar','Adjuntar')}</button>`:''}`:''}</aside>`:'';
 return `<div class="vfs-app"><nav class="vfs-side"><strong>${tr('Este equipo','Aquest equip')}</strong><button data-vfs-folder="root" class="vfs-nav">${icon('directory',18)} ${tr('Inicio','Inici')}</button>${navigation}</nav><div class="vfs-main"><div class="vfs-toolbar"><button data-vfs-cmd="up" title="${tr('Subir','Pujar')}">${icon('arrowLeft')}</button><span>${h(F.path(folder)||'/')}</span><button class="btn btn-small" data-vfs-cmd="newfolder">${icon('folder',15)} ${tr('Nueva carpeta','Carpeta nova')}</button><button class="btn btn-small" data-vfs-cmd="newfile">${icon('file',15)} ${tr('Nota nueva','Nota nova')}</button>${clipboard?`<button class="btn btn-small" data-vfs-cmd="paste">${icon('clipboard',15)} ${tr('Pegar','Enganxar')}</button>`:''}</div><div class="vfs-items" data-vfs-drop="${folder}">${content}</div>${n?.type==='file'&&selected?`<div class="vfs-preview"><strong>${h(n.name)}</strong><pre>${h(n.content||'')}</pre></div>`:''}</div>${actions}</div>`;
 }
 function refresh(){AtCOS.Views.render()}
 function act(el){let cmd=el.dataset.vfsCmd;try{
 if(el.dataset.vfsFolder){folder=el.dataset.vfsFolder;selected=null;refresh();return true}
 if(el.dataset.vfsOpen){const n=F.node(el.dataset.vfsOpen);selected=n?.id;if(n?.type==='folder'){folder=n.id;selected=null}refresh();return true}
 if(!cmd)return false;
 if(cmd==='up'){folder=F.node(folder)?.parent||F.ROOT;selected=null}
 else if(cmd==='newfolder'){const n=prompt(tr('Nombre de la carpeta','Nom de la carpeta'));if(n)selected=F.createFolder(folder,n).id}
 else if(cmd==='newfile'){const n=prompt(tr('Nombre del documento','Nom del document'),'nota.txt');if(n){const text=prompt(tr('Contenido inicial','Contingut inicial'),'')||'';selected=F.createFile(folder,n,text).id}}
 else if(cmd==='rename'&&selected){const n=prompt(tr('Nuevo nombre','Nom nou'),F.node(selected)?.name);if(n)F.rename(selected,n)}
 else if(cmd==='copy'&&selected)clipboard={id:selected,cut:false};
 else if(cmd==='cut'&&selected)clipboard={id:selected,cut:true};
 else if(cmd==='paste'&&clipboard){const n=clipboard.cut?F.move(clipboard.id,folder):F.copy(clipboard.id,folder);selected=n.id;clipboard=null}
 else if(cmd==='trash'&&selected){if(folder===F.TRASH){if(confirm(tr('¿Eliminar definitivamente?','Eliminar definitivament?')))F.removeForever(selected)}else F.move(selected,F.TRASH);selected=null}
 else if(cmd==='restore'&&selected){F.restore(selected);selected=null}
 else if(cmd==='download'&&selected)F.download(selected);
 else if(cmd==='attach'&&selected){const id=document.getElementById('vfsMailTarget')?.value;if(!id)throw Error(tr('Selecciona primero un correo','Selecciona primer un correu'));F.attach(id,selected);AtCOS.Desktop.open('email');E.select(id);AtCOS.Desktop.open('email');AtCOS.App.toast(tr('Archivo preparado como adjunto','Fitxer preparat com a adjunt'))}
 else if(cmd==='preview'){}
 refresh();return true;
 }catch(error){AtCOS.App.toast(error.message);return true}}
 function dragStart(e){const el=e.target.closest('[data-vfs-drag]');if(!el)return;document.getElementById('appShell')?.classList.add('is-dragging');e.dataTransfer.setData('text/atc-os-file',el.dataset.vfsDrag);e.dataTransfer.effectAllowed='move'}
 function dragOver(e){if(e.target.closest('[data-vfs-drop],[data-vfs-folder],#desktopFileDrop'))e.preventDefault()}
 function drop(e){document.getElementById('appShell')?.classList.remove('is-dragging');const id=e.dataTransfer?.getData('text/atc-os-file');if(!id)return;const target=e.target.closest('[data-vfs-drop],[data-vfs-folder],#desktopFileDrop');if(!target)return;e.preventDefault();try{const parent=target.id==='desktopFileDrop'?F.DESKTOP:target.dataset.vfsDrop||target.dataset.vfsFolder;F.move(id,parent);folder=parent;selected=id;refresh()}catch(x){AtCOS.App.toast(x.message)}}
 return {render,act,dragStart,dragOver,drop};
})();
