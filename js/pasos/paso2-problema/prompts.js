/**
 * Paso 2 · Asistente IA — generación de prompts contextualizados y
 * registro de su preparación en la bitácora.
 *
 * Cuerpos copiados literalmente de ORIG:
 *   - renderProblemModule    (11302-11308)
 *   - generateProblemPrompt, con su función anidada formatNodes
 *     (11315-11747, 433 líneas)
 *   - writeProblemPrompt     (11825-11893)
 *
 * writeProblemPrompt NO se movió a utils/portapapeles.js (Tarea 3): muta
 * state.bitacora y las utilidades sin estado no pueden importar del
 * núcleo de estado. Su sitio es este módulo del Paso 2. El copiado real
 * al portapapeles (copyProblemPrompt / fallbackCopyProblemPrompt) ya vive
 * en utils/portapapeles.js como copiarDesdeElemento y no se repite aquí.
 *
 * Cambios permitidos respecto al original: export/import,
 * `state.` → `obtenerEstado()`, y `notificarCambio()` tras mutar.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { renderProblemNodes } from "./nodos.js";
import { renderProblemTree } from "./arbol-svg.js";
import { renderProblemBitacora } from "./bitacora.js";

/* Cuerpo copiado literalmente de ORIG 11302-11308 (renderProblemModule). */
export function renderProblemModule() {

  renderProblemNodes();

  renderProblemTree();

}

/* =========================================================
   PASO 2.6 · ASISTENTE IA
   Generación contextualizada de prompts
   ========================================================= */

/* Cuerpo copiado literalmente de ORIG 11315-11747 (generateProblemPrompt,
   con su función anidada formatNodes). */
export function generateProblemPrompt(tipo) {

  const state = obtenerEstado();

  const caso = state.caso || {};
  const problema = state.problema || {};

  const nodos =
    Array.isArray(state.nodos)
      ? state.nodos
      : [];


  /* ---------------------------------------------------------
     DATOS DEL CASO
     --------------------------------------------------------- */

  const casoNombre =
    caso.nombre ||
    caso.titulo ||
    "No registrado";

  const territorio =
    caso.territorio ||
    "No registrado";

  const poblacion =
    caso.poblacion ||
    problema.poblacion ||
    "No registrada";

  const periodo =
    caso.periodo ||
    "No registrado";

  const situacion =
    caso.situacion ||
    "No registrada";


  /* ---------------------------------------------------------
     PROBLEMA CENTRAL
     --------------------------------------------------------- */

  const root =
    nodos.find(function (node) {
      return node &&
        node.codigo === "P";
    });

  const problemaCentral =
    root?.enunciado ||
    problema.enunciado ||
    "";


  /* ---------------------------------------------------------
     COMPONENTES DEL PROBLEMA
     --------------------------------------------------------- */

  const condicion =
    problema.condicion ||
    problema.cond ||
    "";

  const atributo =
    problema.atributo ||
    "";

  const poblacionProblema =
    problema.poblacion ||
    poblacion;

  const delimitacion =
    problema.delimitacion ||
    problema.delim ||
    territorio;


  /* ---------------------------------------------------------
     REPRESENTACIÓN DEL ÁRBOL
     --------------------------------------------------------- */

  function formatNodes(type) {

    const filtered =
      nodos.filter(function (node) {

        return node &&
          node.codigo !== "P" &&
          node.tipo === type;

      });


    if (!filtered.length) {
      return "No hay nodos registrados.";
    }


    return filtered
      .sort(function (a, b) {

        return String(a.codigo)
          .localeCompare(
            String(b.codigo),
            undefined,
            {
              numeric: true
            }
          );

      })
      .map(function (node) {

        return [
          node.codigo,
          "Nivel " + (node.nivel ?? "—"),
          "Padre " + (node.padre || "P"),
          node.enunciado || "Sin enunciado",
          "Evidencia: " +
          (node.evidencia || "Pendiente"),
          "Línea base: " +
          (node.lineaBase || "Pendiente"),
          "Confianza: " +
          (node.confianza || "Baja"),
          "Origen: " +
          (node.origen || "Formulador")
        ].join(" | ");

      })
      .join("\n");

  }


  const causas =
    formatNodes("causa");

  const efectos =
    formatNodes("efecto");


  /* ---------------------------------------------------------
     CONTEXTO COMÚN
     --------------------------------------------------------- */

  const contexto = `

CONTEXTO DEL CASO
Nombre del caso: ${casoNombre}
Territorio: ${territorio}
Población afectada: ${poblacion}
Periodo: ${periodo}

Situación problemática:
${situacion}

PROBLEMA CENTRAL ACTUAL
${problemaCentral || "Pendiente"}

COMPONENTES DE FORMULACIÓN
Condición negativa:
${condicion || "Pendiente"}

Atributo o manifestación:
${atributo || "Pendiente"}

Población:
${poblacionProblema || "Pendiente"}

Delimitación:
${delimitacion || "Pendiente"}

RESTRICCIONES
- No inventes datos.
- No inventes fuentes.
- No conviertas hipótesis en hechos.
- No introduzcas datos personales.
- Diferencia evidencia disponible de inferencias.
- Toda propuesta debe quedar marcada como propuesta.
- El formulador conserva la decisión final.
`;


  /* ---------------------------------------------------------
     PROMPT 1 · PROBLEMA CENTRAL
     --------------------------------------------------------- */

  if (tipo === "problema") {

    const prompt = `

ACTÚA COMO ASESOR METODOLÓGICO EN LA FORMULACIÓN
DE PROYECTOS CON METODOLOGÍA DE MARCO LÓGICO
CEPAL/ILPES.

Tu función es DEPURAR críticamente la formulación
del problema central. No debes decidir ni reemplazar
automáticamente el problema del formulador.

${contexto}

PROBLEMA A REVISAR
${problemaCentral || "No formulado"}

EVALÚA:

1. Si expresa un estado negativo observable.
2. Si identifica una población afectada.
3. Si está delimitado territorial y temporalmente.
4. Si el atributo problemático es concreto.
5. Si puede ser respaldado mediante evidencia.
6. Si realmente corresponde al problema central.
7. Si está formulado como causa.
8. Si está formulado como efecto.
9. Si contiene una solución implícita.
10. Si une problemas diferentes mediante una conjunción.

ENTREGA:

A. Hallazgos críticos.
B. Elementos que deberían conservarse.
C. Riesgos o ambigüedades.
D. Una o máximo tres ALTERNATIVAS DE REDACCIÓN
   del problema central.

No selecciones una alternativa por el formulador.

Para cada alternativa indica qué cambiaste
y por qué.

IMPORTANTE:
Las alternativas son PROPUESTAS DE IA.
No son hechos ni decisiones finales.
`;

    writeProblemPrompt(
      "problemPromptProblema",
      prompt,
      "Depuración del problema central"
    );

    return;
  }


  /* ---------------------------------------------------------
     PROMPT 2 · CAUSAS Y EFECTOS
     --------------------------------------------------------- */

  if (tipo === "arbol") {

    const prompt = `

ACTÚA COMO ASESOR METODOLÓGICO EN LA CONSTRUCCIÓN
DE ÁRBOLES DE PROBLEMAS CON METODOLOGÍA DE MARCO
LÓGICO CEPAL/ILPES.

Tu función es PROPONER hipótesis causales y de efectos
para ampliar el análisis. No debes modificar
automáticamente el árbol ni presentar hipótesis como hechos.

${contexto}

ÁRBOL ACTUAL · CAUSAS
${causas}

ÁRBOL ACTUAL · EFECTOS
${efectos}

TAREA

Identifica posibles:

1. Causas adicionales.
2. Eslabones causales intermedios que podrían faltar.
3. Causas raíz que podrían explicar causas superiores.
4. Efectos directos adicionales.
5. Efectos indirectos adicionales.
6. Relaciones padre-hijo que deberían revisarse.

CRITERIOS

- Cada causa debe expresar un estado negativo.
- Cada efecto debe expresar una consecuencia.
- No redactes causas como actividades o soluciones.
- No repitas el problema central con otras palabras.
- No inventes evidencia.
- No inventes cifras.
- No asumas que una hipótesis es verdadera.
- Distingue claramente entre evidencia y propuesta.
- Respeta la estructura causal existente.

FORMATO DE RESPUESTA

PROPUESTA 1
Tipo:
Nivel sugerido:
Padre sugerido:
Enunciado:
Justificación causal:
Evidencia requerida:

PROPUESTA 2
...

Al final incluye:

NODOS QUE NO DEBERÍAN AGREGARSE
Indica cuáles propuestas podrían ser redundantes,
demasiado generales, soluciones disfrazadas o efectos
que realmente corresponden a causas.

Todas las propuestas tienen confianza BAJA hasta
ser contrastadas por el formulador.
`;

    writeProblemPrompt(
      "problemPromptArbol",
      prompt,
      "Propuesta de causas y efectos"
    );

    return;
  }


  /* ---------------------------------------------------------
     PROMPT 3 · CONTRADICCIÓN
     --------------------------------------------------------- */

  if (tipo === "validacion") {

    const prompt = `

ACTÚA COMO REVISOR CRÍTICO DE UN ÁRBOL DE PROBLEMAS
CONSTRUIDO BAJO LA METODOLOGÍA DE MARCO LÓGICO
CEPAL/ILPES.

No reconstruyas el árbol automáticamente.
Tu función es intentar ENCONTRAR RUPTURAS,
contradicciones y relaciones débiles.

${contexto}

CAUSAS ACTUALES
${causas}

EFECTOS ACTUALES
${efectos}

REVISA CRÍTICAMENTE:

1. DIRECCIÓN CAUSAL
¿La relación padre-hijo puede leerse realmente
como causa → consecuencia?

2. NIVELES
¿Existe continuidad lógica entre los niveles?
¿Hay saltos o nodos colocados en niveles incorrectos?

3. SUFICIENCIA
¿Las causas terminales explican razonablemente
los nodos superiores?

4. NO CIRCULARIDAD
¿Existe alguna relación circular o dependencia
que termine explicando un nodo mediante sí mismo?

5. REDUNDANCIA
¿Hay nodos que expresan prácticamente lo mismo?

6. REPETICIÓN DEL PROBLEMA
¿Alguna causa simplemente repite el problema central?

7. CAUSAS COMO SOLUCIONES
Busca expresiones como:
"falta", "se necesita", "capacitar",
"implementar", "crear", "construir",
"fortalecer", "promover".

8. EFECTOS MAL CLASIFICADOS
Determina si algún supuesto efecto parece realmente
una causa o una condición previa.

9. EVIDENCIA
Identifica nodos cuya afirmación necesita evidencia
adicional.

10. PADRES INCORRECTOS
Revisa si cada relación padre-hijo es causalmente
defendible.

FORMATO

HALLAZGO 1
Nodo:
Tipo de problema:
Qué resulta débil:
Por qué:
Evidencia que debería revisarse:

HALLAZGO 2
...

CIERRE

Clasifica cada hallazgo como:

- Crítico
- Requiere revisión
- Observación

NO MODIFIQUES LOS NODOS.

Tu resultado es una PROPUESTA DE REVISIÓN.
La decisión corresponde al formulador.
`;

    writeProblemPrompt(
      "problemPromptValidacion",
      prompt,
      "Contradicción del árbol"
    );

    return;
  }


  alert(
    "No se reconoce el tipo de consulta solicitado."
  );

}

/* Cuerpo copiado literalmente de ORIG 11825-11893 (writeProblemPrompt). */
export function writeProblemPrompt(
  elementId,
  prompt,
  taskName
) {

  const textarea =
    document.getElementById(elementId);

  if (!textarea) {
    return;
  }

  textarea.value =
    prompt.trim();


  /*
   * El prompt generado se registra en la bitácora.
   * Todavía NO registramos una "salida del modelo"
   * porque el artefacto offline no está ejecutando IA.
   */

  const state = obtenerEstado();

  if (!Array.isArray(state.bitacora)) {
    state.bitacora = [];
  }


  state.bitacora.push({

    fecha:
      new Date().toISOString(),

    patron:
      "Paso 2.6 · " + taskName,

    prompt:
      prompt,

    salida:
      "Prompt preparado. Pendiente de ejecutar y contrastar con el modelo.",

    error:
      "Pendiente de ejecutar la consulta y verificar la salida.",

    comoSeDetecto:
      "",

    correccion:
      "Pendiente de registrar la revisión humana."

  });

  notificarCambio();


  /*
   * Si posteriormente existe la función de renderizado
   * de bitácora, actualizarla.
   */

  if (
    typeof renderProblemBitacora ===
    "function"
  ) {

    renderProblemBitacora();

  }

}
