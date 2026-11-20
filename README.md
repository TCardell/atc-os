# AtC/OS — Virtual Graphic Office

**Simulador educativo de atención al cliente en una empresa de artes gráficas.** El alumnado trabaja en un escritorio virtual con correo, mensajería, teléfono, comentarios de Instagram, archivos y tareas. Todas las respuestas son redactadas libremente y se recogen en un informe PDF para revisión del profesorado. No hay evaluación semántica automática.

**Estado:** **v0.9**, visor interno de documentos e iconografía de Ajustes corregida. Cinco casos piloto y **cuatro canales: correo, mensajería, teléfono e Instagram**. La atención presencial queda descartada. Todavía no es el banco definitivo.

**Web de pruebas:** https://tcardell.github.io/atc-os/

## Experiencia

1. Arranque simulado, **inicio de sesión** mediante nombre de alumno y configuración inicial centrada en dos pasos: identidad de empresa y personalización. Tras crear o recuperar la jornada hay un arranque breve con indicador de progreso y botón para omitirlo.
2. Se eligen idioma (castellano/catalán), emoji y color de empresa, nombre ficticio y apariencia. El progreso se guarda localmente.
3. El **escritorio comienza sin ventanas abiertas**, con accesos directos a las aplicaciones, archivos personales y una **Papelera** en la esquina inferior derecha (se pueden arrastrar archivos a ella). El botón **Inicio permanece centrado** en la barra inferior y la búsqueda está dentro del menú Inicio o en `Ctrl+K`. Las aplicaciones abiertas se muestran junto a Inicio.
4. Se puede trabajar con ventanas redimensionables/acoplables, con proporciones rápidas **35/65, 50/50 y 65/35**, y el tamaño se **recuerda al cerrar y reabrir una aplicación durante la jornada**. Tareas abre de forma compacta. El correo ofrece **Responder** para desplegar un editor más ancho, sin mostrar direcciones corporativas ficticias como `@oficina.example`. Los correos se marcan como leídos al abrirlos.
5. La aplicación **Archivos** permite crear carpetas y notas, mover, copiar, renombrar, enviar a la papelera, restaurar y **abrir documentos en un visor integrado**. No descarga al ordenador los documentos de práctica. Se pueden conservar copias dentro de la carpeta virtual *Descargas* y adjuntarlas a correos.
6. **Inicio → Apagar** termina la jornada y abre el PDF. **Inicio → Reiniciar** descarta el progreso previa doble confirmación.

El checklist de **Tareas pendientes** es opcional. Las marcas manuales no se consideran una calificación.

### Limitaciones

El login no es una cuenta real; los datos se quedan en el navegador. Los archivos virtuales del piloto son documentos didácticos consultables dentro de AtC/OS, no archivos de diseño originales. No se descargan físicamente: solo el **informe PDF final del alumno** puede guardarse en el ordenador. La persistencia actual usa `localStorage`, por lo que no debe emplearse para archivos grandes. Para el banco definitivo se prevé IndexedDB. Los cambios en el ordenador físico solo ocurren cuando el usuario descarga un documento expresamente.

## Ejecutar en local

Servir la carpeta raíz con un servidor HTTP, sin instalar dependencias:

```bash
python -m http.server 8000
# Abrir http://localhost:8000
```

## Desarrollo y tests

Se necesita Node.js 20+ solo para la validación y el empaquetado:

```bash
npm run check
npm test
npm run build
npm run ci
```

Además existen `tests/e2e_v05.py` y `tests/e2e_workflows_v05.py` para pruebas de navegador con Playwright. GitHub Actions ejecuta `npm run ci` y publica `dist/` en Pages al hacer push a `main`.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles de componentes y [docs/ROADMAP.md](docs/ROADMAP.md) para próximas versiones.

## Privacidad

Este proyecto público **no contiene datos reales de clientes ni alumnos**. Los nombres y documentos de la simulación son ficticios. Los textos redactados por estudiantes se guardan localmente en su navegador; el repositorio GitHub no recopila esas respuestas por sí solo. No debe utilizarse el programa como gestor de información personal real.

## Infraestructura para el futuro tema retro

`js/theme-manager.js` separa el tema del motor de conversaciones, pedidos y ficheros utilizando `data-os-theme`. El tema público por defecto es **modern**. `css/themes/retro98.css` es un **prototipo estructural** para preparar una futura transformación integral de escritorio, ventanas, controles y aplicaciones; **todavía no existe una opción visible para activarlo en el simulador**. En desarrollo se puede probar llamando a `AtCOS.ThemeManager.apply('retro98')` desde las herramientas de depuración.

Esta versión se ha desarrollado sobre la **v0.5 del repositorio**, no reemplazando los módulos con el ZIP antiguo v0.4. Conserva las aplicaciones de Archivos y Tareas, los adjuntos y los tests existentes.

## Cambios de v0.7

- Pantalla de inicio de sesión realmente centrada, incluso cuando hay una partida guardada.
- Logo Inicio con SVG personalizado y posición fija en el centro de la barra de tareas; eliminada la lupa redundante (la búsqueda sigue disponible en Inicio).
- Escritorio con iconos de aplicaciones, documentos del alumno y Papelera arrastrable; siguen funcionando el menú Inicio y las apps abiertas.
- El gestor recuerda las dimensiones manuales de cada ventana al cerrarla y reabrirla **en la misma ejecución del simulador**. No persiste esas posiciones entre recargas de página; las respuestas y documentos sí se guardan.
- Tareas pendientes abre en una ventana más pequeña; tipografía más legible y Correo con botón Responder y editor ampliado.
- Atención presencial restaurada como quinto canal con un caso piloto relacionado con una llamada, sin duplicación del mensaje del cliente.

**Importante:** `@oficina.example` ya no se muestra en la cabecera de Correo. Las direcciones de los clientes de prueba siguen siendo datos de simulación, no buzones reales.

## Novedades de v0.8

- **Fuera Presencial:** eliminada la aplicación, el caso de mostrador y su registro como quinto canal. Queda asentado como decisión de producto en `docs/PRODUCT_DECISIONS.md`.
- **Archivos recibidos reales dentro de la simulación:** el explorador incorpora la carpeta *Archivos recibidos*, con tres registros PDF de práctica ligados a los pedidos P-1847, P-2081 y P-3042. Se pueden consultar, abrir dentro de la aplicación, mover, copiar, eliminar/restaurar y adjuntar; no se descargan al ordenador.
- El caso de Júlia **ya tiene un archivo recibido en el sistema**: al pulsar «Consultar archivo recibido» desde Mensajes se abre ese documento en Archivos. El correo también puede enlazar a documentos de pedidos existentes, sin simular que venían adjuntos a ese email.
- **Integridad:** el indicador de recepción depende del archivo presente, no de una ficha estática. Si se mueve a la Papelera no consta disponible; al restaurarlo vuelve a aparecer. Las partidas antiguas reciben una única migración, sin recrear documentos eliminados.
- El icono vectorial de **Configuración** se ha rediseñado y la zona «Soltar en el escritorio» se ha trasladado arriba a la derecha, separada de la Papelera.
- Los documentos PDF de clientes son **representaciones didácticas creadas para esta práctica**, con contenido técnico consultable. **No se hacen pasar por los archivos gráficos originales** (arte final) del cliente. Para usar PDF originales en el futuro habrá que incluir recursos reales junto a los escenarios.
- Se elimina un botón sin función de la vista de archivos y se revisa la coherencia de la acción «Consultar archivo».

**Conserva:** todos los demás módulos de la v0.7, los archivos propios creados por el alumno, su informe y las funciones de escritorio. El tema Windows 98 sigue como prototipo no activado.

## Novedades de v0.9

- **Visor de documentos dentro de Archivos:** pulsar un archivo abre su contenido en una vista de lectura amplia, con información del documento y opción de volver a la carpeta. Funciona con fichas PDF simuladas y notas de texto. Español y catalán.
- **Eliminada por completo la descarga real de archivos virtuales:** el explorador deja de mostrar «Descargar al ordenador» y `AtCOS.VFS.download` deja de existir. La carpeta *Descargas* sigue siendo exclusivamente una carpeta **virtual del simulador**, útil para organizar copias y adjuntos.
- **Se mantiene expresamente la exportación del informe PDF final**, que sí es el documento que el alumno debe entregar al profesor.
- **Icono de Configuración redibujado desde cero:** engranaje SVG simétrico de ocho dientes y aro central, comprobado con un renderizado y test de límites 24×24.
