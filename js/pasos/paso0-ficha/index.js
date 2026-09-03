import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { actualizarEncabezado } from "../../core/navegacion.js";
import { irAPantalla } from "../../core/router.js";

/** id del input en el DOM → clave en estado.caso */
const CAMPOS = {
  casoTitulo: "titulo",
  casoSector: "sector",
  casoTerritorio: "territorio",
  casoPoblacion: "poblacion",
  casoPeriodo: "periodo",
  casoSituacion: "situacion",
  casoPregunta: "pregunta",
  casoDelimitacion: "delimitacion"
};

let raiz = null;

export default {
  id: 0,
  titulo: "Ficha del caso",
  grupo: "Punto de partida",
  etiquetaPaso: null,
  vista: "views/screen00-ficha.html",

  init(contenedor) {
    raiz = contenedor;

    raiz.addEventListener("input", (evento) => {
      const clave = CAMPOS[evento.target.id];
      if (!clave) return;
      obtenerEstado().caso[clave] = evento.target.value;
      notificarCambio();
      if (clave === "titulo") actualizarEncabezado();
    });

    raiz.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-accion='iniciar-wizard']");
      if (boton) irAPantalla(1);
    });
  },

  render() {
    const caso = obtenerEstado().caso;
    for (const [id, clave] of Object.entries(CAMPOS)) {
      const campo = raiz.querySelector(`#${id}`);
      if (campo) campo.value = caso[clave] || "";
    }
  }
};
