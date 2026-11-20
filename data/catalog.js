/** Internal company guidance (not legal advice). */
(()=>{
 const L=AtCOS.Data.L;
const catalog=[
  {id:'materials',title:L('Papeles y acabados','Papers i acabats'),body:L('Papel estucado: superficie más lisa; mate: menos reflejos; brillo: colores llamativos. El gramaje afecta a la rigidez. Comprobar uso previsto.','Paper estucat: superfície més llisa; mat: menys reflexos; brillant: colors vius. El gramatge afecta la rigidesa. Comprovar l’ús previst.')},
  {id:'deadlines',title:L('Compromisos y plazos','Compromisos i terminis'),body:L('No garantizar plazos sin comprobar estado de producción y posibles cambios. Dejar las condiciones y los acuerdos por escrito.','No garantir terminis sense comprovar l’estat de producció i possibles canvis. Deixar les condicions i els acords per escrit.')},
  {id:'privacy',title:L('Protección de datos y redes','Protecció de dades i xarxes'),body:L('En un comentario público no publicar datos personales, importes privados ni referencias de pedido identificables. Ofrecer un canal privado para detalles.','En un comentari públic no publicar dades personals, imports privats ni referències de comanda identificables. Oferir un canal privat per als detalls.')},
  {id:'complaints',title:L('Gestión de incidencias','Gestió d’incidències'),body:L('Escuchar, identificar y documentar el problema, verificar los hechos y comunicar alternativas realistas sin atribuir culpas antes de investigar.','Escoltar, identificar i documentar el problema, verificar els fets i comunicar alternatives realistes sense atribuir culpes abans d’investigar.')}
 ];
 AtCOS.Data.catalog=catalog;
})();
