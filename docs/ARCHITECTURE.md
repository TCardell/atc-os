# Arquitectura técnica — AtC/OS v0.9.2

AtC/OS es una aplicación web estática (HTML, CSS y JavaScript sin librerías externas) que se distribuye mediante GitHub Pages. Contiene un **sistema operativo simulado** y un **motor independiente de atención al cliente**. No accede a archivos del ordenador físico sin una acción expresa del usuario y no interpreta semánticamente las respuestas libres.

## Subsistemas

- `data/registry.js` y `data/scenarios/*.js`: registro de paquetes de escenarios con IDs estables, clientes, pedidos y pasos bilingües. Canal presencial **eliminado por decisión del usuario**.
- `js/scenario-selector.js`: selecciona hasta 12 situaciones de manera pseudoaleatoria determinista, con representación de los cuatro canales y resolución de dependencias.
- `js/engine.js`: estado de la jornada, transiciones y eventos. Guarda `scenarioIds` y estados individuales, no el tamaño total del catálogo.
- `js/state.js`: persistencia local de la sesión y migración compatible con el piloto anterior. Las sesiones existentes se recuperan preservando sus casos, respuestas y archivos; los nuevos casos solo se seleccionan al comenzar una jornada nueva.
- `js/vfs.js`: **filesystem virtual** por jornada, carpetas y ficheros, mover/copiar/renombrar/papelera/restaurar, adjuntos y visor interno de documentos, **sin descarga física de archivos del VFS**. Está integrado en el estado de la sesión. El contenido es textual en el piloto y los PDF simulados se presentan como fichas de demostración dentro del explorador; no se finge que son el diseño gráfico original.
- `js/file-app.js`: interfaz de Archivos, selección, drag-and-drop y adjuntar desde Correo.
- `js/tasks-app.js`: checklist opcional, independiente de la calificación; marca automática solo si una gestión se completó.
- `js/settings-app.js`: ajustes de idioma, tema, logo, nombre de empresa y wallpaper.
- `js/desktop.js`: gestor de ventanas movibles, redimensionables y acoplables, escritorio con accesos y papelera virtual, Inicio centrado con búsqueda integrada y barra de aplicaciones actualmente abiertas. Recuerda la geometría de las ventanas durante la ejecución.
- `js/app.js`: arranque, inicio de sesión simulado, asistente inicial, enrutamiento de eventos y acciones de energía.
- `js/views.js`: correo, mensajes, teléfono, comentarios de Instagram e informe (candidato a subdividir por apps en futuras versiones).
- `js/pdf.js`: informe PDF con intervenciones del alumno, nombres de adjuntos y acciones de archivos.

## Sesión, seguridad y persistencia

La pantalla de login es **una identidad local simulada**, sin autenticación real. Las respuestas, archivos virtuales y preferencias se guardan en la sesión de ese navegador. El sistema no implementa sincronización entre ordenadores. `localStorage` puede agotar cuota y, en sitios incrustados, puede quedar restringido; la futura migración a IndexedDB debería mantener estable la API de `AtCOS.VFS`.

El primer acceso abre la configuración; al continuar un perfil local aparece directamente el escritorio vacío. Apagar **finaliza** la jornada y abre el informe, pero no borra el estado. Reiniciar requiere doble confirmación y descarta toda la sesión, incluido el árbol de archivos virtuales.

## Ampliar el banco

Crear un nuevo fichero `data/scenarios/coleccion.js` y cargarlo antes de los módulos de motor. Registrar los casos mediante `AtCOS.Data.addPack({id:'reclamaciones',version:1,cases:[...]})`. Cada caso necesita `{id,channel,client,order?,arrival,kind,title,steps}`. Canales permitidos: `email`, `messages`, `phone`, `social`. `arrival` puede ser un número o el ID de una situación previa. Los campos textuales tienen variantes `{es,ca}`. Al aumentar el catálogo, no se modifican los estados de partidas existentes.

## Pruebas

- `npm run ci`: valida recursos y referencias, tests de catálogo/selección, genera `dist/`.
- `python tests/e2e_v05.py`: comprueba login, escritorio con aplicaciones, tareas, archivos, Inicio y reanudación. Los cambios v0.7 tienen además pruebas Node específicas.
- `python tests/e2e_workflows_v05.py`: comprueba personalización, operaciones de archivos, adjunto PDF, correo y apagado con informe.

Los tests de navegador usan HTML ensamblado en memoria para poder ejecutarse en entornos sin acceso HTTP local, y un `localStorage` simulado. La publicación real en GitHub Pages debe verificarse además en el navegador del aula.

## Limitaciones conscientes de esta entrega

Los adjuntos de los cinco casos son **documentos de demostración** generados a partir de fichas de pedidos, no los archivos gráficos finales; las acciones de papelera/archivos existen en el entorno virtual, no en disco del usuario. El sistema de archivos usa la misma persistencia local de la partida, por lo que no se recomiendan ficheros grandes. Pendiente: selección avanzada de adjuntos y previews gráficos, aplicación de Pedidos más profunda, refactor de `js/views.js` por canal, reglas de evaluación docente, migraciones IndexedDB, tests con lectores de pantalla y compatibilidad con iframes de Google Sites.

## Archivos entrantes (v0.8)

- `data/received-files.js` describe los documentos recibidos **en el mundo ficticio**, su cliente, pedido y contenido didáctico bilingüe.
- `js/vfs.js` migra las sesiones antiguas para crear una carpeta de *Archivos recibidos* y copiar allí una sola vez los tres PDF de ejemplo. El campo `receivedSeedVersion` evita regenerarlos si el alumno los elimina.
- `receivedForOrder(orderId)` encuentra el documento vinculado solo si existe y no está en la Papelera; `fileContent(node)` devuelve el texto de consulta en el idioma actual.
- `js/file-app.js` permite abrir el documento desde los casos de Mensajería/Correo y abrirlo en una lectura ampliada dentro de Archivos. No genera archivos físicos.
- `js/engine.js` registra la consulta del archivo cuando existe realmente y no interpreta las respuestas libres.
- Los documentos de práctica representan archivos recibidos, pero no son artes finales originales. El visor muestra su contenido de texto y datos dentro del OS; si se incorporan originales más adelante, habrá que suministrar esos recursos y desarrollar su visualización.

## Lectura de documentos (v0.9)

- `js/file-app.js` controla un visor interno con estado local de archivo abierto. Seleccionar un archivo o pulsar «Abrir archivo» presenta su contenido en el interior de la ventana Archivos, con botón de volver, nombre, formato y datos del pedido.
- El contenido se obtiene de `AtCOS.VFS.fileContent(n)`, conserva ES/CA y se escapa antes de insertarse en el DOM. No se renderiza HTML suministrado por usuarios.
- `js/vfs.js` no expone ni implementa ninguna descarga física (`download`, `makePdf` ni `URL.createObjectURL`) para los archivos de práctica. Las operaciones de copiar, mover, guardar y adjuntar siguen siendo internas.
- **Excepción intencionada:** `js/pdf.js` continúa generando el informe de la jornada como PDF descargable para entrega al docente.
- El icono `settings` se define una sola vez en `js/icons.js`, con un SVG simétrico dentro del `viewBox 0 0 24 24`. Los tests verifican contorno, simetría y límites.

## Mantenimiento de integridad v0.9.1

- `VFS.copy()` rechaza copiar una carpeta sobre sí misma o sobre sus descendientes. `VFS.move()` ya rechazaba el movimiento equivalente; se conserva la estructura jerárquica y el registro local.
- `VFS.attachments(caseId)` solo devuelve archivos existentes de tipo fichero que no estén en la Papelera (incluidos los contenidos indirectamente en ella); `Engine.send()` obtiene los nombres de esa API en vez de resolver identificadores obsoletos. El cambio no elimina las referencias de adjuntos de una partida antigua; si el alumno restaura el archivo antes de enviar, vuelve a estar disponible.
- `VFS.attach()` impide incluir ficheros en correos completados/no revelados o tras cerrar la jornada; las pruebas conservan compatibilidad con partidas que carezcan del campo `revealed`.
- `ScenarioSelector.choose()` evita seleccionar casos con requisitos ausentes y rechaza ciclos de dependencia. `scripts/validate.mjs` analiza todos los módulos JS y valida IDs, referencias y traducciones de documentos recibidos, además de las dependencias del catálogo.
- Los tests `tests/maintenance-v091.test.mjs` cubren copias de carpetas, ciclo de vida de adjuntos, envío, finalización y selección de situaciones. `npm run ci` es obligatorio antes de incorporar una versión.

## Contrato del banco de casos v0.9.2

- `data/registry.js` es el registro principal, independiente de las ventanas: `addPack` y `addCases` validan el paquete **antes de escribir** para evitar importaciones parciales. `audit()` reúne comprobaciones entre paquetes después de registrar todos los datos; `summary()` ofrece la distribución por canal, RA, dificultad y paquete.
- `js/scenario-selector.js` mantiene la API `choose(cases,{limit,seed})`. Calcula íntegramente cada cadena de dependencias, rechaza ciclos, no consume espacio para medio encadenamiento y conserva una selección determinista. Prioriza al menos una tarea inicial y una representación por canal cuando el catálogo y la capacidad lo permiten.
- `js/engine.js` guarda `bankPacks` con ID/versión en las sesiones nuevas; en restauración, estados de casos no disponibles pasan a `parkedCases` en vez de descartarse y se reactivan si reaparece su ID. Los IDs antiguos de casos, pedidos y clientes deben mantenerse estables; no es un sistema de migración semántica de contenidos ya redactados.
- `scripts/validate.mjs` utiliza la auditoría única para referencias/idiomas y valida `post` de **todos los paquetes**, además de verificar que README y paquete declaran la misma versión.
- Guía de creación e integración: **[CASE_BANK.md](CASE_BANK.md)**. Pruebas: `tests/case-bank-v092.test.mjs`. No se ha cargado ninguna nueva colección en la v0.9.2.
