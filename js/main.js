import { iniciarRouter } from "./core/router.js";

window.addEventListener("DOMContentLoaded", () => {
  iniciarRouter().catch((error) => {
    console.error("[main] fallo al iniciar la aplicación:", error);
  });
});
