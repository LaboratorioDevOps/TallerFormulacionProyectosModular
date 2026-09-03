/**
 * Paso 2 · Análisis del problema — validación lógica del árbol.
 *
 * Cuerpos copiados de ORIG:
 *   - runProblemValidation            (5540-5933, sin su `createsCycle` anidada)
 *   - renderProblemValidationResults  (5935-6184)
 *   - saveProblemExternalValidation   (6186-6305)
 *   - saveProblemValidationDecision   (6307-6396)
 *
 * `createsCycle` estaba anidada dentro de `runProblemValidation`
 * (ORIG 5718-5760) y ya fue extraída a `modelo.js` por otra tarea, que
 * conservó su firma real de un solo parámetro: `createsCycle(node)`.
 * Aquí se elimina esa definición anidada y se importa la versión de
 * `modelo.js`.
 *
 * Cambios permitidos respecto al original: export/import,
 * `state.` → `obtenerEstado()`, y `notificarCambio()` tras mutar.
 * Ninguna de las cuatro funciones aquí presentes contiene atributos
 * `onclick`/`onchange` en sus plantillas de cadena, así que no hizo
 * falta introducir ningún `data-accion`.
 */

import { escapeHTML } from "../../utils/dom.js";
import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { createsCycle } from "./modelo.js";

/* Cuerpo copiado de ORIG 5540-5933 (runProblemValidation), sin la
   definición anidada de createsCycle (ORIG 5718-5760): se importa de
   modelo.js en su lugar. */
export function runProblemValidation() {

  const state = obtenerEstado();

  const nodes =
    Array.isArray(state.nodos)
      ? state.nodos
      : [];

  const root =
    nodes.find(function (node) {
      return node && node.codigo === "P";
    });


  /* =========================================================
     1. DIRECCIÓN CAUSAL
     ========================================================= */

  const directionProblems = [];

  nodes
    .filter(function (node) {
      return node && node.codigo !== "P";
    })
    .forEach(function (node) {

      const parent =
        nodes.find(function (candidate) {
          return candidate &&
            candidate.codigo === node.padre;
        });

      if (!parent) {

        directionProblems.push(
          node.codigo +
          " no tiene un padre válido."
        );

        return;
      }

      if (node.tipo === "causa") {

        if (
          parent.codigo !== "P" &&
          parent.tipo !== "causa"
        ) {

          directionProblems.push(
            node.codigo +
            " está conectado a un nodo que no corresponde a una causa."
          );

        }

      }


      if (node.tipo === "efecto") {

        if (
          parent.codigo !== "P" &&
          parent.tipo !== "efecto"
        ) {

          directionProblems.push(
            node.codigo +
            " está conectado a un nodo que no corresponde a un efecto."
          );

        }

      }

    });


  /* =========================================================
     2. NIVEL
     ========================================================= */

  const levelProblems = [];

  nodes
    .filter(function (node) {
      return node && node.codigo !== "P";
    })
    .forEach(function (node) {

      const parent =
        nodes.find(function (candidate) {
          return candidate &&
            candidate.codigo === node.padre;
        });

      if (!parent) {
        return;
      }

      const expectedLevel =
        parent.codigo === "P"
          ? 1
          : Number(parent.nivel) + 1;

      if (Number(node.nivel) !== expectedLevel) {

        levelProblems.push(
          node.codigo +
          " está en nivel " +
          node.nivel +
          " pero su padre " +
          parent.codigo +
          " corresponde al nivel " +
          expectedLevel +
          "."
        );

      }

    });


  /* =========================================================
     3. SUFICIENCIA
     ========================================================= */

  /*
   * Esta prueba no puede resolverse completamente por código.
   * El sistema identifica ramas terminales y solicita juicio
   * del formulador.
   */

  const causeRoots =
    nodes.filter(function (node) {

      if (!node || node.tipo !== "causa") {
        return false;
      }

      return !nodes.some(function (child) {

        return child &&
          child.padre === node.codigo;

      });

    });


  const effectLeaves =
    nodes.filter(function (node) {

      if (!node || node.tipo !== "efecto") {
        return false;
      }

      return !nodes.some(function (child) {

        return child &&
          child.padre === node.codigo;

      });

    });


  const sufficiencyReady =
    causeRoots.length > 0 &&
    Boolean(root);


  /* =========================================================
     4. NO CIRCULARIDAD
     ========================================================= */

  const circularProblems = [];


  nodes
    .filter(function (node) {
      return node && node.codigo !== "P";
    })
    .forEach(function (node) {

      if (createsCycle(node)) {

        circularProblems.push(
          node.codigo
        );

      }

    });


  /* =========================================================
     5. EVIDENCIA
     ========================================================= */

  const evidenceProblems = [];

  nodes
    .filter(function (node) {
      return node && node.codigo !== "P";
    })
    .forEach(function (node) {

      const hasEvidence =
        Boolean(
          String(
            node.evidencia || ""
          ).trim()
        );

      const hasBaseline =
        Boolean(
          String(
            node.lineaBase || ""
          ).trim()
        );

      if (!hasEvidence) {

        evidenceProblems.push(
          node.codigo +
          ": falta evidencia."
        );

      } else if (!hasBaseline) {

        evidenceProblems.push(
          node.codigo +
          ": tiene evidencia pero falta línea base."
        );

      }

    });


  /*
   * El problema central también debe quedar sustentado.
   */

  if (root) {

    if (
      !String(
        root.evidencia || ""
      ).trim()
    ) {

      evidenceProblems.push(
        "P: falta evidencia del problema central."
      );

    }

  } else {

    evidenceProblems.push(
      "No existe el problema central P."
    );

  }


  /* =========================================================
     RESULTADOS
     ========================================================= */

  const tests = [

    {
      key: "direccion",
      title: "1. Dirección causal",
      question:
        "Cada vínculo debe poder leerse como «X produce Y» y «Y ocurre porque X».",
      ok:
        directionProblems.length === 0,
      details:
        directionProblems
    },

    {
      key: "nivel",
      title: "2. Nivel",
      question:
        "Entre un nodo y su superior inmediato no debe faltar un eslabón causal evidente.",
      ok:
        levelProblems.length === 0,
      details:
        levelProblems
    },

    {
      key: "suficiencia",
      title: "3. Suficiencia",
      question:
        "Si las causas inferiores se resolvieran, ¿sería razonable esperar que desapareciera el nodo superior?",
      ok:
        false,
      pending:
        true,
      details:
        sufficiencyReady
          ? [
            "El sistema identificó " +
            causeRoots.length +
            " causa(s) terminal(es). " +
            "La suficiencia causal requiere juicio del formulador."
          ]
          : [
            "El árbol todavía no tiene una estructura suficiente para realizar esta lectura."
          ]
    },

    {
      key: "circularidad",
      title: "4. No circularidad",
      question:
        "Ningún nodo debe terminar dependiendo de sí mismo mediante su cadena de padres.",
      ok:
        circularProblems.length === 0,
      details:
        circularProblems
    },

    {
      key: "evidencia",
      title: "5. Evidencia",
      question:
        "Cada nodo debe contar con al menos una fuente o registro que permita contrastarlo.",
      ok:
        evidenceProblems.length === 0,
      details:
        evidenceProblems
    }

  ];


  renderProblemValidationResults(
    tests
  );

  return tests;

}

/* Cuerpo copiado literalmente de ORIG 5935-6184
   (renderProblemValidationResults). */
export function renderProblemValidationResults(tests) {

  const box =
    document.getElementById(
      "problemValidationWorkspace"
    );

  const summary =
    document.getElementById(
      "problemValidationSummary"
    );

  if (!box) {
    return;
  }


  const failed =
    tests.filter(function (test) {

      return !test.ok &&
        !test.pending;

    });


  const pending =
    tests.filter(function (test) {

      return test.pending;

    });


  const passed =
    tests.filter(function (test) {

      return test.ok;

    });


  let summaryTitle;
  let summaryText;
  let summaryClass;


  if (failed.length > 0) {

    summaryTitle =
      "El árbol requiere correcciones";

    summaryText =
      failed.length +
      " prueba(s) presentan hallazgos.";

    summaryClass =
      "error";

  } else if (pending.length > 0) {

    summaryTitle =
      "Validación estructural favorable, juicio pendiente";

    summaryText =
      "Las pruebas automáticas no detectan fallas estructurales, " +
      "pero aún debe revisarse la suficiencia y la validación externa.";

    summaryClass =
      "warning";

  } else {

    summaryTitle =
      "Validación automática favorable";

    summaryText =
      "No se detectaron fallas automáticas en las cinco pruebas.";

    summaryClass =
      "success";

  }


  if (summary) {

    summary.className =
      "problem-validation-summary " +
      summaryClass;

    summary.innerHTML = `

      <div>

        <strong>
          ${escapeHTML(summaryTitle)}
        </strong>

        <span>
          ${escapeHTML(summaryText)}
        </span>

      </div>

      <div class="problem-validation-counter">

        <span>
          ✓ ${passed.length}
        </span>

        <span>
          ! ${pending.length}
        </span>

        <span>
          ✕ ${failed.length}
        </span>

      </div>

    `;

  }


  box.innerHTML =
    tests.map(function (test) {

      const status =
        test.pending
          ? "pending"
          : test.ok
            ? "ok"
            : "error";


      const statusLabel =
        test.pending
          ? "JUICIO REQUERIDO"
          : test.ok
            ? "CONFORME"
            : "REVISAR";


      return `

        <div
          class="problem-validation-item ${status}">

          <div class="problem-validation-item-head">

            <div>

              <span class="
                problem-validation-status
                ${status}
              ">

                ${statusLabel}

              </span>

              <h4>
                ${escapeHTML(test.title)}
              </h4>

            </div>

          </div>


          <p class="problem-validation-question">

            ${escapeHTML(test.question)}

          </p>


          ${test.ok

              ? `

                <div class="problem-validation-message">

                  ✓ No se encontraron hallazgos automáticos.

                </div>

              `

              : test.pending

                ? `

                  <div class="problem-validation-message pending">

                    ${test.details
                  .map(function (detail) {

                    return `
                            <div>
                              ${escapeHTML(detail)}
                            </div>
                          `;

                  })
                  .join("")
                }

                  </div>

                `

                : `

                  <div class="problem-validation-findings">

                    <strong>
                      Hallazgos
                    </strong>

                    <ul>

                      ${test.details
                  .map(function (detail) {

                    return `
                              <li>
                                ${escapeHTML(detail)}
                              </li>
                            `;

                  })
                  .join("")
                }

                    </ul>

                  </div>

                `
            }

        </div>

      `;

    }).join("");
}

/* Cuerpo copiado literalmente de ORIG 6186-6305
   (saveProblemExternalValidation). */
export function saveProblemExternalValidation() {

  const state = obtenerEstado();

  const recognized =
    document
      .getElementById("validationRecognized")
      ?.value.trim() || "";

  const rejected =
    document
      .getElementById("validationRejected")
      ?.value.trim() || "";

  const missing =
    document
      .getElementById("validationMissing")
      ?.value.trim() || "";

  const source =
    document
      .getElementById("validationSource")
      ?.value || "";

  const observations =
    document
      .getElementById("validationObservations")
      ?.value.trim() || "";


  if (
    !recognized &&
    !rejected &&
    !missing &&
    !observations
  ) {

    alert(
      "Registra al menos un resultado de la validación."
    );

    return;

  }


  /*
   * La validación externa se conserva en la bitácora
   * del artefacto, sin guardar nombres ni datos personales.
   */

  if (!Array.isArray(state.bitacora)) {
    state.bitacora = [];
  }


  state.bitacora.push({

    fecha:
      new Date().toISOString(),

    patron:
      "Validación externa del árbol",

    salida:
      [
        source
          ? "Modalidad: " + source
          : "",

        recognized
          ? "Reconocidos: " + recognized
          : "",

        rejected
          ? "No reconocidos: " + rejected
          : "",

        missing
          ? "Faltantes: " + missing
          : ""
      ]
        .filter(Boolean)
        .join("\n"),

    correccion:
      observations ||
      "Sin corrección registrada."

  });

  notificarCambio();


  const notice =
    document.getElementById(
      "externalValidationNotice"
    );


  if (notice) {

    notice.innerHTML = `

      <div class="notice success">

        <strong>
          ✓ Validación registrada
        </strong>

        <div style="margin-top:4px">

          El resultado quedó incorporado a la bitácora
          para conservar la trazabilidad de la revisión.

        </div>

      </div>

    `;

  }

}

/* Cuerpo copiado literalmente de ORIG 6307-6396
   (saveProblemValidationDecision). */
export function saveProblemValidationDecision() {

  const state = obtenerEstado();

  const selected =
    document.querySelector(
      'input[name="problemValidationDecision"]:checked'
    );

  if (!selected) {

    alert(
      "Selecciona el estado de cierre de la validación."
    );

    return;

  }


  if (!Array.isArray(state.bitacora)) {
    state.bitacora = [];
  }


  const labels = {

    aprobado:
      "Árbol consistente",

    ajustes:
      "Requiere ajustes",

    pendiente:
      "Validación pendiente"

  };


  state.bitacora.push({

    fecha:
      new Date().toISOString(),

    patron:
      "Cierre de validación metodológica",

    salida:
      "Decisión: " +
      labels[selected.value],

    correccion:
      selected.value === "aprobado"
        ? "El formulador considera que el árbol puede continuar."
        : selected.value === "ajustes"
          ? "El árbol debe ser corregido antes de continuar."
          : "La validación aún no es suficiente."

  });

  notificarCambio();


  const notice =
    document.getElementById(
      "problemValidationDecisionNotice"
    );


  if (notice) {

    notice.innerHTML = `

      <div class="notice success">

        <strong>
          ✓ Decisión registrada
        </strong>

        <div style="margin-top:4px">

          ${escapeHTML(
          labels[selected.value]
        )}

        </div>

      </div>

    `;

  }

}
