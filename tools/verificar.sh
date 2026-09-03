#!/usr/bin/env bash
# Verificación estática del proyecto. Sustituye a las pruebas automatizadas.
# Uso: bash tools/verificar.sh
set -uo pipefail
cd "$(dirname "$0")/.."
FALLOS=0
fallo() { echo "  ✗ $1"; FALLOS=$((FALLOS+1)); }
ok()    { echo "  ✓ $1"; }

echo "1. Sintaxis de los módulos JavaScript"
JS=$(find js -name '*.js' 2>/dev/null)
if [ -z "$JS" ]; then
  ok "sin módulos todavía"
else
  for f in $JS; do
    node --check "$f" 2>/dev/null || fallo "sintaxis inválida: $f"
  done
  [ $FALLOS -eq 0 ] && ok "$(echo "$JS" | wc -l) módulos con sintaxis válida"
fi

echo "2. Atributos on* en el markup"
HITS=$(grep -rlE '\son(click|change|input|submit|keyup|keydown|blur|focus|load)=' \
       views index.html 2>/dev/null)
if [ -n "$HITS" ]; then
  for f in $HITS; do fallo "manejador en línea en $f"; done
else
  ok "ningún manejador en línea"
fi

echo "3. Aislamiento entre pasos"
CRUCE=0
for d in js/pasos/*/; do
  paso=$(basename "$d")
  otros=$(grep -rhoE "from ['\"][^'\"]*pasos/[a-z0-9-]+" "$d" 2>/dev/null \
          | grep -oE '[a-z0-9-]+$' | grep -v "^$paso$" | sort -u)
  if [ -n "$otros" ]; then
    fallo "$paso importa de: $(echo "$otros" | tr '\n' ' ')"
    CRUCE=1
  fi
done
[ $CRUCE -eq 0 ] && ok "ningún paso importa de otro paso"

echo "4. Referencias colgantes entre módulos"
COLGANTES=0
for f in $JS; do
  # nombres importados con llaves: import { a, b } from '...'
  while IFS='|' read -r nombres origen; do
    [ -z "$origen" ] && continue
    destino=$(cd "$(dirname "$f")" && realpath -m "$origen" 2>/dev/null)
    [ -f "$destino" ] || { fallo "$f importa de un archivo inexistente: $origen"; COLGANTES=1; continue; }
    for n in $(echo "$nombres" | tr ',' ' '); do
      n=$(echo "$n" | sed 's/ as .*//' | tr -d ' ')
      [ -z "$n" ] && continue
      grep -qE "export (async )?(function|const|let|class) $n\b|export \{[^}]*\b$n\b" "$destino" \
        || { fallo "$f importa '$n', que $origen no exporta"; COLGANTES=1; }
    done
  done < <(grep -oE "import \{([^}]*)\} from ['\"]([^'\"]+)['\"]" "$f" \
           | sed -E "s/import \{(.*)\} from ['\"](.*)['\"]/\1|\2/")
done
[ $COLGANTES -eq 0 ] && ok "todos los imports resuelven"

echo "5. Estado global residual"
if grep -rn 'window\.state' js 2>/dev/null | grep -v 'core/estado.js'; then
  fallo "quedan accesos a window.state fuera de core/estado.js"
else
  ok "sin accesos a window.state"
fi

echo
if [ $FALLOS -eq 0 ]; then echo "OK — sin fallos"; exit 0
else echo "$FALLOS fallo(s)"; exit 1; fi
