/**
 * Paso 2 · Árbol jerárquico de problemas (SVG generado a mano).
 *
 * Migración literal de ORIG 10286-10968. No se ha tocado ninguna constante
 * de posicionamiento, margen, radio ni color. Las cinco funciones anidadas
 * (`groupByLevel`, `hierarchyColor`, `distribute`, `drawConnector`,
 * `drawNode`) se quedan anidadas tal cual estaban en el original.
 */

import { svgText } from "../../utils/svg.js";
import { obtenerEstado } from "../../core/estado.js";

    export function renderProblemTree() {

      const container =
        document.getElementById("problemTreeWorkspace");

      if (!container) {
        return;
      }

      const nodes =
        Array.isArray(obtenerEstado().nodos)
          ? obtenerEstado().nodos
          : [];

      /* ---------------------------------------------------------
         PROBLEMA CENTRAL
         Se toma del nodo P, que es la fuente estructural
         del árbol.
         --------------------------------------------------------- */

      const root =
        nodes.find(function (node) {
          return node && node.codigo === "P";
        });

      const problemText =
        root?.enunciado ||
        obtenerEstado().problema?.enunciado ||
        "Problema central pendiente";


      /* ---------------------------------------------------------
         SEPARACIÓN DE NODOS
         --------------------------------------------------------- */

      const effects =
        nodes.filter(function (node) {
          return node &&
            node.tipo === "efecto";
        });

      const causes =
        nodes.filter(function (node) {
          return node &&
            node.tipo === "causa";
        });


      /* ---------------------------------------------------------
         ORGANIZAR POR NIVEL
         --------------------------------------------------------- */

      function groupByLevel(list) {

        const groups = {};

        list.forEach(function (node) {

          const level =
            Number(node.nivel || 1);

          if (!groups[level]) {
            groups[level] = [];
          }

          groups[level].push(node);

        });

        Object.keys(groups).forEach(function (level) {

          groups[level].sort(function (a, b) {

            return String(a.codigo)
              .localeCompare(
                String(b.codigo),
                undefined,
                { numeric: true }
              );

          });

        });

        return groups;
      }


      const effectLevels =
        groupByLevel(effects);

      const causeLevels =
        groupByLevel(causes);


      /* ---------------------------------------------------------
         NIVELES EXISTENTES
         --------------------------------------------------------- */

      const effectLevelNumbers =
        Object.keys(effectLevels)
          .map(Number)
          .sort(function (a, b) {
            return b - a;
          });

      const causeLevelNumbers =
        Object.keys(causeLevels)
          .map(Number)
          .sort(function (a, b) {
            return a - b;
          });


      /* ---------------------------------------------------------
         COLOR POR JERARQUÍA
         --------------------------------------------------------- */

      const effectColors = [
        "#315d82",
        "#557d9e",
        "#7698b2",
        "#98b1c3"
      ];

      const causeColors = [
        "#9a6735",
        "#b7834e",
        "#c89b70",
        "#d9b897"
      ];


      function hierarchyColor(type, level) {

        const palette =
          type === "causa"
            ? causeColors
            : effectColors;

        return palette[
          Math.min(
            Math.max(Number(level) - 1, 0),
            palette.length - 1
          )
        ];
      }


      /* ---------------------------------------------------------
         CONFIGURACIÓN DEL LIENZO
         --------------------------------------------------------- */

      const width = 1180;

      const nodeWidth = 210;
      const nodeHeight = 82;

      const horizontalGap = 28;
      const verticalGap = 72;

      const allLevels =
        Math.max(
          effectLevelNumbers.length,
          causeLevelNumbers.length,
          1
        );

      const height =
        Math.max(
          620,
          190 +
          allLevels * (nodeHeight + verticalGap)
        );


      /* ---------------------------------------------------------
         POSICIONES
         --------------------------------------------------------- */

      const positions = new Map();


      function distribute(nodesList, y) {

        if (!nodesList.length) {
          return;
        }

        const totalWidth =
          nodesList.length * nodeWidth +
          Math.max(0, nodesList.length - 1) *
          horizontalGap;

        let startX =
          (width - totalWidth) / 2;

        nodesList.forEach(function (node, index) {

          positions.set(
            node.codigo,
            {
              x: startX +
                index *
                (nodeWidth + horizontalGap),

              y: y
            }
          );

        });

      }


      /* ---------------------------------------------------------
         EFECTOS
         Los niveles superiores van arriba.
         --------------------------------------------------------- */

      let currentY = 35;

      effectLevelNumbers.forEach(function (level) {

        distribute(
          effectLevels[level],
          currentY
        );

        currentY +=
          nodeHeight +
          verticalGap;

      });


      /* ---------------------------------------------------------
         PROBLEMA CENTRAL
         --------------------------------------------------------- */

      const problemY =
        currentY + 5;

      positions.set(
        "P",
        {
          x: (width - 390) / 2,
          y: problemY
        }
      );


      /* ---------------------------------------------------------
         CAUSAS
         --------------------------------------------------------- */

      currentY =
        problemY +
        125;

      causeLevelNumbers.forEach(function (level) {

        distribute(
          causeLevels[level],
          currentY
        );

        currentY +=
          nodeHeight +
          verticalGap;

      });


      /* ---------------------------------------------------------
         SVG
         --------------------------------------------------------- */

      let svg = `
    <svg
      class="problem-tree-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Árbol jerárquico de problemas">

      <defs>

        <filter
          id="problemTreeShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%">

          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            flood-opacity=".10"/>

        </filter>

      </defs>

      <!-- TÍTULO EFECTOS -->

      <text
        x="${width / 2}"
        y="18"
        text-anchor="middle"
        class="problem-tree-label">

        EFECTOS

      </text>
  `;


      /* ---------------------------------------------------------
         CONECTORES
         --------------------------------------------------------- */

      function drawConnector(child, parent) {

        const childPos =
          positions.get(child.codigo);

        const parentPos =
          positions.get(parent.codigo);

        if (!childPos || !parentPos) {
          return;
        }

        const childCenter =
          childPos.x +
          nodeWidth / 2;

        const parentCenter =
          parentPos.x +
          nodeWidth / 2;

        /*
         * Para efectos:
         * hijo arriba → padre abajo.
         *
         * Para causas:
         * padre arriba → hijo abajo.
         */

        const isEffect =
          child.tipo === "efecto";

        const startY =
          isEffect
            ? childPos.y + nodeHeight
            : parentPos.y + nodeHeight;

        const endY =
          isEffect
            ? parentPos.y
            : childPos.y;

        const middleY =
          (startY + endY) / 2;

        return `
      <path
        d="
          M ${isEffect ? childCenter : parentCenter}
            ${startY}

          C ${isEffect ? childCenter : parentCenter}
            ${middleY},

            ${isEffect ? parentCenter : childCenter}
            ${middleY},

            ${isEffect ? parentCenter : childCenter}
            ${endY}
        "
        class="problem-tree-connector"
      />
    `;
      }


      /* Conectores de efectos */

      effects.forEach(function (node) {

        const parent =
          nodes.find(function (candidate) {

            return candidate &&
              candidate.codigo === node.padre;

          });

        if (parent) {
          svg += drawConnector(node, parent);
        }

      });


      /* Conectores de causas */

      causes.forEach(function (node) {

        const parent =
          nodes.find(function (candidate) {

            return candidate &&
              candidate.codigo === node.padre;

          });

        if (parent) {
          svg += drawConnector(node, parent);
        }

      });


      /* ---------------------------------------------------------
         NODO CENTRAL
         --------------------------------------------------------- */

      const rootPosition =
        positions.get("P");

      svg += `

    <g filter="url(#problemTreeShadow)">

      <rect
        x="${rootPosition.x}"
        y="${rootPosition.y}"
        width="390"
        height="82"
        rx="10"
        class="problem-tree-central"/>

      <text
        x="${width / 2}"
        y="${rootPosition.y + 23}"
        text-anchor="middle"
        class="problem-tree-central-title">

        PROBLEMA CENTRAL

      </text>

      <foreignObject
        x="${rootPosition.x + 12}"
        y="${rootPosition.y + 31}"
        width="366"
        height="45">

        <div class="problem-tree-central-text">

          ${svgText(problemText)}

        </div>

      </foreignObject>

    </g>

  `;


      /* ---------------------------------------------------------
         NODOS
         --------------------------------------------------------- */

      function drawNode(node) {

        const position =
          positions.get(node.codigo);

        if (!position) {
          return "";
        }

        const color =
          hierarchyColor(
            node.tipo,
            node.nivel
          );

        const label =
          node.tipo === "causa"
            ? "CAUSA"
            : "EFECTO";

        const parentText =
          node.padre
            ? "Padre " + node.padre
            : "";


        return `

      <g
        class="problem-tree-node"
        filter="url(#problemTreeShadow)">

        <rect
          x="${position.x}"
          y="${position.y}"
          width="${nodeWidth}"
          height="${nodeHeight}"
          rx="9"
          fill="#ffffff"
          stroke="${color}"
          stroke-width="2"/>

        <rect
          x="${position.x}"
          y="${position.y}"
          width="5"
          height="${nodeHeight}"
          rx="3"
          fill="${color}"/>

        <text
          x="${position.x + 15}"
          y="${position.y + 19}"
          class="problem-tree-code">

          ${svgText(node.codigo)}

        </text>

        <text
          x="${position.x + nodeWidth - 12}"
          y="${position.y + 19}"
          text-anchor="end"
          class="problem-tree-type"
          fill="${color}">

          ${label}

        </text>

        <foreignObject
          x="${position.x + 14}"
          y="${position.y + 27}"
          width="${nodeWidth - 28}"
          height="39">

          <div class="problem-tree-node-text">

            ${svgText(node.enunciado)}

          </div>

        </foreignObject>

        <text
          x="${position.x + 14}"
          y="${position.y + 76}"
          class="problem-tree-meta">

          Nivel ${svgText(node.nivel)}
          ${parentText ? " · " + svgText(parentText) : ""}

        </text>

      </g>

    `;

      }


      effects.forEach(function (node) {
        svg += drawNode(node);
      });

      causes.forEach(function (node) {
        svg += drawNode(node);
      });


      /* ---------------------------------------------------------
         ETIQUETA CAUSAS
         --------------------------------------------------------- */

      const causesLabelY =
        problemY + 112;

      svg += `

    <text
      x="${width / 2}"
      y="${causesLabelY}"
      text-anchor="middle"
      class="problem-tree-label">

      CAUSAS

    </text>

  `;


      svg += `</svg>`;


      container.innerHTML = `

    <div class="problem-tree-header">

      <div>

        <strong>Árbol jerárquico de problemas</strong>

        <span>
          ${nodes.filter(n => n.codigo !== "P").length}
          nodos · relaciones padre-hijo explícitas
        </span>

      </div>

      <div class="problem-tree-legend">

        <span>
          <i class="tree-level-dot effect-level-1"></i>
          Efectos
        </span>

        <span>
          <i class="tree-level-dot cause-level-1"></i>
          Causas
        </span>

        <span>
          <i class="tree-level-dot central-level"></i>
          Problema
        </span>

      </div>

    </div>

    <div class="problem-tree-canvas">

      ${svg}

    </div>

    <div class="problem-tree-reading">

      <strong>Lectura metodológica</strong>

      <span>
        Los efectos se leen hacia arriba como consecuencias;
        las causas se leen hacia abajo preguntando
        «¿por qué ocurre?». Cada relación se determina mediante
        el campo <b>padre</b>, no únicamente por el nivel.
      </span>

    </div>

  `;

    }
