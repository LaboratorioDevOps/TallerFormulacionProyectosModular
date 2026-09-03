/** Utilidades de texto. Sin estado: no importan nada de core/. */

/* Cuerpo copiado literalmente de ORIG 7772-7777. */
export function normalizeLines(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

/* Cuerpo copiado literalmente de ORIG 8899-8907. */
export function normalizeTextForValidation(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?¿¡()"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* Cuerpo copiado literalmente de ORIG 8909-8916. */
export function containsAny(text, patterns) {
  const normalized =
    normalizeTextForValidation(text);

  return patterns.some(pattern =>
    normalized.includes(pattern)
  );
}

/* Cuerpo copiado literalmente de ORIG 6816-6840. */
export function formatProblemLogDate(value) {

  if (!value) {
    return "Fecha no registrada";
  }


  const date =
    new Date(value);


  if (Number.isNaN(date.getTime())) {
    return String(value);
  }


  return date.toLocaleString(
    "es-CO",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );

}
