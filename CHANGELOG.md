## v0.9.2 — Fundamentos del banco ampliado (20-11-2026)

- Registro atómico de paquetes de situaciones versionados; metadatos normalizados de canal, RA, dificultad y etiquetas, y validación inicial de textos ES/CA.
- Auditoría única de integridad del banco: clientes, pedidos, documentos y cadenas de dependencias entre paquetes; CI la ejecuta antes de publicar.
- Selección reproducible de sesiones con cuatro canales cuando sea posible, al menos una gestión visible al inicio y requisitos completos sin introducir secuencias partidas por el límite de 12.
- Las nuevas sesiones guardan información de paquetes/versión. Las respuestas de una situación cuyo paquete desaparezca temporalmente se aparcan, sin borrarlas; vuelven al reinstalar la definición con el mismo ID.
- Validación de imágenes en cualquier paquete, no solo en el piloto. Nuevos tests de un catálogo sintético de 32 casos, selección, auditoría y restauración.
- Guía [docs/CASE_BANK.md](docs/CASE_BANK.md) para próximos paquetes y documentación de arquitectura actualizada.
- **Sin nuevas situaciones activas ni cambios en el escritorio:** siguen cinco casos, cuatro canales y el informe PDF descargable; no se alteran las claves de almacenamiento.

## v0.9.1 — Mantenimiento preventivo e integridad (20-11-2026)

- El sistema virtual impide copiar una carpeta dentro de sí misma o de una subcarpeta, evitando recursiones sin fin y árboles corruptos. Las copias normales se mantienen.
- Los adjuntos asociados a correos solo se incluyen en el envío si todavía existen y están fuera de la Papelera. Restaurarlos vuelve a permitir consultarlos; no se pueden adjuntar archivos después de finalizar la jornada.
- El selector de situaciones detecta dependencias circulares y omite casos cuyos requisitos no existen. Conserva la selección reproducible y la diversidad por canal.
- El validador CI analiza la sintaxis de todos los JavaScript, y revisa dependencias de casos y relación entre archivos recibidos, pedidos y clientes.
- Nuevas pruebas de regresión sin cambiar los cuatro canales, el flujo PDF, el visor, las ventanas ni el diseño.
- README, documentación técnica y hoja de ruta actualizados para diferenciar historial, decisiones vigentes y pendientes reales.
- Sin cambios en la estructura persistida de las partidas ni en las preferencias del alumnado.

## v0.9.0 — Visor interno e iconografía redibujada (20-11-2026)

- Los ficheros de la oficina se abren dentro de Archivos, en un lector más amplio con navegación de vuelta; no hay descarga física de archivos de práctica.
- Se retiran los botones y acciones «Descargar al ordenador» y la API `VFS.download`, así como el generador de PDF de demostración vinculado a esa descarga.
- Las copias dentro de la carpeta virtual «Descargas», la adjunción a correos y el informe PDF entregable siguen disponibles.
- Se rehace el icono Configuración con engranaje simétrico y verificaciones geométricas.
- Se adaptan la documentación y las pruebas (incluido el flujo de navegador) a la lectura interna.

## v0.8.0 — Cuatro canales, recepción verificable de documentos (20-11-2026)

- Se retira de nuevo la atención presencial, descartada en el diseño de producto: aplicación, escenario, iconos, selección, traducciones, CSS y pruebas.
- Se crea `data/received-files.js` con tres documentos PDF didácticos vinculados a clientes y pedidos.
- Nuevo directorio «Archivos recibidos», navegación y previsualización bilingüe. Se puede descargar y consultar el documento desde el canal que lo menciona.
- Las consultas y descargas utilizan archivos reales del sistema virtual; no inventan un documento cuando se hace clic.
- Migración idempotente de sesiones existentes: no repuebla archivos que el alumno haya movido a la Papelera.
- Icono Configuración rediseñado y área de arrastre separada de Papelera.
- Pruebas unitarias para los documentos, la migración, la eliminación/restauración y las regresiones visuales.

## v0.7.0 — Escritorio, legibilidad, correo y quinto canal (20-11-2026)

- Inicio de sesión centrado, incluso con una partida guardada.
- Botón Inicio con iconografía propia, fijo en el centro; se retira la lupa redundante de la barra inferior.
- Recuperación de accesos a aplicaciones en el escritorio, papelera virtual visible y soporte de arrastrar archivos a la papelera.
- Geometría de ventanas recordada entre cierre y reapertura en la misma jornada; Tareas comienza más pequeña.
- Tipografías más grandes; Correo con botón «Responder» que despliega el editor ampliado.
- Cabecera de Correo con nombre de la empresa y etiqueta corporativa, sin `@oficina.example`.
- Recuperado canal presencial y sexto caso piloto enlazado a una llamada; escena con diálogo no duplicado.
- Corregida la posible reapertura del login al omitir la animación de arranque.
- Se conservan temas modulares y funciones de Archivos, adjuntos y PDF.

## v0.6.0 — Integración del asistente y mejoras visuales (20-11-2026)

- Primera configuración centrada en dos pasos, con avatar SVG, sin composición lateral.
- Animación de arranque con progreso después de crear o recuperar la sesión; se puede omitir.
- Punto de no leído anclado y estado «leído» al abrir un correo, sin alterar la obligación de contestarlo.
- Presets 35/65, 50/50 y 65/35 para dos ventanas acopladas.
- Escritorio sin accesos duplicados a las aplicaciones; se mantienen archivos/carpetas del alumno.
- Motor de temas separado y prototipo CSS retro98 preparado, sin opción de activación pública.
- Se mantiene la base modular, archivos virtuales, adjuntos, tareas y canalizaciones CI de la v0.5.

# Historial de versiones

## v0.5.0 — 20/11/2026

- Nuevo arranque de sistema, pantalla de login simulada, recuperación de perfil local y asistente de primera configuración.
- Escritorio vacío al iniciar, accesos directos y barra de tareas solo con aplicaciones abiertas.
- Menú de energía: apagar y abrir informe; reiniciar con doble confirmación.
- Nueva aplicación de Tareas pendientes y ajustes de personalización dentro del sistema.
- Eliminado indicador permanente de guardado. Mensaje de bienvenida mediante aviso temporal.
- Eliminada la atención presencial del catálogo, las vistas y el lanzador.
- Primer filesystem virtual operativo con carpetas, escritorio, descargas, papelera, movimiento, renombrado, duplicado, documentos de ejemplo y adjuntos al correo.
- Informe PDF con adjuntos enviados y acciones sobre archivos.
- Selector de escenarios determinista con cuotas por canal y soporte de dependencias. Migración de guardado basada en IDs, no en el tamaño del catálogo.
- Tests de selección del banco y dos pruebas completas de interfaz y PDF.

## v0.4.0 — 20/11/2026

Primera publicación en GitHub Pages del piloto modular de AtC/OS.
