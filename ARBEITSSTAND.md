# Arbeitsstand

Stand 16.10.2026. Was gebaut ist, was vereinbart ist, was als Nächstes kommt.
Diese Datei existiert, damit eine neue Sitzung nicht alles aus dem Verlauf
herleiten muss.

## Richtungswechsel vom 16.10.2026

Bis hierher war der Plan: Betriebe finden, Seiten bewerten, **fertige Entwürfe**
bauen und die verschicken. Nach einem Hinweis aus Noahs Umfeld ist der Plan
gedreht: **Zuerst geht ein Report an den Betrieb**, der sagt, was gut ist, was
man verbessern könnte und was dringend ist. Er soll zum Erstgespräch führen.

Der Grund dafür ist nicht "alles automatisieren geht nicht", sondern **wo** die
Automatisierung bricht: nicht am Layout, sondern am Inhalt. Welche Leistungen
ein Betrieb hat, wie er über sich schreibt, welche Fotos es gibt — das kann der
Baukasten nicht erfinden, und daran war der erste Entwurf (rolltruck.de) schwach,
nicht an den Modulen. Ein Report braucht davon nichts: er beschreibt, was da ist.

Gemessen am Bestand (16.10.2026, 1103 Betriebe):

| | |
|---|---|
| E-Mail-Adressen in der Datenbank | **0** |
| Telefonnummern | 252 |
| Adressen | noch nicht erhoben |
| Betriebe mit Stufe-2-Scan | 61 |
| Betriebe mit Lead-Wert ≥ 38 | 152 |

Daraus folgt die Reihenfolge unten: ohne Kontaktdaten gibt es keinen Versand,
ohne Stufe-2-Scan keinen Report, der etwas aussagt.

Noahs Vorgabe dazu: **auf alle Seiten anwenden, nicht nur auf die schwachen.**
Es muss nicht immer ein kompletter Auftritt verkauft werden — oft reicht,
technisch glattzuziehen. Jede Seite hat etwas, das man verbessern kann.

## Der Funnel

Scan → Bewertung → Report → Versendet → Antwort → Abgelehnt → Kunde.
Das Dashboard bildet diese Stufen noch nicht ab; es zeigt bisher Scan und
Bewertung. **Noch zu bauen.**

## Gebaut

### Kundenreport — fertig

Zwei A4-Seiten, gestaltet nach Noahs eigener Meta-Ads-Analyse. Gemessen aus der
Vorlage: Poppins, Papier #f6f7f9, Tinte #14161d. Markenfarbe ist seit dem
12.11.2026 das dunkle Grün #047857.

- `lib/kundenreport.mjs` — baut aus einem Stufe-2-Scan die Seite, die beim
  Betrieb ankommt. Eigenes CSS, A4-druckbar, `noindex`. Drei Färbungen in
  `PALETTEN`: gruen (Standard), indigo, lime.
- `lib/kundenlogo.mjs` — holt das Logo des Betriebs von dessen eigener Seite.
  Gewichtet die Bilder im Kopfbereich statt zu raten und liefert lieber nichts
  als ein Partnerlogo.
- `kundenreport.mjs` — `node kundenreport.mjs <host>`, `--top=N`, `--alle`,
  `--farbe=indigo|lime`, `--ohne-logo`.
  Legt nach `entwuerfe/report/<host>/index.html` ab.

Regeln, die darin stecken:

- **Auswählen statt aufzählen.** Ein Scan liefert bis zu 32 Befunde, der Report
  zeigt drei dringende und sechs weitere. Dafür werden Befunde zu *Themen*
  gebündelt (`buendele()`) — "29 % der Knöpfe zu klein" auf drei Seiten ist ein
  Thema, nicht drei Befunde.
- **Jeder dringende Punkt bekommt einen Satz, warum er zählt.** Ohne den ist es
  eine Messung, keine Aussage.
- **Keine erfundenen Zahlen.** Kein "88 % springen ab". Was dasteht, ist aus dem
  Scan belegbar.
- **Erst, was gut ist** — aus `staerken` des Design-Urteils.
- **Keine Preisspanne.** Die Schätzung aus `groesse` ist eine Budget-Vermutung
  für uns, kein Angebot. Im Kundendokument hat sie nichts verloren.
- **Wie gemessen wurde, steht drin**, samt dem, was wir nicht sehen konnten.

`entwuerfe/report/` ist **gitignored**: Das Repo ist öffentlich, und ein Report
nennt einen Betrieb beim Namen und sagt, was an seiner Seite nicht stimmt.

### Baukasten — eingefroren, nicht weggeworfen

35 Bausteine in 12 Gruppen, im Dashboard unter `Bibliothek`:

| Gruppe | Anzahl |
|---|---|
| Buttons | 3 |
| Navigationen | 5 |
| Ankündigungsbänder | 1 |
| Hero | 4 |
| Vertrauen | 2 |
| Kundenstimmen | 5 |
| Termin | 1 |
| Bildergalerie | 5 |
| Leistungen | 2 |
| Logowände | 2 |
| Verläufe | 3 |
| Fußbereiche | 2 |

Die **Aufgabe des Baukastens hat gewechselt**: Er ist nicht mehr das Ziel der
Automatisierung, sondern Beweismaterial im Erstgespräch und später die Hülle für
Entwürfe. Für diese Rolle reichen 35 Fassungen.

**Nicht gebaut und vorerst zurückgestellt:** Preise & Pakete, Häufige Fragen,
Aktuelles, Abschluss statt Akzentband, Der Betrieb, Kontakt & Anfahrt,
Vorzeilen. Die Vorlagen und die geplanten Fassungen dazu stehen im Verlauf vom
14./15.10.2026; was davon noch gilt, ist beim Wiederaufnehmen neu zu prüfen.

Offen und von Noah nie beantwortet: ob der typografische Kniff aus conideo
(Überschrift mischt aufrecht und kursive Serife) ins System soll.

## Stand 12.11.2026: Kaltakquise zurückgestellt

Der Report ist fertig und gut. Der **Versandweg** ist das Problem, nicht das
Werkzeug.

**Rechtlich** (§ 7 UWG, am Gesetzestext geprüft, siehe unten): Kalte E-Mail an
Betriebe ist unzulässig, es braucht die vorherige ausdrückliche Einwilligung,
und anders als beim Telefon gibt es hier keine mutmaßliche. Zulässig bleiben
Brief und Telefon.

**Wirtschaftlich** hat Noah das Vorhaben am 12.11.2026 zurückgestellt. Seine
Begründung: 500 Briefe kosten rund 750 €, es bleibt Kaltakquise mit geringer
Rücklaufquote, und das Geld steckt er lieber in Paid Ads, wo er die Zahlen
kennt. Das ist nachvollziehbar, auch wenn die reine Kostenrechnung dagegen
spricht: Der Median der geschätzten Projektgröße liegt bei den lohnenden Leads
bei 3.500 €, ein einziger Abschluss trägt also die Portokosten von 500 Briefen
fast fünffach. Der eigentliche Aufwand ist nicht das Porto, sondern Noahs Zeit
für Gespräche und Angebote.

**Was damit NICHT gestorben ist:** Scanner, Bewertung und Reportgenerator
stehen und funktionieren. Der naheliegende Weiterweg ist, den Report von
Ausgang auf **Eingang** zu drehen:

1. Als **kostenlose Website-Analyse auf admemory.de**. Wer sie anfordert,
   willigt ein, damit ist das UWG-Problem weg und die E-Mail-Adresse liegt vor.
2. Als **Angebot hinter einer Paid-Ads-Anzeige**. Das verbindet Noahs
   Budgetpräferenz mit dem, was hier gebaut ist.
3. Als **Werkzeug im Verkaufsgespräch**: vor jedem Termin einmal laufen lassen,
   Kosten etwa 11 ct.
4. Für **Bestandskunden** als regelmäßiger Check.

Die 1103 gescannten Betriebe bleiben nützlich: Fordert jemand einen Check an,
liegt der Scan oft schon vor.

**Wenn die Kaltakquise doch getestet wird:** nicht 500, sondern 25. Das kostet
rund 40 € und einen Nachmittag. Dafür müssen **Adressen** erhoben werden, die
stehen noch nicht in der Datenbank.

## Offen, falls wieder aufgenommen

1. **Kontaktdaten erheben** — E-Mail, Telefon und Adresse aus Impressum und
   Kontaktseite. Ohne Adressen geht kein Brief raus.
2. **Stufe-2-Scans nachziehen.** 61 von 1103. 500 × Stufe 2 kostet rund 55 €
   und gut drei Stunden.
3. **Druckfassung mit weißem Grund.** Der Report hat grauen Vollflächengrund
   bis an die Blattkante. Am Bildschirm richtig, auf einem Bürodrucker heikel:
   randlos geht dort nicht, und hellgraue Vollflächen werden streifig.
4. **Dashboard auf den Funnel umbauen** (Scan → Bewertung → Report → Versendet
   → Antwort → Abgelehnt → Kunde).

## Werkzeuge

- `node scan.mjs --stufe1 --aus-db` / `--stufe2 --top=N` — bewerten.
- `node kundenreport.mjs <host>` — Report bauen.
- `node entwuerfe/pruefen.mjs <datei>` — misst Querüberlauf, Kontrast mit
  Schichtenrechnung, nicht geladene Bilder, zu kleine Logos, von Masken
  verschluckte Logos, Bilder außerhalb ihres Kastens und Klassennamen ohne Regel.
- `node entwuerfe/zeigen.mjs` — Entwürfe und Reports lokal ansehen (Port 4200),
  mit denselben Kopfzeilen wie Vercel.
- `entwuerfe/baukasten/export-bibliothek.mjs` — schreibt bibliothek.json und
  die Bilder fürs Dashboard.
- `werkstatt/vorbilder-holen.mjs <url|name>` — fotografiert Vorbildseiten ab.

## Grundsätze

- **Messen, nicht behaupten.** Jede Aussage über Darstellung wird im Browser
  nachgemessen. Mehrfach war in dieser Arbeit das *Messwerkzeug* falsch — das
  ist der gefährlichere Fehler.
- **Prüfen, was ausgeliefert ist, nicht was auf der Platte liegt.** Ein
  `file:///`-Pfad hat einmal jede lokale Prüfung bestanden und auf dem Server
  jedes Bild tot gestellt.
- Weiteres in `entwuerfe/REGELN.md` und `entwuerfe/baukasten/KATALOG.md`.
