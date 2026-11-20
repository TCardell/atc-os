# Guía de incorporación del banco de casos — AtC/OS v0.9.2

Esta es la **referencia para añadir contenido nuevo** sin alterar el escritorio ni el motor. Consultar además [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) antes de introducir paquetes o canales.

## Objetivo docente y estado

- **Ahora:** cinco situaciones piloto de cuatro canales. Ningún banco nuevo está activado todavía.
- **Objetivo futuro:** catálogo de unas 25–30 situaciones bilingües, con jornadas variadas de **10–12 casos** elegidos reproduciblemente. La capacidad predeterminada del motor es 12.
- **Canales permitidos:** `email`, `messages`, `phone`, `social`. **No reintroducir atención presencial.**
- Las respuestas del alumno se redactan libremente y se conservan literalmente en el informe. **No existe evaluación semántica automática.** El motor solo puede verificar acciones y estados explícitos.
- La selección evita casos sin requisito previo y prefiere diversidad de canales; si el banco o el límite no permiten cubrir los cuatro, el sistema selecciona los que sean viables.

## Organización propuesta de archivos

```text
data/
  clients.js               # clientes compartidos
  orders.js                # pedidos, plazos y producción
  received-files.js        # archivos recibidos ficticios, realmente presentes en el VFS
  scenarios/
    pilot.js               # cinco casos actuales, mantener intactos
    consultas.js           # ejemplo de futuro paquete, aún no creado
    incidencias.js         # ejemplo de futuro paquete, aún no creado
    entregas.js            # ejemplo de futuro paquete, aún no creado
```

Cada archivo de situaciones registra un **paquete versionado**. Al crear uno, añadir su `<script defer src="data/scenarios/..."></script>` en `index.html` **después de los datos de clientes/pedidos y antes de `js/scenario-selector.js`**. No es necesaria una API ni servicio externo.

## Esquema mínimo de un caso

Ejemplo de documentación; **no se añade al piloto**:

```js
(()=>{
 const L = AtCOS.Data.L;
 AtCOS.Data.addPack({
  id: 'asesoramiento-01',
  version: 1,
  cases: [{
   id: 'asesor-001',               // ID global, único y estable
   channel: 'email',               // email | messages | phone | social
   client: 'laura',                // debe existir en data/clients.js
   order: 'P-1847',                // opcional; debe ser de ese cliente
   arrival: 0,                    // 0 = inicial; 2 = tras 2 casos completados;
                                  // 'otro-id' = al completar otro caso
   kind: 'email',
   ra: 'RA2',                      // RA1, RA2, RA3 o RA4
   difficulty: 2,                  // 1 = inicial, 2 = media, 3 = avanzada
   tags: ['asesoramiento','plazos'],
   title: L('Consulta sobre plazo','Consulta sobre termini'),
   subject: L('Pedido P-1847','Comanda P-1847'), // típico de email
   steps: [{
    incoming: L('Buenos días. ¿Cuál es el plazo?','Bon dia. Quin és el termini?'),
    prompt: L('Redacta la respuesta.','Redacta la resposta.')
   }]
  }]
 });
})();
```

Los campos `id`, `channel`, `client`, `arrival`, `title` y un array de `steps` son obligatorios. `kind`, `order`, `subject`, `ra`, `difficulty` y `tags` son opcionales; se recomiendan metadatos pedagógicos explícitos en cada caso nuevo. Por compatibilidad, los valores por defecto son `ra:'RA2'`, `difficulty:2` y `tags:[]`.

**Contratos de calidad:**

1. ID permanente: si cambia la situación esencial, crear un ID nuevo; no reciclar el antiguo. El número de versión del paquete identifica revisiones editoriales, **no sustituye a los IDs**.
2. Toda intervención del cliente y todas las consignas deben incluir **ES y CA**. Títulos y asuntos también, cuando existan.
3. El cliente, pedido y documentos han de pertenecer al mismo expediente; un documento afirmado como «recibido» debe existir en `data/received-files.js` y en el VFS, con `orderId` y `clientId` correctos.
4. Los requisitos `arrival:'otro-id'` pueden apuntar a otro paquete, pero deben existir en el catálogo al publicar. No formar ciclos.
5. Los valores `arrival:n` representan **n casos completados en esa jornada**. No poner n mayor o igual que el número de casos seleccionados: nunca llegaría a aparecer. Conviene garantizar varias tareas `arrival:0` por jornada.
6. `social` usa publicaciones existentes y comentarios; no exige que el alumno invente publicaciones. Si un paso depende de una acción verificable, usar `requiresFlag` con una acción que el motor ya registre (por ejemplo, `openPrivate`), sin fingir interpretación del texto libre.
7. Los documentos de práctica **solo se abren dentro de AtC/OS**. El único PDF que puede descargarse físicamente es el informe final del alumnado.

## Selección y registro (API)

- `AtCOS.Data.addPack({id,version,cases})`: registro **atómico**. Si un caso contiene un error, no se añade ninguno de ese paquete.
- `AtCOS.Data.addCases(cases)`: sigue disponible para compatibilidad, también registra todos o ninguno.
- `AtCOS.Data.audit()`: devuelve incidencias entre paquetes (clientes/pedidos incompatibles, traducciones, dependencias ausentes/cíclicas, documentos recibidos).
- `AtCOS.Data.summary()`: muestra `total`, recuento por `channels`, `ra`, `difficulty` y `packs`.
- `AtCOS.ScenarioSelector.choose(AtCOS.Data.cases,{limit:12,seed:1234})`: devuelve IDs únicos, con cadenas de requisitos completas, semilla reproducible y cobertura de canales cuando sea viable.
- `Engine.create()` sigue fijando la selección al comenzar la jornada; **no introduce nuevos casos a mitad de una partida**. Registra `bankPacks` (ID y versión de los paquetes presentes).
- `Engine.restore()` conserva estados de casos temporalmente ausentes en `parkedCases` en lugar de borrar sus respuestas. Si el paquete vuelve a incluirse, se recuperan con el mismo ID.

**Importante:** `parkedCases` protege los datos guardados, pero la aplicación solo puede mostrar y corregir un caso mientras su definición esté instalada. No publicar cambios destructivos de contenido en mitad de una actividad escolar.

## Pruebas antes de publicar

```bash
npm run ci
```

El validador comprueba scripts, imágenes, relaciones entre pedidos y clientes, traducciones y dependencias. Los tests cubren registros atómicos, elecciones de un catálogo sintético grande, cadenas de requisitos y restauración. Al añadir un paquete, ampliar los tests con su contenido, continuidad entre canales, acciones, documentos, flujos de conversación e informes PDF. Probar **ES y CA** y recuperar una partida anterior antes de fusionar.

La validación en navegador, en GitHub Pages y **dentro de Google Sites** sigue siendo necesaria cuando activemos el banco definitivo.
