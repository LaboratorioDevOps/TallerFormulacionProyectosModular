/**
 * Paso 2 · Análisis del problema — orquestador del módulo.
 *
 * `showProblemSubscreen` (ORIG 9521-9550) se conserva como función interna
 * `mostrarSubpantalla`, con las mismas clases `.problem-subscreen` /
 * `.step2-tab` del original. `continuarAlPaso3` (ORIG 6842-6874) se
 * resuelve aquí delegando en `irAPantalla(3)` del router; la sincronización
 * de objetivos que hacía (`syncObjectivesFromProblemNodes`) pertenece al
 * Paso 3 y no a este módulo.
 *
 * Reúne los ocho módulos del Paso 2 (contexto, enunciado, modelo, nodos,
 * árbol, evidencia, validación, bitácora, prompts) y conecta, por
 * delegación de eventos, todas las acciones de la vista.
 */

import { irAPantalla } from "../../core/router.js";
import { copiarDesdeElemento } from "../../utils/portapapeles.js";
import { prepararPaso2, renderProblemContext } from "./contexto.js";
import { enlazarCamposCentrales, validateCentralProblem, confirmCentralProblem, repoblarCamposCentrales } from "./enunciado.js";
import { refreshNodeParentOptions, addProblemNode, deleteProblemNode, renderProblemNodes } from "./nodos.js";
import { renderProblemTree } from "./arbol-svg.js";
import { renderNodeEvidence } from "./evidencia.js";
import {
  runProblemValidation, renderProblemValidationResults,
  saveProblemExternalValidation, saveProblemValidationDecision
} from "./validacion.js";
import { addProblemLog, renderProblemBitacora, deleteProblemLog, clearProblemLogForm } from "./bitacora.js";
import { renderProblemModule, generateProblemPrompt } from "./prompts.js";

let raiz = null;

/* Reimplementación de showProblemSubscreen (ORIG 9521-9550). */
function mostrarSubpantalla(nombre, boton) {
  for (const s of raiz.querySelectorAll(".problem-subscreen")) s.classList.remove("active");
  for (const t of raiz.querySelectorAll(".step2-tab")) t.classList.remove("active");
  raiz.querySelector(`#problemSubscreen-${nombre}`)?.classList.add("active");
  boton?.classList.add("active");
}

function render() {
  prepararPaso2();
  renderProblemContext();
  repoblarCamposCentrales();
  renderProblemNodes();
  renderProblemTree();
  renderNodeEvidence();
  renderProblemBitacora();
  renderProblemModule();
  refreshNodeParentOptions();
}

export default {
  id: 2,
  titulo: "Análisis del problema",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 2",
  vista: "views/screen02-problema.html",

  init(contenedor) {
    raiz = contenedor;
    enlazarCamposCentrales(raiz, renderProblemTree);

    raiz.addEventListener("click", async (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const { accion, subpantalla, codigo, indice, prompt, tipo } = objetivo.dataset;

      switch (accion) {
        case "p2:subpantalla":     mostrarSubpantalla(subpantalla, objetivo); break;
        case "validar-enunciado":  validateCentralProblem(); break;
        case "confirmar-enunciado":
          confirmCentralProblem(() => {
            renderProblemModule();
            mostrarSubpantalla("causas", null);
          });
          renderProblemTree();
          break;
        case "agregar-nodo":       addProblemNode(); render(); break;
        case "eliminar-nodo":      deleteProblemNode(codigo); render(); break;
        case "validar-arbol":      renderProblemValidationResults(runProblemValidation()); break;
        case "guardar-validacion-externa": saveProblemExternalValidation(); break;
        case "guardar-decision":   saveProblemValidationDecision(); break;
        case "agregar-bitacora":   addProblemLog(); renderProblemBitacora(); break;
        case "eliminar-bitacora":  deleteProblemLog(Number(indice)); renderProblemBitacora(); break;
        case "limpiar-bitacora":   clearProblemLogForm(); break;
        case "generar-prompt":     generateProblemPrompt(tipo); break;
        case "p2:copiar-prompt":   await copiarDesdeElemento(prompt, objetivo); break;
        case "continuar-paso3":    irAPantalla(3); break;
        default: break;
      }
    });
  },

  render
};
