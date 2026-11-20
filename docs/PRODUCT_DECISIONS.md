# Decisiones de producto — AtC/OS (fuente de verdad)

Este documento recoge decisiones explícitas de diseño para evitar regresiones cuando se añadan nuevas funciones o se pierda contexto de conversaciones.

## Canales del simulador

**Confirmados (4):**
1. Correo electrónico
2. Mensajería
3. Llamadas telefónicas
4. Instagram: publicaciones existentes, comentarios públicos y comunicación privada cuando proceda

**Descartado: atención presencial.** No volver a añadir aplicación, escenario, acceso directo, filtros, iconografía ni navegación presencial salvo nueva petición explícita del usuario.

## Experiencia del escritorio

- Inicio de sesión centrado y asistente inicial tipo configuración de sistema operativo.
- Arranque visual simulado, omisible.
- Escritorio tipo OS moderno con Inicio, barra de tareas, ventanas movibles, redimensionables, minimizables, acoplables y reutilización del último tamaño de cada app durante la jornada.
- Accesos directos a aplicaciones en el escritorio, barra e Inicio.
- Papelera en la esquina inferior derecha. La zona para arrastrar archivos al escritorio no debe taparla.
- Iconos SVG propios; modo oscuro, colores, emoji y nombre de empresa personalizables.
- **Windows 98 retro**: infraestructura preparada, aspecto integral en el futuro; no presentarlo como terminado ni activarlo como opción pública todavía.

## Datos, archivos y coherencia profesional

- Si un cliente afirma haber enviado un archivo, el archivo tiene que existir en el sistema de archivos virtual, asociado a ese cliente y pedido, para que el alumno pueda comprobarlo.
- El expediente debe ser coherente en distintos canales: mismo cliente, mismo pedido, mismos archivos y estados.
- Las consultas comprueban la presencia real en el sistema virtual, no solo la existencia de una cadena de texto en una ficha.
- Los documentos de práctica son **representaciones didácticas para consulta dentro de Archivos**, no artes finales originales. **No permitir su descarga física al ordenador**; abrirlos en un visor interno. Si necesitamos originales más adelante, deben aportarse o diseñarse e incluirse como recursos reales.
- Los archivos se pueden organizar, consultar, mover, adjuntar y enviar a Papelera. El guardado es local y no hay servidor ni cuentas reales.
- Guardado automático de respuestas; no se necesita interfaz de exportar/importar progreso de sesión.
- Informe PDF del trabajo redactado, con revisión manual por el profesorado.

## Regla pedagógica

- Predomina **la redacción libre**. No hay puntuación semántica automática.
- El programa no inventa haber comprendido lo escrito. Las ramificaciones dependen de acciones verificables, no de suposiciones sobre el texto del alumno.
- No llenar todo de reclamaciones; mezclar asesoramiento, consulta, entregas, problemas e interacciones respetuosas y realistas.

## Desarrollo

- **GitHub `TCardell/atc-os` es la fuente principal**. Crear rama, probar, abrir PR y fusionar a `main` tras validar. La versión pública se distribuye por GitHub Pages.
- Mantener ES/CA y los módulos de documentos, informes, tareas y ventanas al refactorizar.
- Añadir pruebas de regresión cuando una decisión haya sido vulnerada.

- **Excepción a la prohibición de descargas:** el informe PDF de la jornada sí se descarga, porque es el entregable académico. La carpeta virtual «Descargas» no exporta archivos al ordenador real.
- El icono de Ajustes/Configuración debe ser un engranaje vectorial bien formado y comprobable a tamaños de barra de tareas, Inicio y escritorio.
