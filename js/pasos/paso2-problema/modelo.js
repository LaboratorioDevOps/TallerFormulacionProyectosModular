/**
 * Paso 2 · Análisis del problema — modelo del árbol de nodos.
 *
 * Cuerpos copiados de ORIG:
 *   - nextNodeCode  (9873-9890)
 *   - createsCycle  (5718-5760)
 *
 * `createsCycle` NO estaba a nivel superior en el original: era una
 * función anidada dentro de `runProblemValidation` (5540-5933), que la
 * usaba en la prueba de no-circularidad y le pasaba el `node` completo
 * (no un `codigo` y un `padre` sueltos — su firma real es
 * `createsCycle(node)`). Al extraerla aquí se conserva esa firma tal
 * cual. La Tarea 14 migrará `runProblemValidation` sin ella e importará
 * esta versión.
 *
 * Cambios permitidos respecto al original: añadir export/import,
 * sustituir el acceso previo al estado global por obtenerEstado(). El cuerpo de
 * `createsCycle` en sí no se toca; la única adición es la
 * reconstrucción de la variable `nodes`, que en el original llegaba por
 * clausura desde `runProblemValidation` (`const nodes = Array.isArray(state.nodos) ? state.nodos : [];`)
 * y que, al quedar la función a nivel superior, ya no existe en el
 * entorno léxico.
 */

import { obtenerEstado } from "../../core/estado.js";

/* Cuerpo copiado literalmente de ORIG 9873-9890 (nextNodeCode). */
export function nextNodeCode(type, level) {

  const prefix = type === "causa" ? "C" : "E";

  const existing =
    obtenerEstado().nodos.filter(function (node) {

      return node &&
        node.tipo === type &&
        Number(node.nivel) === Number(level);

    });

  return prefix +
    Number(level) +
    "." +
    (existing.length + 1);
}

/* Cuerpo copiado literalmente de ORIG 5718-5760 (createsCycle, anidada
   originalmente en runProblemValidation). */
export function createsCycle(node) {

  /* Reconstrucción de "nodes", que en el original provenía del closure
     de runProblemValidation (ver comentario de cabecera). No forma
     parte del cuerpo original de createsCycle. */
  const nodes =
    Array.isArray(obtenerEstado().nodos)
      ? obtenerEstado().nodos
      : [];

        const visited =
          new Set();

        let current =
          node.padre;

        while (
          current &&
          current !== "P"
        ) {

          if (visited.has(current)) {
            return true;
          }

          if (current === node.codigo) {
            return true;
          }

          visited.add(current);

          const parent =
            nodes.find(function (candidate) {

              return candidate &&
                candidate.codigo === current;

            });

          if (!parent) {
            return false;
          }

          current =
            parent.padre;

        }

        return false;

}
