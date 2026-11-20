# Arquitectura de AtC/OS

## Estado actual

Aplicación estática sin dependencias externas que carga scripts con `defer` en orden. El espacio de nombres `window.AtCOS` contiene módulos independientes (`Data`, `Store`, `Engine`, `Desktop`, `Views`, `Icons`, `PDF`, `App`). Una evolución futura a módulos ES o TypeScript puede hacerse gradualmente: **no requiere reescribir los canales ahora mismo**.

**Capas:**

1. **Contenido:** `data/registry.js`, `branding.js`, `i18n.js`, `clients.js`, `orders.js`, `catalog.js` y `scenarios/*.js`. El registro `Data.addCases` comprueba ID único, canal, campos y pasos mínimos.
2. **Dominio:** `js/engine.js`: flujo de guiones, estados por conversación, llegada por progreso y registro de acciones. No interpreta respuestas.
3. **Persistencia:** `js/state.js`, localStorage y clave versionada `atc-os-session-v1`. Se intenta migrar la clave anterior de la misma procedencia.
4. **Presentación:** `js/views.js` para la interfaz de cada canal; `js/desktop.js` para el gestor de ventanas, menú Inicio, ajustes y tray.
5. **Orquestación:** `js/app.js` enlaza eventos del DOM, inicio, personalización y transición a la oficina.
6. **Salida:** `js/pdf.js` genera documento A4 local, descargable o abrible por Blob.

## Esquema conceptual

```text
AtCOS.Data.cases[]
  └─ escenario { id, channel, client, order?, arrival, title, steps[] }
           └─ paso { incoming: {es,ca}, prompt: {es,ca}, requiresFlag? }
AtCOS.Engine.state
  └─ cases[] {id,revealed,complete,step,messages[],draft,actions[],note,flags{}}
      ├─ messages[] {role, text, at, kind}
      └─ actions[] {type,at}
```

El alumno escribe libremente: `Engine.send(caseId, text)` guarda literalmente la respuesta, avanza el guion y registra la hora. Las consecuencias posteriores solo pueden depender de estados y acciones verificables. El profesor revisa el PDF después.

## Riesgos y evolución

- **Cambios en el banco:** al pasar de seis a decenas de casos, adaptar `buildSession` para seleccionar una muestra y reemplazar `Store.validate` (ahora compara con todo el banco) por IDs y versiones explícitas.
- **Ramas:** definir un DSL de acciones y condiciones, no código JS embebido en los casos.
- **Renderización:** `views.js` seguirá siendo el primer candidato a descomponer en `channels/*.js` cuando haya nuevos estilos y comportamientos específicos.
- **Seguridad:** todo mensaje de usuario debe escaparse antes de insertar en HTML. Los datos del alumno permanecen locales; GitHub Pages no los recoge por sí mismo.
- **PDF:** probar caracteres fuera de WinAnsi y gran volumen de texto antes de decidir cambiar la biblioteca.
- **Pruebas:** mantener casos deterministas, validar referencias entre clientes/pedidos/escenarios y testear rutas completas en Chromium en ambos idiomas.
