window.AtCOS=window.AtCOS||{};
AtCOS.App=(()=>{
 const D=AtCOS.Data,E=AtCOS.Engine,S=AtCOS.Store,V=AtCOS.Views,OS=AtCOS.Desktop,$=id=>document.getElementById(id);
 const EMOJI=['🖨️','🎨','📐','🖌️','🧩','📚','🦋','✨','🌈','🌿','📦','🍇'];
 const FIRST=['Prisma','Tinta','Estudio','Norte','Pixel','Forma','Arco','Trama','Vértice','Idea','Llum','Croma','Azul','Línea','Taller','Papel','Aula','Faro','Vector','Onda','Punto','Raíz','Nova','Brisa','Marea','Graf','Atlas','Núvol','Oliva','Delta'];
 const LAST=['Gráfico','Creativo','Digital','de Impresión','Visual','Color','de Artes Gráficas','Gràfic','Impressió','Print','Estudio','Diseño','Press','360','Lab','Taller','Solutions','Graf','Paper','Media','Imprenta','Fábrica Gráfica','Preimpresión','Disseny','Gràfica','de Mallorca'];
 const tr=(es,ca)=>setup.lang==='ca'?ca:es;let setup={lang:'es',theme:'multi',mode:'dark',emoji:null},toastTimer,lastName='';
 function setMode(mode){document.body.dataset.mode=mode;$('themeModeBtn').innerHTML=AtCOS.Icons.svg(mode==='dark'?'sun':'moon',{size:18})+' '+tr(mode==='dark'?'Modo claro':'Modo oscuro',mode==='dark'?'Mode clar':'Mode fosc');const b=$('taskMode');if(b)b.innerHTML=AtCOS.Icons.svg(mode==='dark'?'sun':'moon',{size:19})}
 function colors(theme){const hex=D.names[theme]||'#6573de';document.documentElement.style.setProperty('--brand',hex);document.body.classList.toggle('brand-multi',theme==='multi');document.querySelectorAll('.swatch').forEach(b=>{const checked=b.dataset.color===theme;b.classList.toggle('active',checked);b.setAttribute('aria-pressed',String(checked))})}
 function emojiPicker(){const el=$('emojiSwatches');el.innerHTML=EMOJI.map(icon=>`<button type="button" class="emoji-option ${setup.emoji===icon?'active':''}" data-brand-emoji="${icon}" aria-label="${icon}" title="${tr('Logotipo','Logotip')} ${icon}" aria-pressed="${setup.emoji===icon}">${icon}</button>`).join('')}
 function applyLogo(){emojiPicker();const preview=$('companyPreview');if(preview)preview.textContent=setup.emoji||'△'}
 function locale(){const s=D.labels[setup.lang];for(const k of ['introPhrase','introTag','introTitle','introDescription','lblName','lblCompany','lblLang','lblAppearance','lblColor'])$(k).textContent=s[k];
  $('lblEmoji').textContent=tr('Logotipo de la empresa','Logotip de l’empresa');$('logoHint').textContent=tr('Elige uno de los 12 símbolos. Vuelve a pulsar el seleccionado para usar △.','Tria un dels 12 símbols. Torna a prémer el seleccionat per usar △.');
  $('mockPilotText').textContent=tr('06 gestiones piloto','06 gestions pilot');$('randomLabel').textContent=tr('Nombre al azar','Nom a l’atzar');$('randomCompanyBtn').title=tr('Generar nombre de empresa','Generar nom d’empresa');
  $('studentInput').placeholder=tr('Escribe tu nombre completo','Escriu el teu nom complet');$('companyInput').placeholder=tr('Ej.: Prisma Gràfic','P. ex.: Prisma Gràfic');$('startBtn').innerHTML=V.escape(s.start)+' <span>→</span>';$('resumeBtn').textContent=s.resume;$('privacyText').textContent=tr('Guardado automático local. No se envían tus respuestas a servidores.','Desament automàtic local. No s’envien les teves respostes a servidors.');
  $('startScreen').querySelector('.welcome-brand > span:last-child').innerHTML='AtC/OS<br><small>OFICINA VIRTUAL · v0.4</small>';setMode(setup.mode);emojiPicker();
 }
 function toast(msg){const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4800)}
 function fillColors(){$('colorSwatches').innerHTML=Object.entries(D.names).map(([id,hex])=>`<button class="swatch" data-color="${id}" type="button" style="background:${hex}" aria-label="${id}" title="${id}"></button>`).join('')}
 function updateReady(){$('startBtn').disabled=$('studentInput').value.trim().length<2||$('companyInput').value.trim().length<2}
 function randomCompany(){for(let n=0;n<6;n++){const a=FIRST[Math.floor(Math.random()*FIRST.length)],b=LAST[Math.floor(Math.random()*LAST.length)],suffix=Math.random()<.21?' S.L.':'';const name=`${a} ${b}${suffix}`;if(name!==lastName){lastName=name;$('companyInput').value=name;updateReady();return}}}
 function enter(){const s=E.get();$('startScreen').hidden=true;$('appShell').hidden=false;document.documentElement.lang=s.lang;setup={lang:s.lang,theme:s.theme||'multi',mode:s.mode||'light',emoji:s.emoji==='△'?null:s.emoji||null};colors(setup.theme);setMode(setup.mode);OS.start()}
 function create(){const student=$('studentInput').value.trim(),company=$('companyInput').value.trim();if(student.length<2||company.length<2)return;const saved=S.get();if(saved&&!window.confirm(tr('Ya existe una jornada guardada. ¿Quieres sustituirla?','Ja hi ha una jornada desada. La vols substituir?')))return;E.create({...setup,student,company,emoji:setup.emoji||'△'});enter()}
 function resume(){const s=S.get();if(!s)return;E.restore(s);enter()}
 function help(){const ca=E.get()?.lang==='ca'||setup.lang==='ca';$('helpTitle').textContent=ca?'Com funciona AtC/OS?':'¿Cómo funciona AtC/OS?';$('helpClose').textContent=ca?'Entesos':'Entendido';
  $('helpBody').innerHTML=ca?`<p>Fes servir el botó <b>Inici</b> i la barra inferior per obrir Correu, Missatges, Telefonades, Presencial, Instagram, Fitxers i l’Informe.</p><p>Pots <b>minimitzar, maximitzar, moure i dividir</b> les finestres; el botó d’organització permet posar-les a l’esquerra o la dreta. També pots arrossegar les vores per canviar-ne la mida i ajustar dues finestres amb el separador central.</p><p>Escriu les teves respostes i consulta fitxes, comandes i documents. El simulador no interpreta el que escrius: en conserva el text exacte per a l’informe PDF.</p><p>El progrés es desa en aquest navegador. És recomanable completar l’activitat en una mateixa sessió.</p>`:`<p>Utiliza el botón <b>Inicio</b> y la barra inferior para abrir Correo, Mensajes, Llamadas, Presencial, Instagram, Archivos y el Informe.</p><p>Puedes <b>minimizar, maximizar, mover y dividir</b> ventanas; el botón de organización permite colocarlas a izquierda o derecha. También puedes arrastrar sus bordes para cambiar el tamaño o mover el separador entre dos ventanas.</p><p>Redacta tus respuestas y consulta fichas, pedidos y documentos. El simulador no interpreta lo escrito: conserva el texto exacto para el informe PDF.</p><p>El progreso se guarda en este navegador. Se recomienda completar la actividad en una misma sesión.</p>`;
  $('helpBody').innerHTML+=`<div class="dialog-actions"><button class="btn btn-small" data-restart>↻ ${ca?'Nova jornada':'Nueva jornada'}</button></div>`;
  $('helpDialog').showModal()}
 function onClick(e){const el=e.target.closest('button,a');if(!el){if(e.target===$('appShell')||e.target===$('desktopWallpaper'))OS.closeOverlays();return}
  if(el.dataset.brandEmoji){setup.emoji=setup.emoji===el.dataset.brandEmoji?null:el.dataset.brandEmoji;applyLogo();return}
  if(el.dataset.color){setup.theme=setup.theme===el.dataset.color?'multi':el.dataset.color;colors(setup.theme);return}
  if(el.id==='randomCompanyBtn'){randomCompany();return}
  if(el.id==='themeModeBtn'){setup.mode=setup.mode==='dark'?'light':'dark';setMode(setup.mode);return}
  if(el.id==='startBtn'){create();return}if(el.id==='resumeBtn'){resume();return}
  if(el.id==='taskStart'){OS.toggleStart();return}if(el.id==='taskSearch'){OS.toggleStart(true);return}
  if(el.id==='taskNotifications'||el.id==='taskClock'){OS.toggleNotes();return}
  if(el.id==='closeNotifications'){OS.closeOverlays();return}
  if(el.id==='taskMode'){const s=E.get();s.mode=s.mode==='dark'?'light':'dark';setup.mode=s.mode;E.save();setMode(s.mode);return}
  if(el.id==='startHelpBtn'){OS.closeOverlays();help();return}
  if(el.id==='helpClose'){$('helpDialog').close();return}
  if(el.dataset.windowAction){OS.control(el.dataset.windowAction,el.dataset.win);return}
  if(el.dataset.osOpen){const id=el.dataset.osOpen,caseId=el.dataset.osCase;OS.open(id);if(caseId){E.select(caseId);OS.open(id)}return}
  if(el.dataset.mailFolder){V.setMailFolder(el.dataset.mailFolder);OS.open('email');return}
  if(el.dataset.dirFolder){V.setDirectoryFolder(el.dataset.dirFolder);OS.open('directory');return}
  if(el.hasAttribute('data-dir-preview')){V.setDirectoryPreview(el.dataset.dirPreview||null);OS.open('directory');return}
  if(el.dataset.view){OS.open(el.dataset.view);return}
  if(el.dataset.action){const result=E.action(el.dataset.id,el.dataset.action);V.render();if(result)toast(E.label(el.dataset.action==='catalog'?'catalog':el.dataset.action));return}
  if(el.dataset.case){E.select(el.dataset.case);OS.open(E.caseData(el.dataset.case).channel);return}
  if(el.dataset.send){const id=el.dataset.send,ta=document.querySelector(`[data-draft="${id}"]`),sent=E.send(id,ta?.value||E.caseState(id)?.draft);if(!sent.ok){toast(sent.message||'No se pudo enviar');return}V.render();toast(sent.arrivals?.length?(E.get().lang==='ca'?'Assumptes nous: ':'Nuevos asuntos: ')+sent.arrivals.map(id=>E.loc(E.caseData(id).title)).join(' · '):E.label('answered'));return}
  if(el.hasAttribute('data-finish')){if(!window.confirm(E.label('closeConfirm')))return;E.finish();OS.open('report');return}
  if(el.hasAttribute('data-unfinish')){E.unfinish();OS.open('dashboard');return}
  if(el.hasAttribute('data-restart')){if(E.get()&&!window.confirm(E.label('restartConfirm').replace(/Descarga antes el informe o una copia\./,'Guarda el informe PDF antes de continuar.')))return;S.clear();location.reload();return}
 }
 function setupEvents(){document.addEventListener('click',onClick);
  document.addEventListener('pointerdown',e=>{const w=e.target.closest('[data-os-win]');if(w&&!e.target.closest('[data-window-action]')){const id=w.dataset.osWin;const target=E.get()?.view;if(id!==target)OS.focus(id)} });
  $('langSelect').addEventListener('change',e=>{setup.lang=e.target.value;locale()});
  for(const id of ['studentInput','companyInput'])$(id).addEventListener('input',updateReady);
  document.addEventListener('input',e=>{const t=e.target;
   if(t.id==='startSearch'){OS.updateSearch();return}
   if(t.dataset.draft){E.draft(t.dataset.draft,t.value);const b=document.querySelector(`[data-send="${t.dataset.draft}"]`);if(b)b.disabled=t.value.trim().length<12;const n=document.querySelector(`[data-characters="${t.dataset.draft}"]`);if(n)n.textContent=t.value.length;OS.savedStatus()}
   if(t.dataset.note)E.note(t.dataset.note,t.value);
  });
  document.addEventListener('keydown',e=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){if($('appShell').hidden)return;e.preventDefault();OS.toggleStart(true)}
   if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&e.target.matches('[data-draft]')){const btn=document.querySelector(`[data-send="${e.target.dataset.draft}"]`);if(btn&&!btn.disabled){e.preventDefault();btn.click()}}
   if(e.key==='Escape')OS.closeOverlays();
  });
  document.addEventListener('pointerdown',e=>{if(e.target.closest('#startMenu,#taskStart,#taskSearch,#notificationPanel,#taskNotifications,#taskClock'))return;if(!$('startMenu').hidden||!$('notificationPanel').hidden)OS.closeOverlays()});
  document.addEventListener('pointerdown',e=>{if(!$('snapMenu').hidden&&!e.target.closest('#snapMenu,[data-window-action=menu]'))OS.hideSnapMenu()});
  $('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog'))$('helpDialog').close()});
  window.addEventListener('beforeunload',e=>{if(E.get()&&!E.get().finalized&&!S.status()){e.preventDefault();e.returnValue=''}});
  setInterval(()=>{if(E.get()&&!$('appShell').hidden){const changed=E.tick();if(changed)OS.savedStatus();else $('realClock').textContent=new Date().toLocaleDateString(E.get().lang==='ca'?'ca-ES':'es-ES',{day:'2-digit',month:'2-digit'})}},5000);
 }
 function boot(){fillColors();locale();colors(setup.theme);const saved=S.get();$('resumeBtn').hidden=!saved;setupEvents();updateReady()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();return {boot,toast};
})();
