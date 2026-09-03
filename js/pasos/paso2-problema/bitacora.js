/**
 * Paso 2 · Bitácora de trazabilidad de intervenciones IA.
 *
 * Migración literal de ORIG 6452-6551 (addProblemLog), 6553-6760
 * (renderProblemBitacora), 6762-6791 (deleteProblemLog) y 6793-6814
 * (clearProblemLogForm).
 */

import { escapeHTML } from "../../utils/dom.js";
import { formatProblemLogDate } from "../../utils/texto.js";
import { obtenerEstado, notificarCambio } from "../../core/estado.js";

    export function addProblemLog() {

      const pattern =
        document.getElementById("logPattern")
          ?.value.trim() || "";

      const prompt =
        document.getElementById("logPrompt")
          ?.value.trim() || "";

      const output =
        document.getElementById("logOutput")
          ?.value.trim() || "";

      const error =
        document.getElementById("logError")
          ?.value.trim() || "";

      const detection =
        document.getElementById("logDetection")
          ?.value.trim() || "";

      const correction =
        document.getElementById("logCorrection")
          ?.value.trim() || "";


      if (!pattern || !prompt || !output || !error || !correction) {

        alert(
          "Completa propósito, prompt, salida, error y corrección humana."
        );

        return;
      }


      if (!Array.isArray(obtenerEstado().bitacora)) {
        obtenerEstado().bitacora = [];
      }


      obtenerEstado().bitacora.push({

        fecha:
          new Date().toISOString(),

        patron:
          "Paso 2 · " + pattern,

        prompt:
          prompt,

        salida:
          output,

        error:
          error,

        comoSeDetecto:
          detection,

        correccion:
          correction

      });

      notificarCambio();


      renderProblemBitacora();

      clearProblemLogForm();


      const notice =
        document.getElementById(
          "problemLogNotice"
        );


      if (notice) {

        notice.innerHTML = `

      <div class="notice success">

        <strong>
          ✓ Registro agregado
        </strong>

        <div style="margin-top:4px">
          La intervención quedó incorporada a la bitácora.
        </div>

      </div>

    `;

      }

    }

    export function renderProblemBitacora() {

      const box =
        document.getElementById(
          "problemLogWorkspace"
        );

      if (!box) {
        return;
      }


      const logs =
        Array.isArray(obtenerEstado().bitacora)
          ? obtenerEstado().bitacora
          : [];


      const count =
        document.getElementById(
          "problemLogCount"
        );


      if (count) {

        count.textContent =
          logs.length +
          (logs.length === 1
            ? " registro"
            : " registros");

      }


      if (!logs.length) {

        box.innerHTML = `

      <div class="notice">
        Aún no hay registros de bitácora.
      </div>

    `;

        return;
      }


      box.innerHTML = `

    <div class="problem-log-list">

      ${logs
          .map(function (log, index) {

            const date =
              formatProblemLogDate(
                log.fecha
              );


            return `

              <article
                class="problem-log-entry">

                <div class="problem-log-entry-head">

                  <div>

                    <span class="badge">
                      #${index + 1}
                    </span>

                    <strong>
                      ${escapeHTML(
              log.patron ||
              "Intervención IA"
            )}
                    </strong>

                  </div>

                  <span class="problem-log-date">
                    ${escapeHTML(date)}
                  </span>

                </div>


                <div class="problem-log-grid">

                  <div>

                    <label>
                      Prompt empleado
                    </label>

                    <div class="problem-log-content">
                      ${escapeHTML(
              log.prompt ||
              "No registrado"
            )}
                    </div>

                  </div>


                  <div>

                    <label>
                      Salida del modelo
                    </label>

                    <div class="problem-log-content proposal">
                      <span class="badge warning">
                        Propuesta
                      </span>

                      <div style="margin-top:6px">
                        ${escapeHTML(
              log.salida ||
              "No registrada"
            )}
                      </div>

                    </div>

                  </div>


                  <div>

                    <label>
                      Qué produjo mal
                    </label>

                    <div class="problem-log-content error">
                      ${escapeHTML(
              log.error ||
              "No registrado"
            )}
                    </div>

                  </div>


                  <div>

                    <label>
                      Cómo se detectó
                    </label>

                    <div class="problem-log-content">
                      ${escapeHTML(
              log.comoSeDetecto ||
              "No registrado"
            )}
                    </div>

                  </div>


                  <div class="problem-log-correction">

                    <label>
                      Corrección humana
                    </label>

                    <div class="problem-log-content correction">
                      ${escapeHTML(
              log.correccion ||
              "No registrada"
            )}
                    </div>

                  </div>

                </div>


                <div class="problem-log-actions">

                  <button
                    type="button"
                    class="btn-mini"
                    data-accion="eliminar-bitacora"
                    data-indice="${index}">

                    Eliminar registro

                  </button>

                </div>

              </article>

            `;

          })
          .join("")
        }

    </div>

  `;

    }

    export function deleteProblemLog(index) {

      if (
        !Array.isArray(obtenerEstado().bitacora) ||
        !obtenerEstado().bitacora[index]
      ) {
        return;
      }


      const confirmed =
        confirm(
          "¿Desea eliminar este registro de la bitácora?"
        );


      if (!confirmed) {
        return;
      }


      obtenerEstado().bitacora.splice(
        index,
        1
      );

      notificarCambio();


      renderProblemBitacora();

    }

    export function clearProblemLogForm() {

      [
        "logPattern",
        "logPrompt",
        "logOutput",
        "logError",
        "logDetection",
        "logCorrection"

      ].forEach(function (id) {

        const field =
          document.getElementById(id);

        if (field) {
          field.value = "";
        }

      });

    }
