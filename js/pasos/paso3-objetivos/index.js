/**
 * Paso 3 · Análisis de objetivos — orquestador del módulo.
 *
 * Corrige el defecto 3: en el original, `continuarAlPaso3()` (ORIG 6842)
 * comprobaba `typeof syncObjectivesFromProblemNodes === "function"` sobre
 * una función privada de un IIFE. La condición era siempre falsa y la
 * sincronización nunca se ejecutaba, sin ningún error visible. Aquí se
 * importa la función real y se invoca directamente, sin ningún `typeof`:
 * un import roto falla de forma visible al cargar el módulo, nunca en
 * silencio.
 */

import { irAPantalla } from "../../core/router.js";
import { syncObjectivesFromProblemNodes } from "./sincronizacion.js";
import { renderObjectiveTransformation, updateObjectiveValue } from "./transformacion.js";
import { generateObjectiveProposals } from "./propuestas.js";
import { toggleObjectiveAssumption, renderObjectiveAssumptions } from "./supuestos.js";

let raiz = null;

function mostrarSubpantalla(nombre, boton) {
  for (const s of raiz.querySelectorAll(".objective-subscreen")) s.classList.remove("active");
  for (const t of raiz.querySelectorAll(".step3-tab")) t.classList.remove("active");
  raiz.querySelector(`#objectiveSubscreen-${nombre}`)?.classList.add("active");
  boton?.classList.add("active");
  if (nombre === "transformacion") {
    renderObjectiveTransformation();
    renderObjectiveAssumptions();
  }
}

function render() {
  // El artefacto original nunca llegaba a ejecutar esto: comprobaba
  // `typeof syncObjectivesFromProblemNodes === "function"` sobre una
  // función privada del IIFE, y la condición era siempre falsa (defecto 3).
  syncObjectivesFromProblemNodes();
  renderObjectiveTransformation();
  renderObjectiveAssumptions();
}

export default {
  id: 3,
  titulo: "Análisis de objetivos",
  grupo: "Análisis situacional",
  etiquetaPaso: "Paso 3",
  vista: "views/screen03-objetivos.html",

  init(contenedor) {
    raiz = contenedor;

    raiz.addEventListener("click", (evento) => {
      const objetivo = evento.target.closest("[data-accion]");
      if (!objetivo) return;
      const { accion, subpantalla, codigo } = objetivo.dataset;

      switch (accion) {
        case "subpantalla":        mostrarSubpantalla(subpantalla, objetivo); break;
        case "generar-propuestas": generateObjectiveProposals(); render(); break;
        case "quitar-supuesto":    toggleObjectiveAssumption(codigo, false); break;
        case "continuar-paso4":    irAPantalla(4); break;
        default: break;
      }
    });

    raiz.addEventListener("change", (evento) => {
      const campo = evento.target.closest("[data-accion='editar-objetivo']");
      if (campo) {
        updateObjectiveValue(campo.dataset.codigo, campo.value);
        return;
      }

      // El checkbox de "posible supuesto" fija el valor explícito de su
      // estado real (igual que el onchange="...(codigo, this.checked)"
      // del original, ORIG 7324-7327), a diferencia del botón "Quitar"
      // (arriba), que siempre limpia. toggleObjectiveAssumption ya
      // distingue ambos casos por si recibe o no el segundo argumento.
      const checkbox = evento.target.closest("[data-accion='marcar-supuesto']");
      if (checkbox) {
        toggleObjectiveAssumption(checkbox.dataset.codigo, checkbox.checked);
      }
    });
  },

  render
};
