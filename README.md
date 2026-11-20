# AtC/OS — Virtual Graphic Office

**Simulador educativo de atención al cliente en una empresa de artes gráficas.** El alumnado trabaja en un escritorio virtual con correo, mensajería, teléfono, comentarios de Instagram, archivos y tareas. Todas las respuestas son redactadas libremente y se recogen en un informe PDF para revisión del profesorado. No hay evaluación semántica automática.

**Estado:** **v0.5**, nueva base del sistema operativo. Cinco casos piloto y cuatro canales de comunicación (sin atención presencial). Todavía no es el banco definitivo.

**Web de pruebas:** https://tcardell.github.io/atc-os/

## Experiencia

1. Pantalla breve de arranque, seguida de **inicio de sesión simulado** mediante nombre de alumno. El navegador puede ofrecer continuar la partida anterior.
2. En el primer acceso se eligen idioma (castellano/catalán), nombre, emoji y color de la empresa, y apariencia.
3. El **escritorio comienza sin ventanas abiertas**. Los iconos están en el escritorio y en Inicio; la barra inferior solo muestra los programas abiertos.
4. Se puede trabajar con ventanas redimensionables/acoplables, correo, mensajes, llamadas, Instagram, Archivos, Tareas e Informes.
5. La aplicación **Archivos** permite crear carpetas y notas, mover, copiar, renombrar, enviar a la papelera, restaurar y descargar. También permite guardar adjuntos simulados desde Correo y volver a adjuntarlos.
6. **Inicio → Apagar** termina la jornada y abre el PDF. **Inicio → Reiniciar** descarta el progreso previa doble confirmación.

El checklist de **Tareas pendientes** es opcional. Las marcas manuales no se consideran una calificación.

### Limitaciones

El login no es una cuenta real; los datos se quedan en el navegador. Los archivos virtuales del piloto son documentos textuales simulados, y los PDF descargados son fichas válidas de demostración, no originales del cliente. La persistencia actual usa `localStorage`, por lo que no debe emplearse para archivos grandes. Para el banco definitivo se prevé IndexedDB. Los cambios en el ordenador físico solo ocurren cuando el usuario descarga un documento expresamente.

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
