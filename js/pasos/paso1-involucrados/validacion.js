/**
 * Paso 1 · Análisis de involucrados — validación.
 *
 * `validateActor`, `actorValidationMessages` y `renderActorValidations`
 * copiadas literalmente de ORIG 7908-7947, 8918-9132 y 9134-9180.
 */

import { obtenerEstado } from "../../core/estado.js";
import { escapeHTML } from "../../utils/dom.js";
import {
  normalizeTextForValidation,
  containsAny
} from "../../utils/texto.js";

/* Cuerpo copiado literalmente de ORIG 7908-7947 (validateActor). */
export function validateActor(actor) {
  const missing = [];

  if (!actor.grupo) missing.push("cargo u organización");
  if (!actor.naturaleza) missing.push("naturaleza");
  if (!actor.relacion) missing.push("relación con el problema");
  if (!actor.rol) missing.push("rol frente al problema");
  if (!actor.intereses) missing.push("intereses");
  if (!actor.problemas_percibidos.length) {
    missing.push("problemas percibidos");
  }
  if (!actor.recursos_mandatos) {
    missing.push("recursos y mandatos");
  }
  if (actor.posicion === "") {
    missing.push("posición");
  }
  if (!actor.fuerza) {
    missing.push("fuerza / poder");
  }
  if (!actor.intensidad) {
    missing.push("intensidad / interés");
  }
  if (!actor.razon) {
    missing.push("razón de la valoración");
  }
  if (!actor.estrategia) {
    missing.push("estrategia de relacionamiento");
  }

  if (missing.length) {
    alert(
      "Complete los siguientes campos antes de continuar:\n\n• " +
      missing.join("\n• ")
    );
    return false;
  }

  return true;
}

/* Cuerpo copiado literalmente de ORIG 8918-9132 (actorValidationMessages). */
export function actorValidationMessages() {

  const actors =
    obtenerEstado().involucrados || [];

  const messages = [];

  /* 1 · Menos de ocho involucrados */
  if (actors.length < 8) {
    messages.push(
      "Hay menos de ocho involucrados. Revise si faltan financiadores, reguladores, organizaciones relacionadas, afectados y grupos que podrían perder algo con la solución."
    );
  }

  /* 2 · Ninguna posición negativa */
  const hasNegative =
    actors.some(actor =>
      String(actor.posicion) === "-1"
    );

  if (actors.length > 0 && !hasNegative) {
    messages.push(
      "Ningún involucrado tiene posición negativa. Un análisis sin opositores suele requerir revisar si se omitieron grupos que podrían resistirse o perder algo con el proyecto."
    );
  }

  /* 3 · Valoración sin razón */
  actors.forEach(actor => {
    if (!String(actor.razon || "").trim()) {
      messages.push(
        `La valoración de «${actor.grupo || "grupo sin nombre"}» no tiene razón registrada. Un número sin justificación no es defendible.`
      );
    }
  });

  /* 4 · Sin problemas percibidos */
  actors.forEach(actor => {
    if (
      !Array.isArray(actor.problemas_percibidos) ||
      actor.problemas_percibidos.length === 0
    ) {
      messages.push(
        `«${actor.grupo || "Grupo sin nombre"}» no registra problemas percibidos.`
      );
    }
  });

  /* 5 · Sin recursos o mandatos */
  actors.forEach(actor => {
    if (!String(actor.recursos_mandatos || "").trim()) {
      messages.push(
        `«${actor.grupo || "Grupo sin nombre"}» no registra recursos y mandatos.`
      );
    }
  });

  /*
   * 6 · Problemas percibidos formulados en positivo
   *
   * Heurística deliberadamente conservadora:
   * busca expresiones que suelen indicar estados deseables,
   * no pretende decidir por el formulador.
   */
  const positivePatterns = [
    "mejora",
    "mejoras",
    "aumento",
    "aumentar",
    "incremento",
    "incrementar",
    "fortalecimiento",
    "fortalecer",
    "mayor acceso",
    "mayor cobertura",
    "alta calidad",
    "mejor calidad",
    "desarrollo",
    "crecimiento",
    "oportunidades",
    "bienestar",
    "satisfaccion",
    "satisfaccion"
  ];

  actors.forEach(actor => {

    (actor.problemas_percibidos || [])
      .forEach(problem => {

        if (
          containsAny(problem, positivePatterns)
        ) {
          messages.push(
            `«${actor.grupo}» tiene un problema percibido que podría estar formulado en positivo: «${problem}». Revise que exprese claramente un estado negativo.`
          );
        }
      });
  });

  /*
   * 7 · Problemas como ausencia de solución.
   */
  const absencePatterns = [
    "no hay ",
    "falta ",
    "faltan ",
    "ausencia de ",
    "sin acceso",
    "sin apoyo",
    "sin capacitacion",
    "sin capacitación",
    "sin asistencia",
    "sin recursos",
    "sin infraestructura"
  ];

  actors.forEach(actor => {

    (actor.problemas_percibidos || [])
      .forEach(problem => {

        if (
          containsAny(problem, absencePatterns)
        ) {
          messages.push(
            `«${actor.grupo}» registra un problema percibido como ausencia o falta: «${problem}». Revise si describe realmente el problema o si está nombrando implícitamente una solución ausente.`
          );
        }
      });
  });

  /*
   * 8 · Mismo problema percibido por todos.
   */
  if (actors.length >= 2) {

    const problemGroups =
      new Map();

    actors.forEach(actor => {

      const uniqueProblems =
        new Set(
          (actor.problemas_percibidos || [])
            .map(normalizeTextForValidation)
            .filter(Boolean)
        );

      uniqueProblems.forEach(problem => {

        if (!problemGroups.has(problem)) {
          problemGroups.set(problem, 0);
        }

        problemGroups.set(
          problem,
          problemGroups.get(problem) + 1
        );
      });
    });

    problemGroups.forEach((count, problem) => {

      if (count === actors.length) {

        messages.push(
          `Todos los grupos perciben el mismo problema: «${problem}». Revise si realmente existe una única percepción o si falta desagregar diferencias entre involucrados.`
        );
      }
    });
  }

  /*
   * 9 · Poder alto e interés bajo.
   */
  actors.forEach(actor => {

    const force =
      Number(actor.fuerza);

    const interest =
      Number(actor.intensidad);

    if (
      force >= 4 &&
      interest <= 2
    ) {
      messages.push(
        `«${actor.grupo}» presenta poder ≥ 4 e interés ≤ 2. Revise si esta condición debe reaparecer como posible supuesto en el Paso 9.`
      );
    }
  });

  /*
   * 10 · "La comunidad" / "la ciudadanía"
   */
  actors.forEach(actor => {

    const group =
      normalizeTextForValidation(actor.grupo);

    if (
      group === "la comunidad" ||
      group === "comunidad" ||
      group === "la ciudadania" ||
      group === "ciudadania"
    ) {
      messages.push(
        `«${actor.grupo}» es un grupo demasiado amplio. Desagregue sus intereses y posiciones cuando existan diferencias internas.`
      );
    }
  });

  return messages;
}

/* Cuerpo copiado literalmente de ORIG 9134-9180 (renderActorValidations). */
export function renderActorValidations() {

  const container =
    document.getElementById("actorValidations");

  const count =
    document.getElementById("validationCount");

  if (!container || !count) {
    return;
  }

  const messages =
    actorValidationMessages();

  if (!messages.length) {

    count.textContent =
      "Sin hallazgos";

    container.innerHTML = `
      <div class="validation-item validation-success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>No se identifican hallazgos automáticos.</strong>
          <br>
          El análisis supera las comprobaciones configuradas.
          Esto no sustituye la revisión metodológica ni la validación
          con los involucrados.
        </div>
      </div>
    `;

    return;
  }

  count.textContent =
    `${messages.length} hallazgo${messages.length === 1 ? "" : "s"}`;

  container.innerHTML =
    messages.map(message => `
      <div class="validation-item validation-warning">
        <span class="validation-icon">!</span>
        <div>${escapeHTML(message)}</div>
      </div>
    `).join("");
}
