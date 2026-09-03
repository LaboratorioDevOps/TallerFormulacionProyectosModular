/**
 * Paso 3 · Análisis de objetivos — sincronización con el árbol de problemas.
 *
 * Cuerpo copiado de ORIG:
 *   - syncObjectivesFromProblemNodes (7045-7100)
 *
 * Corrige el defecto 3: en el original, `continuarAlPaso3()` comprobaba
 * `typeof syncObjectivesFromProblemNodes === "function"` sobre una función
 * privada de un IIFE. Esa comprobación era siempre falsa y la sincronización
 * nunca se ejecutaba, sin ningún error visible. Aquí se exporta de verdad y
 * el `index.js` del paso la importa e invoca directamente: un import roto
 * fallaría de forma visible al cargar el módulo, nunca en silencio.
 *
 * Regla de aislamiento: este archivo lee `estado.nodos` (escrito por el
 * paso anterior de análisis del problema) pero no importa ningún módulo
 * del árbol de carpetas del paso anterior. Solo depende del estado
 * compartido en `core/estado.js`.
 *
 * Cambios permitidos respecto al original: añadir export/import, sustituir
 * el acceso previo al estado global por obtenerEstado(), y añadir
 * notificarCambio() tras mutar el estado.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";

/* Cuerpo copiado literalmente de ORIG 7045-7100 (syncObjectivesFromProblemNodes). */
export function syncObjectivesFromProblemNodes() {

  const state = obtenerEstado();

  if (!Array.isArray(state.nodos)) {
    state.nodos = [];
  }

  if (!Array.isArray(state.objetivos)) {
    state.objetivos = [];
  }

  state.nodos.forEach(function (nodo) {

    if (!nodo || !nodo.codigo) {
      return;
    }

    const existente = state.objetivos.find(function (objetivo) {
      return objetivo.codigo === nodo.codigo;
    });

    if (!existente) {

      state.objetivos.push({
        codigo: nodo.codigo,
        tipoOrigen: nodo.tipo || "",
        nivel: nodo.nivel ?? null,
        padre: nodo.padre || "",
        enunciadoOrigen: nodo.enunciado || "",

        /* El objetivo todavía NO se genera automáticamente */
        objetivo: "",

        /* Toda propuesta automática deberá quedar trazada */
        propuesta: true,
        confianza: "Baja",
        origen: "Propuesta IA",

        /* Decisión exclusiva del formulador */
        posibleSupuesto: false
      });

    } else {

      /*
       * Mantener actualizada la trazabilidad con el nodo
       * original sin sobrescribir las decisiones del formulador.
       */
      existente.tipoOrigen = nodo.tipo || existente.tipoOrigen;
      existente.nivel = nodo.nivel ?? existente.nivel;
      existente.padre = nodo.padre || existente.padre;
      existente.enunciadoOrigen = nodo.enunciado || existente.enunciado;

    }

  });

  notificarCambio();
}
