/**
 * Paso 2 · Tabla de evidencia y línea base por nodo.
 *
 * Migración literal de ORIG 10970-11300. Las funciones anidadas
 * `requirement` y `confidenceClass` se quedan anidadas tal cual estaban
 * en el original.
 */

import { escapeHTML } from "../../utils/dom.js";
import { obtenerEstado } from "../../core/estado.js";

    export function renderNodeEvidence() {

      const box =
        document.getElementById("nodeEvidenceWorkspace");

      if (!box) {
        return;
      }

      const nodes =
        Array.isArray(obtenerEstado().nodos)
          ? obtenerEstado().nodos
          : [];

      if (!nodes.length) {

        box.innerHTML = `
      <div class="notice">
        Aún no hay nodos registrados.
      </div>
    `;

        return;
      }

      /*
       * Para el Avance 2:
       * P y nodos de primer nivel requieren sustentación.
       * Los demás se muestran para trazabilidad.
       */

      const ordered =
        [...nodes].sort(function (a, b) {

          if (a.codigo === "P") return -1;
          if (b.codigo === "P") return 1;

          if (a.tipo !== b.tipo) {
            return a.tipo === "efecto" ? -1 : 1;
          }

          return Number(a.nivel || 0) -
            Number(b.nivel || 0);

        });


      function requirement(node) {

        if (node.codigo === "P") {
          return "Obligatoria";
        }

        if (Number(node.nivel) === 1) {
          return "Obligatoria";
        }

        return "Opcional en Avance 2";
      }


      function confidenceClass(value) {

        if (value === "Alta") {
          return "success";
        }

        if (value === "Baja") {
          return "danger";
        }

        return "warning";
      }


      box.innerHTML = `

    <div class="node-evidence-summary">

      <div>
        <strong>
          ${ordered.length}
          elementos con trazabilidad
        </strong>

        <span>
          La ficha se alimenta directamente de los nodos
          registrados en el árbol.
        </span>
      </div>

      <div class="node-evidence-legend">

        <span class="badge success">
          Sustentación completa
        </span>

        <span class="badge warning">
          Pendiente de fortalecer
        </span>

        <span class="badge danger">
          Sin evidencia
        </span>

      </div>

    </div>


    <div class="node-evidence-table-wrap">

      <table class="node-evidence-table">

        <thead>

          <tr>

            <th>Código</th>

            <th>Enunciado</th>

            <th>Tipo / nivel</th>

            <th>Evidencia</th>

            <th>Línea base</th>

            <th>Confianza</th>

            <th>Estado</th>

          </tr>

        </thead>

        <tbody>

          ${ordered.map(function (node) {

        const hasEvidence =
          Boolean(
            String(node.evidencia || "").trim()
          );

        const hasBaseline =
          Boolean(
            String(node.lineaBase || "").trim()
          );

        const complete =
          hasEvidence &&
          hasBaseline;

        const confidence =
          node.confianza || "Baja";

        const statusClass =
          complete
            ? "success"
            : hasEvidence
              ? "warning"
              : "danger";

        const statusText =
          complete
            ? "Sustentada"
            : hasEvidence
              ? "Completar línea base"
              : "Falta evidencia";

        return `

              <tr>

                <td>

                  <strong>
                    ${escapeHTML(node.codigo)}
                  </strong>

                  ${node.codigo === "P"
            ? `<span class="badge">Problema</span>`
            : ""}

                </td>


                <td>

                  <div class="node-evidence-statement">

                    ${escapeHTML(
              node.enunciado || ""
            )}

                  </div>

                  <div class="small-note">

                    Padre:
                    ${escapeHTML(
              node.padre || "—"
            )}

                  </div>

                </td>


                <td>

                  <span class="badge">

                    ${node.tipo === "causa"
            ? "Causa"
            : node.tipo === "efecto"
              ? "Efecto"
              : "Problema"}

                  </span>

                  <div class="small-note"
                    style="margin-top:5px">

                    Nivel
                    ${escapeHTML(
                node.nivel ?? "—"
              )}

                  </div>

                </td>


                <td>

                  <div class="
                    ${hasEvidence
            ? "node-evidence-value"
            : "node-evidence-missing"}
                  ">

                    ${escapeHTML(
              node.evidencia ||
              "Pendiente de fuente"
            )}

                  </div>

                </td>


                <td>

                  <div class="
                    ${hasBaseline
            ? "node-evidence-value"
            : "node-evidence-missing"}
                  ">

                    ${escapeHTML(
              node.lineaBase ||
              "Pendiente de dato"
            )}

                  </div>

                </td>


                <td>

                  <span class="
                    badge
                    ${confidenceClass(confidence)}
                  ">

                    ${escapeHTML(confidence)}

                  </span>

                </td>


                <td>

                  <span class="
                    badge
                    ${statusClass}
                  ">

                    ${statusText}

                  </span>

                  <div class="small-note"
                    style="margin-top:5px">

                    ${requirement(node)}

                  </div>

                </td>

              </tr>

            `;

      }).join("")}

        </tbody>

      </table>

    </div>


    <div class="notice"
      style="margin-top:12px">

      <strong>Regla de sustentación:</strong>
      un nodo no se considera suficientemente sustentado solo
      porque sea plausible. Debe poder señalarse una fuente,
      un dato de línea base o una verificación pendiente.
      Las propuestas de IA deben contrastarse antes de aceptarse.

    </div>

  `;
    }
