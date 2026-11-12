#!/bin/bash
# Doppelklick startet das Werkzeug und öffnet den Browser.
# Liegt bewusst als .command vor: Das ist unter macOS doppelklickbar und
# lässt sich ins Dock legen. Zum Beenden das Fenster schließen oder Strg-C.

cd "$(dirname "$0")" || exit 1
PORT=4000

echo "AdMemory · Werkzeug"
echo "───────────────────"

# Läuft es schon? Dann nicht ein zweites Mal starten, nur aufmachen.
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Läuft bereits auf Port $PORT — ich mache nur das Fenster auf."
  open "http://localhost:$PORT"
  sleep 1
  exit 0
fi

# Die Betriebsliste frisch aus results/ bauen, damit neue Scans sofort
# auftauchen. Dauert unter einer Sekunde.
if [ -f archiv-blatt.mjs ]; then
  node archiv-blatt.mjs 2>/dev/null | head -1
fi

echo "Starte … das Fenster bitte offen lassen."
node dashboard/lokal.mjs &
SERVER=$!

# Warten, bis der Server wirklich antwortet, statt blind zu öffnen.
for _ in $(seq 1 40); do
  if curl -s -o /dev/null -m 2 "http://localhost:$PORT/"; then break; fi
  sleep 0.25
done
open "http://localhost:$PORT"

trap 'kill $SERVER 2>/dev/null' EXIT
wait $SERVER
