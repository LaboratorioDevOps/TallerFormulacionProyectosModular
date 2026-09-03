/**
 * Fábrica para las pantallas 4 a 10, cuyo markup existe pero cuya lógica
 * MML aún no está desarrollada. Cumplen el contrato ModuloPaso para que el
 * router y la navegación las traten como a cualquier otra.
 */
export function crearPasoPendiente({ id, titulo, grupo, etiquetaPaso, vista }) {
  return {
    id,
    titulo,
    grupo,
    etiquetaPaso,
    vista,
    init() {},
    render() {}
  };
}
