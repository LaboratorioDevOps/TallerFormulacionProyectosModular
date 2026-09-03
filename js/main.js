import { iniciarRouter, irAPantalla } from "./core/router.js";
import { obtenerEstado } from "./core/estado.js";
import {
  iniciarAutoguardado, restaurarBorrador,
  exportarJSON, importarJSON
} from "./core/almacenamiento.js";

window.addEventListener("DOMContentLoaded", async () => {
  if (restaurarBorrador()) {
    console.info("[main] borrador restaurado desde localStorage.");
  }
  iniciarAutoguardado();

  document.getElementById("btnExportJSON")
    ?.addEventListener("click", exportarJSON);

  const entrada = document.getElementById("inputImportJSON");
  document.getElementById("btnImportJSON")
    ?.addEventListener("click", () => entrada?.click());

  entrada?.addEventListener("change", async (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    try {
      await importarJSON(archivo);
      await irAPantalla(obtenerEstado().current ?? 0);
    } catch (error) {
      console.error("[main] no se pudo importar el JSON:", error);
      window.alert(`No se pudo importar el archivo: ${error.message}`);
    }
    evento.target.value = "";
  });

  try {
    await iniciarRouter();
  } catch (error) {
    console.error("[main] fallo al iniciar la aplicación:", error);
  }
});
