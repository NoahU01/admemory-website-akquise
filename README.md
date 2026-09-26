# admemory-website-akquise

Phase 1 der Akquise-Pipeline: scannt die Website eines lokalen Unternehmens und
liefert zwei Kennzahlen plus **zitierfähige Befunde** — jeder Befund ist so
formuliert, dass er wörtlich auf der Pitch-Landingpage stehen kann.

```bash
npm install
cp .env.example .env          # ANTHROPIC_API_KEY eintragen
node scan.mjs https://beispiel.de/
node scan.mjs --list urls-kalibrierung.txt
```

Ergebnis pro Seite in `results/<host>/`: `scan.json` (alles) und Screenshots
Desktop/Mobil, jeweils Ausschnitt und ganze Seite.

## Zwei Kennzahlen, nicht eine

| | Bedeutung |
|---|---|
| **qualityScore** | Wie gut ist die Website (0 schlecht … 100 gut) |
| **leadScore** | Wie lohnend als Kunde (0 uninteressant … 100 heißer Lead) |

Hoch bei Qualität heißt: gute Seite, **schlechter** Lead. Für die Pipeline zählt
der leadScore. Er ist die invertierte Qualität, später gewichtet mit
Google-Bewertungen aus der Places API — eine schwache Seite bei einem
lebendigen Betrieb ist der beste Kandidat.

## Die sieben Kategorien

| Kategorie | Gewicht | Modell | Was geprüft wird |
|---|---|---|---|
| Eindruck & Design | 24 | Verdienen | Claude sieht Desktop- und Mobil-Screenshot, sechs Skalen 1–5 |
| Mobil | 22 | **Verdienen** | Hygiene (40) + Komposition (60): Hero, H1, CTA über dem Fold, Overlay-Abdeckung, Tap-Ziele |
| Inhalt & Nutzen | 18 | **Verdienen** | Öffnungszeiten, tel:-Link, Adresse, CTA, Karte als HTML statt PDF, Fotos, Reservierung |
| Technik & Tempo | 14 | Abzüge | Lighthouse lokal (mobil), HTTPS, Seitengewicht, Bildgrößen |
| Aktualität | 10 | Abzüge | Copyright-Jahr, Corona-Reste, Theme-Platzhalter, alte Versionen |
| Auffindbarkeit | 7 | **Verdienen** | Title, Description, H1, OG, strukturierte Daten, Sitemap, Alt-Texte |
| Rechtliches | 5 | Abzüge | Impressum, Datenschutz, Google Fonts extern, Tracking ohne Consent |

**Warum zwei Modelle?** Bei Recht und Aktualität geht es um Fehler — da zieht man
ab. Bei Mobil, Inhalt und Auffindbarkeit geht es um Leistung — da muss man Punkte
verdienen, sonst bekommt eine Baukastenseite, die „nichts falsch macht", dieselbe
Note wie eine richtig gute.

**Deckel:** Der Gesamtwert ist nie höher als Eindruck + 25 bzw. Mobil + 30. Guter
Durchschnitt in Nebensachen soll einen schwachen Kern nicht überdecken.

Fehlt eine Kategorie (z. B. Eindruck ohne API-Key), wird ihr Gewicht auf die
übrigen verteilt.

## Kalibrierung (Stand 26.09.2026)

Fünf Seiten, Gastronomie Crailsheim plus der Acanto-Entwurf:

| Seite | Qualität | Lead | Eindruck |
|---|---|---|---|
| Acanto-Entwurf | 90 | 8 | 96 |
| Sicilia | 69 | 24 | 57 |
| Odyssee | 57 | 33 | 32 |
| Hirschgarten | 57 | 33 | 32 |
| Acanto alt | 50 | 39 | 25 |

Ohne die Design-Bewertung lagen alle zwischen 71 und 88 — die Regelchecks messen
Korrektheit, nicht Gestaltung. Erst mit ihr trennt sich das Feld.

## Branchenprofile

Die Bewertungsdimensionen und Gewichte sind für alle Branchen gleich — nur wonach
gesucht wird, unterscheidet sich. Sechs Profile: Gastronomie, Handwerk & Bau,
Praxis & Gesundheit, Kanzlei & Beratung, Einzelhandel, Dienstleistung (Standard).

Erkannt wird die Branche aus schema.org-Daten (verlässlich) oder per
Stichwortzählung über Titel, Beschreibung und Text. Überschreiben mit
`--branche=handwerk`.

Ohne Profile verlor ein Handwerksbetrieb 14 Punkte für eine fehlende Speisekarte
und bekam den Befund „Keine Speisekarte auffindbar" — und wäre als heißer Lead
ganz oben gelandet.

## Entwürfe

`localhost`, `*.vercel.app`, `*.netlify.app` gelten als Entwurf: fehlendes HTTPS,
`noindex` und fehlende Sitemap zählen dort nicht — das ist dort Absicht.

## Konfiguration

`ANTHROPIC_API_KEY` ist nötig für die Kategorie Eindruck (~3 Cent pro Seite).
`ANTHROPIC_WORKSPACE_ID` nur, wenn der Key keinem Workspace zugeordnet ist —
sonst antwortet die API mit 400. `PSI_API_KEY` ist optional, Lighthouse läuft
lokal; PageSpeed dient nur als Fallback.

## Was noch fehlt

- **Unterseiten mitscannen** — bei Gastronomie ist die Karte oft wichtiger als die Startseite
- **Pitch-Potenzial** aus Google-Bewertungen (Places API, Phase 2)
- **Datenbank** statt JSON-Dateien (Supabase)
- Preisformel aus Umfang, Befunden und Branche
