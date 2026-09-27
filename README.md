# admemory-website-akquise

Phase 1 der Akquise-Pipeline: scannt die Website eines lokalen Unternehmens und
liefert zwei Kennzahlen plus **zitierfähige Befunde** — jeder Befund ist so
formuliert, dass er wörtlich auf der Pitch-Landingpage stehen kann.

```bash
npm install
cp .env.example .env          # ANTHROPIC_API_KEY eintragen

# Stufe 1 — Vorauswahl: kostenlos, ~3 s je Betrieb, 4 gleichzeitig
node scan.mjs --stufe1 --list urls.txt
node scan.mjs --stufe1 --aus-db            # alles mit Status 'neu'

# Stufe 2 — Vollbewertung: ~50 s, ~11 ct je Betrieb
node scan.mjs --stufe2 --top=10            # die zehn besten aus Stufe 1
node scan.mjs https://beispiel.de/         # einzelne Seite
```

## Warum zwei Stufen

Gemessen an einem Betrieb: Unterseiten laden 18 s, Design-Urteil 14 s,
Startseite 10 s, Lighthouse 9 s — die Regelchecks dagegen 0,0 s. Das Teure ist
ausschließlich das Laden und das Design-Urteil.

| | 100 Betriebe | Kosten |
|---|---|---|
| alles voll bewerten | ~50 min | 11 € |
| **Stufe 1, dann Stufe 2 für die besten 10** | **~6 min + 8 min** | **1,12 €** |

Stufe 1 braucht kein Design-Urteil, um zu erkennen, dass eine Seite kein
Impressum hat, mobil nicht funktioniert und das Copyright von 2019 stammt. Das
Design-Urteil lohnt sich erst für die Betriebe, die tatsächlich angeschrieben
werden.

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
| Eindruck & Design | 22 | Verdienen | Claude bewertet jede Seite einzeln, sechs Skalen 1–5 |
| Mobil | 20 | **Verdienen** | Hygiene (40) + Komposition (60): Hero, H1, CTA über dem Fold, Overlay-Abdeckung, Tap-Ziele |
| Inhalt & Nutzen | 16 | **Verdienen** | Zeiten, tel:-Link, Adresse, CTA, Angebot als HTML statt PDF, Fotos, Vertrauen |
| Vollständigkeit | 12 | **Verdienen** | Fehlt im ganzen Auftritt Wesentliches? Angebot, Zeiten, Kontakt, Impressum, Datenschutz |
| Technik & Tempo | 12 | Abzüge | Lighthouse lokal (mobil), HTTPS, Seitengewicht, Bildgrößen |
| Aktualität | 9 | Abzüge | Copyright-Jahr, Corona-Reste, Theme-Platzhalter, alte Versionen |
| Auffindbarkeit | 6 | **Verdienen** | Title, Description, H1, OG, strukturierte Daten, Sitemap, Alt-Texte |
| Rechtliches | 3 | Abzüge | Impressum, Datenschutz, Google Fonts extern, Tracking ohne Consent |

Gescannt werden **Startseite plus bis zu zwei Unterseiten** (Angebot, Kontakt).
Recht, Aktualität, Technik und SEO gelten global und werden nur an der Startseite
gemessen. Design und Mobil laufen über alle Seiten: Startseite doppelt gewichtet,
der schlechteste Wert zusätzlich — eine schöne Startseite mit miserabler Karte ist
ein schlechter Auftritt, kein mittelmäßiger. Inhalt zählt das beste Ergebnis, weil
Öffnungszeiten auf der Kontaktseite stehen dürfen.

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

## Betriebe sammeln (Google Places)

```bash
node sammeln.mjs "Malerbetrieb" "Crailsheim"
node sammeln.mjs "Restaurant" "Schwäbisch Hall" --min-bewertungen=10
node sammeln.mjs --liste suchen.txt          # Zeilen: Was;Ort
node sammeln.mjs "Zahnarzt" "Crailsheim" --trocken    # nur anzeigen
```

Braucht `GOOGLE_PLACES_KEY` in der `.env` (Google Cloud Console → APIs &
Dienste → Anmeldedaten; **Places API (New)** muss aktiviert sein).

Google liefert je Suche höchstens 20 Treffer pro Seite und 60 insgesamt — für
mehr braucht es engere Suchbegriffe oder weitere Orte. Aussortiert werden
Betriebe ohne Website, mit reinem Social-Profil als Website und dauerhaft
geschlossene. Der Google-Typ wird auf unsere Branchenprofile abgebildet;
Unbekanntes fällt auf `dienstleistung` und wird beim Scan aus dem Seiteninhalt
korrigiert.

Bewertungsschnitt und Anzahl der Rezensionen landen in der Datenbank und fließen
später in den Lead-Wert: eine schwache Seite bei einem lebendigen Betrieb ist der
beste Kandidat.

## Datenbank (Supabase)

Schema einspielen: Dashboard → **SQL Editor** → New query → Inhalt von
`supabase/schema.sql` einfügen → **Run**. Das Skript ist wiederholbar.

Eine Tabelle `unternehmen` plus die View `arbeitsliste`, die nach Dringlichkeit
sortiert: oben steht, was auf dich wartet (`entwurf_gebaut`), darunter
Antworten, dann Freigegebenes.

**Der Ablauf über den Status:**

```
neu → gescannt → entwurf_gebaut ⇄ feedback_gegeben → freigegeben
    → versendet → geantwortet → kunde | abgelehnt
```

Du filterst auf `entwurf_gebaut`, siehst dir den Entwurf an, notierst
Korrekturen. Der Agent sucht `feedback_gegeben`, liest die neueste Runde, baut um
und setzt zurück auf `entwurf_gebaut`. Feedback ist eine **Historie** — nach drei
Runden siehst du (und der Agent) noch, was in Runde eins gesagt wurde.

Im Terminal:

```bash
node liste.mjs                              # alles, nach Dringlichkeit
node liste.mjs entwurf_gebaut               # nur was auf dich wartet
node liste.mjs --feedback <id> "Hero zu dunkel, Karte fehlt"
node liste.mjs --status <id> freigegeben
```

`node scan.mjs <url>` schreibt automatisch in die Datenbank, sobald
`SUPABASE_URL` und `SUPABASE_SERVICE_KEY` in der `.env` stehen. Ohne sie läuft
alles wie bisher in `results/`.

**Zugriff:** RLS ist aktiv, es gibt keine Policies — an die Daten kommt nur der
`service_role`-Key. Der gehört auf deinen Rechner, nie in eine Website.

## Was noch fehlt

- Preisformel aus Umfang, Befunden und Branche
