# Hoja de ruta AtC/OS

- **v0.4 — Publicación en GitHub:** primera base funcional con escritorio virtual, cinco canales y seis casos piloto.
- **v0.5 — Núcleo de sistema operativo:** arranque, login local, configuración inicial, escritorio vacío, barra dinámica, Inicio con apagar/reiniciar, Tareas, Configuración y filesystem virtual inicial. Eliminada por completo la atención presencial; quedan cinco casos piloto en cuatro canales.
- **v0.6 — Aplicaciones completas:** separar las vistas de cada canal, correo más profundo (adjuntos y conversaciones), aplicaciones independientes de Pedidos y Clientes, accesibilidad y navegación.
- **v0.7 — Banco educativo:** 25–30 casos etiquetados con dificultad, RA, dependencias y variedad; jornadas de 10–12 seleccionadas por reglas equilibradas.
- **v0.8 — Sistema documental:** IndexedDB para archivos reales y gestión de formatos binarios, previsualización gráfica e historial de encargos.
- **v0.9 — Validación docente:** informes más amplios, pruebas exhaustivas bilingües y ensayos en ordenadores de aula y en Google Sites.
- **v1.0 — Aula:** estabilidad y documentación para el alumnado.

**Cada versión solo cuenta como implementada después de pruebas y publicación.** La arquitectura separa deliberadamente el sistema operativo del motor de simulación.

## Estado v0.7 (noviembre de 2026)

Se recuperaron los accesos del escritorio y el quinto canal (presencial), incorporando Papelera, botón Inicio centrado, tamaños de ventana recordados y editor de Correo desplegable. Los 6 casos siguen siendo pilotos; falta ampliar el banco, completar el tema retro98 y validar manualmente la experiencia incrustada en Google Sites.

## Decisiones confirmadas v0.8

Se descarta definitivamente la atención presencial del simulador actual; el banco futuro tendrá cuatro canales. Los documentos recibidos dejan de ser nombres en el pedido y se incorporan al sistema virtual con contenido, acceso desde el caso y estado de archivo verificable. El tema retro Windows 98 sigue como mejora futura, no publicada.
