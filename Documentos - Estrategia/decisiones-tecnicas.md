# Registro de decisiones técnicas

**Proyecto:** Artefacto MML · Formulación de Proyectos
**Contexto académico:** Laboratorio DevOps — Taller Modular
**Fecha de la sesión:** 2026-09-02
**Responsable del proyecto:** luisldra@gmail.com
**Contexto:** Sesión de levantamiento de requisitos mediante diez preguntas de opción múltiple, orientada a definir la reestructuración de un artefacto HTML monolítico hacia un proyecto modular.

---

## 1. Propósito

Este documento registra de forma formal las decisiones técnicas adoptadas durante la sesión de levantamiento de requisitos del 2 de septiembre de 2026, junto con la justificación de cada una. Su finalidad es garantizar la trazabilidad entre las alternativas evaluadas, la opción seleccionada y las consecuencias que dicha selección impone sobre la arquitectura, el despliegue y la verificación del proyecto. Constituye, por tanto, la referencia de consulta ante cualquier revisión posterior del diseño.

---

## 2. Contexto de partida

El punto de partida es el archivo `ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`, un artefacto monolítico con las siguientes características:

- **Extensión total:** 12.352 líneas en un único archivo.
- **Hoja de estilos:** CSS embebido en línea, entre las líneas 8 y 5.344.
- **Marcado:** estructura correspondiente a 11 pantallas de la Metodología de Marco Lógico (MML).
- **Lógica:** aproximadamente 7.000 líneas de JavaScript, distribuidas en 92 funciones.
- **Carencias estructurales:** ausencia de sistema de módulos y ausencia de mecanismo de persistencia.
- **Calidad:** 5 defectos detectados en una revisión previa del código.

El destino de la reestructuración es la carpeta `FormulacionProyectosModular`, que albergará el proyecto modular resultante.

---

## 3. Ronda 1 — Decisiones estructurales

### Pregunta 1 — Stack

> «¿Qué stack quieres para el proyecto modular? Esto define toda la estructura de carpetas y el despliegue.»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| ES Modules sin build (recomendado) | JavaScript nativo con `import`/`export`, CSS en archivos separados, sin dependencias ni paso de compilación. Despliegue como estático puro; máxima fidelidad al código vanilla actual. Requiere servidor local por CORS. | ✅ |
| Vite + JavaScript vanilla | Mismo código vanilla con bundler: recarga en caliente, minificación y build de producción. Añade `package.json` y `node_modules`, e introduce un paso de build. |  |
| Vite + TypeScript | Añade tipado estático. Favorece SOLID e interfaces explícitas, pero exige tipar unas 7.000 líneas existentes: el camino más lento y con mayor superficie de error. |  |
| React / Vue | Reescritura completa del renderizado (hoy 31 asignaciones manuales de `innerHTML`). Equivaldría a un proyecto nuevo, no a una migración. |  |

**Justificación:** el código existente es JavaScript vanilla, por lo que ES Modules sin build ofrece la mayor fidelidad funcional con el menor riesgo de regresión. Se evita además introducir una cadena de compilación cuyo único beneficio inmediato sería cosmético frente al objetivo de preservar el comportamiento.

### Pregunta 2 — Alcance

> «¿Qué alcance funcional tiene la migración respecto a los bugs que encontré?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Migrar + arreglar los 5 defectos (recomendado) | Migración fiel de la lógica y corrección de: handlers privados en el IIFE, identificador duplicado `problemPopulation`, sincronización de objetivos que falla en silencio, función duplicada y `div` sin cerrar. Cada arreglo queda documentado para su verificación. | ✅ |
| Migrar 1:1, defectos aparte | La migración no altera el comportamiento (defectos incluidos) y las correcciones se abordan después como paso separado. Facilita comparar antes/después, pero entrega un proyecto con fallos conocidos. |  |
| Migrar + arreglar + completar pantallas 4-10 | Añade el desarrollo de las 7 pantallas hoy reducidas a marcadores de unas 30 líneas. Implica mucho más trabajo y definir previamente la lógica MML de cada paso. |  |

**Justificación:** dado que los cinco defectos están identificados y acotados, corregirlos durante la migración evita trasladar fallos conocidos al proyecto modular. La documentación individual de cada arreglo preserva la trazabilidad que exigiría una migración 1:1.

### Pregunta 3 — Persistencia

> «¿El artefacto sigue siendo 100% estático o incorporamos persistencia/backend? Hoy no guarda nada: un F5 borra todo el trabajo.»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Estático + `localStorage` (recomendado) | Sin backend. Autoguardado en `localStorage` además del export/import JSON existente. Resuelve la pérdida de datos y mantiene un despliegue trivial en cualquier hosting estático. | ✅ |
| 100% estático, sin tocar persistencia | Se conserva únicamente el export/import manual de JSON. La migración sería puramente estructural. |  |
| Backend con API | Node/Express o similar para almacenar casos en servidor, con usuarios. Cambia radicalmente el análisis de despliegue y multiplica el alcance del taller. |  |

**Justificación:** el autoguardado en `localStorage` corrige la pérdida de trabajo ante una recarga sin alterar la naturaleza estática del artefacto ni el análisis de despliegue. Un backend, en cambio, ampliaría el alcance más allá de lo previsto para el taller.

### Pregunta 4 — DevOps (selección múltiple)

> «El taller está en una carpeta "LaboratorioDevOps". ¿Qué debe cubrir el documento de despliegue y, si aplica, el repo?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Docker + Nginx | `Dockerfile` y `docker-compose` para servir el sitio con Nginx, analizados en el documento y con los archivos incluidos en el repositorio. |  |
| CI/CD (GitHub Actions) | Workflow de build, lint y pruebas con despliegue automático, analizado en el documento y con el workflow incluido en el repositorio. |  |
| Hosting estático (Pages/Netlify/Vercel) | Comparativa de plataformas de hosting gratuito para sitios estáticos, con la ruta de despliegue concreta. |  |
| Solo análisis, sin archivos | El documento evalúa a fondo todas las opciones, pero el repositorio no incluye todavía `Dockerfile` ni workflows. | ✅ |

**Justificación:** el objetivo académico se cumple con la evaluación comparativa de las alternativas de despliegue, sin necesidad de materializarlas. Se evita así incorporar infraestructura que no sería ejercitada en esta etapa del proyecto.

---

## 4. Ronda 2 — Decisiones de detalle

### Pregunta 5 — HTML

> «Dijiste "un html main". ¿Cómo organizamos las 11 pantallas dentro de él?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| `index.html` único con las 11 secciones (recomendado) | Un solo `index.html` con `<section id="screen0..10">`. Se abre con doble clic sin servidor y sin latencia de navegación; migración literal del marcado. En contra: unas 2.200 líneas de HTML. |  |
| `index.html` + parciales en `views/` cargados por `fetch` | `index.html` mínimo (unas 60 líneas) y 11 archivos `views/screen0.html`…`screen10.html` inyectados al navegar. Mucho más modular y mantenible. En contra: exige servidor HTTP siempre y añade carga asíncrona. | ✅ |
| `index.html` + plantillas en `<template>` | Un solo archivo con cada pantalla en un `<template>` clonado al navegar. Punto medio: funciona con `file://` y libera el DOM inicial, pero el archivo sigue siendo grande. |  |

**Justificación:** la separación en parciales es la que realmente materializa la modularidad buscada y mantiene el documento principal en un tamaño manejable. Se acepta conscientemente la dependencia de un servidor HTTP como coste de esa modularidad.

### Pregunta 6 — Pruebas

> «¿Incluimos pruebas automatizadas? Sin bundler igual es posible.»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Sí, `node --test` sobre la lógica pura (recomendado) | Runner nativo de Node 20, sin dependencias. Pruebas sin DOM sobre validaciones del problema central, composición del enunciado, generación de códigos de nodo, árbol y export/import. |  |
| No, sin pruebas por ahora | Solo la reestructuración. Más rápido, pero sin red de seguridad para verificar que la migración no rompió nada. | ✅ |
| Solo un checklist de verificación manual | Documento con los pasos a probar a mano en el navegador, pantalla por pantalla, comparando contra el original. |  |

**Justificación:** al prescindir de pruebas automatizadas, la validación de que «todo sigue funcionando» recae íntegramente en la verificación manual del responsable del proyecto en el navegador, sin ningún mecanismo que detecte regresiones de forma sistemática. Se deja constancia de que este es el principal riesgo asumido del proyecto.

### Pregunta 7 — Nomenclatura

> «El código actual mezcla idiomas (`state.involucrados`, `renderProblemNodes`, `casoTitulo`). ¿Qué hacemos?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Mantener los nombres tal cual (recomendado) | No se renombra nada existente; los nombres nuevos siguen la convención del vecindario. Riesgo nulo de romper referencias entre estado, identificadores del DOM y funciones. | ✅ |
| Unificar todo a inglés | `state.stakeholders`, `renderProblemNodes`, etc. Consistente y estándar, pero afecta a unos 142 accesos al estado y a decenas de identificadores, con alta superficie de error para un beneficio cosmético. |  |
| Unificar todo a español | `renderNodosProblema`, etc. Coherente con el dominio (MML/CEPAL, documentado en español) y con el público del artefacto, pero implica renombrar aún más código. |  |

**Justificación:** durante una migración estructural, cualquier renombrado masivo introduce riesgo de romper la correspondencia entre claves del estado, identificadores del DOM y nombres de función. La mezcla de idiomas se cataloga como deuda técnica independiente, a resolver fuera de esta migración.

### Pregunta 8 — Ubicación

> «¿Dónde va el documento de despliegue y qué hago con git?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| `docs/` dentro del proyecto nuevo + `git init` (recomendado) | `FormulacionProyectosModular/docs/analisis-despliegue.md`, con repositorio git inicializado allí, `.gitignore` y commit inicial. El proyecto queda autocontenido y versionado. | ✅ |
| `docs/` dentro del proyecto nuevo, sin git | Misma ubicación del documento, sin inicializar el control de versiones. |  |
| En la raíz de `TallerModular` | El documento queda en `TallerModular/`, fuera del proyecto, junto a `ArtefactoUnal` y `Estrategia`. |  |

**Justificación:** situar la documentación dentro del proyecto y versionarla desde el inicio mantiene el artefacto autocontenido y coherente con las prácticas propias de un laboratorio DevOps. El historial de git aporta además trazabilidad sobre la migración.

---

## 5. Ronda 3 — Validación de arquitectura

### Pregunta 9 — Arquitectura

Con anterioridad se plantearon tres enfoques de organización. El **enfoque A** distribuía el código por capas técnicas (modelo, vistas, controladores, servicios), al estilo MVC clásico, y se descartó por romper la cohesión del dominio. El **enfoque B** organizaba por dominio puro, con una carpeta por paso, lo que dejaba sin ubicación clara el código transversal. El **enfoque C**, híbrido, propone un `core/` estable con estado, navegación, DOM, SVG y almacenamiento, más una carpeta autocontenida por paso que importa del núcleo pero nunca de otro paso.

> «¿Apruebas el enfoque C (núcleo por capa + pasos por dominio) y el árbol de carpetas propuesto?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Sí, enfoque C tal cual | `core/` + `utils/` + `pasos/`, CSS dividido en `base`, `layout`, `components` y `pasos`, y `views/` con los 11 parciales. | ✅ |
| Sí, pero con ajustes | Se acepta la idea general con cambios en nombres de carpetas, idioma de los nombres (`core` frente a `nucleo`) o alguna división. |  |
| Prefiero el enfoque B (solo por dominio) | Estructura más plana: sin `core/`, cada paso autocontenido y un `shared/` mínimo. Más simple de explicar, a costa de cierta duplicación. |  |
| Prefiero el enfoque A (por capas MVC) | `modelo/`, `vistas/`, `controladores/`, `servicios/`. El más reconocible académicamente si se evalúa el patrón MVC de forma explícita. |  |

**Justificación:** el enfoque C es el único que permite aplicar SOLID de forma efectiva sobre este código: SRP, al partir la función `continuarAlPaso3` de 2.600 líneas; DIP, al hacer que el Paso 3 dependa de una interfaz del estado y no del Paso 2; y OCP, al permitir añadir un paso nuevo registrándolo sin modificar el shell de la aplicación.

### Pregunta 10 — SVG

> «El árbol de problemas y los 2 gráficos de actores son ~1.100 líneas de SVG generado a mano. ¿Qué hago con ellos?»

| Opción | Descripción | Elegida |
| --- | --- | --- |
| Mover tal cual, sin tocar (recomendado) | Es el código más frágil y visual del proyecto; migrarlo literalmente a su propio módulo garantiza que se siga viendo igual. Solo se extraen los helpers repetidos (`svgEl`, `svgText`, `addSvgText`) a `utils/svg.js`. | ✅ |
| Mover y refactorizar a fondo | Unificar los tres renderizadores SVG sobre una capa común de dibujo. Más limpio y con menos duplicación, pero es donde con mayor facilidad se rompe algo visualmente sin detección automática. |  |

**Justificación:** el renderizado SVG es el componente cuya regresión resultaría más difícil de detectar, especialmente sin pruebas automatizadas. La migración literal, con extracción únicamente de los helpers repetidos, limita el cambio a lo estrictamente necesario.

---

## 6. Resumen de decisiones

| N.º | Tema | Opción elegida |
| --- | --- | --- |
| 1 | Stack | ES Modules sin build |
| 2 | Alcance | Migrar y corregir los 5 defectos |
| 3 | Persistencia | Estático + `localStorage` |
| 4 | DevOps | Solo análisis, sin archivos |
| 5 | HTML | `index.html` + parciales en `views/` cargados por `fetch` |
| 6 | Pruebas | Sin pruebas automatizadas por ahora |
| 7 | Nomenclatura | Mantener los nombres tal cual |
| 8 | Ubicación | `docs/` dentro del proyecto nuevo + `git init` |
| 9 | Arquitectura | Enfoque C (núcleo por capa + pasos por dominio) |
| 10 | SVG | Mover tal cual, sin refactorizar |

---

## 7. Implicaciones derivadas

Las decisiones anteriores no son independientes entre sí: varias de ellas producen consecuencias encadenadas que conviene explicitar.

- **Dependencia obligatoria de un servidor HTTP.** La combinación de ES Modules sin build (P1) con parciales cargados mediante `fetch` (P5) implica que la aplicación no podrá abrirse haciendo doble clic sobre `index.html`: `fetch` está bloqueado bajo el esquema `file://` por la política CORS. La ejecución requerirá siempre un servidor HTTP, aunque sea `python3 -m http.server` o `npx serve` en desarrollo.

- **Documentación de despliegue sin artefactos de infraestructura.** La elección de «solo análisis, sin archivos» (P4) significa que el documento de despliegue evaluará Docker, Nginx y CI/CD a fondo, pero el repositorio no incluirá `Dockerfile` ni workflows en esta etapa.

- **Riesgo de regresión concentrado en la verificación manual.** La ausencia de pruebas automatizadas (P6), combinada con la migración literal del SVG (P10), concentra el riesgo de regresión visual en la comprobación manual. Como medida de mitigación, el artefacto original permanece intacto en `ArtefactoUnal/` para permitir la comparación lado a lado.

- **Deuda técnica de nomenclatura asumida de forma explícita.** Mantener la nomenclatura existente (P7) preserva la compatibilidad entre las claves del estado, los identificadores del DOM y los nombres de función durante la migración, a costa de arrastrar la mezcla de idiomas como deuda técnica reconocida y documentada.

---

## 8. Resultado de la implementación: evidencia por decisión

La reestructuración se ejecutó como 21 tareas (plan en `docs/superpowers/plans/2026-09-02-artefacto-mml-modular.md`), con verificación estática tras cada una y una revisión final de rama completa antes de integrar. El resultado son 30 commits sobre la rama `implementacion-modular`, 35 módulos JavaScript, 11 parciales HTML y 17 archivos CSS. Esta sección contrasta cada decisión con lo que efectivamente ocurrió durante la construcción, para que el registro no quede como una declaración de intenciones sino como una decisión puesta a prueba.

### Decisión 1 (Stack: ES Modules sin build)

Confirmada sin matices: el proyecto terminado no tiene `package.json`, no tiene `node_modules`, no depende de ninguna herramienta externa de compilación. Los 35 módulos se ejecutan tal como se escriben, verificado con `node --check` sobre cada uno (`tools/verificar.sh`, comprobación 1). El único uso de Node en todo el proyecto es como herramienta de verificación, exactamente el rol que la decisión le asignaba.

### Decisión 2 (Alcance: migrar y corregir los 5 defectos)

Los cinco defectos quedaron corregidos y documentados con su línea de origen en `README.md` del proyecto, verificados uno a uno contra el artefacto original durante la revisión final. La disciplina de "solo estos cinco" se sostuvo incluso al encontrarse un **sexto defecto preexistente** en el original (`problema.cond`/`problema.delim`, claves que nunca se escriben): se documentó como hallazgo adicional en el README, sin corregirlo, exactamente según el límite que fijaba esta decisión.

La migración literal exigida por esta decisión funcionó, además, como mecanismo de detección de errores: al copiar cuerpos de función sin reinterpretarlos, los agentes que ejecutaron las tareas detectaron y corrigieron tres imprecisiones del propio plan de migración (la firma real de `addSvgText`, el cuerpo real de `escapeHTML`, y el rango de líneas real del bloque `<style>` del original) simplemente por contrastar cada copia contra el archivo fuente antes de aceptarla. Ninguno de esos tres errores habría aparecido si la migración se hubiese hecho "de memoria" en vez de por copia literal verificada.

### Decisión 3 (Persistencia: estático + `localStorage`)

Implementada en `js/core/almacenamiento.js`: autoguardado con *debounce*, restauración de borrador al iniciar, y degradación explícita (sin excepción) cuando `localStorage` no está disponible. La condición de la decisión —"mantener un despliegue trivial en cualquier hosting estático"— se sostiene: la persistencia añadida no introdujo ninguna dependencia de servidor.

### Decisión 4 (DevOps: solo análisis, sin archivos)

Cumplida: el repositorio no contiene `Dockerfile`, `docker-compose.yml` ni workflows de CI/CD. El análisis correspondiente está en `docs/analisis-despliegue.md` (véase la sección 8 de ese documento para su propio contraste con la implementación).

### Decisión 5 (HTML: parciales por `fetch`)

Esta es la decisión cuyo costo se materializó con más fuerza durante la construcción, y conviene decirlo sin matizarlo: el patrón de reinyectar el `innerHTML` del contenedor en cada navegación —consecuencia directa de cargar parciales por `fetch` en lugar de mantener el DOM completo, como hacía el original— introdujo una clase de riesgo que la decisión original no anticipaba explícitamente. La revisión final de rama encontró que ninguna pantalla salvo la 0 se mostraba (la regla CSS `.screen.active` dependía de una clase que el router no restauraba tras inyectar el parcial) y que el enunciado central del Paso 2 se vaciaba al navegar fuera y volver, porque nada repoblaba esos campos desde el estado. Ambos se corrigieron en la ronda de arreglo posterior a la revisión final.

La decisión sigue siendo la correcta —la alternativa de un único `index.html` de ~2.200 líneas tiene sus propios costos de mantenibilidad—, pero el registro debe dejar constancia de que "DOM reinyectado" no es gratis: cualquier estado que antes vivía implícito en el DOM permanente ahora debe repoblarse explícitamente en cada `render()`. Es la lección más costosa de esta migración y la que más tiempo de corrección consumió tras la revisión final.

### Decisión 6 (Pruebas: sin pruebas automatizadas)

Esta es la decisión que más se puso a prueba, en el sentido literal. La justificación original decía: *"la validación de que todo sigue funcionando recae íntegramente en la verificación manual del responsable del proyecto en el navegador, sin ningún mecanismo que detecte regresiones de forma sistemática"*. Eso ocurrió exactamente así:

- `tools/verificar.sh` (comprobación estática, no funcional) detectó consistentemente sintaxis rota, atributos `on*` residuales, imports colgantes y aislamiento entre pasos roto — pero la revisión final de rama completa encontró que dos de sus cinco comprobaciones tenían huecos reales (la de sintaxis no detectaba código roto en módulos ES en este entorno de Node; la de aislamiento se podía burlar con una ruta de import que no contuviera literalmente la palabra `pasos/`), y los corrigió.
- Dos bugs de comportamiento —pantallas invisibles y un `ReferenceError` al confirmar el problema central, ambos capaces de bloquear el uso normal de la aplicación— sobrevivieron a 21 tareas de ejecución y a la verificación estática, y solo se detectaron en la revisión final de código, que fue la primera pasada de lectura exhaustiva del código real (no de comentarios) sobre la rama completa.
- Un tercer bug, de presentación (la barra lateral mostraba «Paso 1» partido en dos líneas en vez del número simple que el diseño original usaba), sobrevivió incluso a esa revisión y solo se detectó al abrir la aplicación en un navegador real.

El riesgo que esta decisión aceptó de antemano se materializó tal como se predijo, y el proyecto lo sobrevivió porque se compensó con dos mecanismos que si no se hubieran incluido —revisión de código exhaustiva de la rama completa y verificación manual en navegador— habrían dejado esos tres defectos en producción. La decisión de no incluir pruebas automatizadas fue defendible dado el alcance del taller, pero el costo que su propia justificación anticipaba fue real, no hipotético.

### Decisión 7 (Nomenclatura: mantener los nombres existentes)

Confirmada como acertada en la práctica: al no renombrar ninguna clave de estado, identificador del DOM ni nombre de función, cientos de referencias cruzadas entre los 35 módulos permanecieron correctas por construcción. El único renombrado real de todo el proyecto (`problemPopulation` → `problemCentralPopulation`, corrección del defecto 2, no una decisión de estilo) se limitó a la superficie mínima necesaria y se verificó con `grep` antes de darlo por cerrado.

### Decisión 8 (Ubicación: `docs/` + `git init`)

Cumplida y extendida: además del repositorio local, el proyecto se publicó en `https://github.com/LaboratorioDevOps/TallerFormulacionProyectosModular`, lo que deja la recomendación de la sección 6.2 de `docs/analisis-despliegue.md` (GitHub Pages) a un paso de ejecutarse — el repositorio ya existe en la plataforma que ese documento recomendaba.

### Decisión 9 (Arquitectura: enfoque C, núcleo por capa + pasos por dominio)

La regla que hace verificable esta arquitectura —"ningún paso importa de otro paso"— se sostuvo en la práctica y quedó mecánicamente comprobada en `tools/verificar.sh` (comprobación 3, endurecida tras la revisión final para resolver rutas reales en vez de buscar una subcadena). La cohesión que buscaba el enfoque C se confirmó también en el proceso de construcción: fue posible desplegar varios agentes en paralelo trabajando en pasos distintos sin que sus cambios colisionaran, salvo en los puntos explícitamente compartidos (`js/core/registro-pasos.js`), que se identificaron de antemano y se coordinaron aparte.

### Decisión 10 (SVG: migración literal, sin refactorizar)

Verificada de la forma más directa posible: un diff normalizado entre el cuerpo original y el migrado de los tres generadores SVG (~1.100 líneas) mostró que dos de los tres son **idénticos carácter por carácter** salvo por `export`/`import`, y el tercero solo difiere en la extracción de un helper ya compartido. Es la confirmación empírica de que "migrar tal cual" se cumplió al pie de la letra, en el componente que la propia decisión señalaba como el más difícil de verificar sin pruebas automatizadas.
