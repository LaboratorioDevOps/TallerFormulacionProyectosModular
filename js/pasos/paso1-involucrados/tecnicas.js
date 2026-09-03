/**
 * Paso 1 · Análisis de involucrados — técnicas de participación.
 *
 * Defecto 4: en ORIG `renderTechniqueHelp` estaba duplicada byte a byte
 * (9253-9319 y 9322-9388, la segunda pisaba a la primera). Aquí existe
 * una sola vez.
 */

import { escapeHTML } from "../../utils/dom.js";

/* Datos copiados literalmente de ORIG 9186-9251 (participationTechniques). */
const participationTechniques = {

  grupos_nominales: {
    nombre: "Grupos nominales",

    procedimiento:
      "Generación silenciosa inicial de ideas, puesta en común estructurada y priorización colectiva.",

    participantes:
      "6 a 12 participantes, presenciales.",

    duracion:
      "2 a 3 horas.",

    evitar:
      "Evitar cuando existen conflictos abiertos y una diferencia de poder muy marcada en la sala."
  },

  delphi: {
    nombre: "Delphi",

    procedimiento:
      "Consulta anónima e iterativa a un panel mediante varias rondas, buscando convergencia informada entre las respuestas.",

    participantes:
      "10 a 30 panelistas, normalmente remotos.",

    duracion:
      "3 a 8 semanas, con 2 a 4 rondas.",

    evitar:
      "Evitar cuando se requiere deliberación cara a cara o legitimidad pública directa."
  },

  easw: {
    nombre: "EASW",

    procedimiento:
      "Taller de escenarios que reúne sectores de actores para construir una visión compartida y formular propuestas.",

    participantes:
      "25 a 40 participantes, organizados en cuatro grupos sectoriales.",

    duracion:
      "1 a 2 jornadas completas.",

    evitar:
      "Evitar cuando no existen recursos ni compromiso institucional para dar seguimiento a los acuerdos."
  },

  nucleos_intervencion: {
    nombre: "Núcleos de intervención participativa",

    procedimiento:
      "Técnica participativa contemplada dentro de la Actividad 4. El diseño concreto del núcleo debe definirse según el propósito, los involucrados y el contexto de intervención.",

    participantes:
      "Debe definirse según el diseño de la intervención y los involucrados convocados.",

    duracion:
      "Debe definirse según el alcance y diseño de la actividad.",

    evitar:
      "No existe en los materiales del curso consultados un parámetro específico de participantes o duración que permita establecer una regla fija. Defina la limitación para el caso antes de seleccionarla."
  }
};

/* Cuerpo copiado literalmente de ORIG 9253-9319 (renderTechniqueHelp).
 * Se descarta la copia duplicada de ORIG 9322-9388: era byte a byte
 * idéntica (defecto 4).
 */
export function renderTechniqueHelp() {

  const select =
    document.getElementById(
      "participationTechnique"
    );

  const container =
    document.getElementById(
      "techniqueHelp"
    );

  if (!select || !container) {
    return;
  }

  const key =
    select.value;

  if (!key) {

    container.innerHTML = `
      <h4>Ayuda contextual</h4>
      <p style="font-size:12px;color:var(--gris-500);">
        Seleccione una técnica para consultar su procedimiento,
        participantes, duración y cuándo evitarla.
      </p>
    `;

    return;
  }

  const technique =
    participationTechniques[key];

  container.innerHTML = `
    <h4>${escapeHTML(technique.nombre)}</h4>

    <div class="technique-meta">

      <div class="technique-meta-item">
        <strong>Participantes</strong>
        <span>${escapeHTML(technique.participantes)}</span>
      </div>

      <div class="technique-meta-item">
        <strong>Duración</strong>
        <span>${escapeHTML(technique.duracion)}</span>
      </div>

    </div>

    <div class="technique-section">
      <strong>Procedimiento</strong>
      <p>${escapeHTML(technique.procedimiento)}</p>
    </div>

    <div class="technique-section">
      <strong>Cuándo evitarla</strong>
      <p>${escapeHTML(technique.evitar)}</p>
    </div>

    <div class="participation-note">
      La información contextual orienta la decisión; no la toma por usted.
    </div>
  `;
}
