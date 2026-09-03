/**
 * Fuente única de verdad del modelo de datos.
 *
 * `obtenerEstado()` devuelve el objeto vivo, no una copia. Es deliberado:
 * la migración conserva las mutaciones directas del código original
 * (`estado.nodos.push(...)`) y una copia defensiva las descartaría en
 * silencio. Quien muta debe llamar a `notificarCambio()` después.
 * Ver §5.1 de la spec.
 */

const suscriptores = new Set();

export function estadoInicial() {
  return {

    /* =====================================================
      CONTROL DE NAVEGACIÓN
      ===================================================== */
    current: 0,


    /* =====================================================
      CASO
      ===================================================== */
    caso: {
      titulo: "",
      sector: "",
      territorio: "",
      poblacion: "",
      periodo: "",
      situacion: "",
      pregunta: "",
      delimitacion: ""
    },


    /* =====================================================
      PASO 1 · ANÁLISIS DE INVOLUCRADOS
      ===================================================== */
    involucrados: [],
    editingActorIndex: null,


    /* =====================================================
      PASO 2 · ANÁLISIS DEL PROBLEMA
      ===================================================== */
    problema: {
      condicion: "",
      atributo: "",
      poblacion: "",
      delimitacion: "",
      enunciado: ""
    },

    nodos: [],


    /* =====================================================
      PASO 3 · ANÁLISIS DE OBJETIVOS
      ===================================================== */
    objetivos: [],

    acciones: [],

    alternativas: [],

    evaluacion: {
      criterios: [],
      pesos: {},
      valoraciones: {},
      sensibilidad: {}
    },

    seleccion: {
      alternativa: "",
      justificacion: ""
    },


    /* =====================================================
      TRAZABILIDAD
      ===================================================== */
    bitacora: []

  };
}

let estado = estadoInicial();

export function obtenerEstado() {
  return estado;
}

export function notificarCambio() {
  for (const cb of suscriptores) {
    try {
      cb(estado);
    } catch (error) {
      console.error("[estado] un suscriptor falló:", error);
    }
  }
}

/**
 * Reemplaza el estado completo fusionándolo sobre el inicial, de modo que
 * un JSON antiguo al que le falten claves nuevas siga siendo válido.
 */
export function cargarEstado(objeto) {
  if (!objeto || typeof objeto !== "object") {
    throw new TypeError("cargarEstado espera un objeto");
  }
  estado = Object.assign(estadoInicial(), objeto);
  notificarCambio();
}

export function reiniciarEstado() {
  estado = estadoInicial();
  notificarCambio();
}

export function suscribir(callback) {
  suscriptores.add(callback);
  return () => suscriptores.delete(callback);
}
