# Diseño · Reestructuración modular del Artefacto MML

**Fecha:** 2026-09-02
**Proyecto:** Artefacto MML · Formulación de Proyectos (Laboratorio DevOps · Taller Modular)
**Origen:** `ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`
**Destino:** `FormulacionProyectosModular/`

---

## 1. Propósito y alcance

Convertir un archivo HTML monolítico de 12.352 líneas en un proyecto modular con separación de responsabilidades, sin alterar el comportamiento observable de la aplicación salvo por cinco defectos que se corrigen de forma explícita.

**Dentro del alcance:**

- Separación física de CSS, JavaScript, markup y datos.
- Modularización del JavaScript con ES Modules nativos.
- División de las 11 pantallas en parciales HTML cargados bajo demanda.
- Corrección de los cinco defectos identificados en la revisión previa.
- Autoguardado en `localStorage`.
- Documento de análisis de opciones de despliegue.

**Fuera del alcance:**

- Desarrollo funcional de las pantallas 4 a 10 (permanecen como marcadores de posición).
- Renombrado de identificadores existentes.
- Refactorización de los generadores SVG.
- Pruebas automatizadas.
- Generación de `Dockerfile`, `docker-compose` o flujos de CI/CD.

---

## 2. Estado del artefacto original

| Zona | Líneas | Contenido |
|---|---|---|
| `<style>` inline | 8 – 3.093 | Hoja de estilos completa (3.084 líneas de CSS) |
| Markup | 3.096 – 5.343 | shell + 11 `<section class="screen">` |
| `<script>` inline | 5.346 – 12.351 | 92 funciones |

Distribución del JavaScript por dominio:

| Dominio | Líneas aprox. | Funciones |
|---|---|---|
| Paso 2 · Análisis del problema | ~4.000 | 30 |
| Paso 1 · Análisis de involucrados | ~1.700 | 30 |
| Paso 3 · Análisis de objetivos | ~700 | 8 |
| Shell (navegación, estado, pantallas) | ~200 | 5 |
| Utilidades transversales | ~150 | 9 |

Características estructurales relevantes para la migración:

- Un IIFE en las líneas 6878–9515 encierra 2.637 líneas. Solo exporta cuatro símbolos al ámbito global: `state`, `showScreen`, `escapeHTML`, `renderActors`. Todo lo demás queda privado por accidente, no por diseño.
- El estado vive en `window.state`, con 142 accesos directos repartidos por todo el archivo.
- El renderizado se hace con 31 asignaciones manuales a `innerHTML`.
- No existe persistencia de ningún tipo. Solo hay export/import manual de JSON.
- Los archivos `script.js` y `style.css` de la carpeta original son copias obsoletas no referenciadas por el HTML.
- `caso_uso_jovenes_rurales_manizales.json` no se carga desde ninguna parte.

---

## 3. Decisiones adoptadas

Registro completo en `docs/decisiones-tecnicas.md`. Resumen:

| # | Tema | Decisión |
|---|---|---|
| 1 | Stack | ES Modules nativos, sin bundler ni paso de compilación |
| 2 | Alcance | Migración fiel + corrección de los 5 defectos |
| 3 | Persistencia | Estático + `localStorage` |
| 4 | DevOps | Solo análisis documental, sin archivos de infraestructura |
| 5 | HTML | `index.html` mínimo + parciales en `views/` cargados por `fetch` |
| 6 | Pruebas | Sin pruebas automatizadas |
| 7 | Nomenclatura | Se conservan los nombres existentes |
| 8 | Ubicación | `docs/` dentro del proyecto, con repositorio git propio |
| 9 | Arquitectura | Enfoque híbrido: núcleo por capa + pasos por dominio |
| 10 | SVG | Migración literal, sin refactorizar |

**Consecuencia crítica de combinar (1) y (5):** la aplicación no podrá abrirse con doble clic sobre `index.html`. La política CORS bloquea `fetch` bajo el esquema `file://`. Se requerirá siempre un servidor HTTP, incluso en desarrollo local.

---

## 4. Arquitectura

### 4.1 Principio rector

Un núcleo estable del que dependen los pasos; los pasos no dependen entre sí.

```
                    ┌───────────┐
                    │  main.js  │
                    └─────┬─────┘
                          │
            ┌─────────────▼─────────────┐
            │           core/           │
            │  estado · almacenamiento  │
            │  router · navegación      │
            │  registro-pasos           │
            └─────────────┬─────────────┘
                          │  (los pasos importan del core)
        ┌────────┬────────┼────────┬────────┐
        ▼        ▼        ▼        ▼        ▼
     paso0    paso1    paso2    paso3    (paso4…)

        └──────── ninguno importa de otro ────────┘

                       utils/
        (dom · svg · texto · portapapeles — sin estado)
```

La regla «ningún paso importa de otro paso» es la que hace verificable la independencia de módulos. Cualquier necesidad de comunicación entre pasos se resuelve a través del estado.

### 4.2 Estructura de directorios

```
FormulacionProyectosModular/
├── index.html
├── README.md
├── .gitignore
├── views/
│   ├── screen00-ficha.html
│   ├── screen01-involucrados.html
│   ├── screen02-problema.html
│   ├── screen03-objetivos.html
│   ├── screen04-estrategia.html
│   ├── screen05-estructura-analitica.html
│   ├── screen06-resumen-narrativo.html
│   ├── screen07-indicadores.html
│   ├── screen08-medios-verificacion.html
│   ├── screen09-supuestos.html
│   └── screen10-evaluacion-intermedia.html
├── css/
│   ├── main.css
│   ├── base/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   └── tipografia.css
│   ├── layout/
│   │   ├── shell.css
│   │   ├── sidebar.css
│   │   └── wizard.css
│   ├── components/
│   │   ├── botones.css
│   │   ├── campos.css
│   │   ├── cards.css
│   │   ├── tablas.css
│   │   ├── badges.css
│   │   ├── tabs.css
│   │   └── svg.css
│   └── pasos/
│       ├── paso1-involucrados.css
│       ├── paso2-problema.css
│       └── paso3-objetivos.css
├── js/
│   ├── main.js
│   ├── core/
│   │   ├── estado.js
│   │   ├── almacenamiento.js
│   │   ├── router.js
│   │   ├── navegacion.js
│   │   └── registro-pasos.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── svg.js
│   │   ├── texto.js
│   │   └── portapapeles.js
│   └── pasos/
│       ├── paso0-ficha/
│       │   └── index.js
│       ├── paso1-involucrados/
│       │   ├── index.js
│       │   ├── modelo.js
│       │   ├── formulario.js
│       │   ├── tablas.js
│       │   ├── grafico-poder-interes.js
│       │   ├── grafico-red.js
│       │   ├── validacion.js
│       │   └── tecnicas.js
│       ├── paso2-problema/
│       │   ├── index.js
│       │   ├── contexto.js
│       │   ├── enunciado.js
│       │   ├── modelo.js
│       │   ├── nodos.js
│       │   ├── arbol-svg.js
│       │   ├── evidencia.js
│       │   ├── validacion.js
│       │   ├── bitacora.js
│       │   └── prompts.js
│       └── paso3-objetivos/
│           ├── index.js
│           ├── sincronizacion.js
│           ├── transformacion.js
│           ├── propuestas.js
│           └── supuestos.js
├── data/
│   └── caso_uso_jovenes_rurales_manizales.json
└── docs/
    ├── analisis-despliegue.md
    ├── decisiones-tecnicas.md
    └── superpowers/specs/
```

### 4.3 Aplicación de SOLID

| Principio | Situación actual | Cómo se aplica |
|---|---|---|
| **SRP** | Un IIFE anónimo de 2.637 líneas concentra el estado, la navegación, todo el módulo de involucrados y todo el de objetivos: cuatro motivos de cambio en un solo ámbito | Cada módulo tiene un único motivo de cambio. Ningún archivo supera las ~400 líneas, salvo los generadores SVG que se migran literalmente |
| **OCP** | Añadir un paso obliga a editar el IIFE y el array `NAV` | Añadir un paso es registrarlo en `registro-pasos.js`. El shell no cambia |
| **LSP** | No aplica: no hay polimorfismo | Todos los módulos de paso cumplen el mismo contrato y son intercambiables desde el router |
| **ISP** | `state` es global: cualquier función alcanza cualquier parte del modelo | Los módulos de `utils/` no reciben el estado, solo argumentos. El acceso al modelo pasa por `core/estado.js`. Cumplimiento parcial y declarado: ver la limitación de encapsulamiento en §5.1 |
| **DIP** | El Paso 3 llama directamente a las funciones de nodos del Paso 2 | El Paso 3 depende de la interfaz de lectura del estado, no del módulo del Paso 2 |

---

## 5. Componentes del núcleo

### 5.1 `core/estado.js`

Sustituye a `window.state`. El objeto queda privado al módulo y se expone mediante funciones de acceso.

**Responsabilidad:** ser la única fuente de verdad del modelo de datos y notificar cambios.

**Interfaz:**

```js
export function obtenerEstado()        // devuelve el objeto vivo
export function notificarCambio()      // avisa a los suscriptores tras mutar
export function cargarEstado(objeto)   // usado por importar JSON y por localStorage
export function reiniciarEstado()
export function suscribir(callback)    // devuelve función para cancelar
export function estadoInicial()        // fábrica del objeto por defecto
```

**Por qué `obtenerEstado()` devuelve el objeto vivo y no una copia.** De los 142 accesos a `state` en el original, una parte son mutaciones directas (`state.nodos.push(...)`, `state.problema.condicion = ...`). Devolver una copia defensiva las descartaría en silencio y obligaría a reescribir cada punto de mutación con una función de acceso propia: dejaría de ser una migración mecánica y multiplicaría la superficie de error, justo en un proyecto sin pruebas automatizadas.

La contrapartida es que el encapsulamiento es de *alcance*, no de *escritura*: se elimina la variable global `window.state` y se centraliza la notificación de cambios, pero un módulo aún puede mutar el objeto. Es una limitación consciente. Endurecerla —sustituyendo cada mutación por una función de acceso por dominio— es una mejora posterior que conviene abordar cuando existan pruebas que la respalden.

**Restricción de migración:** la *forma* del objeto de estado no cambia. Las claves (`current`, `caso`, `involucrados`, `editingActorIndex`, `problema`, `nodos`, `objetivos`, `acciones`, `alternativas`, `evaluacion`, `seleccion`, `bitacora`) se conservan literalmente, para que el JSON exportado por la versión actual siga siendo importable por la nueva.

### 5.2 `core/almacenamiento.js`

**Responsabilidad:** persistir y recuperar el estado.

- Se suscribe a `estado.js` y guarda en `localStorage` con *debounce* de 500 ms bajo la clave `artefacto-mml:borrador`.
- Al arrancar, si existe borrador, ofrece restaurarlo antes de mostrar la pantalla inicial.
- Reubica `exportStateJSON` e `importStateJSON` (líneas 12069 y 12093 del original).
- Expone `descartarBorrador()`.

**Manejo de errores:** toda lectura y escritura va envuelta en `try/catch`. Si `localStorage` no está disponible (modo incógnito, cuota agotada, cookies bloqueadas), la aplicación continúa funcionando sin persistencia y muestra un aviso no bloqueante. El autoguardado nunca puede impedir el uso del artefacto.

### 5.3 `core/router.js`

Sustituye a `showScreen` (línea 7002).

**Responsabilidad:** resolver qué pantalla mostrar, cargar su parcial y delegar el ciclo de vida al módulo del paso.

Flujo de `irAPantalla(id)`:

1. Consultar la caché de parciales. Si falta, `fetch('views/…')` y almacenar.
2. Inyectar el markup en el contenedor principal.
3. Si el módulo del paso no se ha inicializado, invocar su `init(contenedor)` y marcarlo.
4. Invocar su `render()`.
5. Actualizar el estado de navegación y el encabezado.

**Caché:** cada parcial se descarga una sola vez por sesión. La navegación entre pasos ya visitados no genera peticiones de red.

**Manejo de errores:** si `fetch` falla (404, offline, `file://`), se captura y se pinta un mensaje de error visible en el contenedor con la causa y la indicación de que la aplicación requiere un servidor HTTP. No se deja la pantalla en blanco.

### 5.4 `core/navegacion.js`

Contiene el array `NAV` (línea 6879) y las funciones `buildNav` (6968) y `updateHeader` (7036). Construye la barra lateral a partir del registro de pasos.

### 5.5 `core/registro-pasos.js`

Único punto donde se enumeran los módulos de paso. Es la pieza que materializa OCP.

```js
import paso0 from '../pasos/paso0-ficha/index.js';
// …
export const PASOS = [paso0, paso1, paso2, paso3, /* … */];
```

### 5.6 Contrato de módulo de paso

Todo módulo de paso exporta por defecto un objeto con esta forma:

```js
export default {
  id: 2,                          // number
  titulo: 'Análisis del problema', // string
  grupo: 'Análisis situacional',   // string, para agrupar en la barra lateral
  etiquetaPaso: 'Paso 2',          // string | null (screen0 no tiene paso)
  vista: 'views/screen02-problema.html',
  init(contenedor) {},             // una sola vez: registra listeners
  render() {},                     // en cada entrada: repinta desde el estado
  validar() { return { valido: true, mensajes: [] }; }
};
```

`init` recibe el contenedor ya poblado con el markup del parcial, de modo que los `addEventListener` siempre encuentran sus elementos.

### 5.7 `utils/`

Módulos sin estado, sin dependencias del núcleo:

- **`dom.js`** — `escapeHTML` (línea 7779), selectores con guarda que registran en consola cuando no encuentran el elemento en lugar de lanzar excepción.
- **`svg.js`** — `svgEl` (8226), `addSvgText` (8239), `svgText` (10439), `splitSvgLabel` (8850).
- **`texto.js`** — `normalizeLines` (7772), `normalizeTextForValidation` (8899), `containsAny` (8909), `formatProblemLogDate` (6816).
- **`portapapeles.js`** — unifica `copyAIPrompt` (9394), `copyProblemPrompt` (11749), `fallbackCopyProblemPrompt` (11801) y `writeProblemPrompt` (11825) en una sola función con respaldo para navegadores sin `navigator.clipboard`.

---

## 6. Módulos de paso

### 6.1 Paso 0 · Ficha del caso

`bindCaseField` (9493) e `iniciarWizard` (5346). El módulo más pequeño; sirve de referencia del contrato.

### 6.2 Paso 1 · Involucrados

| Módulo | Funciones migradas |
|---|---|
| `modelo.js` | `actorValue`, `actorPositionLabel`, `actorPositionClass`, `actorQuadrant`, `calculateActorResult`, `actorIsComplete`, `natureColor`, `actorPointColor` |
| `formulario.js` | `clearActorForm`, `readActorForm`, `fillActorForm`, `saveActor`, `editActor`, `deleteActor` |
| `tablas.js` | `renderMainActorTable`, `renderCharacterization` |
| `grafico-poder-interes.js` | `drawInterestPowerChart` con `xScale` e `yScale` |
| `grafico-red.js` | `drawStakeholderNetwork` |
| `validacion.js` | `validateActor`, `actorValidationMessages`, `renderActorValidations` |
| `tecnicas.js` | `renderTechniqueHelp` — **una sola copia** |
| `index.js` | `initActorModule`, `renderActors` |

### 6.3 Paso 2 · Problema

| Módulo | Funciones migradas |
|---|---|
| `contexto.js` | `prepararPaso2`, `renderProblemContext` |
| `enunciado.js` | `composeCentralProblem`, `bindProblemCentralFields`, `validateCentralProblem`, `confirmCentralProblem` |
| `modelo.js` | `nextNodeCode`, `createsCycle` |
| `nodos.js` | `addProblemNode`, `deleteProblemNode`, `refreshNodeParentOptions`, `renderProblemNodes`, `renderProblemNodeList`, `renderTreeNode` |
| `arbol-svg.js` | `renderProblemTree` con `groupByLevel`, `hierarchyColor`, `distribute`, `drawConnector`, `drawNode` |
| `evidencia.js` | `renderNodeEvidence` con `requirement` y `confidenceClass` |
| `validacion.js` | `runProblemValidation`, `renderProblemValidationResults`, `saveProblemExternalValidation`, `saveProblemValidationDecision` |
| `bitacora.js` | `addProblemLog`, `renderProblemBitacora`, `deleteProblemLog`, `clearProblemLogForm` |
| `prompts.js` | `renderProblemModule`, `generateProblemPrompt` con `formatNodes` |
| `index.js` | `showProblemSubscreen`, orquestación de subpantallas |

### 6.4 Paso 3 · Objetivos

| Módulo | Funciones migradas |
|---|---|
| `sincronizacion.js` | `syncObjectivesFromProblemNodes` |
| `transformacion.js` | `renderObjectiveTransformation`, `updateObjectiveValue` |
| `propuestas.js` | `generateObjectiveProposals`, `proposePositiveState` |
| `supuestos.js` | `toggleObjectiveAssumption`, `renderObjectiveAssumptions` |
| `index.js` | `showObjectiveSubscreen` |

### 6.5 Pasos 4 a 10

Parciales con el markup de marcador de posición actual y, cada uno, un módulo mínimo que cumple el contrato con `init` y `render` vacíos. Quedan registrados y navegables desde el primer día.

---

## 7. Corrección de defectos

| # | Defecto | Ubicación original | Resolución |
|---|---|---|---|
| 1 | `copyAIPrompt`, `editActor`, `deleteActor`, `generateObjectiveProposals` y `updateObjectiveValue` son privadas del IIFE pero se invocan desde atributos `onclick`/`onchange` del HTML: lanzan `ReferenceError` | 9394, 8018, 8029, 7373, 7588 | Desaparece el IIFE. Se eliminan todos los atributos `on*` del markup y se sustituyen por `addEventListener` en el `init()` del módulo correspondiente. Para elementos generados dinámicamente se usa delegación de eventos en el contenedor del paso |
| 2 | `id="problemPopulation"` duplicado. `getElementById` devuelve el `<input>` de contexto, de modo que el `<textarea>` del enunciado central nunca se lee ni se enlaza | 3810 y 3899 | Los dos campos quedan en parciales distintos. El del enunciado pasa a `problemCentralPopulation`, con su `<label for>` actualizado y binding explícito en `enunciado.js` |
| 3 | `continuarAlPaso3` comprueba `typeof syncObjectivesFromProblemNodes === "function"` sobre una función privada del IIFE: la condición es siempre falsa y la sincronización nunca ocurre, sin error visible | 6852 | `import { sincronizarDesdeProblema }`. Se elimina la comprobación `typeof`. Una dependencia rota pasa a ser un fallo visible de carga de módulo, no un silencio |
| 4 | `renderTechniqueHelp` definida dos veces, con cuerpos byte a byte idénticos | 9253 y 9322 | Una única definición en `paso1-involucrados/tecnicas.js` |
| 5 | `<div class="card">` sin cerrar; lo cierra implícitamente el `</section>`, dejando `.wizard-actions` anidado dentro del card | 3464 / 3725 | Se corrige al extraer el markup a `views/screen01-involucrados.html` |

Cada corrección se registra en `README.md` con referencia a la línea del archivo original, para que sea verificable.

---

## 8. Estrategia de migración y control de riesgo

### 8.1 Método

La migración es mecánica. Por cada función:

1. Se copia el cuerpo **sin editarlo**.
2. Se añade `export`.
3. Se sustituyen los accesos a `window.state` por las funciones de `core/estado.js`.
4. Se añaden los `import` necesarios.

No se renombra, no se reordena lógica, no se «mejora de paso». Cualquier mejora que no esté en la sección 7 queda fuera.

### 8.2 Riesgo asumido

Sin pruebas automatizadas, la verificación de que el comportamiento se conserva depende de la comprobación manual en navegador por parte del responsable del proyecto. Este es el riesgo principal del proyecto y se acepta de forma consciente.

Mitigaciones:

- **El artefacto original permanece intacto** en `ArtefactoUnal/`, lo que permite comparación lado a lado en dos pestañas.
- **Migración incremental por pasos**, con la aplicación funcionando al terminar cada etapa. Un fallo queda acotado a la etapa que lo introdujo.
- **Verificación estática antes de cada entrega:** `node --check` sobre cada módulo, y un barrido que cruza `import`/`export` contra los usos reales para detectar referencias colgantes, incluidos los atributos `on*` residuales en los parciales.
- **Commits atómicos por etapa**, para poder revertir una sola.

### 8.3 Orden de ejecución

| Etapa | Contenido | Verificable al terminar |
|---|---|---|
| 1 | Documento de análisis de despliegue | Lectura |
| 2 | Esqueleto de directorios, `git init`, `.gitignore` | `git status` limpio |
| 3 | Extracción y división del CSS | Estilos idénticos al original |
| 4 | `core/` y `utils/` | La aplicación arranca y muestra la pantalla 0 |
| 5 | Los 11 parciales en `views/` | Navegación entre las 11 pantallas |
| 6 | Paso 0 y Paso 1 | Alta, edición y borrado de actores; los 2 gráficos SVG |
| 7 | Paso 2 | Enunciado, nodos, árbol SVG, evidencia, validación, bitácora, prompts |
| 8 | Paso 3 | Sincronización desde el Paso 2, propuestas, supuestos |
| 9 | Pasos 4 a 10 como marcadores | Navegación completa |
| 10 | Barrido de referencias, `localStorage`, `README.md` | Recarga de página conservando el trabajo |

---

## 9. Documento de análisis de despliegue

`docs/analisis-despliegue.md`. Estructura:

1. **Contexto y restricciones** — naturaleza estática del artefacto, ausencia de backend, ausencia de datos personales conforme a la Ley 1581 de 2012, y el requisito de servidor HTTP derivado del uso de `fetch`.
2. **Dimensión A · Arquitectura frontend** — ES Modules nativos, Vite, Webpack, frameworks SPA. Para cada opción: funcionamiento, beneficios, costos, soporte de navegador e implicación sobre el despliegue.
3. **Dimensión B · Servidor y hosting** — servidores de desarrollo (`python3 -m http.server`, `npx serve`), Nginx, Apache, Node/Express, y plataformas de hosting estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages, Firebase Hosting).
4. **Dimensión C · Empaquetado y automatización** — despliegue manual, Docker con Nginx, CI/CD con GitHub Actions.
5. **Cuadro comparativo** con criterios ponderados: complejidad de configuración, costo, rendimiento, reproducibilidad, curva de aprendizaje, encaje con el taller DevOps y mantenibilidad.
6. **Decisión final** argumentada, con las opciones descartadas y su motivo, y la ruta de evolución que indicaría cuándo tendría sentido incorporar un bundler o contenedores.

El documento analiza todas las opciones; no genera archivos de infraestructura.

---

## 10. Criterios de aceptación

1. `FormulacionProyectosModular/` es un repositorio git con el árbol de la sección 4.2.
2. La aplicación se sirve por HTTP y las 11 pantallas son navegables.
3. Los Pasos 0 a 3 conservan la funcionalidad del artefacto original, verificada manualmente contra él.
4. Los cinco defectos de la sección 7 están corregidos y documentados con referencia a su línea original.
5. No queda ningún atributo `on*` en el markup ni ninguna referencia colgante entre módulos.
6. El trabajo persiste tras recargar la página, y el JSON exportado por el artefacto original sigue siendo importable.
7. Existen `docs/analisis-despliegue.md` y `docs/decisiones-tecnicas.md`.
8. `README.md` documenta cómo levantar el proyecto y qué defectos se corrigieron.
