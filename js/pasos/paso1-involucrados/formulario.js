/**
 * Paso 1 · Análisis de involucrados — formulario.
 *
 * `editActor` y `deleteActor` dejan de ser globales (mitad del defecto 1):
 * se exportan y el `index.js` de la Tarea 9 las conecta por delegación
 * de eventos, sustituyendo los `onclick` inline del original.
 */

import { obtenerEstado, notificarCambio } from "../../core/estado.js";
import { normalizeLines } from "../../utils/texto.js";
import { actorValue } from "./modelo.js";
import { validateActor } from "./validacion.js";

/* Cuerpo copiado literalmente de ORIG 7858-7887 (clearActorForm). */
export function clearActorForm() {
  [
    "actorGrupo",
    "actorRelacion",
    "actorRol",
    "actorIntereses",
    "actorProblemas",
    "actorRecursos",
    "actorRazon",
    "actorEstrategia"
  ].forEach(id => {
    document.getElementById(id).value = "";
  });

  document.getElementById("actorNaturaleza").value = "";
  document.getElementById("actorPosicion").value = "";
  document.getElementById("actorFuerza").value = "";
  document.getElementById("actorIntensidad").value = "";

  obtenerEstado().editingActorIndex = null;
  notificarCambio();

  document.getElementById("actorFormTitle").textContent =
    "Registrar involucrado";

  document.getElementById("actorSaveBtn").textContent =
    "Agregar involucrado";

  document.getElementById("actorCancelBtn").style.display =
    "none";
}

/* Cuerpo copiado literalmente de ORIG 7889-7906 (readActorForm). */
export function readActorForm() {
  return {
    grupo: actorValue("actorGrupo"),
    naturaleza: actorValue("actorNaturaleza"),
    relacion: actorValue("actorRelacion"),
    rol: actorValue("actorRol"),
    intereses: actorValue("actorIntereses"),
    problemas_percibidos: normalizeLines(
      document.getElementById("actorProblemas").value
    ),
    recursos_mandatos: actorValue("actorRecursos"),
    posicion: actorValue("actorPosicion"),
    fuerza: actorValue("actorFuerza"),
    intensidad: actorValue("actorIntensidad"),
    razon: actorValue("actorRazon"),
    estrategia: actorValue("actorEstrategia")
  };
}

/* Cuerpo copiado literalmente de ORIG 7949-7999 (fillActorForm). */
export function fillActorForm(actor) {
  document.getElementById("actorGrupo").value =
    actor.grupo || "";

  document.getElementById("actorNaturaleza").value =
    actor.naturaleza || "";

  document.getElementById("actorRelacion").value =
    actor.relacion || "";

  document.getElementById("actorRol").value =
    actor.rol || "";

  document.getElementById("actorIntereses").value =
    actor.intereses || "";

  document.getElementById("actorProblemas").value =
    (actor.problemas_percibidos || []).join("\n");

  document.getElementById("actorRecursos").value =
    actor.recursos_mandatos || "";

  document.getElementById("actorPosicion").value =
    actor.posicion || "";

  document.getElementById("actorFuerza").value =
    actor.fuerza || "";

  document.getElementById("actorIntensidad").value =
    actor.intensidad || "";

  document.getElementById("actorRazon").value =
    actor.razon || "";

  document.getElementById("actorEstrategia").value =
    actor.estrategia || "";

  document.getElementById("actorFormTitle").textContent =
    "Editar involucrado";

  document.getElementById("actorSaveBtn").textContent =
    "Guardar cambios";

  document.getElementById("actorCancelBtn").style.display =
    "inline-block";

  window.scrollTo({
    top: document.getElementById("screen1").offsetTop,
    behavior: "smooth"
  });
}

/* Cuerpo copiado literalmente de ORIG 8001-8016 (saveActor).
 *
 * `validateActor` vive en `./validacion.js` (Tarea 9, mismo paso: import
 * permitido). Hasta que esa tarea la cree, la llamada queda como
 * referencia pendiente de resolver — Tarea 9 añade el import.
 * `renderActors()` del original se retira: el orquestador (Tarea 9) ya
 * repinta el módulo completo tras cada acción (`saveActor(); render();`),
 * y su `render()` cubre exactamente lo que hacía `renderActors`
 * (renderMainActorTable + renderCharacterization + los dos gráficos SVG +
 * renderActorValidations, verificado contra ORIG 8881-8891).
 */
export function saveActor() {
  const actor = readActorForm();

  if (!validateActor(actor)) {
    return;
  }

  if (obtenerEstado().editingActorIndex === null) {
    obtenerEstado().involucrados.push(actor);
  } else {
    obtenerEstado().involucrados[obtenerEstado().editingActorIndex] = actor;
  }
  notificarCambio();

  clearActorForm();
}

/* Cuerpo copiado literalmente de ORIG 8018-8027 (editActor). */
export function editActor(index) {
  const actor = obtenerEstado().involucrados[index];

  if (!actor) {
    return;
  }

  obtenerEstado().editingActorIndex = index;
  notificarCambio();
  fillActorForm(actor);
}

/* Cuerpo copiado literalmente de ORIG 8029-8052 (deleteActor). */
export function deleteActor(index) {
  const actor = obtenerEstado().involucrados[index];

  if (!actor) {
    return;
  }

  const confirmed = confirm(
    "¿Desea eliminar este involucrado?\n\n" +
    actor.grupo
  );

  if (!confirmed) {
    return;
  }

  obtenerEstado().involucrados.splice(index, 1);
  notificarCambio();

  if (obtenerEstado().editingActorIndex === index) {
    clearActorForm();
  }
}
