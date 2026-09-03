import { PASOS } from "./registro-pasos.js";
import { obtenerEstado } from "./estado.js";
import { porId, escapeHTML } from "../utils/dom.js";

export function construirNav(alNavegar) {
  const contenedor = porId("navigation");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  let grupoActual = null;
  let seccion = null;

  for (const paso of PASOS) {
    if (paso.grupo !== grupoActual) {
      grupoActual = paso.grupo;
      seccion = document.createElement("div");
      seccion.className = "nav-section";
      const titulo = document.createElement("div");
      titulo.className = "nav-section-title";
      titulo.textContent = paso.grupo;
      seccion.appendChild(titulo);
      contenedor.appendChild(seccion);
    }

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "nav-item";
    boton.dataset.pantalla = String(paso.id);
    boton.innerHTML =
      `<span class="nav-num">${paso.id}</span>` +
      `<span class="nav-label">${escapeHTML(paso.titulo)}</span>`;
    boton.addEventListener("click", () => alNavegar(paso.id));
    seccion.appendChild(boton);
  }

  marcarActivo();
}

export function marcarActivo() {
  const actual = obtenerEstado().current;
  for (const boton of document.querySelectorAll(".nav-item")) {
    boton.classList.toggle("active", Number(boton.dataset.pantalla) === actual);
  }
}

export function actualizarEncabezado() {
  const estado = obtenerEstado();
  const paso = PASOS.find((p) => p.id === estado.current);

  const titulo = porId("headerProjectTitle");
  if (titulo) titulo.textContent = estado.caso.titulo || "Proyecto sin título";

  const etiqueta = porId("headerStep");
  if (etiqueta) etiqueta.textContent = paso?.etiquetaPaso || "Punto de partida";

  const nombre = porId("headerStepName");
  if (nombre) nombre.textContent = paso?.titulo || "";
}
