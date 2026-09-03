/**
 * Único punto donde se enumeran los módulos de paso.
 * Añadir un paso = un import y una entrada en PASOS. Nada más cambia.
 *
 * Cada entrada implementa el contrato ModuloPaso:
 *   { id, titulo, grupo, etiquetaPaso, vista, init(contenedor), render() }
 *
 * De momento todas las entradas usan init/render vacíos (PENDIENTE): las
 * tareas de cada paso irán sustituyendo su entrada por el módulo real.
 */

const PENDIENTE = { init() {}, render() {} };

export const PASOS = [
  {
    id: 0,
    titulo: "Ficha del caso",
    grupo: "Punto de partida",
    etiquetaPaso: null,
    vista: "views/screen00-ficha.html",
    ...PENDIENTE
  },
  {
    id: 1,
    titulo: "Análisis de involucrados",
    grupo: "Análisis situacional",
    etiquetaPaso: "Paso 1",
    vista: "views/screen01-involucrados.html",
    ...PENDIENTE
  },
  {
    id: 2,
    titulo: "Análisis del problema",
    grupo: "Análisis situacional",
    etiquetaPaso: "Paso 2",
    vista: "views/screen02-problema.html",
    ...PENDIENTE
  },
  {
    id: 3,
    titulo: "Análisis de objetivos",
    grupo: "Análisis situacional",
    etiquetaPaso: "Paso 3",
    vista: "views/screen03-objetivos.html",
    ...PENDIENTE
  },
  {
    id: 4,
    titulo: "Selección de la estrategia óptima",
    grupo: "Análisis situacional",
    etiquetaPaso: "Paso 4",
    vista: "views/screen04-estrategia.html",
    ...PENDIENTE
  },
  {
    id: 5,
    titulo: "Estructura Analítica",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 5",
    vista: "views/screen05-estructura-analitica.html",
    ...PENDIENTE
  },
  {
    id: 6,
    titulo: "Resumen narrativo",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 6",
    vista: "views/screen06-resumen-narrativo.html",
    ...PENDIENTE
  },
  {
    id: 7,
    titulo: "Indicadores",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 7",
    vista: "views/screen07-indicadores.html",
    ...PENDIENTE
  },
  {
    id: 8,
    titulo: "Medios de verificación",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 8",
    vista: "views/screen08-medios-verificacion.html",
    ...PENDIENTE
  },
  {
    id: 9,
    titulo: "Supuestos",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 9",
    vista: "views/screen09-supuestos.html",
    ...PENDIENTE
  },
  {
    id: 10,
    titulo: "Previsión de la evaluación intermedia",
    grupo: "Matriz de Marco Lógico",
    etiquetaPaso: "Paso 10",
    vista: "views/screen10-evaluacion-intermedia.html",
    ...PENDIENTE
  }
];

export function buscarPaso(id) {
  return PASOS.find((paso) => paso.id === id);
}
