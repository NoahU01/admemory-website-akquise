# Werkzeug

Übersicht über den Bestand und Reports auf Knopfdruck.

**Doppelklick auf `Werkzeug starten.command`** im Projektordner. Das baut die
Betriebsliste frisch, startet den Server und öffnet den Browser. Läuft er
schon, geht nur das Fenster auf. Zum Beenden das Terminalfenster schließen.

Die Datei lässt sich ins Dock legen. Von Hand geht es auch:

```
node dashboard/lokal.mjs      →  http://localhost:4000
```

## Warum lokal

Der Knopf „Report" braucht Chrome für die Screenshots, Lighthouse für die
Technik und die Dateien unter `results/`. Auf einer Serverless-Funktion gibt
es nichts davon, und ein Vollscan dauert länger, als eine solche Funktion
laufen darf. Deshalb läuft das hier auf dem eigenen Rechner — und deshalb
gibt es auch keine Anmeldung mehr: Wer am Rechner sitzt, ist drin.

## Woher die Daten kommen

Aus `betriebe.csv` im Projektverzeichnis, nicht aus einer Datenbank. Das
Supabase-Projekt ist weg, und für Scanner und Report wird keine gebraucht.
Die Tabelle entsteht mit `node archiv-blatt.mjs` aus `results/` und der
Sicherung vom 28.09.2026 und lässt sich jederzeit neu bauen.

Welche Betriebe einen Report haben, wird nicht gemerkt, sondern nachgesehen:
Die Ordner unter `entwuerfe/report/` sind die Wahrheit.

## Zwei Wege beim Report

| Lage | Dauer | Kosten |
|---|---|---|
| Stufe-2-Scan liegt vor | ~20 s | – |
| liegt nicht vor | ~70 s | ~11 ct |

Für einen Betrieb, der noch gar nicht in der Liste steht, gibt es oben das
Feld **Neuer Betrieb**: Adresse einfügen, Enter. Das ist der Weg vor einem
Verkaufsgespräch.

Der Knopf in der Zeile heißt entsprechend `Report` oder `Scan + Report`. Fertige Reports
sind über `Ansehen` jederzeit wieder zu öffnen, `PDF` legt eine Druckfassung
in den Download-Ordner, `↻` scannt neu.

## Offen

`vercel.json` liegt noch hier, und das Vercel-Projekt
`admemory-website-akquise-dashboard` zeigt weiter auf diesen Ordner. Seit die
Datenbank weg ist, läuft `dashboard.admemory.de` ins Leere. Ob die Domain
abgeschaltet wird, entscheidet Noah.
