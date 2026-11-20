/* Guided checklist: optional, not a scoring system. */
window.AtCOS=window.AtCOS||{};
AtCOS.TasksApp=(()=>{
 const E=AtCOS.Engine,I=AtCOS.Icons,h=s=>AtCOS.Views.escape(s);
 const ca=()=>E.get()?.lang==='ca';
 function render(){const s=E.get();s.taskChecks=s.taskChecks||{};const cases=E.visibleCases();const done=cases.filter(c=>c.complete).length;
  const rows=cases.map(c=>{const data=E.caseData(c.id);if(!data)return '';const checked=c.complete||!!s.taskChecks[c.id];return `<div class="todo-item"><input type="checkbox" id="todo-${h(c.id)}" data-task-check="${h(c.id)}" ${checked?'checked':''} ${c.complete?'disabled':''}/><label for="todo-${h(c.id)}"><strong>${h(E.loc(data.title))}</strong><small>${h(E.label(data.channel))} · ${c.complete?(ca()?'Completada':'Completada'):checked?(ca()?'Marcada manualment':'Marcada manualmente'):(ca()?'Pendent':'Pendiente')}</small></label><button class="btn btn-small" data-case="${h(c.id)}">${ca()?'Obrir':'Abrir'}</button></div>`}).join('');
  return `<section class="todo-app"><div class="todo-top"><span class="todo-progress">${done} / ${cases.length}</span><div class="todo-track"><div style="width:${cases.length?100*done/cases.length:0}%"></div></div><p>${ca()?'Les tasques apareixen quan arriben nous assumptes. Pots marcar-les per organitzar-te; només les gestions resoltes compten com a completades.':'Las tareas aparecen cuando llegan nuevos asuntos. Puedes marcarlas para organizarte; solo las gestiones resueltas cuentan como completadas.'}</p></div>${rows||`<div class="empty">${ca()?'Encara no tens tasques':'Todavía no tienes tareas'}</div>`}</section>`}
 function setChecked(id,checked){const s=E.get();if(!E.caseState(id))return;s.taskChecks=s.taskChecks||{};s.taskChecks[id]=!!checked;E.save();}
 return {render,setChecked};
})();
