/**
 * Persistencia en localStorage: autoguardado de borrador y exportación
 * / importación manual del estado como JSON.
 *
 * El autoguardado nunca debe impedir el uso de la aplicación: si
 * localStorage no está disponible (incógnito, cuota agotada, cookies
 * bloqueadas), se avisa una vez por consola y la app sigue funcionando
 * sin persistencia.
 */

import { obtenerEstado, cargarEstado, suscribir } from "./estado.js";

const CLAVE = "artefacto-mml:borrador";
const RETARDO_MS = 500;

let temporizador = null;
let avisado = false;

function disponible() {
  try {
    const prueba = "__mml_test__";
    window.localStorage.setItem(prueba, "1");
    window.localStorage.removeItem(prueba);
    return true;
  } catch {
    return false;
  }
}

function avisarUnaVez(mensaje) {
  if (avisado) return;
  avisado = true;
  console.warn(`[almacenamiento] ${mensaje}`);
}

export function iniciarAutoguardado() {
  if (!disponible()) {
    avisarUnaVez("localStorage no disponible: se trabaja sin autoguardado.");
    return;
  }
  suscribir(() => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      try {
        window.localStorage.setItem(CLAVE, JSON.stringify(obtenerEstado()));
      } catch (error) {
        avisarUnaVez(`no se pudo guardar (¿cuota agotada?): ${error.message}`);
      }
    }, RETARDO_MS);
  });
}

/** Devuelve true si había borrador y se restauró. */
export function restaurarBorrador() {
  if (!disponible()) return false;
  let bruto;
  try {
    bruto = window.localStorage.getItem(CLAVE);
  } catch {
    return false;
  }
  if (!bruto) return false;

  try {
    cargarEstado(JSON.parse(bruto));
    return true;
  } catch (error) {
    console.error("[almacenamiento] borrador corrupto, se descarta:", error);
    descartarBorrador();
    return false;
  }
}

export function descartarBorrador() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch { /* nada que hacer */ }
}

export function exportarJSON() {
  const json = JSON.stringify(obtenerEstado(), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "artefacto-mml.json";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export async function importarJSON(archivo) {
  const texto = await archivo.text();
  cargarEstado(JSON.parse(texto));
}
