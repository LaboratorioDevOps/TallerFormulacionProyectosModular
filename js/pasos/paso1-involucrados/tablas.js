/**
 * Paso 1 · Análisis de involucrados — tablas.
 *
 * Defecto 1 (mitad resuelta aquí): en el original, `renderCharacterization`
 * generaba atributos de manejador en línea que invocaban editActor(...) y
 * deleteActor(...), funciones privadas de un IIFE, lo que lanzaba
 * `ReferenceError`. Se sustituyen por marcadores `data-accion` /
 * `data-indice`; la Tarea 9 los conecta por delegación de eventos.
 */

import { obtenerEstado } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";
import {
  calculateActorResult,
  actorPositionClass,
  actorPositionLabel,
  actorQuadrant
} from "./modelo.js";

/* Cuerpo copiado literalmente de ORIG 8054-8116 (renderMainActorTable). */
export function renderMainActorTable() {
  const body = document.getElementById("actorsMainTableBody");

  if (!body) {
    return;
  }

  if (!obtenerEstado().involucrados.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="actor-empty">
          Aún no hay involucrados registrados.
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = obtenerEstado().involucrados.map((actor, index) => {

    const problems = actor.problemas_percibidos || [];

    const groupEmpty = !actor.grupo;
    const interestEmpty = !actor.intereses;
    const problemsEmpty = !problems.length;
    const resourcesEmpty = !actor.recursos_mandatos;

    return `
      <tr>

        <td class="${groupEmpty ? "empty-cell" : ""}">
          ${groupEmpty
              ? "Celda vacía"
              : escapeHTML(actor.grupo)}
        </td>

        <td class="${interestEmpty ? "empty-cell" : ""}">
          ${interestEmpty
              ? "Celda vacía"
              : escapeHTML(actor.intereses)}
        </td>

        <td class="${problemsEmpty ? "empty-cell" : ""}">
          ${problemsEmpty
              ? "Celda vacía"
              : `<ul class="actor-problem-list">
                  ${problems.map(problem =>
                `<li>${escapeHTML(problem)}</li>`
              ).join("")}
                </ul>`
            }
        </td>

        <td class="${resourcesEmpty ? "empty-cell" : ""}">
          ${resourcesEmpty
              ? "Celda vacía"
              : escapeHTML(actor.recursos_mandatos)}
        </td>

      </tr>
    `;
  }).join("");
}

/* Cuerpo copiado literalmente de ORIG 8118-8224 (renderCharacterization),
 * salvo los dos `onclick` sustituidos por `data-accion`/`data-indice`
 * (líneas ORIG 8208 y 8215) — ver nota de defecto 1 arriba.
 */
export function renderCharacterization() {
  const body = document.getElementById(
    "actorsCharacterizationBody"
  );

  if (!body) {
    return;
  }

  if (!obtenerEstado().involucrados.length) {
    body.innerHTML = `
      <tr>
        <td colspan="9" class="actor-empty">
          Aún no hay involucrados registrados.
        </td>
      </tr>
    `;
    return;
  }

  /*
   * La resultante se calcula solamente para ordenar y mostrar.
   * Nunca se agrega al objeto actor.
   */
  const ordered = obtenerEstado().involucrados
    .map((actor, index) => ({
      actor,
      index,
      result: calculateActorResult(actor)
    }))
    .sort((a, b) =>
      Math.abs(b.result) - Math.abs(a.result)
    );

  body.innerHTML = ordered.map(item => {
    const actor = item.actor;
    const result = item.result;

    const resultClass =
      result > 0
        ? "result-positive"
        : result < 0
          ? "result-negative"
          : "position-neutral";

    const positionClass =
      actorPositionClass(actor.posicion);

    return `
      <tr>

        <td>
          <strong>${escapeHTML(actor.grupo)}</strong>
        </td>

        <td>
          ${actorPositionLabel(actor.posicion)}
        </td>

        <td>
          ${escapeHTML(actor.fuerza)}/5
        </td>

        <td>
          ${escapeHTML(actor.intensidad)}/5
        </td>

        <td class="${resultClass}">
          ${result > 0 ? "+" : ""}${result}
        </td>

        <td>
          <span class="quadrant-badge">
            ${escapeHTML(actorQuadrant(actor))}
          </span>
        </td>

        <td>
          ${escapeHTML(actor.razon)}
        </td>

        <td>
          ${escapeHTML(actor.estrategia)}
        </td>

        <td>
          <div class="actor-table-actions">
            <button
              type="button"
              class="btn-mini"
              data-accion="editar-actor" data-indice="${item.index}">
              Editar
            </button>

            <button
              type="button"
              class="btn-mini"
              data-accion="eliminar-actor" data-indice="${item.index}">
              Eliminar
            </button>
          </div>
        </td>

      </tr>
    `;
  }).join("");
}
