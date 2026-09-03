# Reestructuración modular del Artefacto MML · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html` (12.352 líneas, un solo archivo) en un proyecto modular en `FormulacionProyectosModular/`, sin alterar el comportamiento observable salvo cinco defectos que se corrigen de forma explícita.

**Architecture:** ES Modules nativos sin bundler. Un núcleo (`js/core/`) con estado, almacenamiento, router y navegación; una carpeta por paso en `js/pasos/` que importa del núcleo pero nunca de otro paso; utilidades sin estado en `js/utils/`. Las 11 pantallas viven como parciales HTML en `views/`, cargados por `fetch` bajo demanda.

**Tech Stack:** HTML5, CSS3, JavaScript ES2020 (módulos nativos). Node 20.20.2 solo como herramienta de verificación sintáctica (`node --check`) — el proyecto no tiene `package.json` ni dependencias. Servidor HTTP estático para desarrollo (`python3 -m http.server`).

**Spec:** `docs/superpowers/specs/2026-09-02-artefacto-mml-modular-design.md`

---

## Global Constraints

- **Sin dependencias.** No se crea `package.json`, no se instala nada, no se añade ninguna librería externa. Node se usa exclusivamente para `node --check`.
- **Sin pruebas automatizadas.** Decisión 6 del registro de decisiones. La verificación de cada tarea es: `tools/verificar.sh` (comprobación estática) + comprobación manual en navegador contra el artefacto original. Ninguna tarea introduce un framework de pruebas.
- **Migración literal.** Al mover una función, su cuerpo se copia **sin editarlo**. Los únicos cambios permitidos son: añadir `export`, añadir `import`, y sustituir accesos a `window.state`/`state` por `obtenerEstado()`. Cualquier otra mejora está fuera de alcance salvo que la tarea la pida explícitamente.
- **Nomenclatura congelada.** No se renombra ninguna función, clave de estado, clase CSS ni `id` del DOM existente, con la única excepción del `id` duplicado `problemPopulation` (Tarea 10). Los nombres nuevos (archivos, funciones del núcleo) van en español.
- **Cero atributos `on*` en el markup.** Ningún parcial de `views/` puede contener `onclick`, `onchange`, `oninput`, `onsubmit` ni ningún otro manejador en línea. Todos los eventos se registran con `addEventListener` desde el `init()` del módulo del paso.
- **Ningún paso importa de otro paso.** `js/pasos/pasoA/**` no puede contener un `import` que apunte a `js/pasos/pasoB/**`. La comunicación entre pasos pasa por `core/estado.js`. `tools/verificar.sh` lo comprueba.
- **Forma del estado congelada.** Las claves de primer nivel son exactamente: `current`, `caso`, `involucrados`, `editingActorIndex`, `problema`, `nodos`, `objetivos`, `acciones`, `alternativas`, `evaluacion`, `seleccion`, `bitacora`. Un JSON exportado por el artefacto original debe seguir siendo importable.
- **El original es intocable.** `ArtefactoUnal/` no se modifica en ninguna tarea. Es la referencia de comparación.
- **Rutas relativas siempre.** Sin rutas absolutas ni con `/` inicial, para que el proyecto funcione servido desde un subdirectorio (p. ej. GitHub Pages).
- **Commit al final de cada tarea**, con el mensaje indicado en la tarea.

### Referencia: origen de cada función

`ORIG` designa siempre `ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`. Rangos verificados:

| Función | Líneas | Función | Líneas |
|---|---|---|---|
| `iniciarWizard` | 5346-5348 | `renderCharacterization` | 8118-8224 |
| `continuarAlPaso2` | 5349-5355 | `svgEl` | 8226-8237 |
| `prepararPaso2` | 5358-5538 | `addSvgText` | 8239-8250 |
| `runProblemValidation` | 5540-5933 | `actorPointColor` | 8252-8262 |
| `renderProblemValidationResults` | 5935-6184 | `drawInterestPowerChart` | 8264-8632 |
| `saveProblemExternalValidation` | 6186-6305 | `natureColor` | 8638-8653 |
| `saveProblemValidationDecision` | 6307-6396 | `drawStakeholderNetwork` | 8655-8848 |
| `renderProblemContext` | 6399-6450 | `splitSvgLabel` | 8850-8879 |
| `addProblemLog` | 6452-6551 | `renderActors` | 8881-8891 |
| `renderProblemBitacora` | 6553-6760 | `normalizeTextForValidation` | 8899-8907 |
| `deleteProblemLog` | 6762-6791 | `containsAny` | 8909-8916 |
| `clearProblemLogForm` | 6793-6814 | `actorValidationMessages` | 8918-9132 |
| `formatProblemLogDate` | 6816-6840 | `renderActorValidations` | 9134-9180 |
| `continuarAlPaso3` | 6842-6874 | `renderTechniqueHelp` (1.ª) | 9253-9319 |
| `NAV` (const) | 6879-6892 | `renderTechniqueHelp` (2.ª) | 9322-9388 |
| `state` (objeto) | 6895-6966 | `copyAIPrompt` | 9394-9454 |
| `buildNav` | 6968-7000 | `initActorModule` | 9456-9491 |
| `showScreen` | 7002-7031 | `bindCaseField` | 9493-9499 |
| `updateHeader` | 7036-7043 | `showProblemSubscreen` | 9521-9550 |
| `syncObjectivesFromProblemNodes` | 7045-7100 | `composeCentralProblem` | 9583-9614 |
| `renderObjectiveTransformation` | 7106-7371 | `bindProblemCentralFields` | 9617-9657 |
| `generateObjectiveProposals` | 7373-7425 | `validateCentralProblem` | 9660-9785 |
| `proposePositiveState` | 7427-7586 | `confirmCentralProblem` | 9788-9866 |
| `updateObjectiveValue` | 7588-7623 | `nextNodeCode` | 9873-9890 |
| `toggleObjectiveAssumption` | 7625-7655 | `refreshNodeParentOptions` | 9893-9939 |
| `renderObjectiveAssumptions` | 7657-7766 | `addProblemNode` | 9942-10094 |
| `actorValue` | 7768-7770 | `deleteProblemNode` | 10097-10152 |
| `normalizeLines` | 7772-7777 | `renderProblemNodes` (+`nodeCard`) | 10158-10284 |
| `escapeHTML` | 7779-7786 | `renderProblemTree` (+5 anidadas) | 10286-10968 |
| `actorPositionLabel` | 7790-7800 | `renderNodeEvidence` (+2) | 10970-11300 |
| `actorPositionClass` | 7802-7806 | `renderProblemModule` | 11302-11308 |
| `actorQuadrant` | 7808-7828 | `generateProblemPrompt` (+`formatNodes`) | 11315-11747 |
| `calculateActorResult` | 7834-7838 | `copyProblemPrompt` | 11749-11798 |
| `actorIsComplete` | 7840-7856 | `fallbackCopyProblemPrompt` | 11801-11823 |
| `clearActorForm` | 7858-7887 | `writeProblemPrompt` | 11825-11893 |
| `readActorForm` | 7889-7906 | `renderTreeNode` | 11896-11927 |
| `validateActor` | 7908-7947 | `renderProblemNodeList` | 11930-12025 |
| `fillActorForm` | 7949-7999 | `showObjectiveSubscreen` | 12031-12068 |
| `saveActor` | 8001-8016 | `exportStateJSON` | 12069-12091 |
| `editActor` | 8018-8027 | `importStateJSON` | 12093-12104 |
| `deleteActor` | 8029-8052 | `IIFE` (envoltorio) | 6878-9515 |
| `renderMainActorTable` | 8054-8116 | | |

CSS: `<style>` 8-3093 (contenido 9-3092, 3.084 líneas). Markup: shell (`.app`/sidebar/topbar) 3097-3139 · `screen0` 3141-3196 · `screen1` 3200-3725 · `screen2` 3728-4694 · `screen3` 4698-5111 · `screen4` 5114-5147 · `screen5` 5150-5178 · `screen6` 5181-5208 · `screen7` 5211-5242 · `screen8` 5245-5272 · `screen9` 5275-5304 · `screen10` 5307-5335 · nota de pie 5337-5341.

---

## Tarea 0: Documento de análisis de despliegue

Implementa la §9 de la spec. No produce código y ninguna tarea posterior depende de ella, pero es el criterio de aceptación 7 y la que fija por escrito el porqué del stack que usan todas las demás.

**Files:**
- Create: `docs/analisis-despliegue.md`

- [ ] **Step 1: Redactar las seis secciones**

| Sección | Contenido obligatorio |
|---|---|
| 1. Contexto y restricciones | Naturaleza estática del artefacto; ausencia de backend; ausencia de datos personales conforme a la Ley 1581 de 2012 (el propio artefacto lo declara como regla permanente en `ORIG` 3715-3717); requisito de servidor HTTP derivado del uso de `fetch` para los parciales |
| 2. Dimensión A · Arquitectura frontend | ES Modules nativos, Vite, Webpack, frameworks SPA (React/Vue). Por cada uno: funcionamiento, beneficios, costos, soporte de navegador, implicación sobre el despliegue |
| 3. Dimensión B · Servidor y hosting | Servidores de desarrollo (`python3 -m http.server`, `npx serve`); Nginx; Apache; Node/Express; plataformas estáticas: GitHub Pages, Netlify, Vercel, Cloudflare Pages, Firebase Hosting |
| 4. Dimensión C · Empaquetado y automatización | Despliegue manual; Docker con Nginx; CI/CD con GitHub Actions |
| 5. Cuadro comparativo | Criterios ponderados: complejidad de configuración, costo, rendimiento, reproducibilidad, curva de aprendizaje, encaje con el taller DevOps, mantenibilidad. Los pesos se declaran antes de puntuar, no después |
| 6. Decisión final | Argumentada; qué se descarta y por qué; ruta de evolución que indique cuándo tendría sentido incorporar un bundler o contenedores |

Restricciones de la decisión 4 del registro: el documento **analiza** Docker, Nginx y CI/CD, pero la tarea **no crea** `Dockerfile`, `docker-compose.yml` ni workflows de GitHub Actions.

- [ ] **Step 2: Comprobar coherencia con las decisiones ya tomadas**

La decisión final debe coincidir con las decisiones 1, 3 y 5 del registro (ES Modules sin build, estático + `localStorage`, parciales por `fetch`). Si al construir el cuadro comparativo el resultado ponderado apunta a otra opción, **no maquillar los pesos**: registrarlo en la sección 6 como discrepancia y plantearlo antes de continuar.

```bash
grep -n 'ES Modules' docs/decisiones-tecnicas.md   # contrastar con la sección 6
```

- [ ] **Step 3: Commit**

```bash
git add docs/analisis-despliegue.md
git commit -m "docs: análisis de opciones de despliegue y decisión final"
```

---

## Tarea 1: Esqueleto del proyecto y herramienta de verificación

Sin pruebas automatizadas, esta herramienta es la única red de seguridad mecánica del proyecto. Se construye primero para que todas las tareas posteriores tengan un comando real que ejecutar.

**Files:**
- Create: `tools/verificar.sh`
- Create: los directorios vacíos del árbol (con `.gitkeep`)
- Modify: `.gitignore`

**Interfaces:**
- Produces: `bash tools/verificar.sh` — sale con código 0 si todo está bien, 1 si hay fallos. Todas las tareas siguientes lo invocan.

- [ ] **Step 1: Crear el árbol de directorios**

```bash
cd FormulacionProyectosModular
mkdir -p views css/{base,layout,components,pasos} \
         js/{core,utils} \
         js/pasos/{paso0-ficha,paso1-involucrados,paso2-problema,paso3-objetivos,pasos-pendientes} \
         data tools
find views css js data -type d -empty -exec touch {}/.gitkeep \;
```

- [ ] **Step 2: Escribir `tools/verificar.sh`**

```bash
#!/usr/bin/env bash
# Verificación estática del proyecto. Sustituye a las pruebas automatizadas.
# Uso: bash tools/verificar.sh
set -uo pipefail
cd "$(dirname "$0")/.."
FALLOS=0
fallo() { echo "  ✗ $1"; FALLOS=$((FALLOS+1)); }
ok()    { echo "  ✓ $1"; }

echo "1. Sintaxis de los módulos JavaScript"
JS=$(find js -name '*.js' 2>/dev/null)
if [ -z "$JS" ]; then
  ok "sin módulos todavía"
else
  for f in $JS; do
    node --check "$f" 2>/dev/null || fallo "sintaxis inválida: $f"
  done
  [ $FALLOS -eq 0 ] && ok "$(echo "$JS" | wc -l) módulos con sintaxis válida"
fi

echo "2. Atributos on* en el markup"
HITS=$(grep -rlE '\son(click|change|input|submit|keyup|keydown|blur|focus|load)=' \
       views index.html 2>/dev/null)
if [ -n "$HITS" ]; then
  for f in $HITS; do fallo "manejador en línea en $f"; done
else
  ok "ningún manejador en línea"
fi

echo "3. Aislamiento entre pasos"
CRUCE=0
for d in js/pasos/*/; do
  paso=$(basename "$d")
  otros=$(grep -rhoE "from ['\"][^'\"]*pasos/[a-z0-9-]+" "$d" 2>/dev/null \
          | grep -oE '[a-z0-9-]+$' | grep -v "^$paso$" | sort -u)
  if [ -n "$otros" ]; then
    fallo "$paso importa de: $(echo "$otros" | tr '\n' ' ')"
    CRUCE=1
  fi
done
[ $CRUCE -eq 0 ] && ok "ningún paso importa de otro paso"

echo "4. Referencias colgantes entre módulos"
COLGANTES=0
for f in $JS; do
  # nombres importados con llaves: import { a, b } from '...'
  while IFS='|' read -r nombres origen; do
    [ -z "$origen" ] && continue
    destino=$(cd "$(dirname "$f")" && realpath -m "$origen" 2>/dev/null)
    [ -f "$destino" ] || { fallo "$f importa de un archivo inexistente: $origen"; COLGANTES=1; continue; }
    for n in $(echo "$nombres" | tr ',' ' '); do
      n=$(echo "$n" | sed 's/ as .*//' | tr -d ' ')
      [ -z "$n" ] && continue
      grep -qE "export (async )?(function|const|let|class) $n\b|export \{[^}]*\b$n\b" "$destino" \
        || { fallo "$f importa '$n', que $origen no exporta"; COLGANTES=1; }
    done
  done < <(grep -oE "import \{([^}]*)\} from ['\"]([^'\"]+)['\"]" "$f" \
           | sed -E "s/import \{(.*)\} from ['\"](.*)['\"]/\1|\2/")
done
[ $COLGANTES -eq 0 ] && ok "todos los imports resuelven"

echo "5. Estado global residual"
if grep -rn 'window\.state' js 2>/dev/null | grep -v 'core/estado.js'; then
  fallo "quedan accesos a window.state fuera de core/estado.js"
else
  ok "sin accesos a window.state"
fi

echo
if [ $FALLOS -eq 0 ]; then echo "OK — sin fallos"; exit 0
else echo "$FALLOS fallo(s)"; exit 1; fi
```

- [ ] **Step 3: Ejecutar la verificación en el proyecto vacío**

Run: `bash tools/verificar.sh`
Expected: PASS (`OK — sin fallos`). Con el proyecto vacío todas las comprobaciones son vacuas; sirve para confirmar que el script corre sin errores de sintaxis de bash.

- [ ] **Step 4: Provocar un fallo a propósito y confirmar que lo detecta**

Un verificador que nunca falla no verifica nada. Comprobarlo:

```bash
mkdir -p js/core && echo 'function roto( {' > js/core/_prueba.js
bash tools/verificar.sh   # Expected: FAIL con "sintaxis inválida: js/core/_prueba.js"
rm js/core/_prueba.js
bash tools/verificar.sh   # Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: esqueleto de directorios y verificación estática"
```

---

## Tarea 2: Extracción y división del CSS

**Files:**
- Create: `css/main.css`, `css/base/{variables,reset,tipografia}.css`, `css/layout/{shell,sidebar,wizard}.css`, `css/components/{botones,campos,cards,tablas,badges,tabs,svg}.css`, `css/pasos/{paso1-involucrados,paso2-problema,paso3-objetivos}.css`
- Read: `ORIG` líneas 9-3092 (contenido del bloque `<style>`, que abre en la 8 y cierra en la 3093)

**Interfaces:**
- Produces: `css/main.css`, único archivo enlazado desde `index.html`.

**Riesgo específico de esta tarea.** El CSS es una cascada: si dos reglas tienen la misma especificidad y afectan al mismo elemento, gana la última. Repartir las reglas en archivos **cambia su orden**. El orden de los `@import` en `main.css` debe reproducir el orden de aparición original tan fielmente como sea posible, y el Paso 5 de esta tarea lo comprueba de forma mecánica.

- [ ] **Step 1: Extraer el CSS completo a un archivo de trabajo**

```bash
sed -n '9,3092p' ../ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html > /tmp/mml-original.css
wc -l /tmp/mml-original.css   # Expected: 3084
```

- [ ] **Step 2: Repartir las reglas por archivo**

Criterio de reparto, aplicado al selector raíz de cada regla:

| Archivo | Selectores que le corresponden |
|---|---|
| `base/variables.css` | `:root` |
| `base/reset.css` | `*`, `html`, `body`, `.app` |
| `base/tipografia.css` | `button`, `input`, `textarea`, `select`, `label`, `.kicker`, `.footer-note` |
| `layout/sidebar.css` | `.sidebar`, `.brand*`, `.nav-*` |
| `layout/shell.css` | `.main`, `.topbar`, `.project-title`, `.step-badge`, `.content`, `.global-actions`, `.global-json-btn` |
| `layout/wizard.css` | `.screen`, `.hero`, `.wizard-actions`, `.construction`, `.method-layer` |
| `components/botones.css` | `.btn`, `.btn-primary`, `.btn-mini` |
| `components/campos.css` | `.field*`, `.form-group`, `.case-grid`, `.case-note`, `:focus` |
| `components/cards.css` | `.card`, `.chart-card`, `.section-head` |
| `components/tablas.css` | `.actor-table*`, `.characterization-table`, `.node-evidence-table*` |
| `components/badges.css` | `.quadrant-badge`, `.position-*`, `.result-*`, `.*-badge` |
| `components/tabs.css` | `.step2-tab`, `.step3-tab`, `.step2-nav`, `.step3-nav`, `.problem-subscreen`, `.objective-subscreen` |
| `components/svg.css` | `.svg-*`, `.actor-svg`, `.problem-tree-svg`, `.problem-tree-canvas` |
| `pasos/paso1-involucrados.css` | `.actor-*`, `.participation-*`, `.technique-*`, `.validation-*`, `.ai-*`, `#actorChart*` |
| `pasos/paso2-problema.css` | `.problem-*`, `.node-evidence-*`, `.tree-level-dot`, `.effect-level-*`, `.cause-level-*`, `.central-level`, `#problemSubscreen-*`, `#problemTreeWorkspace`, `#problemAIPrompts`, `#causesWorkspace`, `#effectsWorkspace`, `#nodeEvidenceWorkspace`, `#problemValidationWorkspace`, `#problemBitacoraWorkspace` |
| `pasos/paso3-objetivos.css` | `.objective-*`, `.potential-assumption*`, `.module-transition*`, `#objective*Workspace`, `#potentialAssumptionsWorkspace`, `#action*Workspace`, `#alternative*Workspace`, `#sensitivityWorkspace`, `#strategySelectionWorkspace` |

Reglas de reparto:
1. **Cada regla se mueve entera, sin editar ninguna declaración.** No se reordenan propiedades, no se abrevian valores, no se fusionan reglas.
2. **Los 26 bloques `@media`** no se mueven en bloque. Se abre cada uno y se reparten sus reglas interiores según la misma tabla, reconstruyendo un `@media` con la misma condición en el archivo de destino. Una regla siempre viaja al archivo de su componente, dentro o fuera de una media query.
3. **Un selector compuesto pertenece al archivo de su primer segmento.** `#problemSubscreen-causas > .card:first-child` va a `pasos/paso2-problema.css`, no a `components/cards.css`.
4. **Ante la duda, al archivo más específico.** Si una regla podría ir a `components/` o a `pasos/`, va a `pasos/`.

- [ ] **Step 3: Escribir `css/main.css`**

El orden de los `@import` reproduce el orden de la cascada original: primero variables y reset, luego layout, luego componentes, y al final los pasos (que sobrescriben a los componentes, como en el original).

```css
/* Punto de entrada único de estilos.
   El orden de importación define la cascada: no reordenar sin comprobar §Step 5. */

@import url("base/variables.css");
@import url("base/reset.css");
@import url("base/tipografia.css");

@import url("layout/shell.css");
@import url("layout/sidebar.css");
@import url("layout/wizard.css");

@import url("components/botones.css");
@import url("components/campos.css");
@import url("components/cards.css");
@import url("components/tablas.css");
@import url("components/badges.css");
@import url("components/tabs.css");
@import url("components/svg.css");

@import url("pasos/paso1-involucrados.css");
@import url("pasos/paso2-problema.css");
@import url("pasos/paso3-objetivos.css");
```

- [ ] **Step 4: Verificar que no se perdió ni se duplicó ninguna declaración**

```bash
norm() { tr -d ' \t' < "$1" | grep -vE '^$|^/\*|^\*' | sort; }
cat css/base/*.css css/layout/*.css css/components/*.css css/pasos/*.css > /tmp/mml-split.css
norm /tmp/mml-original.css > /tmp/a.txt
norm /tmp/mml-split.css    > /tmp/b.txt
diff /tmp/a.txt /tmp/b.txt && echo "IDENTICO: ninguna declaración perdida ni duplicada"
```

Expected: sin diferencias. Si aparecen líneas solo en `/tmp/a.txt`, se perdieron reglas; si aparecen solo en `/tmp/b.txt`, se duplicaron. Corregir y repetir hasta que el `diff` esté limpio.

- [ ] **Step 5: Detectar riesgos de cascada por reordenación**

```bash
# Lista los selectores que aparecen en más de un archivo: son los únicos
# donde el reparto puede haber alterado qué regla gana.
grep -rhoE '^[^@/][^{]*\{' css/base css/layout css/components css/pasos \
  | sed 's/{//; s/[[:space:]]*$//' | sort | uniq -d
```

Expected: lista vacía o muy corta. Cada selector que aparezca debe revisarse a mano: comprobar que las reglas duplicadas no declaran la misma propiedad con valores distintos. Si lo hacen, mover ambas al mismo archivo, en su orden original.

- [ ] **Step 6: Comparación visual**

Este paso es manual y es el que realmente valida la tarea. Crear un `css/_comparacion.html` temporal que enlace `main.css` y pegue el markup del `screen1` del original (líneas 3200-3725), abrirlo junto al artefacto original y comparar. Borrar el archivo temporal al terminar.

Expected: sin diferencias visuales apreciables. Prestar atención a: espaciados de las tarjetas, colores de los badges de posición, y el comportamiento responsive al estrechar la ventana (donde viven las 26 media queries).

- [ ] **Step 7: Commit**

```bash
rm -f css/_comparacion.html
find css -name .gitkeep -delete
git add -A
git commit -m "refactor(css): dividir la hoja monolítica en base, layout, components y pasos"
```

---

## Tarea 3: Núcleo — estado y utilidades

**Files:**
- Create: `js/core/estado.js`, `js/utils/dom.js`, `js/utils/texto.js`, `js/utils/svg.js`, `js/utils/portapapeles.js`
- Read: `ORIG` 6895-6966 (estado), 7779-7786, 7772-7777, 8899-8916, 6816-6840, 8226-8250, 8850-8879, 10439-10445, 9394-9454, 11749-11893

**Interfaces:**
- Produces:
  - `estado.js`: `obtenerEstado(): Estado`, `notificarCambio(): void`, `cargarEstado(objeto: Estado): void`, `reiniciarEstado(): void`, `suscribir(cb: (e: Estado) => void): () => void`, `estadoInicial(): Estado`
  - `dom.js`: `escapeHTML(valor: any): string`, `porId(id: string): HTMLElement|null`, `porIdObligatorio(id: string): HTMLElement` (lanza si falta), `todos(selector, raiz?): Element[]`
  - `texto.js`: `normalizeLines(v): string[]`, `normalizeTextForValidation(v): string`, `containsAny(t, lista): boolean`, `formatProblemLogDate(v): string`
  - `svg.js`: `svgEl(tag, attributes): SVGElement`, `addSvgText(svg, text, x, y, className): SVGTextElement`, `svgText(text): string`, `splitSvgLabel(text, maxChars): string[]` — **firmas idénticas a las del original**: las llamadas se migran literales y pasan los argumentos en ese orden, así que reordenar o renombrar parámetros rompe los tres generadores SVG en silencio
  - `portapapeles.js`: `copiarTexto(texto: string): Promise<boolean>`, `copiarDesdeElemento(elementId: string, boton: HTMLElement|null): Promise<void>`

- [ ] **Step 1: Escribir `js/core/estado.js`**

La forma del objeto es copia literal de `ORIG` 6895-6966, incluidos los comentarios de sección.

```js
/**
 * Fuente única de verdad del modelo de datos.
 *
 * `obtenerEstado()` devuelve el objeto vivo, no una copia. Es deliberado:
 * la migración conserva las mutaciones directas del código original
 * (`estado.nodos.push(...)`) y una copia defensiva las descartaría en
 * silencio. Quien muta debe llamar a `notificarCambio()` después.
 * Ver §5.1 de la spec.
 */

const suscriptores = new Set();

export function estadoInicial() {
  return {
    /* CONTROL DE NAVEGACIÓN */
    current: 0,

    /* CASO */
    caso: {
      titulo: "",
      sector: "",
      territorio: "",
      poblacion: "",
      periodo: "",
      situacion: "",
      pregunta: "",
      delimitacion: ""
    },

    /* PASO 1 · ANÁLISIS DE INVOLUCRADOS */
    involucrados: [],
    editingActorIndex: null,

    /* PASO 2 · ANÁLISIS DEL PROBLEMA */
    problema: {
      condicion: "",
      atributo: "",
      poblacion: "",
      delimitacion: "",
      enunciado: ""
    },
    nodos: [],

    /* PASO 3 · ANÁLISIS DE OBJETIVOS */
    objetivos: [],
    acciones: [],
    alternativas: [],
    evaluacion: {
      criterios: [],
      pesos: {},
      valoraciones: {},
      sensibilidad: {}
    },
    seleccion: {
      alternativa: "",
      justificacion: ""
    },

    /* TRAZABILIDAD */
    bitacora: []
  };
}

let estado = estadoInicial();

export function obtenerEstado() {
  return estado;
}

export function notificarCambio() {
  for (const cb of suscriptores) {
    try {
      cb(estado);
    } catch (error) {
      console.error("[estado] un suscriptor falló:", error);
    }
  }
}

/**
 * Reemplaza el estado completo fusionándolo sobre el inicial, de modo que
 * un JSON antiguo al que le falten claves nuevas siga siendo válido.
 */
export function cargarEstado(objeto) {
  if (!objeto || typeof objeto !== "object") {
    throw new TypeError("cargarEstado espera un objeto");
  }
  estado = Object.assign(estadoInicial(), objeto);
  notificarCambio();
}

export function reiniciarEstado() {
  estado = estadoInicial();
  notificarCambio();
}

export function suscribir(callback) {
  suscriptores.add(callback);
  return () => suscriptores.delete(callback);
}
```

- [ ] **Step 2: Escribir `js/utils/dom.js`**

`escapeHTML` es copia literal de `ORIG` 7779-7786. El resto son guardas nuevas que sustituyen a los `getElementById` desnudos del original.

```js
/** Utilidades de DOM. Sin estado: no importan nada de core/. */

export function escapeHTML(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Devuelve el elemento o null, avisando en consola si no existe. */
export function porId(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[dom] no existe el elemento #${id}`);
  return el;
}

/** Igual que porId, pero lanza. Para elementos sin los que el módulo no puede operar. */
export function porIdObligatorio(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[dom] falta el elemento obligatorio #${id}`);
  return el;
}

export function todos(selector, raiz = document) {
  return Array.from(raiz.querySelectorAll(selector));
}
```

**Nota:** el cuerpo de `escapeHTML` mostrado arriba debe sustituirse por el de `ORIG` 7779-7786 si difiere. Leer esas líneas y copiarlas literalmente; no reimplementar de memoria.

- [ ] **Step 3: Escribir `js/utils/texto.js`**

Copiar literalmente los cuerpos de `normalizeLines` (7772-7777), `normalizeTextForValidation` (8899-8907), `containsAny` (8909-8916) y `formatProblemLogDate` (6816-6840), añadiendo `export` a cada una. No editar sus cuerpos.

- [ ] **Step 4: Escribir `js/utils/svg.js`**

Copiar literalmente `svgEl` (8226-8237), `addSvgText` (8239-8250), `svgText` (10439-10445) y `splitSvgLabel` (8850-8879), añadiendo `export`. `svgText` está anidada dentro de `renderProblemTree`; extraerla al mismo nivel que las demás.

- [ ] **Step 5: Escribir `js/utils/portapapeles.js`**

Unifica tres funciones del original que hacen lo mismo: `copyAIPrompt` (9394-9454), `copyProblemPrompt` (11749-11798) y `fallbackCopyProblemPrompt` (11801-11823). Leer las tres antes de escribir, para conservar el texto exacto del mensaje de confirmación del botón y su temporización.

**`writeProblemPrompt` (11825-11893) NO va aquí.** Muta `state.bitacora`, y `utils/` no puede importar de `core/`. Su sitio es el módulo de prompts del Paso 2 (Tarea 16).

```js
/** Copia al portapapeles con respaldo para navegadores sin navigator.clipboard. */

export async function copiarTexto(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (error) {
    console.warn("[portapapeles] navigator.clipboard falló, usando respaldo:", error);
  }
  return copiarConRespaldo(texto);
}

function copiarConRespaldo(texto) {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (error) {
    console.error("[portapapeles] el respaldo también falló:", error);
  }
  document.body.removeChild(area);
  return ok;
}

/**
 * Copia el contenido de un textarea/elemento y da realimentación en el botón.
 * Reemplaza a copyAIPrompt y copyProblemPrompt del artefacto original.
 */
export async function copiarDesdeElemento(elementId, boton) {
  const origen = document.getElementById(elementId);
  if (!origen) {
    console.warn(`[portapapeles] no existe #${elementId}`);
    return;
  }
  const texto = "value" in origen ? origen.value : origen.textContent;
  const ok = await copiarTexto(texto);
  if (!boton) return;
  const original = boton.textContent;
  boton.textContent = ok ? "¡Copiado!" : "No se pudo copiar";
  boton.disabled = true;
  setTimeout(() => {
    boton.textContent = original;
    boton.disabled = false;
  }, 1800);
}
```

- [ ] **Step 6: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS. Las cinco comprobaciones deben salir en verde; en particular la 1 (sintaxis) sobre los cinco módulos nuevos.

- [ ] **Step 7: Commit**

```bash
git add js/core/estado.js js/utils
git commit -m "feat(core): estado centralizado y utilidades sin estado"
```

---

## Tarea 4: Núcleo — router, navegación y shell

**Files:**
- Create: `index.html`, `js/main.js`, `js/core/router.js`, `js/core/navegacion.js`, `js/core/registro-pasos.js`
- Read: `ORIG` 3097-3139 (shell), 6879-6892 (`NAV`), 6968-7043 (`buildNav`, `showScreen`, `updateHeader`)

**Interfaces:**
- Consumes: `estado.js` (Tarea 3), `dom.js` (Tarea 3)
- Produces:
  - `router.js`: `irAPantalla(id: number): Promise<void>`, `iniciarRouter(): Promise<void>`
  - `navegacion.js`: `construirNav(alNavegar: (id: number) => void): void`, `marcarActivo(): void`, `actualizarEncabezado(): void`
  - `registro-pasos.js`: `PASOS: ModuloPaso[]`, `buscarPaso(id: number): ModuloPaso|undefined`
  - **Contrato `ModuloPaso`** — toda tarea que cree un módulo de paso debe cumplirlo exactamente:
    ```
    { id: number, titulo: string, grupo: string, etiquetaPaso: string|null,
      vista: string, init(contenedor: HTMLElement): void, render(): void }
    ```

- [ ] **Step 1: Escribir `index.html`**

El shell es copia del markup de `ORIG` 3097-3139, con tres cambios: se quitan los dos `onclick` de los botones JSON, `<nav id="navigation">` se conserva vacío (lo puebla `construirNav`), y `.content` queda vacío (lo puebla el router).

```html
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artefacto MML · Formulación de Proyectos</title>
  <link rel="stylesheet" href="css/main.css">
</head>

<body>
  <div class="app">

    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">MML</div>
        <h1>Formulación de Proyectos</h1>
        <p>Artefacto educativo basado en la Metodología de Marco Lógico CEPAL/ILPES.</p>
      </div>

      <nav id="navigation"></nav>
    </aside>

    <main class="main">
      <header class="topbar">

        <div class="project-title">
          <div class="eyebrow">Proyecto</div>
          <strong id="headerProjectTitle">Proyecto sin título</strong>
        </div>

        <div class="global-actions">
          <button type="button" class="btn global-json-btn" id="btnExportJSON">Exportar JSON</button>
          <button type="button" class="btn global-json-btn" id="btnImportJSON">Importar JSON</button>
          <input type="file" id="inputImportJSON" accept=".json,application/json" hidden>
        </div>

        <div class="step-badge">
          <span id="headerStep">Paso 0</span>
          <strong id="headerStepName">Ficha del caso</strong>
        </div>

      </header>

      <div class="content" id="contenidoPantalla"></div>

      <p class="footer-note">
        Artefacto educativo en construcción. Estructura basada en la secuencia de diez pasos de la Metodología de
        Marco Lógico de CEPAL/ILPES y en los documentos de formulación del curso.
      </p>
    </main>
  </div>

  <script type="module" src="js/main.js"></script>
</body>

</html>
```

- [ ] **Step 2: Escribir `js/core/registro-pasos.js`**

En esta tarea solo hay un paso de prueba; las tareas siguientes irán añadiendo imports reales aquí. Este archivo es el único punto que hay que tocar para añadir un paso (OCP).

```js
/**
 * Único punto donde se enumeran los módulos de paso.
 * Añadir un paso = un import y una entrada en PASOS. Nada más cambia.
 */

const PASOS_TEMPORAL = [
  {
    id: 0,
    titulo: "Ficha del caso",
    grupo: "Punto de partida",
    etiquetaPaso: null,
    vista: "views/screen00-ficha.html",
    init() {},
    render() {}
  }
];

export const PASOS = PASOS_TEMPORAL;

export function buscarPaso(id) {
  return PASOS.find((paso) => paso.id === id);
}
```

- [ ] **Step 3: Escribir `js/core/navegacion.js`**

Los cuerpos de `buildNav` (6968-7000) y `updateHeader` (7036-7043) se copian del original, cambiando solo su fuente de datos: en vez del array `NAV` literal, recorren `PASOS`. Las clases CSS (`.nav-item`, `.nav-section`, `.nav-section-title`, `.nav-num`, `.nav-label`, `.active`) se conservan exactamente, porque `layout/sidebar.css` depende de ellas.

```js
import { PASOS } from "./registro-pasos.js";
import { obtenerEstado } from "./estado.js";
import { porId, escapeHTML } from "../utils/dom.js";

export function construirNav(alNavegar) {
  const contenedor = porId("navigation");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  let grupoActual = null;
  let seccion = null;

  for (const paso of PASOS) {
    if (paso.grupo !== grupoActual) {
      grupoActual = paso.grupo;
      seccion = document.createElement("div");
      seccion.className = "nav-section";
      const titulo = document.createElement("div");
      titulo.className = "nav-section-title";
      titulo.textContent = paso.grupo;
      seccion.appendChild(titulo);
      contenedor.appendChild(seccion);
    }

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "nav-item";
    boton.dataset.pantalla = String(paso.id);
    boton.innerHTML =
      `<span class="nav-num">${escapeHTML(paso.etiquetaPaso || "·")}</span>` +
      `<span class="nav-label">${escapeHTML(paso.titulo)}</span>`;
    boton.addEventListener("click", () => alNavegar(paso.id));
    seccion.appendChild(boton);
  }

  marcarActivo();
}

export function marcarActivo() {
  const actual = obtenerEstado().current;
  for (const boton of document.querySelectorAll(".nav-item")) {
    boton.classList.toggle("active", Number(boton.dataset.pantalla) === actual);
  }
}

export function actualizarEncabezado() {
  const estado = obtenerEstado();
  const paso = PASOS.find((p) => p.id === estado.current);

  const titulo = porId("headerProjectTitle");
  if (titulo) titulo.textContent = estado.caso.titulo || "Proyecto sin título";

  const etiqueta = porId("headerStep");
  if (etiqueta) etiqueta.textContent = paso?.etiquetaPaso || "Punto de partida";

  const nombre = porId("headerStepName");
  if (nombre) nombre.textContent = paso?.titulo || "";
}
```

- [ ] **Step 4: Escribir `js/core/router.js`**

```js
import { buscarPaso, PASOS } from "./registro-pasos.js";
import { obtenerEstado, notificarCambio } from "./estado.js";
import { construirNav, marcarActivo, actualizarEncabezado } from "./navegacion.js";
import { porIdObligatorio } from "../utils/dom.js";

const cacheVistas = new Map();
const inicializados = new Set();

async function cargarVista(ruta) {
  if (cacheVistas.has(ruta)) return cacheVistas.get(ruta);

  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${ruta} (HTTP ${respuesta.status})`);
  }
  const html = await respuesta.text();
  cacheVistas.set(ruta, html);
  return html;
}

function mostrarError(contenedor, ruta, error) {
  console.error("[router]", error);
  contenedor.innerHTML = `
    <div class="card">
      <h3>No se pudo cargar la pantalla</h3>
      <p>Archivo: <code>${ruta}</code></p>
      <p>${error.message}</p>
      <p>Esta aplicación carga sus pantallas con <code>fetch</code>, que no
         funciona al abrir el archivo directamente desde el disco. Sírvela por
         HTTP, por ejemplo con <code>python3 -m http.server</code> desde la raíz
         del proyecto.</p>
    </div>`;
}

export async function irAPantalla(id) {
  const paso = buscarPaso(id);
  if (!paso) {
    console.warn(`[router] no existe la pantalla ${id}`);
    return;
  }

  const contenedor = porIdObligatorio("contenidoPantalla");

  try {
    contenedor.innerHTML = await cargarVista(paso.vista);
  } catch (error) {
    mostrarError(contenedor, paso.vista, error);
    return;
  }

  obtenerEstado().current = id;
  notificarCambio();

  if (!inicializados.has(id)) {
    paso.init(contenedor);
    inicializados.add(id);
  }
  paso.render();

  marcarActivo();
  actualizarEncabezado();
}

export async function iniciarRouter() {
  construirNav(irAPantalla);
  await irAPantalla(obtenerEstado().current ?? PASOS[0].id);
}
```

**Nota sobre `init` y el cacheo:** el router inyecta HTML nuevo en cada navegación, de modo que los nodos del DOM son nuevos aunque el parcial venga de caché. Por eso `init()` debe registrar sus listeners con **delegación** sobre el contenedor del paso, no sobre elementos concretos. Las tareas 6 a 17 lo aplican.

- [ ] **Step 5: Escribir `js/main.js`**

```js
import { iniciarRouter } from "./core/router.js";

window.addEventListener("DOMContentLoaded", () => {
  iniciarRouter().catch((error) => {
    console.error("[main] fallo al iniciar la aplicación:", error);
  });
});
```

- [ ] **Step 6: Crear un parcial mínimo para poder probar**

```bash
cat > views/screen00-ficha.html <<'HTML'
<section class="screen active" id="screen0">
  <div class="hero">
    <div class="kicker">Punto de partida</div>
    <h2>Ficha del caso</h2>
  </div>
</section>
HTML
```

- [ ] **Step 7: Verificar**

```bash
bash tools/verificar.sh          # Expected: PASS
python3 -m http.server 8000 &     # servir el proyecto
```

Abrir `http://localhost:8000`. Expected: se ve la barra lateral con una entrada («Ficha del caso»), el encabezado dice «Punto de partida / Ficha del caso», y el contenido muestra el hero. La consola del navegador no muestra errores.

- [ ] **Step 8: Comprobar el manejo de error del router**

Renombrar temporalmente el parcial y recargar:

```bash
mv views/screen00-ficha.html views/_screen00.html
```

Expected: la pantalla muestra la tarjeta de error con el mensaje sobre `fetch` y HTTP, **no** una pantalla en blanco. Restaurar: `mv views/_screen00.html views/screen00-ficha.html`.

- [ ] **Step 9: Commit**

```bash
git add index.html js/main.js js/core views/screen00-ficha.html
git commit -m "feat(core): router con carga de parciales, navegación y shell"
```

---

## Tarea 5: Los 11 parciales de vista

**Files:**
- Create: `views/screen00-ficha.html` … `views/screen10-evaluacion-intermedia.html` (11 archivos)
- Read: `ORIG` 3141-3196, 3200-3725, 3728-4694, 4698-5111, 5114-5147, 5150-5178, 5181-5208, 5211-5242, 5245-5272, 5275-5304, 5307-5335

**Interfaces:**
- Produces: los 11 archivos que `registro-pasos.js` referencia en el campo `vista`.

- [ ] **Step 1: Extraer cada sección a su archivo**

```bash
O=../ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html
sed -n '3141,3196p' $O > views/screen00-ficha.html
sed -n '3200,3725p' $O > views/screen01-involucrados.html
sed -n '3728,4694p' $O > views/screen02-problema.html
sed -n '4698,5111p' $O > views/screen03-objetivos.html
sed -n '5114,5147p' $O > views/screen04-estrategia.html
sed -n '5150,5178p' $O > views/screen05-estructura-analitica.html
sed -n '5181,5208p' $O > views/screen06-resumen-narrativo.html
sed -n '5211,5242p' $O > views/screen07-indicadores.html
sed -n '5245,5272p' $O > views/screen08-medios-verificacion.html
sed -n '5275,5304p' $O > views/screen09-supuestos.html
sed -n '5307,5335p' $O > views/screen10-evaluacion-intermedia.html
wc -l views/*.html
```

- [ ] **Step 2: Corregir el `<div>` sin cerrar — defecto 5**

`views/screen01-involucrados.html` procede de las líneas 3200-3725, donde el `<div class="card">` abierto en `ORIG` 3464 nunca se cierra: lo cierra implícitamente el `</section>`, dejando `.wizard-actions` anidado dentro de la tarjeta.

Localizar el bloque `<div class="wizard-actions">` al final del archivo e insertar el `</div>` que falta **inmediatamente antes** de él, de modo que `.wizard-actions` quede como hermano de la tarjeta y no como hijo.

- [ ] **Step 3: Corregir el `id` duplicado — defecto 2**

`views/screen02-problema.html` contiene dos elementos con `id="problemPopulation"` (`ORIG` 3810 y 3899). El segundo, el `<textarea>` de la subpantalla «Enunciado», pasa a `problemCentralPopulation`:

```bash
# Renombra SOLO el textarea y su label asociado, no el input de contexto.
python3 - <<'PY'
import re
p='views/screen02-problema.html'
s=open(p,encoding='utf-8').read()
s=s.replace('<textarea id="problemPopulation" placeholder="¿Quiénes están afectados?">',
            '<textarea id="problemCentralPopulation" placeholder="¿Quiénes están afectados?">')
# el <label for> que precede al textarea
s=re.sub(r'(<label for=")problemPopulation("[^>]*>\s*Población afectada \*)',
         r'\1problemCentralPopulation\2', s)
open(p,'w',encoding='utf-8').write(s)
PY
grep -c 'problemPopulation"' views/screen02-problema.html          # Expected: 1
grep -c 'problemCentralPopulation"' views/screen02-problema.html    # Expected: 2
```

- [ ] **Step 4: Eliminar todos los atributos `on*` del markup**

```bash
grep -rnoE '\son[a-z]+="[^"]*"' views/ | sed 's/:.*=/ → /' | sort -u
```

Anotar cada uno en una lista: la tarea del paso correspondiente tendrá que registrarlo con `addEventListener`. Después eliminarlos:

```bash
python3 - <<'PY'
import re,glob
patron = re.compile(r'\son(click|change|input|submit|keyup|keydown|blur|focus)="[^"]*"')
for p in glob.glob('views/*.html'):
    s = open(p, encoding='utf-8').read()
    n = len(patron.findall(s))
    if n:
        open(p, 'w', encoding='utf-8').write(patron.sub('', s))
        print(f"{p}: {n} atributos eliminados")
PY
```

Añadir a cada elemento que perdió su manejador un `data-accion` descriptivo, para que la delegación de eventos pueda localizarlo. Por ejemplo, el botón que tenía `onclick="continuarAlPaso2()"` pasa a `<button type="button" class="btn primary" data-accion="continuar-paso2">`.

- [ ] **Step 5: Registrar los 11 pasos en `registro-pasos.js`**

Sustituir `PASOS_TEMPORAL` por entradas para las 11 pantallas, todas con `init`/`render` vacíos por ahora. Los valores de `titulo`, `grupo` y `etiquetaPaso` se copian literalmente del array `NAV` de `ORIG` 6879-6892:

```js
const PENDIENTE = { init() {}, render() {} };

export const PASOS = [
  { id: 0,  titulo: "Ficha del caso",                       grupo: "Punto de partida",       etiquetaPaso: null,      vista: "views/screen00-ficha.html",                  ...PENDIENTE },
  { id: 1,  titulo: "Análisis de involucrados",             grupo: "Análisis situacional",   etiquetaPaso: "Paso 1",  vista: "views/screen01-involucrados.html",           ...PENDIENTE },
  { id: 2,  titulo: "Análisis del problema",                grupo: "Análisis situacional",   etiquetaPaso: "Paso 2",  vista: "views/screen02-problema.html",               ...PENDIENTE },
  { id: 3,  titulo: "Análisis de objetivos",                grupo: "Análisis situacional",   etiquetaPaso: "Paso 3",  vista: "views/screen03-objetivos.html",              ...PENDIENTE },
  { id: 4,  titulo: "Selección de la estrategia óptima",    grupo: "Análisis situacional",   etiquetaPaso: "Paso 4",  vista: "views/screen04-estrategia.html",             ...PENDIENTE },
  { id: 5,  titulo: "Estructura Analítica",                 grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 5",  vista: "views/screen05-estructura-analitica.html",   ...PENDIENTE },
  { id: 6,  titulo: "Resumen narrativo",                    grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 6",  vista: "views/screen06-resumen-narrativo.html",      ...PENDIENTE },
  { id: 7,  titulo: "Indicadores",                          grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 7",  vista: "views/screen07-indicadores.html",            ...PENDIENTE },
  { id: 8,  titulo: "Medios de verificación",               grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 8",  vista: "views/screen08-medios-verificacion.html",    ...PENDIENTE },
  { id: 9,  titulo: "Supuestos",                            grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 9",  vista: "views/screen09-supuestos.html",              ...PENDIENTE },
  { id: 10, titulo: "Previsión de la evaluación intermedia", grupo: "Matriz de Marco Lógico", etiquetaPaso: "Paso 10", vista: "views/screen10-evaluacion-intermedia.html",  ...PENDIENTE }
];

export function buscarPaso(id) {
  return PASOS.find((paso) => paso.id === id);
}
```

- [ ] **Step 6: Verificar**

```bash
bash tools/verificar.sh
```

Expected: PASS, con la comprobación 2 («ningún manejador en línea») en verde. Si falla, quedan atributos `on*` que el Step 4 no capturó.

- [ ] **Step 7: Comprobación manual**

Servir y navegar por las 11 entradas de la barra lateral. Expected: las 11 pantallas se ven con su markup y sus estilos; nada es funcional todavía (los botones no hacen nada), y la consola no muestra errores. Comparar el aspecto de cada una contra el original.

- [ ] **Step 8: Commit**

```bash
git add views js/core/registro-pasos.js
git commit -m "refactor(views): extraer las 11 pantallas a parciales

Corrige el div sin cerrar de la pantalla 1 (defecto 5) y el id
duplicado problemPopulation de la pantalla 2 (defecto 2).
Elimina todos los atributos on* del markup."
```

---

## Tarea 6: Paso 0 · Ficha del caso

El paso más pequeño. Sirve de plantilla de referencia para los demás: la estructura que se establece aquí se repite en las tareas 7 a 17.

**Files:**
- Create: `js/pasos/paso0-ficha/index.js`
- Modify: `js/core/registro-pasos.js`
- Read: `ORIG` 9493-9499 (`bindCaseField`), 5346-5348 (`iniciarWizard`)

**Interfaces:**
- Consumes: `estado.js`, `dom.js`, `router.js`
- Produces: módulo por defecto que cumple el contrato `ModuloPaso`.

- [ ] **Step 1: Escribir `js/pasos/paso0-ficha/index.js`**

`bindCaseField` (9493-9499) enlazaba cada input con una clave de `state.caso`. Aquí se conserva la lógica, con delegación en vez de un listener por campo.

```js
import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { actualizarEncabezado } from "../../core/navegacion.js";
import { irAPantalla } from "../../core/router.js";

/** id del input en el DOM → clave en estado.caso */
const CAMPOS = {
  casoTitulo: "titulo",
  casoSector: "sector",
  casoTerritorio: "territorio",
  casoPoblacion: "poblacion",
  casoPeriodo: "periodo",
  casoSituacion: "situacion",
  casoPregunta: "pregunta",
  casoDelimitacion: "delimitacion"
};

let raiz = null;

export default {
  id: 0,
  titulo: "Ficha del caso",
  grupo: "Punto de partida",
  etiquetaPaso: null,
  vista: "views/screen00-ficha.html",

  init(contenedor) {
    raiz = contenedor;

    raiz.addEventListener("input", (evento) => {
      const clave = CAMPOS[evento.target.id];
      if (!clave) return;
      obtenerEstado().caso[clave] = evento.target.value;
      notificarCambio();
      if (clave === "titulo") actualizarEncabezado();
    });

    raiz.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-accion='iniciar-wizard']");
      if (boton) irAPantalla(1);
    });
  },

  render() {
    const caso = obtenerEstado().caso;
    for (const [id, clave] of Object.entries(CAMPOS)) {
      const campo = raiz.querySelector(`#${id}`);
      if (campo) campo.value = caso[clave] || "";
    }
  }
};
```

- [ ] **Step 2: Marcar el botón de inicio en el parcial**

En `views/screen00-ficha.html`, el botón que en el original tenía `onclick="iniciarWizard()"` debe llevar `data-accion="iniciar-wizard"`. Comprobar:

```bash
grep -n 'data-accion="iniciar-wizard"' views/screen00-ficha.html   # Expected: 1 línea
```

- [ ] **Step 3: Registrar el paso**

En `js/core/registro-pasos.js`, añadir `import paso0 from "../pasos/paso0-ficha/index.js";` arriba, y sustituir la entrada `{ id: 0, ... ...PENDIENTE }` por `paso0`.

- [ ] **Step 4: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 5: Comprobación manual**

Servir, abrir la pantalla 0, escribir en «Título del proyecto». Expected: el encabezado superior cambia de «Proyecto sin título» al texto escrito. Navegar al Paso 1 y volver al 0: los valores escritos siguen ahí (los repone `render()`). El botón de continuar lleva al Paso 1.

- [ ] **Step 6: Commit**

```bash
git add js/pasos/paso0-ficha js/core/registro-pasos.js views/screen00-ficha.html
git commit -m "feat(paso0): módulo de la ficha del caso"
```

---

## Tarea 7: Paso 1 · Modelo, formulario y tablas de involucrados

**Files:**
- Create: `js/pasos/paso1-involucrados/modelo.js`, `formulario.js`, `tablas.js`
- Read: `ORIG` 7768-7770, 7790-7856, 7858-8052, 8054-8224, 8638-8653, 8252-8262

**Interfaces:**
- Consumes: `estado.js`, `dom.js`, `texto.js`
- Produces:
  - `modelo.js`: `actorValue`, `actorPositionLabel`, `actorPositionClass`, `actorQuadrant`, `calculateActorResult`, `actorIsComplete`, `natureColor`, `actorPointColor`
  - `formulario.js`: `clearActorForm`, `readActorForm`, `fillActorForm`, `saveActor`, `editActor`, `deleteActor`
  - `tablas.js`: `renderMainActorTable`, `renderCharacterization`

- [ ] **Step 1: Escribir `modelo.js`**

Copiar literalmente, añadiendo `export` a cada una y sin editar sus cuerpos: `actorValue` (7768-7770), `actorPositionLabel` (7790-7800), `actorPositionClass` (7802-7806), `actorQuadrant` (7808-7828), `calculateActorResult` (7834-7838), `actorIsComplete` (7840-7856), `natureColor` (8638-8653), `actorPointColor` (8252-8262).

Estas ocho funciones son puras salvo por lecturas de estado. Donde referencien `state`, sustituir por `obtenerEstado()` y añadir el import correspondiente.

- [ ] **Step 2: Escribir `formulario.js`**

Copiar literalmente `clearActorForm` (7858-7887), `readActorForm` (7889-7906), `fillActorForm` (7949-7999), `saveActor` (8001-8016), `editActor` (8018-8027), `deleteActor` (8029-8052).

Tres ajustes obligatorios, y solo estos tres:
1. `state` → `obtenerEstado()`, incluidas las referencias a `state.involucrados` y `state.editingActorIndex`.
2. Tras cada mutación del estado, llamar a `notificarCambio()`.
3. `editActor` y `deleteActor` **dejan de ser globales**: se exportan y el `index.js` de la Tarea 9 las conectará por delegación. Esto resuelve la mitad del defecto 1.

- [ ] **Step 3: Escribir `tablas.js`**

Copiar literalmente `renderMainActorTable` (8054-8116) y `renderCharacterization` (8118-8224). Ambas usan `escapeHTML`: importarlo de `../../utils/dom.js`.

**Atención al defecto 1.** `renderCharacterization` genera HTML con `onclick="editActor(${item.index})"` y `onclick="deleteActor(${item.index})"` en las líneas 8208 y 8215 del original. Sustituir esos atributos por marcadores de datos:

```js
// antes (ORIG 8208, 8215):
//   onclick="editActor(${item.index})"
//   onclick="deleteActor(${item.index})"
// después:
   data-accion="editar-actor" data-indice="${item.index}"
   data-accion="eliminar-actor" data-indice="${item.index}"
```

- [ ] **Step 4: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS. La comprobación 4 confirma que los imports entre los tres archivos resuelven.

- [ ] **Step 5: Confirmar que no quedan manejadores en el HTML generado**

```bash
grep -rnE "onclick=|onchange=" js/pasos/paso1-involucrados/
```

Expected: sin resultados. Si aparece alguno, es un `onclick` dentro de una plantilla de cadena que se coló: convertirlo a `data-accion`.

- [ ] **Step 6: Commit**

```bash
git add js/pasos/paso1-involucrados
git commit -m "refactor(paso1): modelo, formulario y tablas de involucrados"
```

---

## Tarea 8: Paso 1 · Gráficos SVG

Migración literal, sin refactorizar (decisión 10). Es el código más frágil del proyecto y sin pruebas que lo cubran: cualquier «mejora de paso» aquí es un riesgo puro.

**Files:**
- Create: `js/pasos/paso1-involucrados/grafico-poder-interes.js`, `grafico-red.js`
- Read: `ORIG` 8264-8632 (`drawInterestPowerChart`, 369 líneas), 8655-8848 (`drawStakeholderNetwork`, 194 líneas)

**Interfaces:**
- Consumes: `modelo.js` (Tarea 7), `svg.js` (Tarea 3), `estado.js`
- Produces: `drawInterestPowerChart(): void`, `drawStakeholderNetwork(): void`

- [ ] **Step 1: Escribir `grafico-poder-interes.js`**

Copiar `drawInterestPowerChart` **entera**, incluidas sus funciones anidadas `xScale` (8292) e `yScale` (8298), que se quedan dentro como estaban. No extraerlas, no renombrarlas, no tocar ni una constante numérica.

Imports: `svgEl`, `addSvgText` de `../../utils/svg.js`; `actorQuadrant`, `actorPointColor`, `actorValue` de `./modelo.js`; `obtenerEstado` de `../../core/estado.js`.

- [ ] **Step 2: Escribir `grafico-red.js`**

Copiar `drawStakeholderNetwork` (8655-8848) entera, con el mismo criterio. Imports: `svgEl`, `addSvgText`, `splitSvgLabel` de `../../utils/svg.js`; `natureColor` de `./modelo.js`; `obtenerEstado`.

- [ ] **Step 3: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 4: Comparar el recuento de nodos SVG generados**

Comprobación mecánica de que la migración no perdió elementos. En la consola del navegador, con el artefacto original abierto en una pestaña y el nuevo en otra, tras cargar los mismos tres actores de prueba en ambos:

```js
document.querySelectorAll('#actorChart svg *').length
```

Expected: el mismo número en ambas pestañas. Una diferencia indica que falta parte del dibujo.

- [ ] **Step 5: Commit**

```bash
git add js/pasos/paso1-involucrados/grafico-poder-interes.js js/pasos/paso1-involucrados/grafico-red.js
git commit -m "refactor(paso1): gráficos SVG de poder/interés y red de actores"
```

---

## Tarea 9: Paso 1 · Validación, técnicas y orquestador

Cierra el Paso 1 y resuelve dos defectos: la duplicación de `renderTechniqueHelp` (defecto 4) y los manejadores privados de actores (mitad del defecto 1).

**Files:**
- Create: `js/pasos/paso1-involucrados/validacion.js`, `tecnicas.js`, `index.js`
- Modify: `js/core/registro-pasos.js`
- Read: `ORIG` 7908-7947, 8918-9180, 9253-9319, 9456-9491, 8881-8891, 5349-5355

**Interfaces:**
- Consumes: `modelo.js`, `formulario.js`, `tablas.js`, `grafico-poder-interes.js`, `grafico-red.js`, `texto.js`, `portapapeles.js`
- Produces: `validacion.js`: `validateActor`, `actorValidationMessages`, `renderActorValidations`; `tecnicas.js`: `renderTechniqueHelp`; `index.js`: módulo por defecto `ModuloPaso`.

- [ ] **Step 1: Escribir `validacion.js`**

Copiar literalmente `validateActor` (7908-7947), `actorValidationMessages` (8918-9132) y `renderActorValidations` (9134-9180). Importar `normalizeTextForValidation` y `containsAny` de `../../utils/texto.js`.

- [ ] **Step 2: Escribir `tecnicas.js` — defecto 4**

`ORIG` define `renderTechniqueHelp` dos veces, en 9253-9319 y 9322-9388, con cuerpos byte a byte idénticos (verificado con `diff`). La segunda pisaba a la primera.

Copiar **una sola** de las dos, exportarla, y comprobar:

```bash
grep -c 'function renderTechniqueHelp' js/pasos/paso1-involucrados/tecnicas.js   # Expected: 1
```

- [ ] **Step 3: Escribir `index.js` — defecto 1**

`initActorModule` (9456-9491) y `renderActors` (8881-8891) se convierten en `init` y `render`. Toda la conexión de eventos pasa por delegación sobre el contenedor.

```js
import { obtenerEstado } from "../../core/estado.js";
import { irAPantalla } from "../../core/router.js";
import { copiarDesdeElemento } from "../../utils/portapapeles.js";
import { saveActor, editActor, deleteActor, clearActorForm } from "./formulario.js";
import { renderMainActorTable, renderCharacterization } from "./tablas.js";
import { drawInterestPowerChart } from "./grafico-poder-interes.js";
import { drawStakeholderNetwork } from "./grafico-red.js";
import { renderActorValidations } from "./validacion.js";
import { renderTechniqueHelp } from "./tecnicas.js";

let raiz = null;

function render() {
  renderMainActorTable();
  renderCharacterization();
  drawInterestPowerChart();
  drawStakeholderNetwork();
  renderActorValidations();
  renderTechniqueHelp();
}

export default {
  id: 1,
  titulo: "Análisis de involucrados",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 1",
  vista: "views/screen01-involucrados.html",

  init(contenedor) {
    raiz = contenedor;

    // Delegación: cubre también las filas de tabla generadas dinámicamente.
    raiz.addEventListener("click", async (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const indice = Number(objetivo.dataset.indice);

      switch (objetivo.dataset.accion) {
        case "guardar-actor":   saveActor();   render(); break;
        case "limpiar-actor":   clearActorForm();        break;
        case "editar-actor":    editActor(indice);   render(); break;
        case "eliminar-actor":  deleteActor(indice); render(); break;
        case "copiar-prompt":
          // Resuelve el defecto 1: copyAIPrompt era privada del IIFE.
          await copiarDesdeElemento(objetivo.dataset.prompt, objetivo);
          break;
        case "continuar-paso2": irAPantalla(2); break;
        default: break;
      }
    });

    raiz.addEventListener("change", (evento) => {
      if (evento.target.id === "participationTechnique") renderTechniqueHelp();
    });
  },

  render
};
```

- [ ] **Step 4: Marcar los elementos del parcial**

En `views/screen01-involucrados.html`, los tres botones de copiar prompt (que en `ORIG` 3626, 3661 y 3701 tenían `onclick="copyAIPrompt('aiPrompt1',this)"`) pasan a:

```html
<button type="button" class="ai-copy-btn" data-accion="copiar-prompt" data-prompt="aiPrompt1">
```

con `aiPrompt2` y `aiPrompt3` en los otros dos. Los botones de guardar y limpiar del formulario reciben `data-accion="guardar-actor"` y `data-accion="limpiar-actor"`, y el de continuar `data-accion="continuar-paso2"`.

- [ ] **Step 5: Registrar el paso**

En `registro-pasos.js`: `import paso1 from "../pasos/paso1-involucrados/index.js";` y sustituir la entrada `{ id: 1, ... }`.

- [ ] **Step 6: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 7: Comprobación manual — es la que valida el defecto 1**

Servir y, en la pantalla 1:
1. Rellenar el formulario de actor y guardar. Expected: aparece en la tabla principal y en la caracterización; los dos gráficos SVG se redibujan.
2. Pulsar «Editar» en una fila. Expected: el formulario se rellena con ese actor. **En el artefacto original esto lanza `ReferenceError`** — comprobar que aquí funciona.
3. Pulsar «Eliminar». Expected: la fila desaparece y los gráficos se actualizan.
4. Pulsar los tres botones «Copiar» de los prompts de IA. Expected: el botón dice «¡Copiado!» y el portapapeles tiene el texto. **En el original los tres lanzan `ReferenceError`.**
5. Cambiar el selector de técnica de participación. Expected: la ayuda contextual cambia.

- [ ] **Step 8: Commit**

```bash
git add js/pasos/paso1-involucrados js/core/registro-pasos.js views/screen01-involucrados.html
git commit -m "feat(paso1): validación, técnicas y orquestador

Corrige el defecto 4 (renderTechniqueHelp duplicada) y la parte del
defecto 1 relativa a editActor, deleteActor y copyAIPrompt."
```

---

## Tarea 10: Paso 2 · Contexto y enunciado del problema central

Resuelve la segunda mitad del defecto 2: hacer que el `<textarea>` renombrado en la Tarea 5 se lea y se guarde de verdad.

**Files:**
- Create: `js/pasos/paso2-problema/contexto.js`, `enunciado.js`
- Read: `ORIG` 5358-5538 (`prepararPaso2`), 6399-6450 (`renderProblemContext`), 9583-9866 (`composeCentralProblem`, `bindProblemCentralFields`, `validateCentralProblem`, `confirmCentralProblem`)

**Interfaces:**
- Consumes: `estado.js`, `dom.js`
- Produces: `contexto.js`: `prepararPaso2`, `renderProblemContext`; `enunciado.js`: `composeCentralProblem`, `enlazarCamposCentrales`, `validateCentralProblem`, `confirmCentralProblem`

- [ ] **Step 1: Escribir `contexto.js`**

Copiar `prepararPaso2` (5358-5538) y `renderProblemContext` (6399-6450), sustituyendo `state` por `obtenerEstado()`. `renderProblemContext` escribe en el input `problemPopulation` (el de la subpantalla «Contexto»): ese `id` **no cambia** y la función se queda como está.

- [ ] **Step 2: Escribir `enunciado.js` — defecto 2**

Copiar `composeCentralProblem` (9583-9614), `validateCentralProblem` (9660-9785) y `confirmCentralProblem` (9788-9866). En las tres, sustituir toda referencia a `getElementById("problemPopulation")` por `getElementById("problemCentralPopulation")` — son las líneas 9592, 9645, 9671 y 9808 del original.

`bindProblemCentralFields` (9617-9657) se reescribe como `enlazarCamposCentrales`, con delegación y con el `id` corregido:

```js
import { obtenerEstado, notificarCambio } from "../../core/estado.js";

/**
 * Enlaza los cuatro campos del enunciado central con el estado.
 *
 * `problemCentralPopulation` era `problemPopulation` en el artefacto
 * original, colisionando con el input de la subpantalla «Contexto».
 * getElementById devolvía siempre el input, de modo que lo que se
 * escribía en este textarea nunca llegaba al estado (defecto 2).
 */
const CAMPOS_CENTRALES = {
  problemCondition: "condicion",
  problemAttribute: "atributo",
  problemCentralPopulation: "poblacion",
  problemDelimitation: "delimitacion"
};

export function enlazarCamposCentrales(raiz, alCambiar) {
  raiz.addEventListener("input", (evento) => {
    const clave = CAMPOS_CENTRALES[evento.target.id];
    if (!clave) return;

    const problema = obtenerEstado().problema;
    problema[clave] = evento.target.value.trim();
    problema.enunciado = composeCentralProblem();
    notificarCambio();
    alCambiar();
  });
}
```

`composeCentralProblem` debe leer de `CAMPOS_CENTRALES`, no de los `id` antiguos.

- [ ] **Step 3: Verificar**

```bash
bash tools/verificar.sh
grep -rn 'problemPopulation' js/pasos/paso2-problema/enunciado.js
```

Expected: `verificar.sh` en PASS, y el `grep` **sin resultados** — en `enunciado.js` no puede quedar ninguna referencia al `id` antiguo.

- [ ] **Step 4: Commit**

```bash
git add js/pasos/paso2-problema/contexto.js js/pasos/paso2-problema/enunciado.js
git commit -m "refactor(paso2): contexto y enunciado central

Corrige el defecto 2: el textarea del enunciado pasa a
problemCentralPopulation y por fin se lee y se guarda."
```

---

## Tarea 11: Paso 2 · Modelo y gestión de nodos

**Files:**
- Create: `js/pasos/paso2-problema/modelo.js`, `nodos.js`
- Read: `ORIG` 9873-9890 (`nextNodeCode`), 5718-5760 (`createsCycle`), 9893-10152, 10158-10284, 11896-12025

**Interfaces:**
- Consumes: `estado.js`, `dom.js`
- Produces: `modelo.js`: `nextNodeCode(type, level)`, `createsCycle(codigo, padre)`; `nodos.js`: `refreshNodeParentOptions`, `addProblemNode`, `deleteProblemNode`, `renderProblemNodes`, `renderTreeNode`, `renderProblemNodeList`

- [ ] **Step 1: Escribir `modelo.js`**

Copiar `nextNodeCode` (9873-9890) y `createsCycle` (5718-5760). `createsCycle` está anidada dentro de `runProblemValidation`; extraerla al nivel superior y exportarla, sin tocar su cuerpo. La Tarea 14 la importará desde aquí.

- [ ] **Step 2: Escribir `nodos.js`**

Copiar `refreshNodeParentOptions` (9893-9939), `addProblemNode` (9942-10094), `deleteProblemNode` (10097-10152), `renderProblemNodes` con su anidada `nodeCard` (10158-10284), `renderTreeNode` (11896-11927) y `renderProblemNodeList` (11930-12025).

Ajustes: `state` → `obtenerEstado()` + `notificarCambio()` tras mutar; y todo `onclick` que aparezca en las plantillas de cadena de `nodeCard` pasa a `data-accion="eliminar-nodo" data-codigo="..."`.

- [ ] **Step 3: Verificar**

```bash
bash tools/verificar.sh
grep -rnE 'onclick=|onchange=' js/pasos/paso2-problema/nodos.js
```

Expected: PASS y `grep` sin resultados.

- [ ] **Step 4: Commit**

```bash
git add js/pasos/paso2-problema/modelo.js js/pasos/paso2-problema/nodos.js
git commit -m "refactor(paso2): modelo de nodos y gestión del árbol"
```

---

## Tarea 12: Paso 2 · Árbol SVG

La función más grande del proyecto: 683 líneas con cinco anidadas. Migración literal, sin refactorizar.

**Files:**
- Create: `js/pasos/paso2-problema/arbol-svg.js`
- Read: `ORIG` 10286-10968

**Interfaces:**
- Consumes: `svg.js`, `estado.js`
- Produces: `renderProblemTree(): void`

- [ ] **Step 1: Copiar la función entera**

```bash
sed -n '10286,10968p' ../ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html \
  > js/pasos/paso2-problema/arbol-svg.js
wc -l js/pasos/paso2-problema/arbol-svg.js   # Expected: 683
```

- [ ] **Step 2: Ajustar solo lo imprescindible**

Cuatro cambios, y ninguno más:
1. Añadir la cabecera de imports: `import { svgEl, addSvgText } from "../../utils/svg.js";` e `import { obtenerEstado } from "../../core/estado.js";`
2. `export function renderProblemTree(` en la línea de la firma.
3. `state` → `obtenerEstado()`.
4. **Eliminar la definición anidada de `svgText`** (era 10439-10445 en el original) e importarla de `../../utils/svg.js`, ya que la Tarea 3 la extrajo allí.

`groupByLevel`, `hierarchyColor`, `distribute`, `drawConnector` y `drawNode` **se quedan anidadas**, tal cual. No extraer, no renombrar, no tocar ninguna constante de posicionamiento.

- [ ] **Step 3: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add js/pasos/paso2-problema/arbol-svg.js
git commit -m "refactor(paso2): árbol de problemas SVG, migración literal"
```

---

## Tarea 13: Paso 2 · Evidencia de nodos

**Files:**
- Create: `js/pasos/paso2-problema/evidencia.js`
- Read: `ORIG` 10970-11300 (`renderNodeEvidence` con `requirement` y `confidenceClass`)

**Interfaces:**
- Consumes: `estado.js`, `dom.js`
- Produces: `renderNodeEvidence(): void`

- [ ] **Step 1: Copiar `renderNodeEvidence` entera**

Las 331 líneas, con `requirement` (11017-11028) y `confidenceClass` (11031-11042) anidadas dentro, como están. Añadir `export`, los imports de `escapeHTML` y `obtenerEstado`, y sustituir `state`. Convertir a `data-accion` cualquier `onclick`/`onchange` de sus plantillas de cadena.

- [ ] **Step 2: Verificar**

```bash
bash tools/verificar.sh
grep -rnE 'onclick=|onchange=' js/pasos/paso2-problema/evidencia.js
```

Expected: PASS y sin resultados.

- [ ] **Step 3: Commit**

```bash
git add js/pasos/paso2-problema/evidencia.js
git commit -m "refactor(paso2): tabla de evidencia y línea base"
```

---

## Tarea 14: Paso 2 · Validación del árbol

**Files:**
- Create: `js/pasos/paso2-problema/validacion.js`
- Read: `ORIG` 5540-5933 (`runProblemValidation`), 5935-6184, 6186-6305, 6307-6396

**Interfaces:**
- Consumes: `modelo.js` (Tarea 11, para `createsCycle`), `estado.js`, `dom.js`
- Produces: `runProblemValidation`, `renderProblemValidationResults`, `saveProblemExternalValidation`, `saveProblemValidationDecision`

- [ ] **Step 1: Copiar las cuatro funciones**

`runProblemValidation` (5540-5933) **sin** su anidada `createsCycle`, que la Tarea 11 movió a `modelo.js`: eliminar la definición anidada y añadir `import { createsCycle } from "./modelo.js";`. Copiar después `renderProblemValidationResults` (5935-6184), `saveProblemExternalValidation` (6186-6305) y `saveProblemValidationDecision` (6307-6396).

- [ ] **Step 2: Verificar que `createsCycle` no quedó duplicada**

```bash
grep -rc 'function createsCycle' js/pasos/paso2-problema/*.js
```

Expected: `modelo.js:1` y `validacion.js:0`.

- [ ] **Step 3: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS. La comprobación 4 confirma que `validacion.js` importa un `createsCycle` que `modelo.js` sí exporta.

- [ ] **Step 4: Commit**

```bash
git add js/pasos/paso2-problema/validacion.js
git commit -m "refactor(paso2): validación lógica del árbol de problemas"
```

---

## Tarea 15: Paso 2 · Bitácora

**Files:**
- Create: `js/pasos/paso2-problema/bitacora.js`
- Read: `ORIG` 6452-6551, 6553-6760, 6762-6791, 6793-6814

**Interfaces:**
- Consumes: `estado.js`, `dom.js`, `texto.js` (para `formatProblemLogDate`)
- Produces: `addProblemLog`, `renderProblemBitacora`, `deleteProblemLog`, `clearProblemLogForm`

- [ ] **Step 1: Copiar las cuatro funciones**

`addProblemLog` (6452-6551), `renderProblemBitacora` (6553-6760), `deleteProblemLog` (6762-6791), `clearProblemLogForm` (6793-6814). `formatProblemLogDate` ya vive en `utils/texto.js` desde la Tarea 3: importarla, no volver a definirla.

Los `onclick` de las entradas de bitácora generadas en `renderProblemBitacora` pasan a `data-accion="eliminar-bitacora" data-indice="..."`.

- [ ] **Step 2: Verificar**

```bash
bash tools/verificar.sh
grep -rc 'function formatProblemLogDate' js/pasos/paso2-problema/bitacora.js   # Expected: 0
```

- [ ] **Step 3: Commit**

```bash
git add js/pasos/paso2-problema/bitacora.js
git commit -m "refactor(paso2): bitácora de trazabilidad"
```

---

## Tarea 16: Paso 2 · Prompts de IA y orquestador

Cierra el Paso 2.

**Files:**
- Create: `js/pasos/paso2-problema/prompts.js`, `index.js`
- Modify: `js/core/registro-pasos.js`
- Read: `ORIG` 11302-11308, 11315-11747, 9521-9550 (`showProblemSubscreen`), 6842-6874 (`continuarAlPaso3`), 5349-5355

**Interfaces:**
- Consumes: todos los módulos del Paso 2, `portapapeles.js`, `router.js`
- Produces: `prompts.js`: `renderProblemModule`, `generateProblemPrompt`; `index.js`: módulo por defecto `ModuloPaso`

- [ ] **Step 1: Escribir `prompts.js`**

Copiar `renderProblemModule` (11302-11308) y `generateProblemPrompt` con su anidada `formatNodes` (11315-11747, 433 líneas). El copiado al portapapeles ya vive en `utils/portapapeles.js` desde la Tarea 3: **no** copiar `copyProblemPrompt` ni `fallbackCopyProblemPrompt`.

**Sí copiar `writeProblemPrompt` (11825-11893) aquí.** La Tarea 3 la excluyó de `utils/` con razón: muta `state.bitacora`. Este módulo sí puede importar de `core/estado.js`.

- [ ] **Step 2: Escribir `index.js`**

`showProblemSubscreen` (9521-9550) se conserva como función interna; las clases `.problem-subscreen` y `.step2-tab` no cambian.

```js
import { irAPantalla } from "../../core/router.js";
import { copiarDesdeElemento } from "../../utils/portapapeles.js";
import { prepararPaso2, renderProblemContext } from "./contexto.js";
import { enlazarCamposCentrales, validateCentralProblem, confirmCentralProblem } from "./enunciado.js";
import { refreshNodeParentOptions, addProblemNode, deleteProblemNode, renderProblemNodes } from "./nodos.js";
import { renderProblemTree } from "./arbol-svg.js";
import { renderNodeEvidence } from "./evidencia.js";
import { runProblemValidation, renderProblemValidationResults,
         saveProblemExternalValidation, saveProblemValidationDecision } from "./validacion.js";
import { addProblemLog, renderProblemBitacora, deleteProblemLog, clearProblemLogForm } from "./bitacora.js";
import { renderProblemModule } from "./prompts.js";

let raiz = null;

function mostrarSubpantalla(nombre, boton) {
  for (const s of raiz.querySelectorAll(".problem-subscreen")) s.classList.remove("active");
  for (const t of raiz.querySelectorAll(".step2-tab")) t.classList.remove("active");
  raiz.querySelector(`#problemSubscreen-${nombre}`)?.classList.add("active");
  boton?.classList.add("active");
}

function render() {
  prepararPaso2();
  renderProblemContext();
  renderProblemNodes();
  renderProblemTree();
  renderNodeEvidence();
  renderProblemBitacora();
  renderProblemModule();
  refreshNodeParentOptions();
}

export default {
  id: 2,
  titulo: "Análisis del problema",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 2",
  vista: "views/screen02-problema.html",

  init(contenedor) {
    raiz = contenedor;
    enlazarCamposCentrales(raiz, renderProblemTree);

    raiz.addEventListener("click", async (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const { accion, subpantalla, codigo, indice, prompt } = objetivo.dataset;

      switch (accion) {
        case "subpantalla":        mostrarSubpantalla(subpantalla, objetivo); break;
        case "validar-enunciado":  validateCentralProblem(); break;
        case "confirmar-enunciado": confirmCentralProblem(); renderProblemTree(); break;
        case "agregar-nodo":       addProblemNode(); render(); break;
        case "eliminar-nodo":      deleteProblemNode(codigo); render(); break;
        case "validar-arbol":      renderProblemValidationResults(runProblemValidation()); break;
        case "guardar-validacion-externa": saveProblemExternalValidation(); break;
        case "guardar-decision":   saveProblemValidationDecision(); break;
        case "agregar-bitacora":   addProblemLog(); renderProblemBitacora(); break;
        case "eliminar-bitacora":  deleteProblemLog(Number(indice)); renderProblemBitacora(); break;
        case "limpiar-bitacora":   clearProblemLogForm(); break;
        case "copiar-prompt":      await copiarDesdeElemento(prompt, objetivo); break;
        case "continuar-paso3":    irAPantalla(3); break;
        default: break;
      }
    });
  },

  render
};
```

- [ ] **Step 3: Marcar los elementos del parcial**

En `views/screen02-problema.html`, añadir `data-accion` (y `data-subpantalla`, `data-prompt`, `data-indice` donde corresponda) a cada elemento que perdió su atributo `on*` en la Tarea 5. Las siete pestañas del Paso 2 llevan `data-accion="subpantalla" data-subpantalla="<nombre>"`, con los nombres que ya usan sus `id` (`problemSubscreen-contexto`, `-problema`, `-causas`, `-arbol`, `-evidencia`, `-validacion`, `-bitacora`).

- [ ] **Step 4: Registrar el paso**

`import paso2 from "../pasos/paso2-problema/index.js";` y sustituir la entrada `{ id: 2, ... }`.

- [ ] **Step 5: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 6: Comprobación manual — la más larga del plan**

Con el original abierto al lado, recorrer las siete subpantallas del Paso 2:
1. **Contexto** — los campos se rellenan desde la ficha del Paso 0.
2. **Enunciado** — escribir en los cuatro campos. Expected: el enunciado compuesto se actualiza. **Escribir en «Población afectada» y comprobar que el texto se conserva al salir y volver** — esto es lo que el defecto 2 rompía.
3. **Causas y efectos** — añadir nodos de cada tipo y nivel; comprobar los códigos generados.
4. **Árbol** — el SVG dibuja los nodos, los conectores y el problema central. Comparar contra el original con los mismos datos.
5. **Evidencia** — la tabla lista los nodos con sus requisitos y su clase de confianza.
6. **Validación** — ejecutar; comprobar que detecta un ciclo si se crea uno a propósito.
7. **Bitácora** — añadir, listar y eliminar entradas; comprobar el formato de fecha.

- [ ] **Step 7: Commit**

```bash
git add js/pasos/paso2-problema js/core/registro-pasos.js views/screen02-problema.html
git commit -m "feat(paso2): prompts de IA y orquestador del análisis del problema"
```

---

## Tarea 17: Paso 3 · Objetivos

Resuelve el defecto 3: la sincronización con el Paso 2 que fallaba en silencio.

**Files:**
- Create: `js/pasos/paso3-objetivos/sincronizacion.js`, `transformacion.js`, `propuestas.js`, `supuestos.js`, `index.js`
- Modify: `js/core/registro-pasos.js`
- Read: `ORIG` 7045-7100, 7106-7371, 7373-7586, 7588-7655, 7657-7766, 12031-12068, 6842-6874

**Interfaces:**
- Consumes: `estado.js`, `dom.js`, `router.js`
- Produces: `sincronizacion.js`: `syncObjectivesFromProblemNodes`; `transformacion.js`: `renderObjectiveTransformation`, `updateObjectiveValue`; `propuestas.js`: `generateObjectiveProposals`, `proposePositiveState`; `supuestos.js`: `toggleObjectiveAssumption`, `renderObjectiveAssumptions`; `index.js`: módulo por defecto

- [ ] **Step 1: Escribir `sincronizacion.js` — defecto 3**

Copiar `syncObjectivesFromProblemNodes` (7045-7100). Lee `estado.nodos` y escribe `estado.objetivos`; **no importa nada del Paso 2**, cumpliendo la regla de aislamiento. Comprobar:

```bash
grep -n 'paso2' js/pasos/paso3-objetivos/sincronizacion.js   # Expected: sin resultados
```

- [ ] **Step 2: Escribir `transformacion.js`, `propuestas.js` y `supuestos.js`**

Copiar literalmente: `renderObjectiveTransformation` (7106-7371) y `updateObjectiveValue` (7588-7623) en `transformacion.js`; `generateObjectiveProposals` (7373-7425) y `proposePositiveState` (7427-7586) en `propuestas.js`; `toggleObjectiveAssumption` (7625-7655) y `renderObjectiveAssumptions` (7657-7766) en `supuestos.js`.

En `renderObjectiveTransformation`, el `onchange="updateObjectiveValue('${escapeHTML(node.codigo)}', this.value)"` de `ORIG` 7295 pasa a `data-accion="editar-objetivo" data-codigo="${escapeHTML(node.codigo)}"`.

- [ ] **Step 3: Escribir `index.js`**

```js
import { irAPantalla } from "../../core/router.js";
import { syncObjectivesFromProblemNodes } from "./sincronizacion.js";
import { renderObjectiveTransformation, updateObjectiveValue } from "./transformacion.js";
import { generateObjectiveProposals } from "./propuestas.js";
import { toggleObjectiveAssumption, renderObjectiveAssumptions } from "./supuestos.js";

let raiz = null;

function mostrarSubpantalla(nombre, boton) {
  for (const s of raiz.querySelectorAll(".objective-subscreen")) s.classList.remove("active");
  for (const t of raiz.querySelectorAll(".step3-tab")) t.classList.remove("active");
  raiz.querySelector(`#objectiveSubscreen-${nombre}`)?.classList.add("active");
  boton?.classList.add("active");
  if (nombre === "transformacion") {
    renderObjectiveTransformation();
    renderObjectiveAssumptions();
  }
}

function render() {
  // El artefacto original nunca llegaba a ejecutar esto: comprobaba
  // `typeof syncObjectivesFromProblemNodes === "function"` sobre una
  // función privada del IIFE, y la condición era siempre falsa (defecto 3).
  syncObjectivesFromProblemNodes();
  renderObjectiveTransformation();
  renderObjectiveAssumptions();
}

export default {
  id: 3,
  titulo: "Análisis de objetivos",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 3",
  vista: "views/screen03-objetivos.html",

  init(contenedor) {
    raiz = contenedor;

    raiz.addEventListener("click", (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const { accion, subpantalla, codigo } = objetivo.dataset;

      switch (accion) {
        case "subpantalla":        mostrarSubpantalla(subpantalla, objetivo); break;
        case "generar-propuestas": generateObjectiveProposals(); render(); break;
        case "alternar-supuesto":  toggleObjectiveAssumption(codigo); renderObjectiveAssumptions(); break;
        case "continuar-paso4":    irAPantalla(4); break;
        default: break;
      }
    });

    raiz.addEventListener("change", (evento) => {
      const campo = evento.target.closest("[data-accion='editar-objetivo']");
      if (campo) updateObjectiveValue(campo.dataset.codigo, campo.value);
    });
  },

  render
};
```

- [ ] **Step 4: Marcar el parcial y registrar el paso**

Añadir los `data-accion` correspondientes en `views/screen03-objetivos.html` (las pestañas, el botón de generar propuestas y el de continuar). Registrar `paso3` en `registro-pasos.js`.

- [ ] **Step 5: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS, incluida la comprobación 3 (aislamiento entre pasos).

- [ ] **Step 6: Comprobación manual — valida el defecto 3**

1. Crear varios nodos en el Paso 2.
2. Navegar al Paso 3. **Expected: los objetivos aparecen sincronizados desde los nodos del Paso 2.** En el artefacto original esta lista sale vacía, sin ningún mensaje de error.
3. Abrir la pestaña «Transformación». Expected: se renderiza. **En el original esto lanza `ReferenceError`.**
4. Editar el texto de un objetivo y comprobar que persiste al cambiar de pestaña.

- [ ] **Step 7: Commit**

```bash
git add js/pasos/paso3-objetivos js/core/registro-pasos.js views/screen03-objetivos.html
git commit -m "feat(paso3): análisis de objetivos

Corrige el defecto 3: la sincronización desde el árbol de problemas
fallaba en silencio por una comprobación typeof sobre una función
privada del IIFE."
```

---

## Tarea 18: Pasos 4 a 10 como marcadores

**Files:**
- Create: `js/pasos/pasos-pendientes/index.js`
- Modify: `js/core/registro-pasos.js`

**Interfaces:**
- Produces: `crearPasoPendiente(config): ModuloPaso`

- [ ] **Step 1: Escribir la fábrica**

```js
/**
 * Fábrica para las pantallas 4 a 10, cuyo markup existe pero cuya lógica
 * MML aún no está desarrollada. Cumplen el contrato ModuloPaso para que el
 * router y la navegación las traten como a cualquier otra.
 */
export function crearPasoPendiente({ id, titulo, grupo, etiquetaPaso, vista }) {
  return {
    id,
    titulo,
    grupo,
    etiquetaPaso,
    vista,
    init() {},
    render() {}
  };
}
```

- [ ] **Step 2: Registrar los siete pasos**

En `registro-pasos.js`, sustituir las entradas 4 a 10 por llamadas a `crearPasoPendiente`, conservando exactamente los `titulo`, `grupo` y `etiquetaPaso` de la Tarea 5.

- [ ] **Step 3: Verificar**

```bash
bash tools/verificar.sh
grep -c 'PENDIENTE' js/core/registro-pasos.js   # Expected: 0
```

- [ ] **Step 4: Comprobación manual**

Navegar a las 11 pantallas en orden. Expected: ninguna produce error en consola; las 4 a 10 muestran su markup de marcador.

- [ ] **Step 5: Commit**

```bash
git add js/pasos/pasos-pendientes js/core/registro-pasos.js
git commit -m "feat(pasos): registrar las pantallas 4 a 10 como marcadores"
```

---

## Tarea 19: Persistencia en localStorage

**Files:**
- Create: `js/core/almacenamiento.js`
- Modify: `js/main.js`
- Read: `ORIG` 12069-12091 (`exportStateJSON`), 12093-12104 (`importStateJSON`)

**Interfaces:**
- Consumes: `estado.js`
- Produces: `iniciarAutoguardado(): void`, `restaurarBorrador(): boolean`, `descartarBorrador(): void`, `exportarJSON(): void`, `importarJSON(archivo: File): Promise<void>`

- [ ] **Step 1: Escribir `almacenamiento.js`**

```js
import { obtenerEstado, cargarEstado, suscribir } from "./estado.js";

const CLAVE = "artefacto-mml:borrador";
const RETARDO_MS = 500;

let temporizador = null;
let avisado = false;

function disponible() {
  try {
    const prueba = "__mml_test__";
    window.localStorage.setItem(prueba, "1");
    window.localStorage.removeItem(prueba);
    return true;
  } catch {
    return false;
  }
}

function avisarUnaVez(mensaje) {
  if (avisado) return;
  avisado = true;
  console.warn(`[almacenamiento] ${mensaje}`);
}

export function iniciarAutoguardado() {
  if (!disponible()) {
    avisarUnaVez("localStorage no disponible: se trabaja sin autoguardado.");
    return;
  }
  suscribir(() => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      try {
        window.localStorage.setItem(CLAVE, JSON.stringify(obtenerEstado()));
      } catch (error) {
        avisarUnaVez(`no se pudo guardar (¿cuota agotada?): ${error.message}`);
      }
    }, RETARDO_MS);
  });
}

/** Devuelve true si había borrador y se restauró. */
export function restaurarBorrador() {
  if (!disponible()) return false;
  let bruto;
  try {
    bruto = window.localStorage.getItem(CLAVE);
  } catch {
    return false;
  }
  if (!bruto) return false;

  try {
    cargarEstado(JSON.parse(bruto));
    return true;
  } catch (error) {
    console.error("[almacenamiento] borrador corrupto, se descarta:", error);
    descartarBorrador();
    return false;
  }
}

export function descartarBorrador() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch { /* nada que hacer */ }
}

export function exportarJSON() {
  const json = JSON.stringify(obtenerEstado(), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "artefacto-mml.json";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export async function importarJSON(archivo) {
  const texto = await archivo.text();
  cargarEstado(JSON.parse(texto));
}
```

- [ ] **Step 2: Conectar en `main.js`**

```js
import { iniciarRouter, irAPantalla } from "./core/router.js";
import { obtenerEstado } from "./core/estado.js";
import {
  iniciarAutoguardado, restaurarBorrador,
  exportarJSON, importarJSON
} from "./core/almacenamiento.js";

window.addEventListener("DOMContentLoaded", async () => {
  if (restaurarBorrador()) {
    console.info("[main] borrador restaurado desde localStorage.");
  }
  iniciarAutoguardado();

  document.getElementById("btnExportJSON")
    ?.addEventListener("click", exportarJSON);

  const entrada = document.getElementById("inputImportJSON");
  document.getElementById("btnImportJSON")
    ?.addEventListener("click", () => entrada?.click());

  entrada?.addEventListener("change", async (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    try {
      await importarJSON(archivo);
      await irAPantalla(obtenerEstado().current ?? 0);
    } catch (error) {
      console.error("[main] no se pudo importar el JSON:", error);
      window.alert(`No se pudo importar el archivo: ${error.message}`);
    }
    evento.target.value = "";
  });

  try {
    await iniciarRouter();
  } catch (error) {
    console.error("[main] fallo al iniciar la aplicación:", error);
  }
});
```

- [ ] **Step 3: Verificar**

Run: `bash tools/verificar.sh`
Expected: PASS.

- [ ] **Step 4: Comprobación manual — persistencia**

1. Rellenar la ficha del caso y añadir dos actores. Recargar la página (F5). Expected: todo sigue ahí. **En el artefacto original se pierde.**
2. Exportar JSON. Expected: se descarga `artefacto-mml.json`.
3. Abrir el **artefacto original**, exportar su JSON, e importarlo en el proyecto nuevo. Expected: se carga sin errores — confirma que la forma del estado no cambió.
4. Abrir el proyecto en una ventana de incógnito con el almacenamiento bloqueado. Expected: la aplicación funciona, con un aviso en consola y sin autoguardado.

- [ ] **Step 5: Commit**

```bash
git add js/core/almacenamiento.js js/main.js
git commit -m "feat(core): autoguardado en localStorage y export/import JSON"
```

---

## Tarea 20: Barrido final, datos y documentación

**Files:**
- Create: `README.md`
- Copy: `data/caso_uso_jovenes_rurales_manizales.json`
- Modify: `.gitignore`

- [ ] **Step 1: Copiar el archivo de datos**

```bash
cp ../ArtefactoUnal/caso_uso_jovenes_rurales_manizales.json data/
```

Queda como caso de ejemplo. En el artefacto original tampoco se cargaba desde ninguna parte; cargarlo es trabajo futuro, fuera del alcance de este plan.

- [ ] **Step 2: Barrido de residuos de la migración**

```bash
echo "-- funciones del original que no se migraron a ningún módulo --"
for f in copyAIPrompt editActor deleteActor generateObjectiveProposals \
         updateObjectiveValue syncObjectivesFromProblemNodes renderTechniqueHelp; do
  n=$(grep -rl "function $f\|$f," js | wc -l)
  [ "$n" -eq 0 ] && echo "  FALTA: $f"
done

echo "-- llamadas a funciones inexistentes --"
grep -rhoE '\b[a-zA-Z_][a-zA-Z0-9_]*\(' js --include='*.js' \
  | sed 's/($//;s/(//' | sort -u > /tmp/llamadas.txt
grep -rhoE 'function [a-zA-Z_][a-zA-Z0-9_]*' js --include='*.js' \
  | awk '{print $2}' | sort -u > /tmp/definidas.txt
comm -23 /tmp/llamadas.txt /tmp/definidas.txt | head -40
```

La segunda lista incluirá métodos nativos (`querySelector`, `map`, `parseInt`…), que son ruido esperado. Revisarla buscando nombres del dominio del artefacto: cualquiera que aparezca es una referencia colgante y debe corregirse.

- [ ] **Step 3: Escribir `README.md`**

````markdown
# Artefacto MML · Formulación de Proyectos

Aplicación web educativa para la formulación de proyectos con la Metodología
de Marco Lógico (CEPAL/ILPES). Versión modular de
`ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`.

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
| `data/` | Caso de ejemplo |
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
global. El proyecto no tiene pruebas automatizadas: la verificación funcional
es manual, contra el artefacto original.

## Estado actual

Pasos 0 a 3 funcionales. Pasos 4 a 10 registrados y navegables, con su markup
pero sin lógica.

## Defectos corregidos respecto al artefacto original

| # | Defecto | Origen | Corrección |
|---|---|---|---|
| 1 | `copyAIPrompt`, `editActor`, `deleteActor`, `generateObjectiveProposals` y `updateObjectiveValue` eran privadas del IIFE (líneas 6878-9515) pero se invocaban desde atributos `onclick`: lanzaban `ReferenceError` | 9394, 8018, 8029, 7373, 7588 | Eliminado el IIFE; eventos por delegación desde `init()` |
| 2 | `id="problemPopulation"` duplicado: `getElementById` devolvía el input de contexto, así que el textarea del enunciado central nunca se leía | 3810, 3899 | El textarea pasa a `problemCentralPopulation` |
| 3 | `continuarAlPaso3` comprobaba `typeof syncObjectivesFromProblemNodes === "function"` sobre una función privada: siempre falso, sincronización nunca ejecutada, sin error visible | 6852 | `import` explícito en `paso3-objetivos/sincronizacion.js` |
| 4 | `renderTechniqueHelp` definida dos veces, cuerpos idénticos | 9253, 9322 | Una sola definición en `paso1-involucrados/tecnicas.js` |
| 5 | `<div class="card">` sin cerrar; `.wizard-actions` quedaba anidado dentro de la tarjeta | 3464 | Corregido al extraer `views/screen01-involucrados.html` |

Números de línea referidos a
`ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`, que se conserva
intacto como referencia.

## Limitaciones conocidas

- `obtenerEstado()` devuelve el objeto vivo, no una copia: un módulo puede
  mutar el estado sin pasar por el núcleo. Ver §5.1 de la spec.
- Sin pruebas automatizadas.
- Los generadores SVG (~1.100 líneas) se migraron literalmente, sin
  refactorizar.
- Nomenclatura mezclada entre español e inglés, heredada del original.
````

- [ ] **Step 4: Verificación final completa**

```bash
bash tools/verificar.sh
```

Expected: PASS, las cinco comprobaciones en verde.

- [ ] **Step 5: Recorrido manual completo**

Con el artefacto original abierto al lado, recorrer los Pasos 0 a 3 de punta a punta: crear un caso, tres actores, un árbol de problemas con causas y efectos en dos niveles, validarlo, registrar una entrada de bitácora y sincronizar los objetivos. Expected: comportamiento equivalente al original, más los cinco defectos corregidos y la persistencia al recargar.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: README con estructura, verificación y defectos corregidos"
```

---

## Verificación del plan completo

Al terminar las 21 tareas (0 a 20), los criterios de aceptación de la §10 de la spec deben cumplirse:

1. Repositorio git con el árbol de la §4.2 de la spec — `git log --oneline | wc -l` ≥ 21.
2. Las 11 pantallas navegables servidas por HTTP.
3. Pasos 0 a 3 funcionales, verificados contra el original.
4. Los 5 defectos corregidos y documentados en el README con su línea de origen.
5. `bash tools/verificar.sh` en PASS.
6. El trabajo persiste tras recargar; el JSON del artefacto original sigue siendo importable.
7. `docs/analisis-despliegue.md` (Tarea 0) y `docs/decisiones-tecnicas.md` presentes.
8. `README.md` documenta cómo levantar el proyecto.

**Nota sobre el orden.** La Tarea 0 no produce código y ninguna otra depende de ella: puede ejecutarse en paralelo al resto. Las tareas 1 a 20 sí son secuenciales — cada una asume que la anterior está terminada y verificada.

**Nota sobre el verificador.** `tools/verificar.sh` comprueba estructura, no comportamiento: detecta un import roto o un `onclick` olvidado, pero no que un gráfico SVG se dibuje mal ni que una validación devuelva un resultado distinto al del original. Los pasos de comprobación manual de cada tarea no son opcionales; son la única verificación funcional que tiene este plan.
