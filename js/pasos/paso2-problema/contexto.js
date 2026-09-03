/**
 * Subpantalla «Contexto» del Paso 2 (Análisis del problema).
 *
 * Cuerpos copiados literalmente de ORIG:
 *   - prepararPaso2        (5358-5538)
 *   - renderProblemContext (6399-6450)
 *
 * Único cambio permitido: las referencias directas al estado global del
 * artefacto original pasan a `obtenerEstado()`, y se añade
 * `notificarCambio()` tras mutar. `renderProblemContext` escribe en el
 * input `problemPopulation` de esta subpantalla (Contexto); ese `id` NO
 * cambia, a diferencia del textarea homónimo de la subpantalla «Enunciado»
 * (ver enunciado.js, defecto 2).
 *
 * Corrección (revisión final, IMPORTANTE 1): `renderProblemContext` leía
 * `problema.cond` / `problema.delim`, claves que nadie escribe (la única
 * escritura real, en enunciado.js, usa `problema.condicion` /
 * `problema.delimitacion`), así que `problemCondition` y
 * `problemDelimitation` quedaban vacíos en cada render. Se corrigen las
 * claves aquí. Nótese que `problemCondition`, `problemAttribute` y
 * `problemDelimitation` son los MISMOS ids que usa la subpantalla
 * «Enunciado» (ver enunciado.js) — con esta corrección basta un solo
 * sitio; enunciado.js solo repuebla `problemCentralPopulation` y
 * `problemStatement`, que no se solapan con esta función.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";

export function prepararPaso2() {

  const estado = obtenerEstado();

  const caso = estado.caso || {};

  const involucrados =
    Array.isArray(estado.involucrados)
      ? estado.involucrados
      : [];

  /*
   * Asegurar estructura del problema
   */
  if (!estado.problema ||
    typeof estado.problema !== "object") {

    estado.problema = {
      cond: "",
      atributo: "",
      poblacion: "",
      delim: ""
    };
  }

  /*
   * Asegurar estructura de nodos
   */
  if (!Array.isArray(estado.nodos)) {
    estado.nodos = [];
  }

  /*
   * =====================================================
   * INSUMOS DEL PASO 0
   * =====================================================
   */

  const insumoCaso = {
    nombre: caso.nombre || "",
    territorio: caso.territorio || "",
    poblacion: caso.poblacion || "",
    periodo: caso.periodo || "",
    situacion: caso.situacion || ""
  };

  /*
   * =====================================================
   * INSUMOS DEL PASO 1
   * =====================================================
   */

  const insumoInvolucrados =
    involucrados.map(function (actor) {

      return {
        grupo: actor.grupo || "",
        naturaleza: actor.naturaleza || "",
        relacion: actor.relacion || "",
        rol: actor.rol || "",
        intereses: actor.intereses || "",

        problemasPercibidos:
          Array.isArray(actor.problemasPercibidos)
            ? actor.problemasPercibidos.slice()
            : [],

        recursosMandatos:
          Array.isArray(actor.recursos_mandatos)
            ? actor.recursos_mandatos.slice()
            : [],

        posicion:
          actor.posicion ?? "",

        fuerza:
          actor.fuerza ?? "",

        intensidad:
          actor.intensidad ?? ""
      };

    });

  /*
   * =====================================================
   * INSUMOS PARA EL ANÁLISIS DEL PROBLEMA
   * =====================================================
   */

  estado.problema.insumos = {
    caso: insumoCaso,
    involucrados: insumoInvolucrados
  };

  /*
   * =====================================================
   * PROBLEMA CENTRAL
   * =====================================================
   */



  /*
   * =====================================================
   * PROPUESTAS DE NODOS A PARTIR DE INVOLUCRADOS
   * =====================================================
   *
   * Los problemas percibidos son INSUMOS.
   * No se convierten automáticamente en causas.
   *
   * Por ahora se conservan como propuestas para
   * posterior clasificación y validación.
   */

  const problemasPercibidos = [];

  insumoInvolucrados.forEach(function (actor) {

    actor.problemasPercibidos.forEach(function (problema) {

      const texto =
        String(problema || "").trim();

      if (!texto) {
        return;
      }

      const existe =
        problemasPercibidos.some(function (item) {

          return item.texto.toLowerCase() ===
            texto.toLowerCase();

        });

      if (!existe) {

        problemasPercibidos.push({

          texto: texto,

          grupos: [
            actor.grupo
          ].filter(Boolean)

        });

      } else {

        const existente =
          problemasPercibidos.find(function (item) {

            return item.texto.toLowerCase() ===
              texto.toLowerCase();

          });

        if (
          actor.grupo &&
          !existente.grupos.includes(actor.grupo)
        ) {

          existente.grupos.push(actor.grupo);

        }

      }

    });

  });

  /*
   * Guardamos los problemas percibidos como
   * insumo explícito para la construcción de
   * causas y efectos.
   */

  estado.problema.insumos.problemasPercibidos =
    problemasPercibidos;

  notificarCambio();

}


export function renderProblemContext() {

  const estado = obtenerEstado();
  const caso = estado.caso || {};
  const problema = estado.problema || {};

  const fields = {

    problemCaseName:
      caso.titulo ||
      caso.nombre ||
      "",

    problemTerritory:
      caso.territorio || "",

    problemPopulation:
      problema.poblacion ||
      caso.poblacion ||
      "",

    problemPeriod:
      caso.periodo || "",

    problemSituation:
      caso.situacion || "",

    problemCondition:
      problema.condicion || "",

    problemAttribute:
      problema.atributo || "",

    problemDelimitation:
      problema.delimitacion || ""

  };

  Object.keys(fields).forEach(function (fieldId) {

    const field =
      document.getElementById(fieldId);

    if (!field) {
      return;
    }

    field.value =
      fields[fieldId];

  });

}
