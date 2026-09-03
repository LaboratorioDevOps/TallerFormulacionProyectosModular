/** Utilidades de DOM. Sin estado: no importan nada de core/. */

/* Cuerpo copiado literalmente de ORIG 7779-7786 (escapeHTML). */
export function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Devuelve el elemento o null, avisando en consola si no existe. */
export function porId(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[dom] no existe el elemento #${id}`);
  return el;
}

/** Igual que porId, pero lanza. Para elementos sin los que el módulo no puede operar. */
export function porIdObligatorio(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[dom] falta el elemento obligatorio #${id}`);
  return el;
}

export function todos(selector, raiz = document) {
  return Array.from(raiz.querySelectorAll(selector));
}
