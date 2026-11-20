/* OS de oficina: ventanas independientes, taskbar, Inicio, búsqueda y notificaciones. */
window.AtCOS=window.AtCOS||{};
AtCOS.Desktop=(()=>{
 const E=AtCOS.Engine,D=AtCOS.Data,I=AtCOS.Icons;
 const $=id=>document.getElementById(id),h=s=>AtCOS.Views.escape(s);
 const apps=['email','messages','phone','social','directory','tasks','settings','dashboard','report'];
 const win=new Map();let z=12,active='',startOpen=false,notesOpen=false;
 let splitRatio=50,activeSnapMenu=null,interaction=null;
 const text=(es,ca)=>E.get()?.lang==='ca'?ca:es;
 function name(id){const c=D.labels[E.get()?.lang||'es'];return c[id]||id}
 function tagIcon(id){return I.app(id)}
 const glyph=(id,size=17)=>I.svg(id,{size});
 function windowTitle(id){return name(id)}
 function bounds(){const e=$('windowLayer');const w=e.clientWidth||window.innerWidth,H=e.clientHeight||window.innerHeight;return {w,H,maxW:Math.max(365,w-24),maxH:Math.max(290,H-18)}}
 function preferredRect(id){const b=bounds(),i=apps.indexOf(id),ww=Math.min(b.maxW,b.w>1420?1120:b.w>980?920:b.maxW),hh=Math.min(b.maxH,Math.max(450,b.H-38));return {left:Math.max(12,Math.round((b.w-ww)/2)+((i*13)%53)-22),top:Math.max(20,Math.round((b.H-hh)/2)+((i*11)%55)-8),w:ww,h:hh}}
 function buildWindow(id){const v=win.get(id);if(!v)return;
  const e=document.createElement('section');e.className='os-window';e.dataset.osWin=id;e.dataset.pos='free';e.setAttribute('aria-label',windowTitle(id));e.style.zIndex=v.z;
  const a=(act,icon,title,extra='')=>`<button type="button" class="os-title-action ${extra}" data-window-action="${act}" data-win="${id}" title="${title}" aria-label="${title}">${glyph(icon,16)}</button>`;
  const caption=text('Opciones de organización de ventanas','Opcions d’organització de finestres');
  e.innerHTML=`<div class="os-titlebar" data-drag-title="${id}"><div class="os-title-left">${tagIcon(id)}<div><strong>${h(windowTitle(id))}</strong><small>${h(E.get().company)}</small></div></div><div class="os-title-actions">${a('menu','snap',caption,'os-title-split')}${a('min','minus',text('Minimizar','Minimitzar'))}${a('max','maximize',text('Maximizar o restaurar','Maximitzar o restaurar'))}${a('close','close',text('Cerrar ventana','Tancar finestra'),'close-window')}</div></div><div class="os-window-content" data-window-content="${id}"></div>${['n','e','s','w','ne','nw','se','sw'].map(dir=>`<div class="os-resize-handle resize-${dir}" data-resize="${dir}" aria-hidden="true"></div>`).join('')}`;
  $('windowLayer').appendChild(e);v.node=e;position(v);renderOne(id);
 }
 function position(v){if(!v.node)return;const e=v.node;
  e.classList.toggle('is-minimized',!!v.minimized);
  e.classList.toggle('is-maximized',!!v.maximized);
  e.classList.toggle('is-snapped-left',v.snap==='left');e.classList.toggle('is-snapped-right',v.snap==='right');
  e.style.zIndex=v.z;e.classList.toggle('is-focused',active===v.id);
  e.style.left=v.rect.left+'px';e.style.top=v.rect.top+'px';e.style.width=v.rect.w+'px';e.style.height=v.rect.h+'px';
  const maxIcon=e.querySelector('[data-window-action="max"]');if(maxIcon)maxIcon.innerHTML=glyph(v.maximized||v.snap?'restore':'maximize',16);
 }
 function renderOne(id){const v=win.get(id);if(!v?.node)return;const body=v.node.querySelector('[data-window-content]');body.innerHTML=AtCOS.Views.windowContent(id)}
 function focus(id,refresh=false){const v=win.get(id);if(!v)return;active=id;v.z=++z;v.minimized=false;E.view(id);for(const x of win.values())position(x);if(refresh)renderOne(id);drawTaskbar();closeOverlays();updateDivider()}
 function open(id){if(!apps.includes(id))return;let v=win.get(id);if(!v){v={id,z:++z,minimized:false,maximized:false,snap:null,rect:preferredRect(id),node:null};win.set(id,v);buildWindow(id)}focus(id,true);refreshDecorations();updateDivider()}
 function minimize(id){const v=win.get(id);if(!v)return;v.minimized=true;v.node?.classList.add('is-minimized');updateDivider();const others=[...win.values()].filter(x=>!x.minimized&&x.id!==id).sort((a,b)=>b.z-a.z);if(others.length)focus(others[0].id);else {active='';drawTaskbar()}}
 function close(id){const v=win.get(id);if(!v)return;v.node?.remove();win.delete(id);updateDivider();const others=[...win.values()].filter(x=>!x.minimized).sort((a,b)=>b.z-a.z);if(others.length)focus(others[0].id);else {active='';drawTaskbar()}closeOverlays()}
 function maximize(id){const v=win.get(id);if(!v)return;const toMax=!(v.maximized&&!v.snap);v.maximized=toMax;v.snap=null;focus(id);position(v);updateDivider()}
 function snap(id,side){const v=win.get(id);if(!v)return;
  const b=bounds();if(b.w<820){maximize(id);return}
  if(side!=='left'&&side!=='right')return;
  for(const other of win.values())if(other.id!==id&&other.snap===side){other.snap=null;position(other)}
  v.snap=side;v.maximized=false;v.minimized=false;focus(id);position(v);updateDivider();
 }
 function restore(id){const v=win.get(id);if(!v)return;v.maximized=false;v.snap=null;focus(id);position(v);updateDivider()}
 function split(id){const alt=id==='directory'?'email':'directory';open(alt);snap(alt,'right');open(id);snap(id,'left');splitRatio=50;updateDivider()}
 function hasPair(){const w=[...win.values()].filter(x=>!x.minimized);return w.some(x=>x.snap==='left')&&w.some(x=>x.snap==='right')}
 function updateDivider(){const layer=$('windowLayer');layer.style.setProperty('--split-ratio',splitRatio+'%');let d=$('tileDivider');
  if(!d){d=document.createElement('div');d.id='tileDivider';d.className='tile-divider';d.dataset.splitter='true';d.title=text('Arrastra para ajustar el ancho de las dos ventanas','Arrossega per ajustar l’amplada de les dues finestres');d.setAttribute('role','separator');d.setAttribute('aria-orientation','vertical');d.setAttribute('aria-label',d.title);d.setAttribute('tabindex','0');layer.appendChild(d)}
  d.hidden=!hasPair();d.style.left=`calc(${splitRatio}% - 6px)`;
 }
 function showSnapMenu(id){const v=win.get(id);if(!v?.node)return;const pop=$('snapMenu');
  if(activeSnapMenu===id&&!pop.hidden){hideSnapMenu();return}
  closeOverlays();activeSnapMenu=id;
  const items=[['left','left',text('Colocar a la izquierda','Col·locar a l’esquerra')],['right','right',text('Colocar a la derecha','Col·locar a la dreta')],['split','tile',text('Correo o Archivos al lado','Correu o Arxius al costat')],['restore','restore',text('Restaurar ventana','Restaurar finestra')]];
  pop.innerHTML=`<div class="snap-menu-heading">${text('Organizar ventanas','Organitzar finestres')}</div><div class="snap-menu-grid">${items.map(([cmd,icon,label])=>`<button type="button" class="snap-menu-option" data-window-action="${cmd}" data-win="${id}">${glyph(icon,21)}<span>${label}</span></button>`).join('')}</div><p>${text('También puedes arrastrar una ventana a un borde o ajustar su tamaño desde las esquinas.','També pots arrossegar una finestra fins a una vora o ajustar-ne la mida des de les cantonades.')}</p>`;
  pop.hidden=false;
  const rect=v.node.querySelector('[data-window-action="menu"]').getBoundingClientRect();const shell=$('appShell').getBoundingClientRect();
  pop.style.left=Math.max(10,Math.min(shell.width-270,rect.left-shell.left-220))+'px';pop.style.top=Math.max(12,Math.min(shell.height-330,rect.bottom-shell.top+7))+'px';
 }
 function hideSnapMenu(){activeSnapMenu=null;$('snapMenu').hidden=true}
 function control(cmd,id){if(cmd==='menu'){showSnapMenu(id);return}
  hideSnapMenu();if(cmd==='min')minimize(id);else if(cmd==='max')maximize(id);else if(cmd==='close')close(id);else if(cmd==='split')split(id);else if(cmd==='restore')restore(id);else if(cmd==='left'||cmd==='right')snap(id,cmd);
 }
 function drawTaskbar(){const s=E.get();if(!s)return;
  const counts={email:E.availableCount('email'),messages:E.availableCount('messages'),phone:E.availableCount('phone'),social:E.availableCount('social')};
  $('taskbarApps').innerHTML=apps.filter(id=>win.has(id)).map(id=>{const w=win.get(id),count=counts[id]||0;return `<button class="taskbar-button ${w&&!w.minimized?'running':''} ${active===id&&!w?.minimized?'selected':''}" data-os-open="${id}" title="${h(name(id))}" aria-label="${h(name(id))}">${tagIcon(id)}${count?`<span class="taskbar-count">${count}</span>`:''}</button>`}).join('');
  $('taskMode').innerHTML=glyph(s.mode==='dark'?'sun':'moon',19);$('fakeTime').textContent=E.stamp();
  $('realClock').textContent=new Date().toLocaleDateString(s.lang==='ca'?'ca-ES':'es-ES',{day:'2-digit',month:'2-digit'});
 }
 function renderShortcuts(){const s=E.get();if(!s)return;
  $('desktopCompany').textContent=s.company;$('desktopStudent').textContent=s.student;$('desktopBrandEmoji').textContent=s.emoji||'△';
  $('desktopGreeting').textContent=text('MI OFICINA','LA MEVA OFICINA');
  const shortcuts=['email','messages','phone','social','directory','tasks','settings','report'];
  $('desktopIcons').innerHTML=shortcuts.map(id=>`<button class="desktop-shortcut" data-os-open="${id}" title="${h(name(id))}">${tagIcon(id)}<span>${h(name(id))}</span></button>`).join('')+AtCOS.VFS.list(AtCOS.VFS.DESKTOP).map(n=>`<button class="desktop-shortcut desktop-file" draggable="true" data-vfs-drag="${n.id}" data-vfs-desktop="${n.id}" title="${h(n.name)}">${glyph(n.type==='folder'?'folder':'file',33)}<span>${h(n.name)}</span></button>`).join('');
  $('startCompanyName').textContent=s.company;$('startStudentName').textContent=s.student;$('startUserBadge').textContent=s.emoji||'△';
 }
 function renderStart(){const s=E.get();if(!s)return;
  $('startPinnedLabel').textContent=text('APLICACIONES ANCLADAS','APLICACIONS ANCORADES');
  $('startAppGrid').innerHTML=apps.map(id=>`<button class="start-app-tile" data-os-open="${id}">${tagIcon(id)}<span>${h(name(id))}</span></button>`).join('');
  $('startSearch').placeholder=text('Buscar aplicaciones, clientes, pedidos…','Cercar aplicacions, clients, comandes…');
  $('notificationsHeading').textContent=text('Centro de notificaciones','Centre de notificacions');
 }
 function updateSearch(){const inp=$('startSearch'),q=(inp?.value||'').trim().toLocaleLowerCase();const el=$('startResults');if(!q){el.hidden=true;el.innerHTML='';return}const matches=[];
  apps.filter(id=>name(id).toLowerCase().includes(q)).forEach(id=>matches.push({app:id,title:name(id),sub:text('Aplicación','Aplicació')}));
  Object.entries(D.clients).filter(([,c])=>(c.name+' '+c.company+' '+c.email).toLowerCase().includes(q)).forEach(([id,c])=>{const found=D.cases.find(x=>x.client===id&&E.caseState(x.id)?.revealed);matches.push({app:found?.channel||'directory',caseId:found?.id,title:c.name,sub:c.company})});
  Object.entries(D.orders).filter(([id,o])=>(id+' '+E.loc(o.title)).toLowerCase().includes(q)).forEach(([id,o])=>{const found=D.cases.find(x=>x.order===id&&E.caseState(x.id)?.revealed);matches.push({app:found?.channel||'directory',caseId:found?.id,title:id,sub:E.loc(o.title)})});
  D.cases.filter(c=>E.caseState(c.id)?.revealed&&(E.loc(c.title)+' '+E.loc(c.subject||'')).toLowerCase().includes(q)).forEach(c=>matches.push({app:c.channel,caseId:c.id,title:E.loc(c.title),sub:name(c.channel)}));
  el.hidden=false;el.innerHTML=matches.slice(0,12).map(m=>`<button class="start-result-row" data-os-open="${m.app}" ${m.caseId?`data-os-case="${m.caseId}"`:''}>${tagIcon(m.app)}<span><strong>${h(m.title)}</strong><small>${h(m.sub)}</small></span>${glyph('arrowRight',15)}</button>`).join('')||`<div class="start-empty">${text('No se encontraron resultados.','No s’han trobat resultats.')}</div>`;
 }
 function drawNotifications(){const s=E.get();if(!s)return;const items=s.events.slice(0,14);
  $('notificationDot').hidden=!items.some(x=>x.type==='arrival');
  $('notificationItems').innerHTML=items.length?items.map(e=>`<button class="notification-item" ${e.caseId?`data-os-open="${E.caseData(e.caseId).channel}" data-os-case="${e.caseId}"`:''}><span class="notification-symbol">${glyph(e.type==='arrival'?'email':e.type==='resolved'?'checkCircle':e.type==='action'?'file':'info',18)}</span><span><strong>${h(e.title)}</strong><small>${h(e.at)} · ${h(e.type)}</small></span></button>`).join(''):`<p class="start-empty">${text('Sin notificaciones todavía.','Encara no hi ha notificacions.')}</p>`;
 }
 function refreshDecorations(){drawTaskbar();renderShortcuts();renderStart();drawNotifications()}
 function sync(){const s=E.get();if(!s)return;for(const v of win.values()){if(v.node){renderOne(v.id);position(v)}}refreshDecorations()}
 function toggleStart(focusSearch=false){startOpen=!startOpen;notesOpen=false;$('notificationPanel').hidden=true;$('startMenu').hidden=!startOpen;$('taskStart').classList.toggle('selected',startOpen);if(startOpen){$('startSearch').value='';updateSearch();if(focusSearch)$('startSearch').focus()}}
 function toggleNotes(){notesOpen=!notesOpen;startOpen=false;$('startMenu').hidden=true;$('taskStart').classList.remove('selected');drawNotifications();$('notificationPanel').hidden=!notesOpen}
 function closeOverlays(){startOpen=false;notesOpen=false;$('startMenu').hidden=true;$('notificationPanel').hidden=true;$('taskStart').classList.remove('selected');hideSnapMenu()}
 function start(){win.clear();$('windowLayer').innerHTML='';active='';splitRatio=50;closeOverlays();AtCOS.VFS.init();refreshDecorations();updateDivider();
  $('taskStartGlyph').innerHTML=glyph('start',22);$('taskSearchGlyph').innerHTML=glyph('search',19);$('startSearchGlyph').innerHTML=glyph('search',19);$('startHelpGlyph').innerHTML=glyph('info',17);$('startPowerGlyph').innerHTML=glyph('power',18);$('closeNotificationsGlyph').innerHTML=glyph('close',18);$('taskNotificationsGlyph').innerHTML=glyph('bell',18);}
 function savedStatus(){drawTaskbar()}
 // Pointer-based movement and resizing, fully constrained to the desktop work area.
 function installInteraction(){
  const layer=$('windowLayer');const PREVIEW='os-drop-preview';let preview=null;
  function targetFromPointer(e){const rect=layer.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
   if(x<42)return 'left';if(x>rect.width-42)return 'right';if(y<33)return 'max';return null;
  }
  function dropPreview(target){
   if(!preview){preview=document.createElement('div');preview.className=PREVIEW;layer.appendChild(preview)}
   preview.hidden=!target;if(!target)return;
   preview.className=PREVIEW+' preview-'+target;
  }
  function clampRect(rect,minW=390,minH=310){const b=bounds();rect.w=Math.min(Math.max(minW,rect.w),b.w-12);rect.h=Math.min(Math.max(minH,rect.h),b.H-12);
   rect.left=Math.min(Math.max(4,rect.left),b.w-rect.w-4);rect.top=Math.min(Math.max(4,rect.top),b.H-rect.h-4);return rect}
  function restoreForDrag(v,e){if(!v.snap&&!v.maximized)return;
   const rect=v.node.getBoundingClientRect();const xFraction=Math.max(.15,Math.min(.85,(e.clientX-rect.left)/rect.width));
   v.snap=null;v.maximized=false;v.rect.left=e.clientX-layer.getBoundingClientRect().left-v.rect.w*xFraction;
   v.rect.top=e.clientY-layer.getBoundingClientRect().top-23;clampRect(v.rect);position(v);updateDivider();
  }
  document.addEventListener('pointerdown',e=>{
   const handle=e.target.closest('[data-resize]');const bar=e.target.closest('[data-drag-title]');const divider=e.target.closest('[data-splitter]');
   if(divider&&!divider.hidden){e.preventDefault();interaction={type:'divider',pointer:e.pointerId};divider.setPointerCapture?.(e.pointerId);return}
   if(handle){const v=win.get(handle.closest('[data-os-win]')?.dataset.osWin);if(!v||v.snap||v.maximized)return;
    e.preventDefault();focus(v.id);interaction={type:'resize',v,dir:handle.dataset.resize,pointer:e.pointerId,x:e.clientX,y:e.clientY,rect:{...v.rect}};handle.setPointerCapture?.(e.pointerId);return}
   if(!bar||e.target.closest('button'))return;
   const v=win.get(bar.dataset.dragTitle);if(!v)return;
   e.preventDefault();focus(v.id);interaction={type:'drag',v,pointer:e.pointerId,x:e.clientX,y:e.clientY,rect:{...v.rect},started:false,target:null};
   bar.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('pointermove',e=>{
   const a=interaction;if(!a||e.pointerId!==a.pointer)return;
   if(a.type==='divider'){
    const b=layer.getBoundingClientRect(),minimum=Math.min(410,b.width*.32);
    const ratio=Math.max(minimum/b.width*100,Math.min(100-minimum/b.width*100,(e.clientX-b.left)/b.width*100));
    splitRatio=Math.max(30,Math.min(70,ratio));updateDivider();return;
   }
   const dx=e.clientX-a.x,dy=e.clientY-a.y;
   if(a.type==='drag'){
    if(!a.started&&Math.hypot(dx,dy)<4)return;
    if(!a.started){restoreForDrag(a.v,e);a.rect={...a.v.rect};a.x=e.clientX;a.y=e.clientY;a.started=true}
    const b=bounds();a.v.rect.left=Math.max(4,Math.min(b.w-140,a.rect.left+e.clientX-a.x));
    a.v.rect.top=Math.max(3,Math.min(b.H-53,a.rect.top+e.clientY-a.y));position(a.v);
    a.target=targetFromPointer(e);dropPreview(a.target);return;
   }
   if(a.type==='resize'){
    const r={...a.rect},dir=a.dir,b=bounds(),minW=Math.min(390,b.w-12),minH=Math.min(310,b.H-12);
    if(dir.includes('e'))r.w=Math.max(minW,Math.min(b.w-r.left-4,a.rect.w+dx));
    if(dir.includes('s'))r.h=Math.max(minH,Math.min(b.H-r.top-4,a.rect.h+dy));
    if(dir.includes('w')){let nextW=Math.max(minW,Math.min(b.w-8,a.rect.w-dx));r.left=a.rect.left+a.rect.w-nextW;r.w=nextW;if(r.left<4){r.w-=4-r.left;r.left=4}}
    if(dir.includes('n')){let nextH=Math.max(minH,Math.min(b.H-8,a.rect.h-dy));r.top=a.rect.top+a.rect.h-nextH;r.h=nextH;if(r.top<4){r.h-=4-r.top;r.top=4}}
    a.v.rect=r;position(a.v);
   }
  });
  function stop(e){const a=interaction;if(!a||e.pointerId!==a.pointer)return;
   if(a.type==='drag'&&a.target){if(a.target==='max')maximize(a.v.id);else snap(a.v.id,a.target)}
   dropPreview(null);interaction=null;
  }
  document.addEventListener('pointerup',stop);document.addEventListener('pointercancel',stop);
  document.addEventListener('dblclick',e=>{const bar=e.target.closest('[data-drag-title]');if(bar&&!e.target.closest('button'))maximize(bar.dataset.dragTitle)});
  document.addEventListener('keydown',e=>{if(e.target?.id!=='tileDivider')return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();splitRatio=Math.max(30,Math.min(70,splitRatio+(e.key==='ArrowLeft'?-4:4)));updateDivider()}
  });
  window.addEventListener('resize',()=>{for(const v of win.values())if(!v.snap&&!v.maximized){clampRect(v.rect);position(v)}updateDivider()});
 }
 installInteraction();
 return {start,sync,open,focus,minimize,close,maximize,snap,split,restore,control,toggleStart,toggleNotes,closeOverlays,hideSnapMenu,updateSearch,savedStatus};
})();
