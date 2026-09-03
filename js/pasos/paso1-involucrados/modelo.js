/**
 * Paso 1 · Análisis de involucrados — modelo.
 *
 * Funciones puras de lectura de formulario y de cálculo/clasificación
 * de actores. Ninguna de ellas lee ni muta `state`, por lo que no
 * requieren importar `obtenerEstado`.
 */

/* Cuerpo copiado literalmente de ORIG 7768-7770 (actorValue). */
export function actorValue(id) {
  return document.getElementById(id).value.trim();
}

/* Cuerpo copiado literalmente de ORIG 7790-7800 (actorPositionLabel). */
export function actorPositionLabel(position) {
  if (position === "1") {
    return '<span class="position-positive">+1 · A favor</span>';
  }

  if (position === "-1") {
    return '<span class="position-negative">−1 · En contra</span>';
  }

  return '<span class="position-neutral">0 · Neutral</span>';
}

/* Cuerpo copiado literalmente de ORIG 7802-7806 (actorPositionClass). */
export function actorPositionClass(position) {
  if (position === "1") return "position-positive";
  if (position === "-1") return "position-negative";
  return "position-neutral";
}

/* Cuerpo copiado literalmente de ORIG 7808-7828 (actorQuadrant). */
export function actorQuadrant(actor) {
  const force = Number(actor.fuerza);
  const intensity = Number(actor.intensidad);

  const highPower = force >= 4;
  const highInterest = intensity >= 4;

  if (highPower && highInterest) {
    return "Alto poder · Alto interés";
  }

  if (highPower && !highInterest) {
    return "Alto poder · Bajo interés";
  }

  if (!highPower && highInterest) {
    return "Bajo poder · Alto interés";
  }

  return "Bajo poder · Bajo interés";
}

/*
 * La resultante NO se almacena.
 * Se calcula cada vez que se requiere.
 */
/* Cuerpo copiado literalmente de ORIG 7834-7838 (calculateActorResult). */
export function calculateActorResult(actor) {
  return Number(actor.fuerza || 0)
    * Number(actor.intensidad || 0)
    * Number(actor.posicion || 0);
}

/* Cuerpo copiado literalmente de ORIG 7840-7856 (actorIsComplete). */
export function actorIsComplete(actor) {
  return Boolean(
    actor.grupo &&
    actor.naturaleza &&
    actor.relacion &&
    actor.rol &&
    actor.intereses &&
    actor.problemas_percibidos &&
    actor.problemas_percibidos.length &&
    actor.recursos_mandatos &&
    actor.posicion !== "" &&
    actor.fuerza &&
    actor.intensidad &&
    actor.razon &&
    actor.estrategia
  );
}

/* Cuerpo copiado literalmente de ORIG 8638-8653 (natureColor). */
export function natureColor(nature) {

  const colors = {
    "Comunitaria": "#22c55e",
    "Institucional": "#16a34a",
    "Productiva": "#84cc16",
    "Educativa": "#3b82f6",
    "Social": "#8b5cf6",
    "Privada": "#f59e0b",
    "Financiera": "#ef4444",
    "Gremial": "#14b8a6",
    "Otra": "#9ca3af"
  };

  return colors[nature] || colors["Otra"];
}

/* Cuerpo copiado literalmente de ORIG 8252-8262 (actorPointColor). */
export function actorPointColor(position) {
  if (position === "1") {
    return "#16a34a";
  }

  if (position === "-1") {
    return "#dc2626";
  }

  return "#c58a16";
}
