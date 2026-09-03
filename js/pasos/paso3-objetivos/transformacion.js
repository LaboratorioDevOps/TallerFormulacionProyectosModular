/**
 * Paso 3 · Análisis de objetivos — transformación de problemas en objetivos.
 *
 * Cuerpos copiados de ORIG:
 *   - renderObjectiveTransformation (7106-7371)
 *   - updateObjectiveValue          (7588-7623)
 *
 * Cambios permitidos respecto al original: añadir export/import, sustituir
 * el acceso previo al estado global por obtenerEstado(), añadir
 * notificarCambio() tras cada mutación del estado, y sustituir el
 * `onchange="updateObjectiveValue(...)"` de ORIG 7295 (dentro del textarea)
 * por `data-accion="editar-objetivo" data-codigo="..."`, que el `index.js`
 * del paso escucha con un listener `change`. El `onclick` del botón
 * "Generar propuestas" y el `onchange` del checkbox de supuesto también se
 * retiran de la plantilla: el `index.js` los cubre con sus propios
 * `data-accion` sobre el contenedor del paso.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";
import { syncObjectivesFromProblemNodes } from "./sincronizacion.js";

/* Cuerpo copiado literalmente de ORIG 7106-7371 (renderObjectiveTransformation). */
export function renderObjectiveTransformation() {

  const state = obtenerEstado();

  const box =
    document.getElementById(
      "objectiveTransformationWorkspace"
    );

  if (!box) {
    return;
  }

  const nodes =
    Array.isArray(state.nodos)
      ? state.nodos
      : [];

  const objectives =
    Array.isArray(state.objetivos)
      ? state.objetivos
      : [];


  if (!nodes.length) {

    box.innerHTML = `
      <div class="notice">
        No hay nodos provenientes del árbol de problemas.
        Regresa al Paso 2 y construye primero el árbol.
      </div>
    `;

    return;
  }


  /*
   * Garantizar correspondencia nodo ↔ objetivo.
   */

  syncObjectivesFromProblemNodes();


  const refreshedObjectives =
    state.objetivos;


  box.innerHTML = `

    <div class="objective-transformation-toolbar">

      <div>

        <strong>
          Revelado del árbol de objetivos
        </strong>

        <span>
          ${nodes.length} nodos provenientes del árbol de problemas.
          Cada conversión permanece editable y marcada como propuesta.
        </span>

      </div>


      <button
        type="button"
        class="btn"
        data-accion="generar-propuestas">

        Generar propuestas

      </button>

    </div>


    <div class="objective-transformation-list">

      ${nodes.map(function (node) {

          const objective =
            refreshedObjectives.find(function (item) {

              return item.codigo === node.codigo;

            });


          if (!objective) {
            return "";
          }


          const role =
            node.codigo === "P"
              ? "Propósito"
              : node.tipo === "causa"
                ? (
                  node.raiz
                    ? "Medio operacionalizable"
                    : "Medio"
                )
                : "Fin";


          const roleClass =
            node.codigo === "P"
              ? "purpose"
              : node.tipo === "causa"
                ? "means"
                : "ends";


          return `

            <article
              class="objective-transformation-card">

              <div class="objective-source">

                <div>

                  <span class="objective-code">
                    ${escapeHTML(node.codigo)}
                  </span>

                  <span class="
                    objective-role
                    ${roleClass}
                  ">

                    ${role}

                  </span>

                  <span class="objective-proposal-badge">
                    Propuesta · Confianza baja
                  </span>

                </div>


                <div class="objective-source-meta">

                  Nivel ${escapeHTML(node.nivel ?? "—")}
                  · Padre ${escapeHTML(node.padre || "P")}

                </div>

              </div>


              <div class="objective-conversion">

                <div class="objective-problem-side">

                  <label>
                    Estado negativo de origen
                  </label>

                  <div class="objective-source-text">

                    ${escapeHTML(
            node.enunciado ||
            "Sin enunciado"
          )}

                  </div>

                </div>


                <div class="objective-arrow">
                  →
                </div>


                <div class="objective-target-side">

                  <label for="objective-${escapeHTML(node.codigo)}">

                    Objetivo propuesto *

                  </label>

                  <textarea
                    id="objective-${escapeHTML(node.codigo)}"
                    rows="3"
                    placeholder="Escribe un estado positivo deseado y viable..."
                    data-accion="editar-objetivo" data-codigo="${escapeHTML(node.codigo)}"
                  >${escapeHTML(
            objective.objetivo || ""
          )}</textarea>


                  <div class="objective-edit-note">

                    Editable por el formulador.
                    No debe nombrar directamente una acción o solución.

                  </div>

                </div>

              </div>


              <div class="objective-card-footer">

                <label class="objective-assumption">

                  <input
                    type="checkbox"
                    ${objective.posibleSupuesto
              ? "checked"
              : ""
            }
                    data-accion="marcar-supuesto"
                    data-codigo="${escapeHTML(node.codigo)}"
                  >

                  <span>
                    Marcar como posible supuesto
                  </span>

                </label>


                <span class="objective-origin">

                  ${objective.origen === "Propuesta IA"
              ? "Origen: Propuesta"
              : "Origen: Formulador"}

                </span>

              </div>

            </article>

          `;

        }).join("")

          }

    </div>


    <div class="notice objective-method-note">

      <strong>Regla metodológica:</strong>
      convertir un problema en objetivo no significa agregar
      "no" ni nombrar la solución. El resultado debe describir
      una condición positiva, deseable y viable. Las acciones
      se definirán posteriormente sobre los medios operacionalizables.

    </div>

  `;

}

/* Cuerpo copiado literalmente de ORIG 7588-7623 (updateObjectiveValue). */
export function updateObjectiveValue(
  codigo,
  value
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


  objective.objetivo =
    String(value || "").trim();


  /*
   * Sigue siendo propuesta hasta que el formulador
   * la revise y valide posteriormente.
   */

  objective.propuesta = true;
  objective.confianza = "Baja";

  notificarCambio();
}
