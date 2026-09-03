/**
 * Gráfico de matriz poder / interés del Paso 1.
 *
 * Cuerpo copiado literalmente de ORIG 8264-8632 (drawInterestPowerChart),
 * incluidas sus funciones anidadas xScale (8292) e yScale (8298), que se
 * quedan anidadas tal cual. Único cambio permitido: state. -> obtenerEstado().
 */

import { svgEl, addSvgText, splitSvgLabel } from "../../utils/svg.js";
import { calculateActorResult, actorPointColor } from "./modelo.js";
import { obtenerEstado } from "../../core/estado.js";

export function drawInterestPowerChart() {

  const svg = document.getElementById(
    "interestPowerChart"
  );

  if (!svg) {
    return;
  }

  svg.innerHTML = "";

  const width = 760;
  const height = 540;

  const plot = {
    left: 72,
    right: 705,
    top: 48,
    bottom: 450
  };

  const plotWidth =
    plot.right - plot.left;

  const plotHeight =
    plot.bottom - plot.top;

  function xScale(value) {
    return plot.left +
      ((Number(value) - 1) / 4) *
      plotWidth;
  }

  function yScale(value) {
    return plot.bottom -
      ((Number(value) - 1) / 4) *
      plotHeight;
  }

  /* Fondo */
  svg.appendChild(
    svgEl("rect", {
      x: plot.left,
      y: plot.top,
      width: plotWidth,
      height: plotHeight,
      fill: "#ffffff",
      stroke: "#d1d5db"
    })
  );

  /* Líneas de cuadrícula */
  for (let value = 1; value <= 5; value++) {

    const x = xScale(value);
    const y = yScale(value);

    svg.appendChild(
      svgEl("line", {
        x1: x,
        y1: plot.top,
        x2: x,
        y2: plot.bottom,
        class: "svg-grid"
      })
    );

    svg.appendChild(
      svgEl("line", {
        x1: plot.left,
        y1: y,
        x2: plot.right,
        y2: y,
        class: "svg-grid"
      })
    );

    addSvgText(
      svg,
      String(value),
      x,
      plot.bottom + 22,
      "svg-tick"
    );

    addSvgText(
      svg,
      String(value),
      plot.left - 22,
      y + 4,
      "svg-tick"
    );
  }

  /* Líneas divisorias de cuadrantes */
  const midX = xScale(3);
  const midY = yScale(3);

  svg.appendChild(
    svgEl("line", {
      x1: midX,
      y1: plot.top,
      x2: midX,
      y2: plot.bottom,
      class: "svg-quadrant-line"
    })
  );

  svg.appendChild(
    svgEl("line", {
      x1: plot.left,
      y1: midY,
      x2: plot.right,
      y2: midY,
      class: "svg-quadrant-line"
    })
  );

  /* Ejes */
  svg.appendChild(
    svgEl("line", {
      x1: plot.left,
      y1: plot.bottom,
      x2: plot.right + 12,
      y2: plot.bottom,
      class: "svg-axis"
    })
  );

  svg.appendChild(
    svgEl("line", {
      x1: plot.left,
      y1: plot.bottom,
      x2: plot.left,
      y2: plot.top - 12,
      class: "svg-axis"
    })
  );

  /* Flechas */
  svg.appendChild(
    svgEl("polygon", {
      points:
        `${plot.right + 12},${plot.bottom} ` +
        `${plot.right + 3},${plot.bottom - 5} ` +
        `${plot.right + 3},${plot.bottom + 5}`,
      fill: "#374151"
    })
  );

  svg.appendChild(
    svgEl("polygon", {
      points:
        `${plot.left},${plot.top - 12} ` +
        `${plot.left - 5},${plot.top - 3} ` +
        `${plot.left + 5},${plot.top - 3}`,
      fill: "#374151"
    })
  );

  /* Títulos de ejes */
  addSvgText(
    svg,
    "INTERÉS / AFECTACIÓN",
    (plot.left + plot.right) / 2,
    500,
    "svg-axis-label"
  );

  const yLabel = addSvgText(
    svg,
    "PODER / INFLUENCIA",
    20,
    (plot.top + plot.bottom) / 2,
    "svg-axis-label"
  );

  yLabel.setAttribute(
    "transform",
    `rotate(-90 20 ${(plot.top + plot.bottom) / 2})`
  );

  /* Cuadrantes */
  addSvgText(
    svg,
    "ALTO PODER · BAJO INTERÉS",
    xScale(2),
    20,
    "svg-quadrant-title"
  );

  addSvgText(
    svg,
    "Mantener satisfecho",
    xScale(2),
    35,
    "svg-quadrant-strategy"
  );

  addSvgText(
    svg,
    "ALTO PODER · ALTO INTERÉS",
    xScale(4),
    20,
    "svg-quadrant-title"
  );

  addSvgText(
    svg,
    "Involucrar estrechamente",
    xScale(4),
    35,
    "svg-quadrant-strategy"
  );

  addSvgText(
    svg,
    "BAJO PODER · BAJO INTERÉS",
    xScale(2),
    425,
    "svg-quadrant-title"
  );

  addSvgText(
    svg,
    "Monitorear",
    xScale(2),
    440,
    "svg-quadrant-strategy"
  );

  addSvgText(
    svg,
    "BAJO PODER · ALTO INTERÉS",
    xScale(4),
    425,
    "svg-quadrant-title"
  );

  addSvgText(
    svg,
    "Involucrar y empoderar",
    xScale(4),
    440,
    "svg-quadrant-strategy"
  );

  if (!obtenerEstado().involucrados.length) {

    addSvgText(
      svg,
      "Registre involucrados para visualizar la matriz",
      width / 2,
      260,
      "svg-empty-text"
    );

    return;
  }

  /*
   * Agrupamos posiciones coincidentes.
   * Esto permite alternar las etiquetas arriba/abajo.
   */
  const occupied = {};

  obtenerEstado().involucrados.forEach((actor, index) => {

    const x = xScale(actor.intensidad);
    const y = yScale(actor.fuerza);

    const key =
      `${actor.intensidad}-${actor.fuerza}`;

    if (!occupied[key]) {
      occupied[key] = 0;
    }

    const duplicateIndex =
      occupied[key]++;

    const result =
      calculateActorResult(actor);

    /*
     * El tamaño depende de |resultante|.
     * Se mantiene dentro de un rango legible.
     */
    const radius =
      8 + Math.min(
        20,
        Math.sqrt(Math.abs(result)) * 1.8
      );

    const point = svgEl("circle", {
      cx: x,
      cy: y,
      r: radius,
      fill: actorPointColor(actor.posicion),
      "fill-opacity": "0.82",
      stroke: "#ffffff",
      "stroke-width": "2"
    });

    svg.appendChild(point);

    /*
     * Etiquetas alternadas arriba / abajo.
     * En caso de coincidencia, cada etiqueta recibe
     * una separación adicional.
     */
    const labelAbove =
      duplicateIndex % 2 === 0;

    const verticalOffset =
      labelAbove
        ? -(radius + 14 + Math.floor(duplicateIndex / 2) * 18)
        : (radius + 16 + Math.floor(duplicateIndex / 2) * 18);

    const lines =
      splitSvgLabel(actor.grupo, 18);

    lines.forEach((line, lineIndex) => {

      const labelY =
        y +
        verticalOffset +
        lineIndex * 12;

      addSvgText(
        svg,
        line,
        x,
        labelY,
        "svg-stakeholder-label"
      );
    });
  });

  /* Leyenda de posición */
  const legendY = 525;

  [
    { position: "1", label: "Apoya (+1)" },
    { position: "0", label: "Indiferente (0)" },
    { position: "-1", label: "Se opone (−1)" }
  ].forEach((item, index) => {

    const x = 95 + index * 170;

    svg.appendChild(
      svgEl("circle", {
        cx: x,
        cy: legendY - 4,
        r: 7,
        fill: actorPointColor(item.position)
      })
    );

    addSvgText(
      svg,
      item.label,
      x + 12,
      legendY,
      "svg-legend-text"
    );
  });
}
