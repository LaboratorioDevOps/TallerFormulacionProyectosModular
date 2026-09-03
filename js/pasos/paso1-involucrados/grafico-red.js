/**
 * Gráfico de red de actores del Paso 1.
 *
 * Cuerpo copiado literalmente de ORIG 8655-8848 (drawStakeholderNetwork).
 * Único cambio permitido: state. -> obtenerEstado().
 */

import { svgEl, addSvgText, splitSvgLabel } from "../../utils/svg.js";
import { calculateActorResult, natureColor } from "./modelo.js";
import { obtenerEstado } from "../../core/estado.js";

export function drawStakeholderNetwork() {

  const svg = document.getElementById(
    "stakeholderNetworkChart"
  );

  if (!svg) {
    return;
  }

  svg.innerHTML = "";

  const width = 760;
  const height = 540;

  const center = {
    x: 290,
    y: 275
  };

  const radius = 175;

  /* Círculo guía */
  svg.appendChild(
    svgEl("circle", {
      cx: center.x,
      cy: center.y,
      r: radius,
      fill: "none",
      stroke: "#d1d5db",
      "stroke-width": "1",
      "stroke-dasharray": "4 5"
    })
  );

  /* Nodo central */
  svg.appendChild(
    svgEl("circle", {
      cx: center.x,
      cy: center.y,
      r: 58,
      class: "svg-project-node"
    })
  );

  addSvgText(
    svg,
    "PROYECTO",
    center.x,
    center.y,
    "svg-project-label"
  );

  if (!obtenerEstado().involucrados.length) {

    addSvgText(
      svg,
      "Registre involucrados para visualizar el diagrama",
      center.x,
      center.y + 100,
      "svg-empty-text"
    );

    return;
  }

  /*
   * Los involucrados se distribuyen alrededor del proyecto
   * en círculo.
   */
  const total =
    obtenerEstado().involucrados.length;

  obtenerEstado().involucrados.forEach((actor, index) => {

    const angle =
      (-Math.PI / 2) +
      (index / total) * Math.PI * 2;

    const x =
      center.x +
      Math.cos(angle) * radius;

    const y =
      center.y +
      Math.sin(angle) * radius;

    /*
     * Tamaño del nodo según relevancia.
     * La relevancia vuelve a calcularse desde
     * la resultante; no se almacena.
     */
    const result =
      calculateActorResult(actor);

    const nodeRadius =
      28 +
      Math.min(
        12,
        Math.sqrt(Math.abs(result)) * 1.1
      );

    /* Línea al proyecto */
    svg.appendChild(
      svgEl("line", {
        x1: center.x,
        y1: center.y,
        x2: x,
        y2: y,
        class: "svg-network-line"
      })
    );

    /* Nodo */
    svg.appendChild(
      svgEl("circle", {
        cx: x,
        cy: y,
        r: nodeRadius,
        fill: natureColor(actor.naturaleza),
        "fill-opacity": "0.78",
        stroke: natureColor(actor.naturaleza),
        "stroke-width": "1.5"
      })
    );

    /* Etiqueta */
    const lines =
      splitSvgLabel(actor.grupo, 16);

    const firstY =
      y -
      ((lines.length - 1) * 6);

    lines.forEach((line, lineIndex) => {

      addSvgText(
        svg,
        line,
        x,
        firstY + lineIndex * 12,
        "svg-stakeholder-label"
      );
    });
  });

  /* Leyenda por naturaleza */
  const legendX = 535;
  const legendY = 100;

  addSvgText(
    svg,
    "LEYENDA · NATURALEZA",
    legendX,
    legendY - 24,
    "svg-axis-label"
  );

  const natureList = [
    "Comunitaria",
    "Institucional",
    "Productiva",
    "Educativa",
    "Social",
    "Privada",
    "Financiera",
    "Gremial",
    "Otra"
  ];

  natureList.forEach((nature, index) => {

    const y =
      legendY +
      index * 34;

    svg.appendChild(
      svgEl("circle", {
        cx: legendX,
        cy: y,
        r: 8,
        fill: natureColor(nature)
      })
    );

    addSvgText(
      svg,
      nature,
      legendX + 17,
      y + 4,
      "svg-legend-text"
    );
  });
}
