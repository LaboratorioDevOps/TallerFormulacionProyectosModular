/**
 * Copia al portapapeles con respaldo para navegadores sin navigator.clipboard.
 *
 * Unifica cuatro funciones del original que hacían lo mismo con variantes
 * de UI: copyAIPrompt (ORIG 9394-9454), copyProblemPrompt (11749-11798) y
 * fallbackCopyProblemPrompt (11801-11823). El texto de confirmación exacto
 * ("Copiado") y el tiempo de reset (1500ms) se tomaron de copyAIPrompt, que
 * es la única de las tres que da realimentación en el propio botón —
 * copyProblemPrompt/fallbackCopyProblemPrompt usan alert() en su lugar.
 *
 * writeProblemPrompt (ORIG 11825-11893) NO se incluyó aquí: no copia nada,
 * escribe el prompt en el textarea y empuja un registro a state.bitacora.
 * Es lógica con estado y pertenece a un módulo de pasos, no a esta
 * utilidad sin estado (utils/ no puede importar de core/).
 */

/* Basado en el fallback de copyAIPrompt (ORIG 9418-9430): textarea oculto,
   foco, selección y document.execCommand("copy"). */
function copiarConRespaldo(texto) {
  const helper = document.createElement("textarea");
  helper.value = texto;
  helper.style.position = "fixed";
  helper.style.opacity = "0";

  document.body.appendChild(helper);

  helper.focus();
  helper.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    document.body.removeChild(helper);
  }
  return ok;
}

export async function copiarTexto(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (error) {
    console.warn("[portapapeles] navigator.clipboard falló, usando respaldo:", error);
  }
  return copiarConRespaldo(texto);
}

/**
 * Copia el contenido de un textarea/elemento y da realimentación en el
 * botón. Reemplaza a copyAIPrompt y copyProblemPrompt del artefacto
 * original. Texto de confirmación ("Copiado") y duración (1500ms) tomados
 * literalmente de copyAIPrompt (ORIG 9412-9414 y 9418).
 */
export async function copiarDesdeElemento(elementId, boton) {
  const origen = document.getElementById(elementId);
  if (!origen) {
    console.warn(`[portapapeles] no existe #${elementId}`);
    return;
  }
  const texto = "value" in origen ? origen.value : origen.textContent;
  const ok = await copiarTexto(texto);
  if (!boton) return;
  const original = boton.textContent;
  if (ok) {
    boton.textContent = "Copiado";
  }
  setTimeout(() => {
    boton.textContent = original;
  }, 1500);
}
