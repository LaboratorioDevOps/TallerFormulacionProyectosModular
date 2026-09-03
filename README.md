# Artefacto MML · Formulación de Proyectos

Aplicación web educativa para la formulación de proyectos con la Metodología
de Marco Lógico (CEPAL/ILPES). Versión modular de
`ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html` (12.352 líneas,
monolítico, con JavaScript embebido en un único `<script>` y CSS en un único
`<style>`).

## Cómo ejecutarlo

La aplicación carga sus pantallas con `fetch`, que el navegador bloquea bajo
el esquema `file://`. **No funciona abriendo `index.html` con doble clic.**
Hay que servirla por HTTP:

```bash
python3 -m http.server 8000
# después, abrir http://localhost:8000
```

Cualquier servidor estático sirve (`npx serve`, `php -S`, Nginx…).

## Estructura

| Carpeta | Contenido |
|---|---|
| `views/` | Las 11 pantallas como parciales HTML, cargados bajo demanda |
| `css/` | Estilos: `base/`, `layout/`, `components/`, `pasos/`. Punto de entrada: `main.css` |
| `js/core/` | Estado, almacenamiento, router, navegación y registro de pasos |
| `js/utils/` | Utilidades sin estado: DOM, SVG, texto, portapapeles |
| `js/pasos/` | Un módulo por paso metodológico |
| `data/` | Caso de ejemplo (`caso_uso_jovenes_rurales_manizales.json`) |
| `docs/` | Análisis de despliegue, decisiones técnicas, spec y plan |
| `tools/` | `verificar.sh`, comprobación estática del proyecto |

### Añadir un paso

Crear `js/pasos/pasoN-nombre/index.js` con un `export default` que cumpla el
contrato, y registrarlo en `js/core/registro-pasos.js`. Nada más cambia.

```js
export default {
  id, titulo, grupo, etiquetaPaso, vista,
  init(contenedor) {},  // una vez: registra listeners por delegación
  render() {}           // en cada entrada: repinta desde el estado
};
```

Regla que el verificador comprueba: **ningún paso importa de otro paso.**

## Verificación

```bash
bash tools/verificar.sh
```

Comprueba sintaxis de los módulos, ausencia de manejadores `on*` en el
markup, aislamiento entre pasos, resolución de imports y ausencia de estado
global. El proyecto no tiene pruebas automatizadas: la verificación
funcional es manual, contra el artefacto original.

## Estado actual

Pasos 0 a 3 funcionales (Ficha, Involucrados, Análisis del problema,
Análisis de objetivos). Pasos 4 a 10 registrados y navegables, con su
markup, pero sin lógica (marcadores).

La cabecera global incluye autoguardado del estado en `localStorage`
(`js/core/almacenamiento.js`), restauración del borrador al recargar, y
botones "Exportar JSON" / "Importar JSON" para volcar o cargar el estado
completo como archivo.

## Datos de ejemplo

`data/caso_uso_jovenes_rurales_manizales.json` es un caso de ejemplo. Como
en el artefacto original, no se carga automáticamente desde ninguna parte
de la aplicación; conectarlo (p. ej. un botón "Cargar caso de ejemplo") es
trabajo futuro, fuera del alcance de este plan.

## Defectos corregidos respecto al artefacto original

| # | Defecto | Líneas ORIG | Corrección |
|---|---|---|---|
| 1 | `copyAIPrompt`, `editActor`, `deleteActor`, `generateObjectiveProposals` y `updateObjectiveValue` eran privadas de un IIFE pero se invocaban desde atributos `onclick` del markup: lanzaban `ReferenceError` al pulsar el botón | `copyAIPrompt` 9394, `editActor` 8018, `deleteActor` 8029, `generateObjectiveProposals` 7373, `updateObjectiveValue` 7588 | Eliminado el IIFE. Las funciones se exportan (`formulario.js`, `portapapeles.js`, `propuestas.js`, `transformacion.js`) y el `index.js` de cada paso las conecta por delegación de eventos sobre el contenedor, usando marcadores `data-accion` en vez de `onclick` inline |
| 2 | Dos elementos con `id="problemPopulation"`: un `<input>` en la subpantalla «Contexto» y un `<textarea>` en «Enunciado». `getElementById` devolvía siempre el primero, así que lo que el usuario escribía en el textarea del enunciado central nunca llegaba al estado ni se validaba | 9592, 9645, 9671, 9808 (uso del id duplicado en la subpantalla «Enunciado») | El textarea de «Enunciado» pasa a `id="problemCentralPopulation"` en `views/screen02-problema.html`; `enunciado.js` referencia el nuevo id. El input de «Contexto» conserva `problemPopulation` sin cambios |
| 3 | `continuarAlPaso3()` comprobaba `typeof syncObjectivesFromProblemNodes === "function"` sobre una función privada de un IIFE: la condición era siempre falsa, la sincronización de objetivos nunca se ejecutaba, sin ningún error visible | 6842-6874 (`continuarAlPaso3`), 7045-7100 (`syncObjectivesFromProblemNodes`) | `syncObjectivesFromProblemNodes` se exporta desde `paso3-objetivos/sincronizacion.js` y `paso3-objetivos/index.js` la importa e invoca directamente, sin `typeof`: un import roto falla de forma visible al cargar el módulo, nunca en silencio |
| 4 | `renderTechniqueHelp` estaba definida dos veces, con cuerpos idénticos byte a byte; la segunda definición pisaba a la primera | 9253-9319 y 9322-9388 | Una sola definición, en `paso1-involucrados/tecnicas.js` |
| 5 | Un `<div class="card">` sin cerrar en la pantalla de involucrados dejaba `.wizard-actions` anidado dentro de la tarjeta en vez de ser hermano de ella | 3464 (aprox., bloque de la pantalla de involucrados) | Corregido al extraer `views/screen01-involucrados.html` como parcial independiente |

Números de línea referidos a
`ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`, que se conserva
intacto como referencia.

## Hallazgos adicionales (no corregidos)

Durante la migración se detectó un sexto defecto en el artefacto original,
fuera del alcance de los 5 defectos que esta spec pedía corregir. Se
documenta pero **no se corrige**, y se migró literalmente igual que en el
original:

- En el módulo de análisis del problema, `renderProblemContext`
  (`js/pasos/paso2-problema/contexto.js`, función original en ORIG
  6399-6450) y `generateProblemPrompt`
  (`js/pasos/paso2-problema/prompts.js`, original en ORIG 11315-11747) leen
  `problema.cond` y `problema.delim`. Ninguna parte del código —original ni
  migrado— escribe esas claves: quien escribe el estado del problema
  (`enunciado.js`, función `confirmCentralProblem`) usa
  `estado.problema.condicion` y `estado.problema.delimitacion`. En
  `generateProblemPrompt` el efecto es inocuo porque el propio código
  intenta primero `problema.condicion` y solo cae a `problema.cond` como
  respaldo (`problema.condicion || problema.cond || ""`); pero en
  `renderProblemContext`, que solo lee `problema.cond` / `problema.delim`
  sin ese respaldo, los campos de condición y delimitación de la
  subpantalla «Contexto» quedan permanentemente vacíos aunque el usuario
  ya haya completado el enunciado central del problema.

## Limitaciones conocidas

- `obtenerEstado()` devuelve el objeto vivo, no una copia: un módulo puede
  mutar el estado sin pasar por el núcleo. Ver §5.1 de la spec
  (`docs/decisiones-tecnicas.md`).
- Sin pruebas automatizadas; la verificación es estática
  (`tools/verificar.sh`) más recorrido manual.
- Sin persistencia de servidor: el estado vive en memoria y en
  `localStorage` del navegador (autoguardado/borrador), igual que el
  artefacto original no tenía backend. No hay `writeAssignments()` ni
  ningún otro mecanismo de guardado remoto — es una limitación heredada,
  no introducida por la migración.
- Los generadores SVG (~1.100 líneas, en `paso2-problema/arbol-svg.js` y
  `paso1-involucrados/grafico-poder-interes.js` / `grafico-red.js`) se
  migraron literalmente, sin refactorizar.
- Nomenclatura mezclada entre español e inglés, heredada del original
  (identificadores de campos del DOM en inglés, funciones y comentarios de
  la migración en español).
- Ver la sección "Hallazgos adicionales" arriba para un bug preexistente
  del artefacto original que no se corrigió por estar fuera del alcance de
  esta spec.
