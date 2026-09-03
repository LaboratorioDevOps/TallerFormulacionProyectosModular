/**
 * Paso 1 · Análisis de involucrados — orquestador del módulo.
 *
 * Defecto 1 (mitad restante): `initActorModule` (ORIG 9456-9491) y
 * `renderActors` (ORIG 8881-8891) se convierten en `init` y `render`.
 * Toda la conexión de eventos pasa por delegación sobre el contenedor,
 * en vez de `addEventListener` directos sobre botones concretos y de
 * los `onclick` inline que lanzaban `ReferenceError` (editActor,
 * deleteActor, copyAIPrompt eran privadas del IIFE original).
 */

import { irAPantalla } from "../../core/router.js";
import { copiarDesdeElemento } from "../../utils/portapapeles.js";
import { saveActor, editActor, deleteActor, clearActorForm } from "./formulario.js";
import { renderMainActorTable, renderCharacterization } from "./tablas.js";
import { drawInterestPowerChart } from "./grafico-poder-interes.js";
import { drawStakeholderNetwork } from "./grafico-red.js";
import { renderActorValidations } from "./validacion.js";
import { renderTechniqueHelp } from "./tecnicas.js";

let raiz = null;

/* Cuerpo equivalente a ORIG 8881-8891 (renderActors). */
function render() {
  renderMainActorTable();
  renderCharacterization();
  drawInterestPowerChart();
  drawStakeholderNetwork();
  renderActorValidations();
  renderTechniqueHelp();
}

export default {
  id: 1,
  titulo: "Análisis de involucrados",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 1",
  vista: "views/screen01-involucrados.html",

  init(contenedor) {
    raiz = contenedor;

    // Delegación: cubre también las filas de tabla generadas dinámicamente.
    raiz.addEventListener("click", async (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const indice = Number(objetivo.dataset.indice);

      switch (objetivo.dataset.accion) {
        case "guardar-actor":   saveActor();   render(); break;
        case "limpiar-actor":   clearActorForm();        break;
        case "editar-actor":    editActor(indice);   render(); break;
        case "eliminar-actor":  deleteActor(indice); render(); break;
        case "copiar-prompt":
          // Resuelve el defecto 1: copyAIPrompt era privada del IIFE.
          await copiarDesdeElemento(objetivo.dataset.prompt, objetivo);
          break;
        case "continuar-paso2": irAPantalla(2); break;
        default: break;
      }
    });

    raiz.addEventListener("change", (evento) => {
      if (evento.target.id === "participationTechnique") renderTechniqueHelp();
    });
  },

  render
};
