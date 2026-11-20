# Hoja de ruta AtC/OS — estado vivo

**Estado actual: v0.9.2 (20 de noviembre de 2026).** Para evitar regresiones, las decisiones vigentes se mantienen en [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) y el historial completo en [CHANGELOG.md](../CHANGELOG.md). Este documento recoge **qué existe y qué queda pendiente**, no promesas asociadas a versiones antiguas.

## Funcionalidad entregada

- **v0.4–v0.5:** primer simulador modular, sistema operativo virtual, arranque, sesión local, ventanas, Tareas e infraestructura de Archivos.
- **v0.6:** configuración centrada, progreso de arranque, mejora del indicador del correo, distribución de ventanas e infraestructura de temas.
- **v0.7:** ajustes de escritorio y barra de tareas, Papelera, tamaño de ventanas recordado durante la jornada, botón Responder y legibilidad. Se probó temporalmente la atención presencial, **revertida después**.
- **v0.8:** cuatro canales definitivos (correo, mensajería, teléfono e Instagram), carpeta de archivos recibidos, documentos vinculados realmente a cliente/pedido y migración de partidas.
- **v0.9:** visor interno de documentos, supresión de descargas físicas de archivos de práctica, icono de Ajustes corregido; sigue descargándose únicamente el informe PDF del alumno.
- **v0.9.1:** mantenimiento preventivo de copias de carpetas, adjuntos, dependencias de escenarios, validaciones CI y documentación. No cambia la interfaz ni el contenido piloto.
- **v0.9.2:** registro atómico y auditoría de paquetes, selección de sesiones por cadenas completas, preservación de respuestas de casos temporalmente no disponibles, tests de catálogo ampliado sintético y [guía de incorporación](CASE_BANK.md). No cambia los cinco casos reales.

**Hoy existen cinco casos piloto y cuatro canales.** Las decisiones de descartar atención presencial y de mantener las descargas físicas limitadas al informe final son obligatorias en próximos desarrollos.

## Trabajo pendiente — sin asignar aún a versión

1. **Banco docente definitivo:** diseñar y revisar entre 25 y 30 situaciones bilingües, con dificultad, RA y relaciones entre clientes/pedidos/archivos. **La infraestructura de selección y registro ya existe**, pero falta redactar, integrar y ensayar los casos reales según [CASE_BANK.md](CASE_BANK.md).
2. **Validación en el aula:** ensayar en Google Sites y ordenadores reales, revisar tamaños de ventanas, descarga del informe, accesibilidad y comportamiento de almacenamiento local.
3. **Motor y arquitectura de aplicaciones:** separar gradualmente `js/views.js` por canales, mejorar los presupuestos y los expedientes de pedidos sin romper sus identificadores.
4. **Archivos más complejos:** estudiar IndexedDB y previsualizaciones auténticas con migración compatible; no almacenar binarios grandes en `localStorage`.
5. **Tema retro Windows 98:** terminar todos los componentes de escritorio y aplicaciones antes de publicar un selector. El CSS actual solo es un prototipo técnico.
6. **Evaluación docente:** mejorar informes y pruebas bilingües sin atribuir a un motor local comprensión automática del texto libre.

## Normas de publicación

Trabajar desde el último `main` de [TCardell/atc-os](https://github.com/TCardell/atc-os) en una rama independiente, actualizar tests y documentación, exigir `npm run ci` y revisión de la pull request. La publicación de GitHub Pages ocurre al fusionar en `main`. No recuperar funciones descartadas solamente porque aparezcan en un historial antiguo.
