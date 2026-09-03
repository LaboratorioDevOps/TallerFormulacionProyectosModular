/**
 * Utilidades SVG. Sin estado: no importan nada de core/.
 *
 * Los parámetros se renombraron al español para cumplir la interfaz
 * contractual de la tarea (nombre/atributos, padre/x/y/texto/clase);
 * la lógica de cada cuerpo es la copia literal de ORIG.
 */

import { escapeHTML } from "./dom.js";

/* Cuerpo copiado literalmente de ORIG 8226-8237 (parámetros: tag→nombre, attributes→atributos). */
export function svgEl(nombre, atributos = {}) {
  const el = document.createElementNS(
    "http://www.w3.org/2000/svg",
    nombre
  );

  Object.entries(atributos).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });

  return el;
}

/* Copiada literalmente de ORIG 8239-8250, firma incluida. El orden de los
   parámetros NO se toca: todas las llamadas de los tres generadores SVG se
   migran literales desde el original y pasan (svg, text, x, y). */
export function addSvgText(svg, text, x, y, className = "") {
  const node = svgEl("text", {
    x,
    y,
    class: className
  });

  node.textContent = text;
  svg.appendChild(node);

  return node;
}

/* Cuerpo copiado literalmente de ORIG 10439-10445. Extraída de dentro de
   renderProblemTree al nivel superior del módulo, sin editar su cuerpo. */
export function svgText(text) {

  return escapeHTML(
    String(text || "")
  );

}

/* Cuerpo copiado literalmente de ORIG 8850-8879 (parámetros: text→texto, maxChars→max). */
export function splitSvgLabel(texto, max) {

  const words =
    String(texto || "").split(/\s+/);

  const lines = [];
  let current = "";

  words.forEach(word => {

    if (
      current &&
      (current + " " + word).length > max
    ) {
      lines.push(current);
      current = word;
    } else {
      current =
        current
          ? current + " " + word
          : word;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 3);
}
