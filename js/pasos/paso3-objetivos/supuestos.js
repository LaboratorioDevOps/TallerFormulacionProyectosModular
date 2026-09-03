/**
 * Paso 3 · Análisis de objetivos — supuestos potenciales.
 *
 * Cuerpos copiados de ORIG:
 *   - toggleObjectiveAssumption (7625-7655)
 *   - renderObjectiveAssumptions (7657-7766)
 *
 * Cambios permitidos respecto al original: añadir export/import, sustituir
 * el acceso previo al estado global por obtenerEstado(), añadir
 * notificarCambio() tras mutar el estado, y sustituir el
 * `onclick="toggleObjectiveAssumption('${codigo}', false)"` del botón
 * "Quitar" (ORIG 7724-7728, dentro de renderObjectiveAssumptions) por
 * `data-accion="quitar-supuesto" data-codigo="..."`.
 *
 * El original tenía DOS llamadas con semánticas distintas: el checkbox
 * de renderObjectiveTransformation (ORIG 7315-7327) pasaba `this.checked`
 * (fija el valor real del checkbox), y este botón "Quitar" pasaba
 * siempre `false` (limpia incondicionalmente). El index.js del paso
 * respeta esa diferencia con dos data-accion separados: "quitar-supuesto"
 * aquí llama con `false` explícito; "marcar-supuesto" (en
 * transformacion.js) llama con el `checked` real del checkbox.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";
import { renderObjectiveTransformation } from "./transformacion.js";

/*
 * Cuerpo copiado literalmente de ORIG 7625-7655 (toggleObjectiveAssumption),
 * con la firma real de dos parámetros. `checked === undefined` alterna
 * el valor actual (para llamadas futuras sin argumento explícito); ambas
 * llamadas reales del index.js pasan `checked` de forma explícita, así
 * que en la práctica el comportamiento es idéntico al original: fijar,
 * nunca alternar.
 */
export function toggleObjectiveAssumption(
  codigo,
  checked
) {

  const state = obtenerEstado();

  if (!Array.isArray(state.objetivos)) {
    return;
  }

  const objective =
    state.objetivos.find(function (item) {

      return item.codigo === codigo;

    });


  if (!objective) {
    return;
  }


  objective.posibleSupuesto =
    checked === undefined
      ? !objective.posibleSupuesto
      : Boolean(checked);

  notificarCambio();

  renderObjectiveTransformation();

  renderObjectiveAssumptions();

}

/* Cuerpo copiado literalmente de ORIG 7657-7766 (renderObjectiveAssumptions). */
export function renderObjectiveAssumptions() {

  const state = obtenerEstado();

  const workspace =
    document.getElementById(
      "potentialAssumptionsWorkspace"
    );

  if (!workspace) {
    return;
  }

  const objectives =
    Array.isArray(state.objetivos)
      ? state.objetivos
      : [];

  const candidates =
    objectives.filter(function (objective) {

      return objective.posibleSupuesto === true;

    });


  if (!candidates.length) {

    workspace.innerHTML = `
      <div class="notice">
        Aún no se han identificado objetivos candidatos
        a supuesto.
      </div>
    `;

    return;
  }


  workspace.innerHTML = `

    <div class="potential-assumptions-list">

      ${candidates.map(function (objective) {

          return `

            <div class="potential-assumption-card">

              <div class="potential-assumption-header">

                <div>

                  <strong>
                    ${escapeHTML(
            objective.codigo
          )}
                  </strong>

                  <span class="potential-assumption-badge">
                    POSIBLE SUPUESTO
                  </span>

                </div>

                <button
                  type="button"
                  class="btn-mini"
                  data-accion="quitar-supuesto"
                  data-codigo="${escapeHTML(objective.codigo)}">

                  Quitar

                </button>

              </div>


              <div class="potential-assumption-objective">

                ${escapeHTML(
            objective.objetivo ||
            "Objetivo pendiente de formulación"
          )}

              </div>


              <div class="potential-assumption-note">

                Candidato identificado por el formulador.
                La decisión definitiva se realizará posteriormente
                en el Paso 9 · Supuestos.

              </div>

            </div>

          `;

        }).join("")
          }

    </div>

  `;

}
