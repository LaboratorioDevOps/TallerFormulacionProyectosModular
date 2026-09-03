/**
 * Subpantalla «Enunciado» del Paso 2 (Análisis del problema).
 *
 * Cuerpos copiados de ORIG:
 *   - composeCentralProblem  (9583-9614)
 *   - bindProblemCentralFields (9617-9657) -> reescrita como
 *     enlazarCamposCentrales, según el brief de la tarea.
 *   - validateCentralProblem (9660-9785)
 *   - confirmCentralProblem  (9788-9866)
 *
 * DEFECTO 2: en el artefacto original había dos elementos con
 * id="problemPopulation" — un <input> en la subpantalla «Contexto»
 * (ver contexto.js) y un <textarea> aquí, en «Enunciado». getElementById
 * devolvía siempre el primero (el input de Contexto), así que lo que el
 * usuario escribía en este textarea nunca llegaba al estado ni se
 * validaba. El markup ya distingue los dos elementos: el textarea de esta
 * subpantalla ahora es `problemCentralPopulation`. Toda referencia a
 * "problemPopulation" en este archivo pasa a "problemCentralPopulation"
 * (ORIG líneas 9592, 9645, 9671 y 9808).
 *
 * Cambios permitidos respecto al original: añadir export/import,
 * sustituir las referencias directas al estado global por
 * obtenerEstado(), añadir notificarCambio() tras mutar, y el
 * renombrado de id anterior.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";

export function composeCentralProblem() {

  const condition =
    document.getElementById("problemCondition")?.value.trim() || "";

  const attribute =
    document.getElementById("problemAttribute")?.value.trim() || "";

  const population =
    document.getElementById("problemCentralPopulation")?.value.trim() || "";

  const delimitation =
    document.getElementById("problemDelimitation")?.value.trim() || "";

  const parts = [
    condition,
    attribute,
    population,
    delimitation
  ].filter(Boolean);

  const statement = parts.join(" ");

  const output =
    document.getElementById("problemStatement");

  if (output) {
    output.value = statement;
  }

  return statement;
}


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

/**
 * Repuebla, tras reinyectar el parcial del Paso 2, los campos que
 * `renderProblemContext` (contexto.js) no cubre: el textarea
 * `problemCentralPopulation` (id exclusivo de esta subpantalla, ver
 * defecto 2) y el enunciado compuesto `problemStatement`. Los otros tres
 * campos del enunciado central (`problemCondition`, `problemAttribute`,
 * `problemDelimitation`) comparten id con la subpantalla «Contexto» y ya
 * los repuebla `renderProblemContext`; repetirlo aquí sería redundante.
 */
export function repoblarCamposCentrales() {
  const problema = obtenerEstado().problema || {};

  const population = document.getElementById("problemCentralPopulation");
  if (population) {
    population.value = problema.poblacion || "";
  }

  const statement = document.getElementById("problemStatement");
  if (statement) {
    statement.value = problema.enunciado || "";
  }
}

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


export function validateCentralProblem() {

  const statement = composeCentralProblem();

  const condition =
    document.getElementById("problemCondition")?.value.trim() || "";

  const attribute =
    document.getElementById("problemAttribute")?.value.trim() || "";

  const population =
    document.getElementById("problemCentralPopulation")?.value.trim() || "";

  const delimitation =
    document.getElementById("problemDelimitation")?.value.trim() || "";

  const checks = [];

  checks.push({
    ok: Boolean(statement),
    title: "Existe un enunciado",
    message: statement
      ? "El problema tiene una formulación."
      : "Debe construirse el enunciado."
  });

  checks.push({
    ok: Boolean(condition),
    title: "Condición negativa",
    message: condition
      ? "Se identificó una condición observable."
      : "Falta la condición negativa observable."
  });

  checks.push({
    ok: Boolean(attribute),
    title: "Atributo o manifestación",
    message: attribute
      ? "Se identificó la manifestación del problema."
      : "Falta describir cómo se manifiesta."
  });

  checks.push({
    ok: Boolean(population),
    title: "Población afectada",
    message: population
      ? "La población está delimitada."
      : "Debe identificarse la población afectada."
  });

  checks.push({
    ok: Boolean(delimitation),
    title: "Territorio y delimitación",
    message: delimitation
      ? "El ámbito territorial está delimitado."
      : "Debe indicarse territorio y periodo."
  });

  const solutionPattern =
    /\b(falta|faltan|no hay|ausencia de|se necesita|se requiere|capacitar|construir|implementar|crear)\b/i;

  checks.push({
    ok: !solutionPattern.test(statement),
    title: "No está redactado como solución",
    message: solutionPattern.test(statement)
      ? "El enunciado incorpora una carencia o solución. Reescríbelo como estado negativo."
      : "No se detectó lenguaje típico de solución."
  });

  checks.push({
    ok: !/\by\b/i.test(statement),
    title: "Un solo núcleo problemático",
    message: /\by\b/i.test(statement)
      ? "Revisa si la conjunción 'y' está uniendo dos problemas."
      : "No se detectó una posible unión de problemas."
  });

  checks.push({
    ok: statement.length <= 300,
    title: "Extensión controlada",
    message: statement.length <= 300
      ? "La extensión es manejable."
      : "El enunciado es demasiado extenso."
  });

  const box =
    document.getElementById("centralProblemValidation");

  if (!box) {
    return false;
  }

  box.innerHTML = `
    <div style="
      display:grid;
      gap:8px;
    ">
      ${checks.map(function (check) {

        return `
          <div class="notice"
            style="
              border-left:4px solid ${check.ok ? "#2e7d32" : "#b42318"};
              background:${check.ok ? "#f3faf4" : "#fff5f4"};
            ">

            <strong>
              ${check.ok ? "✓" : "✕"}
              ${escapeHTML(check.title)}
            </strong>

            <div class="small-note" style="margin-top:4px;">
              ${escapeHTML(check.message)}
            </div>

          </div>
        `;

      }).join("")}
    </div>
  `;

  return checks.every(function (check) {
    return check.ok;
  });
}


export function confirmCentralProblem(alConfirmar) {

  const valid = validateCentralProblem();

  if (!valid) {
    alert(
      "Corrige los hallazgos de formulación antes de confirmar el problema central."
    );
    return;
  }

  const statement = composeCentralProblem();

  const estado = obtenerEstado();

  estado.problema.condicion =
    document.getElementById("problemCondition").value.trim();

  estado.problema.atributo =
    document.getElementById("problemAttribute").value.trim();

  estado.problema.poblacion =
    document.getElementById("problemCentralPopulation").value.trim();

  estado.problema.delimitacion =
    document.getElementById("problemDelimitation").value.trim();

  estado.problema.enunciado = statement;

  /*
   * El problema central es el nodo raíz especial P.
   * No se guarda como causa ni como efecto.
   */

  const existingRoot =
    estado.nodos.find(function (node) {
      return node && node.codigo === "P";
    });

  if (existingRoot) {

    existingRoot.tipo = "problema";
    existingRoot.nivel = 0;
    existingRoot.padre = "";
    existingRoot.enunciado = statement;
    existingRoot.evidencia =
      existingRoot.evidencia || "";
    existingRoot.lineaBase =
      existingRoot.lineaBase || "";
    existingRoot.confianza =
      existingRoot.confianza || "Media";
    existingRoot.origen =
      existingRoot.origen || "Formulador";

  } else {

    estado.nodos.unshift({
      codigo: "P",
      tipo: "problema",
      nivel: 0,
      padre: "",
      enunciado: statement,
      evidencia: "",
      lineaBase: "",
      confianza: "Media",
      origen: "Formulador"
    });

  }

  notificarCambio();

  alert("Problema central confirmado.");

  /*
   * renderProblemModule() (repintar prompts) y el cambio a la subpantalla
   * "causas" viven en el orquestador (index.js), no aquí: este módulo no
   * los importa para evitar el ReferenceError que tenía el original
   * migrado. El orquestador nos pasa un callback con ambas acciones.
   */
  if (typeof alConfirmar === "function") alConfirmar();
}
