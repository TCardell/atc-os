# AtC/OS — Oficina Virtual

**Simulador educativo de atención al cliente en artes gráficas.** La persona que juega utiliza un escritorio virtual con Correo, Mensajería, Teléfono, Mostrador, Comentarios en Instagram y Archivos. Las respuestas se redactan libremente, se registran y se exportan como PDF para revisión del profesorado. La aplicación **no simula entender el contenido escrito**.

**Estado:** v0.4 — base funcional migrada desde *Central de Clientes 2 v0.3*. Incluye seis escenarios piloto, no el banco definitivo.

**Probar online:** https://tcardell.github.io/atc-os/ (una vez activado GitHub Pages en el repositorio).

## Ejecutar

La aplicación es estática. Para desarrollo, servir la carpeta raíz (no hace falta instalar dependencias):

```bash
python -m http.server 8000
# http://localhost:8000/
```

También es posible abrir `index.html` directamente, aunque servirlo por HTTP evita restricciones de origen en navegadores.

## Calidad y publicación

Requiere Node.js 20+ **solo para comprobaciones y compilación estática**:

```bash
npm run check     # dependencias y validación de casos
npm test          # test unitarios de datos
npm run build     # prepara dist/ para Pages
npm run ci        # las tres comprobaciones
```

No se usan dependencias npm externas. En GitHub, `ci.yml` verifica los cambios y `pages.yml` publica `dist/` en la rama `main`. **La primera vez:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. Si el despliegue todavía no aparece, revisar Actions → *Deploy AtC/OS to GitHub Pages*.

## Estructura

```text
index.html                  Portal y escritorio virtual
css/app.css                 Estilos base y formularios
css/desktop.css             Sistema de ventanas, panel Inicio, barra inferior
js/icons.js                 Iconografía vectorial SVG
js/state.js                 Guardado automático local y migración de sesión anterior
js/engine.js                Sesión, eventos, respuestas, acciones y estados
js/views.js                 Vistas y componentes de los cinco canales
js/desktop.js               Ventanas, acoplamiento, barra y notificaciones
js/pdf.js                   Generador de informe descargable
js/app.js                   Inicialización, eventos y orquestación

data/registry.js            Registro validado de escenarios
 data/branding.js           12 colores corporativos
 data/i18n.js               Etiquetas castellano/catalán
 data/clients.js            CRM ficticio
 data/orders.js             Pedidos y metadatos
 data/catalog.js            Manual de consulta
 data/scenarios/pilot.js    6 casos piloto; futuros módulos aquí
assets/                     Recursos gráficos locales
scripts/                    Validación y empaquetado sin dependencias
.github/workflows/          CI y despliegue a GitHub Pages
tests/                      Tests del contenido y recorridos de navegador
```

### Cómo añadir nuevos casos

1. Crear `data/scenarios/<coleccion>.js` con una IIFE, `const L=AtCOS.Data.L` y `AtCOS.Data.addCases([...])`.
2. Cada caso necesita `id` único, `channel` (`email`, `messages`, `phone`, `desk`, `social`), `client`, `order` opcional, `arrival`, `kind`, `title` y un array de `steps`.
3. Cada paso debe tener `incoming: L('Español','Català')` y `prompt: L('Español','Català')`. No escribir guiones que den por hecho lo que el alumno redactó.
4. Añadir la referencia al nuevo `<script defer ...>` **después de `data/registry.js` y de los demás datos, pero antes de `js/engine.js`**.
5. Ejecutar `npm run ci` y comprobar un recorrido completo en ambos idiomas.

```js
(()=>{
 const L=AtCOS.Data.L;
 AtCOS.Data.addCases([{id:'email02',channel:'email',client:'laura',order:'P-1847',
   title:L('Consulta adicional','Consulta addicional'),subject:L('Pedido','Comanda'),
   arrival:0,kind:'email',steps:[{incoming:L('Mensaje recibido','Missatge rebut'),
   prompt:L('Redacta una respuesta','Redacta una resposta')}]
 }]);
})();
```

Para incorporar nuevos clientes y pedidos, ampliar los módulos `data/clients.js` y `data/orders.js`.

## Principios a mantener

- **Simulación sin IA:** el programa registra las respuestas pero no las comprende; los acontecimientos avanzan mediante guiones y acciones estructuradas.
- **Trabajo en una sola sesión:** no hay exportación/importación manual del progreso. El guardado local es una protección ante recargas accidentales y no debe considerarse almacenamiento permanente.
- **Privacidad:** no hay servidor, analítica ni envío de respuestas. El alumnado descarga su PDF y lo entrega por Classroom.
- **Interfaz:** escritorio con menú Inicio, barra de tareas, iconos SVG, ventanas redimensionables y acoplamiento lateral.
- **Bilingüismo:** todo caso nuevo debe tener versiones `es` y `ca`.
- **Estabilidad:** no cambiar `state` ni el esquema de escenarios sin actualizar validaciones y pruebas. Al ampliar el banco, habrá que versionar o migrar el estado guardado, pues la validación actual exige que su cantidad de casos coincida.

## Pendientes de producto

Ampliar escenarios, mejorar accesibilidad por teclado de ventanas, separar componentes de vistas extensas, incorporar un motor PDF Unicode de terceros si la longitud/diversidad de textos crece mucho y validar descarga desde un Google Sites real. No se promete una nota automática: el PDF es para corrección docente.

Consulta `docs/ARCHITECTURE.md` y `docs/ROADMAP.md` para ampliar el proyecto.
