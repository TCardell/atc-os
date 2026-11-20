/** Five current pilot scenarios. New content goes in separate versioned case packs. */
(()=>{
 const L=AtCOS.Data.L;
const cases=[
  {id:'email01',channel:'email',client:'laura',order:'P-1847',title:L('Cambio de última hora en tarjetas','Canvi d’última hora a les targetes'),subject:L('Consulta sobre tarjetas · pedido P-1847','Consulta sobre targetes · comanda P-1847'),arrival:0,kind:'email',steps:[
   {incoming:L('Buenos días. Quería confirmar si las 500 tarjetas estarán listas para el viernes. Además, he detectado que el teléfono del diseño ya no es correcto. ¿Se podría cambiar? Muchas gracias.','Bon dia. Volia confirmar si les 500 targetes estaran llestes per divendres. A més, he vist que el telèfon del disseny ja no és correcte. Es podria canviar? Moltes gràcies.'),prompt:L('Responde al correo de Laura.','Respon al correu de na Laura.')},
   {incoming:L('Os envío el teléfono actualizado: 971 440 218. Agradecería que me indicarais si el cambio afecta al importe o a la fecha de entrega.','Us envio el telèfon actualitzat: 971 440 218. Agrairia que m’indicàssiu si el canvi afecta l’import o la data de lliurament.'),prompt:L('Redacta una segunda respuesta a este nuevo correo.','Redacta una segona resposta a aquest nou correu.')}
  ]},
  {id:'messages01',channel:'messages',client:'julia',order:'P-2081',title:L('Archivo para folletos de la feria','Arxiu dels fullets de la fira'),arrival:0,kind:'chat',steps:[
   {incoming:L('¡Hola! Ayer os envié el diseño de los folletos de la feria. ¿Habéis recibido bien el archivo?','Hola! Ahir us vaig enviar el disseny dels fullets de la fira. Heu rebut bé l’arxiu?'),prompt:L('Escribe un mensaje breve y útil.','Escriu un missatge breu i útil.')},
   {incoming:L('Una cosa más: ¿sería posible imprimirlos con un acabado mate? No quiero que reflejen demasiado la luz.','Una altra cosa: seria possible imprimir-los amb un acabat mat? No vull que reflecteixin gaire la llum.'),prompt:L('Responde al nuevo mensaje.','Respon al missatge nou.')}
  ]},
  {id:'phone01',channel:'phone',client:'bernat',order:'P-3042',title:L('Llamada sobre recogida de un pedido','Telefonada sobre recollida d’una comanda'),arrival:0,kind:'call',steps:[
   {incoming:L('Hola, buenos días. Soy Bernat, del Café Marès. Llamo por las 200 cartas que encargamos. ¿Podemos pasar a recogerlas hoy?','Hola, bon dia. Som en Bernat, del Cafè Marès. Telefon per les 200 cartes que vàrem encarregar. Podem passar a recollir-les avui?'),prompt:L('Escribe lo que dirías por teléfono.','Escriu què diries per telèfon.')},
   {incoming:L('Ah, y probablemente las recogerá mi compañera, no yo. ¿Qué deberíamos llevar para que nos las entreguéis?','Ah, i probablement les recollirà la meva companya, no jo. Què hauríem de dur perquè ens les lliureu?'),prompt:L('Responde oralmente en la simulación.','Respon oralment en la simulació.')}
  ]},
  {id:'social01',channel:'social',client:'clara',order:null,title:L('Queja en un comentario público','Queixa en un comentari públic'),arrival:2,kind:'comment',post:'post-eco.svg',steps:[
   {incoming:L('Bonita publicación, pero llevo dos días intentando contactar con vosotros por un problema en un folleto. Nadie me responde. 😕','Molt maca la publicació, però fa dos dies que intent contactar amb vosaltres per un problema amb un fullet. Ningú em respon. 😕'),prompt:L('Redacta la respuesta pública al comentario.','Redacta la resposta pública al comentari.')},
   {incoming:L('Escribe ahora un mensaje privado a la persona, sin dar por hecho ningún dato que no conozcas.','Escriu ara un missatge privat a la persona, sense donar per fet cap dada que no coneguis.'),prompt:L('Mensaje privado (si decidiste prepararlo).','Missatge privat (si has decidit preparar-lo).'),requiresFlag:'openPrivate'}
  ]},
  {id:'phone02',channel:'phone',client:'laura',order:'P-1847',title:L('Laura llama para ampliar la consulta','Na Laura telefona per ampliar la consulta'),arrival:'email01',kind:'call',steps:[
   {incoming:L('Hola, soy Laura, del Estudio Prisma. Llamo por el pedido P-1847. Además del cambio de teléfono, quería saber si puedo recoger las tarjetas personalmente en lugar de recibirlas por mensajería.','Hola, som na Laura, d’Estudio Prisma. Telefon per la comanda P-1847. A més del canvi de telèfon, volia saber si puc recollir les targetes personalment en lloc de rebre-les per missatgeria.'),prompt:L('Continúa la atención de la misma clienta por teléfono.','Continua l’atenció de la mateixa clienta per telèfon.')}
  ]}
 ];
 AtCOS.Data.addPack({id:'pilot',version:4,cases});
})();
