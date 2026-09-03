/**
 * Paso 3 · Análisis de objetivos — generación de propuestas de objetivo.
 *
 * Cuerpos copiados de ORIG:
 *   - generateObjectiveProposals (7373-7425)
 *   - proposePositiveState       (7427-7586)
 *
 * Cambios permitidos respecto al original: añadir export/import, sustituir
 * el acceso previo al estado global por obtenerEstado(), y añadir
 * notificarCambio() tras mutar el estado.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { syncObjectivesFromProblemNodes } from "./sincronizacion.js";
import { renderObjectiveTransformation } from "./transformacion.js";

/* Cuerpo copiado literalmente de ORIG 7373-7425 (generateObjectiveProposals). */
export function generateObjectiveProposals() {

  const state = obtenerEstado();

  if (!Array.isArray(state.nodos)) {
    return;
  }

  syncObjectivesFromProblemNodes();


  state.nodos.forEach(function (node) {

    const objective =
      state.objetivos.find(function (item) {

        return item.codigo === node.codigo;

      });


    if (!objective) {
      return;
    }


    /*
     * Si el formulador ya escribió un objetivo,
     * NO lo sobrescribimos.
     */

    if (
      String(
        objective.objetivo || ""
      ).trim()
    ) {
      return;
    }


    objective.objetivo =
      proposePositiveState(
        node.enunciado
      );

    objective.propuesta = true;
    objective.confianza = "Baja";
    objective.origen = "Propuesta IA";

  });

  notificarCambio();

  renderObjectiveTransformation();

}

/* Cuerpo copiado literalmente de ORIG 7427-7586 (proposePositiveState). */
export function proposePositiveState(text) {

  let value =
    String(text || "")
      .trim();


  if (!value) {
    return "";
  }


  /*
   * Transformaciones de estado frecuentes.
   * No son decisiones metodológicas definitivas.
   */

  const replacements = [

    {
      pattern:
        /^limitadas oportunidades/i,

      replacement:
        "Mayores oportunidades"
    },

    {
      pattern:
        /^baja disponibilidad/i,

      replacement:
        "Mayor disponibilidad"
    },

    {
      pattern:
        /^limitada disponibilidad/i,

      replacement:
        "Mayor disponibilidad"
    },

    {
      pattern:
        /^limitada oferta/i,

      replacement:
        "Mayor oferta"
    },

    {
      pattern:
        /^baja oferta/i,

      replacement:
        "Mayor oferta"
    },

    {
      pattern:
        /^débil articulación/i,

      replacement:
        "Articulación fortalecida"
    },

    {
      pattern:
        /^baja articulación/i,

      replacement:
        "Articulación mejorada"
    },

    {
      pattern:
        /^menor disponibilidad/i,

      replacement:
        "Mayor disponibilidad"
    },

    {
      pattern:
        /^alto nivel de/i,

      replacement:
        "Nivel reducido de"
    },

    {
      pattern:
        /^alta proporción de/i,

      replacement:
        "Menor proporción de"
    },

    {
      pattern:
        /^baja proporción de/i,

      replacement:
        "Mayor proporción de"
    },

    {
      pattern:
        /^escasa/i,

      replacement:
        "Mayor disponibilidad de"
    },

    {
      pattern:
        /^insuficiente/i,

      replacement:
        "Nivel suficiente de"
    }

  ];


  for (
    let i = 0;
    i < replacements.length;
    i++
  ) {

    const item =
      replacements[i];


    if (
      item.pattern.test(value)
    ) {

      return value.replace(
        item.pattern,
        item.replacement
      );

    }

  }


  /*
   * Fallback deliberadamente conservador.
   * Se marca como propuesta y requiere edición.
   */

  return "Condición mejorada: " +
    value.charAt(0).toLowerCase() +
    value.slice(1);

}
