window.AtCOS=window.AtCOS||{};
AtCOS.App=(()=>{
 const D=AtCOS.Data,E=AtCOS.Engine,S=AtCOS.Store,V=AtCOS.Views,OS=AtCOS.Desktop,$=id=>document.getElementById(id);
 const EMOJI=['🖨️','🎨','📐','🖌️','🧩','📚','🦋','✨','🌈','🌿','📦','🍇'];
 const FIRST=['Prisma','Tinta','Estudio','Norte','Pixel','Forma','Arco','Trama','Vértice','Idea','Llum','Croma','Azul','Línea','Taller','Papel','Aula','Faro','Vector','Onda','Punto','Raíz','Nova','Brisa','Marea','Graf','Atlas','Núvol','Oliva','Delta'];
 const LAST=['Gráfico','Creativo','Digital','de Impresión','Visual','Color','de Artes Gráficas','Gràfic','Impressió','Print','Estudio','Diseño','Press','360','Lab','Taller','Solutions','Graf','Paper','Media','Imprenta','Fábrica Gráfica','Preimpresión','Disseny','Gràfica','de Mallorca'];
 const tr=(es,ca)=>setup.lang==='ca'?ca:es;let setup={lang:'es',theme:'multi',mode:'dark',emoji:null},toastTimer,lastName='',setupPage=1,bootTimer=null,bootSkipAction=null;
 function setMode(mode){document.body.dataset.mode=mode;$('themeModeBtn').innerHTML=AtCOS.Icons.svg(mode==='dark'?'sun':'moon',{size:18})+' '+tr(mode==='dark'?'Modo claro':'Modo oscuro',mode==='dark'?'Mode clar':'Mode fosc');const b=$('taskMode');if(b)b.innerHTML=AtCOS.Icons.svg(mode==='dark'?'sun':'moon',{size:19})}
 function colors(theme){const hex=D.names[theme]||'#6573de';document.documentElement.style.setProperty('--brand',hex);document.body.classList.toggle('brand-multi',theme==='multi');document.querySelectorAll('.swatch').forEach(b=>{const checked=b.dataset.color===theme;b.classList.toggle('active',checked);b.setAttribute('aria-pressed',String(checked))})}
 function emojiPicker(){const el=$('emojiSwatches');el.innerHTML=EMOJI.map(icon=>`<button type="button" class="emoji-option ${setup.emoji===icon?'active':''}" data-brand-emoji="${icon}" aria-label="${icon}" title="${tr('Logotipo','Logotip')} ${icon}" aria-pressed="${setup.emoji===icon}">${icon}</button>`).join('')}
 function applyLogo(){emojiPicker();const preview=$('companyPreview');if(preview)preview.textContent=setup.emoji||'△'}
 function locale(){const s=D.labels[setup.lang];for(const k of ['introPhrase','introTag','introTitle','introDescription','lblName','lblCompany','lblLang','lblAppearance','lblColor'])$(k).textContent=s[k];
  $('lblEmoji').textContent=tr('Logotipo de la empresa','Logotip de l’empresa');$('logoHint').textContent=tr('Elige uno de los 12 símbolos. Vuelve a pulsar el seleccionado para usar △.','Tria un dels 12 símbols. Torna a prémer el seleccionat per usar △.');
  $('mockPilotText').textContent=tr('05 gestiones piloto','05 gestions pilot');$('randomLabel').textContent=tr('Nombre al azar','Nom a l’atzar');$('randomCompanyBtn').title=tr('Generar nombre de empresa','Generar nom d’empresa');
  $('studentInput').placeholder=tr('Escribe tu nombre completo','Escriu el teu nom complet');$('companyInput').placeholder=tr('Ej.: Prisma Gràfic','P. ex.: Prisma Gràfic');$('startBtn').innerHTML=V.escape(s.start)+' <span>→</span>';$('resumeBtn').textContent=s.resume;$('privacyText').textContent=tr('Guardado automático local. No se envían tus respuestas a servidores.','Desament automàtic local. No s’envien les teves respostes a servidors.');
  $('setupNext').textContent=tr('Continuar →','Continuar →');$('setupBack').textContent=tr('← Volver','← Tornar');$('setupStyleLabel').textContent=tr('PASO 2 DE 2 · PERSONALIZACIÓN','PAS 2 DE 2 · PERSONALITZACIÓ');$('setupStyleTitle').textContent=tr('Personaliza tu oficina','Personalitza la teva oficina');$('setupStyleDescription').textContent=tr('Elige el idioma, la apariencia y la identidad de tu empresa.','Tria l’idioma, l’aparença i la identitat de la teva empresa.');
  $('startScreen').querySelector('.welcome-brand > span:last-child').innerHTML='AtC/OS<br><small>OFICINA VIRTUAL · v0.6</small>';setMode(setup.mode);emojiPicker();
 }
 function toast(msg){const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4800)}
 function fillColors(){$('colorSwatches').innerHTML=Object.entries(D.names).map(([id,hex])=>`<button class="swatch" data-color="${id}" type="button" style="background:${hex}" aria-label="${id}" title="${id}"></button>`).join('')}
 function setSetupPage(page){setupPage=page===2?2:1;document.body.dataset.setupPage=String(setupPage);$('startScreen').dataset.step=String(setupPage);document.querySelectorAll('#startScreen [data-setup-step]').forEach(el=>{el.hidden=el.dataset.setupStep!==String(setupPage)});document.querySelectorAll('#startScreen [data-setup-progress]').forEach(el=>el.classList.toggle('is-current',Number(el.dataset.setupProgress)<=setupPage));$('startBtn').hidden=setupPage!==2}
 function updateReady(){const disabled=$('studentInput').value.trim().length<2||$('companyInput').value.trim().length<2;$('startBtn').disabled=disabled;$('setupNext').disabled=disabled}
 function startBoot(next,initial=false){clearTimeout(bootTimer);const screen=$('bootScreen'),bar=$('bootProgress');screen.hidden=false;screen.style.display='flex';$('skipBoot').textContent=tr('Omitir','Ometre');$('bootCaption').textContent=initial?tr('Iniciando AtC/OS…','Iniciant AtC/OS…'):tr('Preparando el escritorio y las aplicaciones…','Preparant l’escriptori i les aplicacions…');bar.style.transition='none';bar.style.width='3%';void bar.offsetWidth;const duration=initial?950:1700;bar.style.transition=`width ${duration-140}ms ease`;bar.style.width='100%';let fired=false;const finish=()=>{if(fired)return;fired=true;clearTimeout(bootTimer);screen.hidden=true;screen.style.display='none';bootSkipAction=null;next()};bootSkipAction=finish;bootTimer=setTimeout(finish,duration)}
 function randomCompany(){for(let n=0;n<6;n++){const a=FIRST[Math.floor(Math.random()*FIRST.length)],b=LAST[Math.floor(Math.random()*LAST.length)],suffix=Math.random()<.21?' S.L.':'';const name=`${a} ${b}${suffix}`;if(name!==lastName){lastName=name;$('companyInput').value=name;updateReady();return}}}
 function applyAppearance(){const s=E.get();if(!s)return;setup={lang:s.lang,theme:s.theme||'multi',mode:s.mode||'dark',emoji:s.emoji==='△'?null:s.emoji||null};colors(setup.theme);setMode(setup.mode);$('appShell').dataset.wallpaper=s.wallpaper||'aurora';AtCOS.ThemeManager.apply(s.uiTheme||'modern');document.documentElement.lang=s.lang;}
 function enter(){const s=E.get();$('startScreen').hidden=true;$('loginScreen').hidden=true;$('bootScreen').hidden=true;$('appShell').hidden=false;AtCOS.VFS.init();applyAppearance();OS.start();toast(tr('Bienvenido a AtC/OS. Abre una aplicación para empezar.','Benvingut a AtC/OS. Obre una aplicació per començar.'))}
 function showLogin(){if($('loginScreen').hidden){$('bootScreen').hidden=true;$('loginScreen').hidden=false;}const saved=S.get();$('savedProfile').hidden=!saved;if(saved)$('savedProfile').textContent=tr('Continuar como ','Continuar com a ')+saved.student+' · '+saved.company}
 function proceedLogin(){const name=$('loginName').value.trim();if(name.length<2){$('loginName').focus();return}$('studentInput').value=name;$('loginScreen').hidden=true;$('startScreen').hidden=false;setSetupPage(1);updateReady();$('companyInput').focus()}
 function shutdown(){if(!window.confirm(tr('¿Finalizar la jornada y preparar el informe PDF? Revisa el informe antes de cerrar la página.','Finalitzar la jornada i preparar l’informe PDF? Revisa l’informe abans de tancar la pàgina.')))return;E.finish();OS.closeOverlays();$('powerMenu').hidden=true;OS.open('report');toast(tr('Jornada finalizada. Descarga el informe antes de salir.','Jornada finalitzada. Baixa l’informe abans de sortir.'))}
 function reboot(){if(!window.confirm(tr('¿Reiniciar toda la partida? Se perderán las respuestas y los archivos virtuales.','Reiniciar tota la partida? Es perdran les respostes i els fitxers virtuals.')))return;if(!window.confirm(tr('Confirmar reinicio: esta acción es irreversible.','Confirmar el reinici: aquesta acció és irreversible.')))return;S.clear();location.reload()}
 
 function create(){const student=$('studentInput').value.trim(),company=$('companyInput').value.trim();if(student.length<2||company.length<2)return;const saved=S.get();if(saved&&!window.confirm(tr('Ya existe una jornada guardada. ¿Quieres sustituirla?','Ja hi ha una jornada desada. La vols substituir?')))return;E.create({...setup,student,company,emoji:setup.emoji||'△'});startBoot(enter)}
 function resume(){const s=S.get();if(!s)return;E.restore(s);startBoot(enter)}
 function help(){const ca=E.get()?.lang==='ca'||setup.lang==='ca';$('helpTitle').textContent=ca?'Com funciona AtC/OS?':'¿Cómo funciona AtC/OS?';$('helpClose').textContent=ca?'Entesos':'Entendido';
  $('helpBody').innerHTML=ca?`<p>Fes servir el botó <b>Inici</b> i la barra inferior per obrir Correu, Missatges, Telefonades, Instagram, Fitxers i l’Informe.</p><p>Pots <b>minimitzar, maximitzar, moure i dividir</b> les finestres; el botó d’organització permet posar-les a l’esquerra o la dreta. També pots arrossegar les vores per canviar-ne la mida i ajustar dues finestres amb el separador central.</p><p>Escriu les teves respostes i consulta fitxes, comandes i documents. El simulador no interpreta el que escrius: en conserva el text exacte per a l’informe PDF.</p><p>El progrés es desa en aquest navegador. És recomanable completar l’activitat en una mateixa sessió.</p>`:`<p>Utiliza el botón <b>Inicio</b> y la barra inferior para abrir Correo, Mensajes, Llamadas, Instagram, Archivos y el Informe.</p><p>Puedes <b>minimizar, maximizar, mover y dividir</b> ventanas; el botón de organización permite colocarlas a izquierda o derecha. También puedes arrastrar sus bordes para cambiar el tamaño o mover el separador entre dos ventanas.</p><p>Redacta tus respuestas y consulta fichas, pedidos y documentos. El simulador no interpreta lo escrito: conserva el texto exacto para el informe PDF.</p><p>El progreso se guarda en este navegador. Se recomienda completar la actividad en una misma sesión.</p>`;
  $('helpBody').innerHTML+=`<div class="dialog-actions"><button class="btn btn-small" data-restart>↻ ${ca?'Nova jornada':'Nueva jornada'}</button></div>`;
  $('helpDialog').showModal()}
 function onClick(e){const el=e.target.closest('button,a');if(!el){if(e.target===$('appShell')||e.target===$('desktopWallpaper'))OS.closeOverlays();return}
  if(el.dataset.brandEmoji){setup.emoji=setup.emoji===el.dataset.brandEmoji?null:el.dataset.brandEmoji;applyLogo();return}
  if(el.dataset.color){setup.theme=setup.theme===el.dataset.color?'multi':el.dataset.color;colors(setup.theme);return}
  if(el.id==='randomCompanyBtn'){randomCompany();return}
  if(el.id==='themeModeBtn'){setup.mode=setup.mode==='dark'?'light':'dark';setMode(setup.mode);return}
  if(el.id==='skipBoot'){showLogin();return}
  if(el.id==='loginProceed'){proceedLogin();return}
  if(el.id==='savedProfile'){resume();return}
  if(el.id==='setupNext'){if(!el.disabled){setSetupPage(2);$('langSelect').focus()}return}if(el.id==='setupBack'){setSetupPage(1);$('companyInput').focus();return}if(el.id==='startBtn'){create();return}if(el.id==='resumeBtn'){resume();return}
  if(el.id==='startPower'){$('powerMenu').hidden=!$('powerMenu').hidden;return}
  if(el.dataset.power){$('powerMenu').hidden=true;if(el.dataset.power==='shutdown')shutdown();else reboot();return}
  if(el.hasAttribute('data-os-settings-save')){AtCOS.SettingsApp.save();return}
  if(el.dataset.vfsDesktop){OS.open('directory');AtCOS.FileApp.act({dataset:{vfsOpen:el.dataset.vfsDesktop}});return}
  if(el.dataset.vfsSaveOrder){try{const n=AtCOS.VFS.saveAttachment(el.dataset.vfsSaveOrder);toast(tr('Archivo guardado en Descargas: ','Fitxer desat a Baixades: ')+n.name);V.render()}catch(x){toast(x.message)}return}
  if(el.dataset.vfsDetach){AtCOS.VFS.detach(el.dataset.id,el.dataset.vfsDetach);V.render();return}
  if(el.dataset.vfsCmd||el.dataset.vfsFolder||el.dataset.vfsOpen){AtCOS.FileApp.act(el);return}
  
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
  if(el.hasAttribute('data-restart')){reboot();return}
 }
 function setupEvents(){document.addEventListener('click',onClick);
  document.addEventListener('pointerdown',e=>{const w=e.target.closest('[data-os-win]');if(w&&!e.target.closest('[data-window-action]')){const id=w.dataset.osWin;const target=E.get()?.view;if(id!==target)OS.focus(id)} });
  $('langSelect').addEventListener('change',e=>{setup.lang=e.target.value;locale()});
  for(const id of ['studentInput','companyInput'])$(id).addEventListener('input',updateReady);$('companyInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('setupNext').disabled&&setupPage===1){e.preventDefault();setSetupPage(2)}});$('loginName').addEventListener('keydown',e=>{if(e.key==='Enter')proceedLogin()});
  document.addEventListener('input',e=>{const t=e.target;
   if(t.id==='startSearch'){OS.updateSearch();return}
   if(t.dataset.draft){E.draft(t.dataset.draft,t.value);const b=document.querySelector(`[data-send="${t.dataset.draft}"]`);if(b)b.disabled=t.value.trim().length<12;const n=document.querySelector(`[data-characters="${t.dataset.draft}"]`);if(n)n.textContent=t.value.length;OS.savedStatus()}
   if(t.dataset.note)E.note(t.dataset.note,t.value);
   if(t.dataset.taskCheck){AtCOS.TasksApp.setChecked(t.dataset.taskCheck,t.checked);V.render()}
  });
  document.addEventListener('change',e=>{if(e.target.dataset.taskCheck){AtCOS.TasksApp.setChecked(e.target.dataset.taskCheck,e.target.checked);V.render()}});
  document.addEventListener('dragstart',AtCOS.FileApp.dragStart);document.addEventListener('dragover',AtCOS.FileApp.dragOver);document.addEventListener('drop',AtCOS.FileApp.drop);document.addEventListener('dragend',()=>document.getElementById('appShell')?.classList.remove('is-dragging'));
  document.addEventListener('keydown',e=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){if($('appShell').hidden)return;e.preventDefault();OS.toggleStart(true)}
   if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&e.target.matches('[data-draft]')){const btn=document.querySelector(`[data-send="${e.target.dataset.draft}"]`);if(btn&&!btn.disabled){e.preventDefault();btn.click()}}
   if(e.key==='Escape'){$('powerMenu').hidden=true;OS.closeOverlays()}
  });
  document.addEventListener('pointerdown',e=>{if(e.target.closest('#startMenu,#taskStart,#taskSearch,#notificationPanel,#taskNotifications,#taskClock,#powerMenu'))return;$('powerMenu').hidden=true;if(!$('startMenu').hidden||!$('notificationPanel').hidden)OS.closeOverlays()});
  document.addEventListener('pointerdown',e=>{if(!$('snapMenu').hidden&&!e.target.closest('#snapMenu,[data-window-action=menu]'))OS.hideSnapMenu()});
  $('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog'))$('helpDialog').close()});
  window.addEventListener('beforeunload',e=>{if(E.get()&&!E.get().finalized&&!S.status()){e.preventDefault();e.returnValue=''}});
  setInterval(()=>{if(E.get()&&!$('appShell').hidden){const changed=E.tick();if(changed)OS.savedStatus();else $('realClock').textContent=new Date().toLocaleDateString(E.get().lang==='ca'?'ca-ES':'es-ES',{day:'2-digit',month:'2-digit'})}},5000);
 }
 function boot(){fillColors();locale();colors(setup.theme);$('startScreen').hidden=true;$('loginScreen').hidden=true;const saved=S.get();$('resumeBtn').hidden=true;setupEvents();updateReady();$('skipBoot').addEventListener('click',()=>bootSkipAction?.());setSetupPage(1);startBoot(showLogin,true)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();return {boot,toast,applyAppearance};
})();
