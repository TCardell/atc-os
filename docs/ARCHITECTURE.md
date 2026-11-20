# Arquitectura técnica — AtC/OS v0.5

AtC/OS es una aplicación web estática (HTML, CSS y JavaScript sin librerías externas) que se distribuye mediante GitHub Pages. Contiene un **sistema operativo simulado** y un **motor independiente de atención al cliente**. No accede a archivos del ordenador físico sin una acción expresa del usuario y no interpreta semánticamente las respuestas libres.

## Subsistemas

- `data/registry.js` y `data/scenarios/*.js`: registro de paquetes de escenarios con IDs estables, clientes, pedidos y pasos bilingües. Canal presencial eliminado.
- `js/scenario-selector.js`: selecciona hasta 12 situaciones de manera pseudoaleatoria determinista, con representación de los cuatro canales y resolución de dependencias.
- `js/engine.js`: estado de la jornada, transiciones y eventos. Guarda `scenarioIds` y estados individuales, no el tamaño total del catálogo.
- `js/state.js`: persistencia local de la sesión y migración compatible con el piloto anterior. Las sesiones viejas pierden el caso presencial retirado; las respuestas de otros casos siguen disponibles.
- `js/vfs.js`: **filesystem virtual** por jornada, carpetas y ficheros, mover/copiar/renombrar/papelera/restaurar, adjuntos y descarga del archivo físico. Está integrado en el estado de la sesión. El contenido es textual en el piloto y los documentos PDF descargados se generan como fichas de demostración válidas; no se finge que son el diseño gráfico original.
- `js/file-app.js`: interfaz de Archivos, selección, drag-and-drop y adjuntar desde Correo.
- `js/tasks-app.js`: checklist opcional, independiente de la calificación; marca automática solo si una gestión se completó.
- `js/settings-app.js`: ajustes de idioma, tema, logo, nombre de empresa y wallpaper.
- `js/desktop.js`: gestor de ventanas movibles, redimensionables y acoplables, escritorio con accesos, Inicio, búsqueda y barra de aplicaciones actualmente abiertas.
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
- `python tests/e2e_v05.py`: comprueba login, escritorio vacío, tareas, archivos, inicio y reanudación.
- `python tests/e2e_workflows_v05.py`: comprueba personalización, operaciones de archivos, adjunto PDF, correo y apagado con informe.

Los tests de navegador usan HTML ensamblado en memoria para poder ejecutarse en entornos sin acceso HTTP local, y un `localStorage` simulado. La publicación real en GitHub Pages debe verificarse además en el navegador del aula.

## Limitaciones conscientes de esta entrega

Los adjuntos de los cinco casos son **documentos de demostración** generados a partir de fichas de pedidos, no los archivos gráficos finales; las acciones de papelera/archivos existen en el entorno virtual, no en disco del usuario. El sistema de archivos usa la misma persistencia local de la partida, por lo que no se recomiendan ficheros grandes. Pendiente: selección avanzada de adjuntos y previews gráficos, aplicación de Pedidos más profunda, refactor de `js/views.js` por canal, reglas de evaluación docente, migraciones IndexedDB, tests con lectores de pantalla y compatibilidad con iframes de Google Sites.
