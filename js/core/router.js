import { buscarPaso, PASOS } from "./registro-pasos.js";
import { obtenerEstado, notificarCambio } from "./estado.js";
import { construirNav, marcarActivo, actualizarEncabezado } from "./navegacion.js";
import { porIdObligatorio } from "../utils/dom.js";

const cacheVistas = new Map();
const inicializados = new Set();

async function cargarVista(ruta) {
  if (cacheVistas.has(ruta)) return cacheVistas.get(ruta);

  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${ruta} (HTTP ${respuesta.status})`);
  }
  const html = await respuesta.text();
  cacheVistas.set(ruta, html);
  return html;
}

function mostrarError(contenedor, ruta, error) {
  console.error("[router]", error);
  contenedor.innerHTML = `
    <div class="card">
      <h3>No se pudo cargar la pantalla</h3>
      <p>Archivo: <code>${ruta}</code></p>
      <p>${error.message}</p>
      <p>Esta aplicación carga sus pantallas con <code>fetch</code>, que no
         funciona al abrir el archivo directamente desde el disco. Sírvela por
         HTTP, por ejemplo con <code>python3 -m http.server</code> desde la raíz
         del proyecto.</p>
    </div>`;
}

export async function irAPantalla(id) {
  const paso = buscarPaso(id);
  if (!paso) {
    console.warn(`[router] no existe la pantalla ${id}`);
    return;
  }

  const contenedor = porIdObligatorio("contenidoPantalla");

  try {
    contenedor.innerHTML = await cargarVista(paso.vista);
    // El original marcaba la pantalla activa con display:block vía la clase
    // "active" sobre <section class="screen">. Al inyectar el parcial por
    // fetch, esa clase ya no viene puesta salvo en la pantalla 0 (ver
    // css/layout/wizard.css: .screen{display:none} / .screen.active{display:block}).
    contenedor.querySelector(".screen")?.classList.add("active");
  } catch (error) {
    mostrarError(contenedor, paso.vista, error);
    return;
  }

  obtenerEstado().current = id;
  notificarCambio();

  if (!inicializados.has(id)) {
    paso.init(contenedor);
    inicializados.add(id);
  }
  paso.render();

  marcarActivo();
  actualizarEncabezado();
}

export async function iniciarRouter() {
  construirNav(irAPantalla);
  await irAPantalla(obtenerEstado().current ?? PASOS[0].id);
}
