/**
 * Paso 2 · Análisis del problema — gestión de nodos (alta, baja, listados).
 *
 * Cuerpos copiados de ORIG:
 *   - refreshNodeParentOptions (9893-9939)
 *   - addProblemNode           (9942-10094)
 *   - deleteProblemNode        (10097-10152)
 *   - renderProblemNodes, con su función anidada nodeCard (10158-10284)
 *   - renderTreeNode           (11896-11927)
 *   - renderProblemNodeList    (11930-12025)
 *
 * Cambios permitidos respecto al original: añadir export/import,
 * sustituir el acceso previo al estado global por obtenerEstado(), añadir
 * notificarCambio() tras cada mutación del estado, y sustituir el manejador
 * en línea de la plantilla de nodeCard (que invocaba deleteProblemNode) por
 * data-accion="eliminar-nodo" data-codigo="...".
 *
 * addProblemNode/deleteProblemNode llamaban en el original a
 * renderProblemModule, renderNodeEvidence y renderProblemTree tras mutar
 * el estado. Esas tres viven en otros archivos del paso (prompts.js,
 * evidencia.js, arbol-svg.js) y el orquestador del Paso 2 (Tarea 16) ya
 * repinta las ocho funciones del módulo, esta incluida, después de cada
 * acción (`case "agregar-nodo": addProblemNode(); render(); break;`), así
 * que son una redundancia exacta: se retiran aquí en vez de importarlas.
 * refreshNodeParentOptions() y renderProblemNodes() SÍ se conservan
 * porque están definidas en este mismo archivo.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";
import { nextNodeCode } from "./modelo.js";

/* Cuerpo copiado literalmente de ORIG 9893-9939 (refreshNodeParentOptions). */
export function refreshNodeParentOptions() {

  const select =
    document.getElementById("nodeParent");

  if (!select) {
    return;
  }

  const currentValue = select.value || "P";

  const nodes =
    Array.isArray(obtenerEstado().nodos)
      ? obtenerEstado().nodos
      : [];

  const validParents =
    nodes.filter(function (node) {

      return node &&
        node.codigo &&
        node.codigo !== "P";

    });

  select.innerHTML =
    `<option value="P">P · Problema central</option>` +
    validParents.map(function (node) {

      return `
        <option value="${escapeHTML(node.codigo)}">
          ${escapeHTML(node.codigo)} ·
          ${escapeHTML(node.enunciado)}
        </option>
      `;

    }).join("");

  if (
    Array.from(select.options)
      .some(option => option.value === currentValue)
  ) {
    select.value = currentValue;
  } else {
    select.value = "P";
  }
}

/* Cuerpo copiado literalmente de ORIG 9942-10094 (addProblemNode). */
export function addProblemNode() {

  const type =
    document.getElementById("nodeType").value;

  const level =
    Number(document.getElementById("nodeLevel").value);

  const parent =
    document.getElementById("nodeParent").value || "P";

  const statement =
    document.getElementById("nodeStatement").value.trim();

  const evidence =
    document.getElementById("nodeEvidence").value.trim();

  const baseline =
    document.getElementById("nodeBaseline").value.trim();

  const confidence =
    document.getElementById("nodeConfidence").value;

  const origin =
    document.getElementById("nodeOrigin").value;

  if (!statement) {
    alert("Escribe el enunciado del nodo.");
    return;
  }

  /*
   * Los nodos del árbol representan estados negativos.
   * Se advierten acciones o soluciones.
   */

  const actionPattern =
    /^(capacitar|crear|construir|implementar|diseñar|desarrollar|fortalecer|promover|realizar|ejecutar)\b/i;

  if (actionPattern.test(statement)) {

    alert(
      "El nodo parece estar redactado como una acción o solución.\n\n" +
      "Reescríbelo como un estado negativo observable."
    );

    return;
  }

  /*
   * Evitar duplicados exactos.
   */

  const duplicate =
    obtenerEstado().nodos.some(function (node) {

      return node &&
        String(node.enunciado || "")
          .trim()
          .toLowerCase() === statement.toLowerCase();

    });

  if (duplicate) {

    alert(
      "Ya existe un nodo con el mismo enunciado."
    );

    return;
  }

  /*
   * No permitir saltos de nivel.
   * Un nivel > 1 debe depender de un nodo existente
   * de nivel inmediatamente anterior.
   */

  if (level > 1 && parent === "P") {

    const previousLevelExists =
      obtenerEstado().nodos.some(function (node) {

        return node &&
          node.tipo === type &&
          Number(node.nivel) === level - 1;

      });

    if (previousLevelExists) {

      alert(
        "Para un nodo de nivel " +
        level +
        ", selecciona un padre del nivel anterior."
      );

      return;
    }

  }

  const node = {

    codigo:
      nextNodeCode(type, level),

    tipo:
      type,

    nivel:
      level,

    padre:
      parent,

    enunciado:
      statement,

    evidencia:
      evidence,

    lineaBase:
      baseline,

    confianza:
      origin === "Propuesta IA"
        ? "Baja"
        : confidence,

    origen:
      origin

  };

  obtenerEstado().nodos.push(node);
  notificarCambio();
  refreshNodeParentOptions();


  /*
   * Limpiar únicamente los campos de captura.
   */

  document.getElementById("nodeStatement").value = "";
  document.getElementById("nodeEvidence").value = "";
  document.getElementById("nodeBaseline").value = "";


  refreshNodeParentOptions();
}

/* Cuerpo copiado literalmente de ORIG 10097-10152 (deleteProblemNode). */
export function deleteProblemNode(codigo) {

  const index =
    obtenerEstado().nodos.findIndex(function (node) {
      return node && node.codigo === codigo;
    });

  if (index === -1) {
    return;
  }

  /*
   * El problema central P no puede eliminarse desde
   * el listado de causas y efectos.
   */

  if (codigo === "P") {
    alert("El problema central se modifica desde la sección 2.2.");
    return;
  }

  const confirmed =
    confirm(
      "¿Desea eliminar el nodo " +
      codigo +
      "?"
    );

  if (!confirmed) {
    return;
  }

  obtenerEstado().nodos.splice(index, 1);
  notificarCambio();

  renderProblemNodes();

  /*
   * Si otros nodos apuntaban al nodo eliminado,
   * se reconectan provisionalmente al problema central.
   * La validación posterior señalará la relación para revisión.
   */

  obtenerEstado().nodos.forEach(function (node) {

    if (node.padre === codigo) {
      node.padre = "P";
    }

  });
  notificarCambio();


  refreshNodeParentOptions();
}

/* Cuerpo copiado literalmente de ORIG 10158-10284 (renderProblemNodes,
   con su función anidada nodeCard). El manejador en línea que invocaba
   deleteProblemNode en la plantilla de nodeCard pasa a
   data-accion="eliminar-nodo" data-codigo="...", según el brief. */
export function renderProblemNodes() {

  const effectsBox =
    document.getElementById("effectsWorkspace");

  const causesBox =
    document.getElementById("causesWorkspace");

  if (!effectsBox || !causesBox) {
    return;
  }

  const nodes =
    Array.isArray(obtenerEstado().nodos)
      ? obtenerEstado().nodos
      : [];

  const effects =
    nodes.filter(function (node) {
      return node &&
        node.tipo === "efecto";
    });

  const causes =
    nodes.filter(function (node) {
      return node &&
        node.tipo === "causa";
    });

  function nodeCard(node) {

    const origin =
      node.origen === "Propuesta IA"
        ? "Propuesta IA"
        : "Formulador";

    return `
      <div class="card"
        style="
          margin-top:10px;
          border-left:4px solid
          ${node.tipo === "causa" ? "#8b5e34" : "#4b6b8a"};
        ">

        <div class="section-head">

          <div>

            <div>
              <strong>
                ${escapeHTML(node.codigo)}
              </strong>

              <span class="pill">
                ${node.tipo === "causa"
            ? "Causa"
            : "Efecto"}
              </span>
            </div>

            <h4 style="margin-top:7px;">
              ${escapeHTML(node.enunciado)}
            </h4>

          </div>

          <button
            type="button"
            class="btn-mini"
            data-accion="eliminar-nodo" data-codigo="${escapeHTML(node.codigo)}">
            Eliminar
          </button>

        </div>

        <div class="small-note">

          Nivel ${escapeHTML(node.nivel)}
          · Padre ${escapeHTML(node.padre || "P")}
          · ${escapeHTML(origin)}
          · Confianza ${escapeHTML(node.confianza || "Baja")}

        </div>

        <div
          style="
            margin-top:8px;
            display:grid;
            gap:5px;
          ">

          <div class="small-note">
            <strong>Evidencia:</strong>
            ${escapeHTML(node.evidencia || "Pendiente")}
          </div>

          <div class="small-note">
            <strong>Línea base:</strong>
            ${escapeHTML(node.lineaBase || "Pendiente")}
          </div>

        </div>

      </div>
    `;
  }

  effectsBox.innerHTML =
    effects.length
      ? effects.map(nodeCard).join("")
      : `
        <div class="notice">
          Aún no hay efectos registrados.
        </div>
      `;

  causesBox.innerHTML =
    causes.length
      ? causes.map(nodeCard).join("")
      : `
        <div class="notice">
          Aún no hay causas registradas.
        </div>
      `;

  refreshNodeParentOptions();
}

/* Cuerpo copiado literalmente de ORIG 11896-11927 (renderTreeNode). */
export function renderTreeNode(node) {

  return `
    <div class="tree-node"
      style="
        min-width:220px;
        max-width:360px;
      ">

      <strong>
        ${escapeHTML(node.codigo || "Sin código")}
      </strong>

      <div style="margin-top:6px;">
        ${escapeHTML(
        node.enunciado || "Sin enunciado"
      )}
      </div>

      <small style="
        display:block;
        margin-top:7px;
      ">

        Nivel ${escapeHTML(node.nivel ?? "—")}
        · Padre ${escapeHTML(node.padre || "P")}

      </small>

    </div>
  `;
}

/* Cuerpo copiado literalmente de ORIG 11930-12025 (renderProblemNodeList). */
export function renderProblemNodeList(nodes, type) {

  if (!nodes.length) {

    return `
      <div class="notice">
        No hay ${type === "efecto"
            ? "efectos"
            : "causas"} registrados.
      </div>
    `;
  }

  return nodes.map(function (node) {

    const origin =
      node.origen === "Propuesta IA"
        ? "Propuesta IA"
        : "Formulador";

    const confidence =
      node.confianza || "Baja";

    return `
      <div class="card" style="margin-top:10px">

        <div class="section-head">

          <div>

            <div>
              <strong>${escapeHTML(node.codigo || "Sin código")}</strong>
              <span class="pill">
                ${node.tipo === "efecto"
            ? "Efecto"
            : "Causa"}
              </span>
            </div>

            <h4 style="margin-top:7px">
              ${escapeHTML(
              node.enunciado || "Sin enunciado"
            )}
            </h4>

          </div>

        </div>

        <div class="small-note">

          Nivel:
          <strong>
            ${escapeHTML(node.nivel ?? "—")}
          </strong>

          · Padre:
          <strong>
            ${escapeHTML(node.padre || "P")}
          </strong>

          · Confianza:
          <strong>
            ${escapeHTML(confidence)}
          </strong>

          · Origen:
          <strong>
            ${escapeHTML(origin)}
          </strong>

        </div>

        <div class="small-note">

          <strong>Evidencia:</strong>
          ${escapeHTML(
              node.evidencia || "Pendiente"
            )}

        </div>

        <div class="small-note">

          <strong>Línea base:</strong>
          ${escapeHTML(
              node.lineaBase || "Pendiente"
            )}

        </div>

      </div>
    `;

  }).join("");
}
