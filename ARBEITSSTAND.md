# Arbeitsstand Baukasten

Stand 14.10.2026. Was vereinbart ist, was gebaut ist, was als Nächstes kommt.
Diese Datei existiert, damit eine neue Sitzung nicht alles aus dem Verlauf
herleiten muss.

## Gebaut und in der Bibliothek

| Gruppe | Fassungen |
|---|---|
| Kopfbereiche | heroMitte, heroGeteilt (hell/dunkel), heroVoll |
| Vertrauen | vertrauenDuo, vertrauenStreu |
| Kundenstimmen | stimmenSpalten, stimmenBuehne, stimmenBilder, stimmenNote, stimmenReihe |
| Termin | terminAnfrage |
| Leistungen | leistungenBento, leistungen |
| Logowände | logowandKarten, logowandLauf |
| Verläufe | verlaufSeitlich, verlaufWaagerecht, verlaufSchmal |
| Fußbereiche | fussKontakt, fussSpalten |

Die Bibliothek erscheint im Dashboard unter `Bibliothek`. Sie entsteht aus den
Prüfseiten: Das kanonische Beispiel ist dort mit `bsp(id, …)` ausgezeichnet,
`export-bibliothek.mjs` fotografiert es ab.

## Vereinbart, noch nicht gebaut

Reihenfolge wie mit Noah besprochen:

1. **Knöpfe** als eigene Kategorie. Gemessen an zwölf Vorbildseiten: deren
   Median liegt bei 44 px Höhe, 8 px Radius, Schriftgewicht 400–500. Unsere
   sind 53–54 px hoch und Gewicht 600 — zu hoch und zu fett.
2. **Navigationen** als eigene Kategorie. Sechs Muster erkannt: Standard mit
   einem lauten Knopf; wenige Punkte plus großer Knopf (michael-milz);
   zweistöckig mit Telefonnummer (maasprofile); zweistöckig mit
   Herstellermarken (senger); schwebende Leiste (porsche); fast leer (apple).
   Durchgehend: zwei Knöpfe rechts, einer leise, einer laut.
3. **Preise & Pakete** — preiseKarten, preiseLeuchten, preiseZeilen,
   preiseAngebote, preiseRichtwerte. Der letzte ist der wichtigste: Die
   wenigsten Handwerker nennen Festpreise.
4. **Häufige Fragen** — fragenZweispaltig (sofortsichtbar), fragenListe
   (maasprofile), fragenOffen, fragenMitDraht, fragenZweiSpaltenOffen.
5. **Aktuelles** — aktuellesKarten (senger), aktuellesSchlicht (ohne Bilder,
   Datum links), aktuellesGross.
6. **Abschluss statt Akzentband** — abschlussKarte (conideo), abschlussLeise,
   abschlussDraht. Das Akzentband von senger hat Noah abgelehnt.
7. **Ankündigungsband** über der Navigation, **Kontaktleiste** unter dem Hero,
   **Der Betrieb**, **Kontakt & Anfahrt**, **Vorzeilen**, **Bildergalerie**.

Offen und von Noah noch nicht beantwortet: ob der typografische Kniff aus
conideo (Überschrift mischt aufrecht und kursive Serife) ins System soll.

## Werkzeuge

- `entwuerfe/pruefen.mjs <datei>` — misst Querüberlauf, Kontrast mit
  Schichtenrechnung, nicht geladene Bilder, zu kleine Logos, von Masken
  verschluckte Logos und Klassennamen ohne Regel.
- `entwuerfe/baukasten/export-bibliothek.mjs` — schreibt bibliothek.json und
  die Bilder fürs Dashboard.
- `entwuerfe/baukasten/bilder-holen.mjs` — CC0-Bilder über Openverse.
- `werkstatt/vorbilder-holen.mjs <url|name>` — fotografiert Vorbildseiten ab
  und vermisst deren Schaltflächen. Bilder landen außerhalb des Repos.

## Grundsätze

Alles Weitere steht in `entwuerfe/REGELN.md` und
`entwuerfe/baukasten/KATALOG.md`. Die zwei wichtigsten:

- **Grenzen gehören in den Baustein, nicht in die Prüfseite.** Was es nicht
  geben soll, wird beim Bauen verweigert, nicht als Beispiel gezeigt.
- **Die Bibliothek bleibt allgemein.** Kein Kundenmaterial im Katalog.
