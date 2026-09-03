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
  # `node --check` sobre un .js con import/export de nivel superior no
  # detecta errores de sintaxis reales en este entorno (Node 20.20.2):
  # Node trata el archivo como script (no como módulo) al no encontrar
  # "type":"module" en package.json (este proyecto no tiene package.json),
  # y --check parece no completar el parseo del cuerpo tras un import/export
  # inesperado. Copiando cada archivo a una extensión .mjs en un directorio
  # temporal, Node lo analiza como módulo ES y sí detecta el error. Verificado
  # empíricamente con un archivo de prueba (function roto( { ... }).
  TMP_MJS=$(mktemp -d)
  trap 'rm -rf "$TMP_MJS"' EXIT
  for f in $JS; do
    destino="$TMP_MJS/$(echo "$f" | tr '/' '_').mjs"
    cp "$f" "$destino"
    node --check "$destino" 2>/dev/null || fallo "sintaxis inválida: $f"
  done
  rm -rf "$TMP_MJS"
  [ $FALLOS -eq 0 ] && ok "$(echo "$JS" | wc -l) módulos con sintaxis válida"
fi

echo "2. Atributos on* en el markup"
# También se recorre js/: el defecto 1 original nacía de onclick generados
# DENTRO de plantillas de cadena en .js (p. ej. renderCharacterization). Se
# exige la comilla de apertura (on\w+="...") para casar solo atributos HTML
# reales, y se descartan las líneas de comentario (// o *) de los .js, donde
# aparecen menciones explicativas al patrón onclick/onchange del original
# (p. ej. paso3-objetivos/index.js) que no son manejadores en línea reales.
HITS=$(grep -rnE '\son(click|change|input|submit|keyup|keydown|blur|focus|load)="' \
       views index.html js 2>/dev/null | grep -vE '^[^:]+:[0-9]+: *(//|\*)')
if [ -n "$HITS" ]; then
  while read -r f; do fallo "manejador en línea en $f"; done < <(echo "$HITS" | cut -d: -f1 | sort -u)
else
  ok "ningún manejador en línea"
fi

echo "3. Aislamiento entre pasos"
# La versión anterior buscaba la subcadena literal "pasos/" en la ruta del
# import, y no detectaba un import relativo entre pasos hermanos escrito de
# forma natural (p. ej. from "../paso2-problema/nodos.js" dentro de un
# archivo ya ubicado en js/pasos/otro-paso/), porque esa ruta no contiene
# la palabra "pasos/". Ahora se resuelve la ruta real de cada import con
# realpath -m (relativo al directorio del archivo que importa) y se compara
# el directorio de paso (js/pasos/<nombre-paso>/) del importador contra el
# del importado.
CRUCE=0
for f in $JS; do
  case "$f" in js/pasos/*) ;; *) continue ;; esac
  paso_origen=$(echo "$f" | sed -E 's#^js/pasos/([^/]+)/.*#\1#')
  origenes=$(grep -ohE "from ['\"][^'\"]+['\"]" "$f" 2>/dev/null \
             | sed -E "s/from ['\"](.*)['\"]/\1/")
  while IFS= read -r ruta; do
    [ -z "$ruta" ] && continue
    destino=$(cd "$(dirname "$f")" && realpath -m "$ruta" 2>/dev/null)
    [ -z "$destino" ] && continue
    case "$destino" in
      "$(realpath "$(pwd)")"/js/pasos/*)
        paso_destino=$(echo "$destino" | sed -E "s#^$(realpath "$(pwd)")/js/pasos/([^/]+)/.*#\1#")
        if [ "$paso_destino" != "$paso_origen" ]; then
          fallo "$f importa de otro paso: $ruta (paso $paso_destino)"
          CRUCE=1
        fi
        ;;
    esac
  done <<< "$origenes"
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
