#!/usr/bin/env bash
# Render Excalidraw scenes defined in a diagrams.js file.
# Usage: render.sh <diagrams.js> <out-dir>
# Needs: node + npm (with registry access), python3, and a Chromium binary
# (auto-detected under /opt/pw-browsers, or set CHROME=/path/to/chrome).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
# No `realpath -m`: macOS realpath lacks it, so create the out dir first.
DIAGRAMS="$(realpath "$1")"; mkdir -p "$2"; OUT="$(cd "$2" && pwd)"
WORK="${EXC_WORK:-${TMPDIR:-/tmp}/excalidraw-story-deck}"
mkdir -p "$WORK" "$OUT"
cp "$SRC"/{package.json,package-lock.json,lib.js,entry.js,index.html,export.mjs} "$WORK"/
cp "$DIAGRAMS" "$WORK/diagrams.js"
cd "$WORK"
[ -d node_modules/@excalidraw ] || npm i --silent --no-audit --no-fund
FONTDIR=node_modules/@excalidraw/excalidraw/dist/prod/fonts/Excalifont
echo "window.EXC_FONTS=$(ls "$FONTDIR" | python3 -c 'import sys,json;print(json.dumps(sys.stdin.read().split()))');" > fonts.js
npx esbuild entry.js --bundle --format=iife --outfile=bundle.js --loader:.woff2=file --loader:.css=empty \
  --define:process.env.NODE_ENV='"production"' --minify --log-level=warning
export CHROME="${CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)}"
[ -x "$CHROME" ] || { echo "No Chromium found; set CHROME=/path/to/chrome" >&2; exit 1; }
export PORT="${PORT:-8765}"
python3 -m http.server "$PORT" >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
for _ in $(seq 50); do curl -s "localhost:$PORT" >/dev/null && break; sleep 0.1; done
node export.mjs "$OUT"
