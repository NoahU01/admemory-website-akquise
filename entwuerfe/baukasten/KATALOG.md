# Baukasten-Katalog

Welcher Baustein wann. Der Agent wählt danach, nicht nach Gefühl.

Jede Variante ist einmal gegen Extremfälle geprüft: sehr lange Überschrift,
fehlender Text, zu viele und zu wenige Einträge, 390 px Breite. Die Prüfseite
liegt unter `entwuerfe/_probe/`.

---

## Kopfbereiche

| Baustein | Wann |
|---|---|
| `heroMitte` | **Erste Wahl.** Ganzflächiges Bild, Text mittig darüber, große leichte Überschrift. Nimmt am stärksten ein. Braucht ein Bild, das abgedunkelt noch trägt, und eine Überschrift unter acht Wörtern. Partnerlogos können darunter stehen. |
| `heroGeteilt` | **Zweite Wahl, oft die bessere.** Links Text mit drei Merkmalen und Knöpfen, rechts ein Bild, das zum Rand ausblendet. Wenn drei Argumente sofort genannt werden sollen. Funktioniert auch mit Panoramabildern, weil nur ein Ausschnitt gezeigt wird. |
| `heroTiefe` | **Nicht für die automatische Wahl.** Das Bild wandert beim Scrollen langsamer. Braucht ein ruhiges, tiefes Motiv; bei einem unruhigen Bild wirkt die Bewegung billig, und genau solche Bilder liefern die alten Seiten meistens. Bleibt im Baukasten für den Einzelfall, den Noah selbst bestimmt. Braucht `TIEFE_SKRIPT` am Seitenende. |
| `heroVoll` | Ältere Fassung: Bild ganzflächig, Text linksbündig unten. Weiterhin brauchbar, aber `heroMitte` nimmt mehr ein. |
| `heroBand` | Text oben, breites Bildband darunter. Für Panoramabilder, die als Ausschnitt nichts hergeben. |
| `hero` | Geteilt mit Bildkasten rechts. Der sicherste, aber blasseste Aufbau. Nur, wenn nichts anderes passt. |

Ohne brauchbares Bild keine davon: dann Text plus `zahlen`.

**Echte Parallaxe geht nicht.** Mehrschichtige Tiefe braucht freigestellte
Ebenen, Vorder- und Hintergrund getrennt. Aus einem Foto der alten Seite lässt
sich das nicht herstellen. `heroTiefe` bewegt eine Schicht, mehr ist ehrlich
nicht drin.

## Verläufe, Historie, Vorgehen

Alle drei tragen denselben Inhalt. Die Wahl hängt an Menge und Textlänge.

| Baustein | Trägt | Wann |
|---|---|---|
| `verlaufSeitlich` | 4 bis 7 Einträge | Links Fließtext, rechts Karten an einer Linie. Die Marke sitzt mittig auf der Linie, rund bei einer Ziffer, als Pille bei einer Jahreszahl. **Je Eintrag zwei bis drei Sätze**, ein einzelner kurzer Satz lässt die Karte leer wirken. `icon` nur setzen, wenn es wirklich eine Checkliste ist. |
| `verlaufWaagerecht` | 3 bis 5 Stationen | Sehr kurze Texte, viel Weißraum. `bisHier` färbt die erreichten Stationen; bei einer Historie alle, bei einem laufenden Vorgang nur einen Teil. Ab sechs Stationen wird es am Rechner eng, ab neun unleserlich. |
| `verlaufSchmal` | 3 bis 6 Schritte | Lange Erklärtexte, ruhige Seite, keine Bilder daneben. Schmaler Satzspiegel trägt die Wirkung. |

## Inhalt

| Baustein | Wann |
|---|---|
| `leistungenBento` | **Erste Wahl bei fünf bis neun Leistungen.** Ungleich große Karten: Die erste ist doppelt so breit und hoch und trägt die wichtigste Leistung mit Aufzählung und einer Kennzahl. Bricht das gleichförmige Raster auf, das eine Seite schnell nach Baukasten aussehen lässt. Das Raster gleicht sich selbst aus, die Anzahl muss niemand ausrechnen. |
| `leistungen` | Gleichmäßiges Raster. Für zehn und mehr Einträge, oder wenn alle gleich wichtig sind. `mittig: true` zentriert die Kopfzeile, `iconStil: 'kreis'` oder `'kasten'` ändert die Icon-Fassung. Eine Karte darf `wichtig: true` tragen und sticht farbig heraus. |
| `textBild` | Ein Gedanke mit einem Bild daneben. `bildRechts` abwechseln, aber nicht öfter als zweimal hintereinander. |
| `zahlen` | Vier Kennzahlen. Nur mit belegten Werten, keine Zahl ohne Aussage. |
| `zeitleiste` | Älter als die Verlaufsbausteine, Karten im Raster. Für Verläufe lieber einen der drei oben. |

## Vertrauen

| Baustein | Wann |
|---|---|
| `logowandKarten` | **Erste Wahl bei vier bis acht Logos.** Raster mit feinen Fugen. Die beste Fassung für weiß hinterlegte Dateien, weil die Karte ohnehin weiß ist. Die Spaltenzahl richtet sich nach der Anzahl, zwei Logos ergeben zwei Spalten statt zwei Leerfelder. |
| `logowandGitter` | Ab etwa sechs Logos. Frei umbrechend, die Logos erscheinen beim Hereinscrollen nacheinander. Braucht `ERSCHEINEN_SKRIPT` am Seitenende. |
| `logowandLauf` | Endloses Laufband, hält beim Überfahren an. Braucht Bewegung auf der Seite und mindestens sechs Logos; bei weniger wird die Liste automatisch wiederholt, bis sie trägt. Bei reduzierter Bewegung bricht sie um, statt zu laufen. |
| `logoband` | Einfache Reihe. Für den Kopfbereich unter den Knöpfen. |
| `siegel` | Auszeichnungen groß, nicht als Dekoration am Rand. |
| `markenband` | Veraltet. Zeigt Textpillen. Nicht mehr verwenden. |

## Abschluss

| Baustein | Wann |
|---|---|
| `kontakt` | Anschrift, Zeiten, Telefon als eigener Abschnitt. Immer vor dem Fußbereich. |
| `fussKontakt` | **Erste Wahl.** Logo und Anschrift links, Öffnungszeiten in der Mitte, ein Knopf rechts. Für Betriebe, bei denen Erreichbarkeit das Wichtigste ist: Handwerk, Praxis, Gastronomie, Werkstatt. |
| `fussSpalten` | Logo mit kurzem Text, daneben Linkspalten und Kontakt. Für Betriebe mit vielen Unterseiten. Die Spaltenzahl richtet sich nach dem Inhalt. **Kein Newsletter-Feld**: Wir bauen keine Anmeldung, die niemand entgegennimmt. |
| `notband` | Ein Band quer, eine Aussage, eine Nummer. Nur bei echtem Notdienst. |
| `ruflasche` | Sticky am Rand, am Telefon als Leiste unten. Nur wenn ein Anruf das Ziel ist. |

---

## Abfolge

Was einzeln gut aussieht, ergibt in Reihe noch keine gute Seite. Regeln:

- **Nicht zweimal dasselbe Muster hintereinander.** Zwei `textBild` in Folge
  wirken wie eine Vorlage, auch wenn die Bildseite wechselt.
- **Dunkle Flächen als Zäsur, nicht als Dekoration.** Höchstens zwei pro Seite,
  und nicht direkt nebeneinander.
- **Nach einem Raster etwas Schmales.** Nach `leistungen` ein `verlaufSchmal`
  oder `textBild`, damit die Seite atmet.
- **Der Abschluss gehört dem Kontakt.** Darunter nur noch der Fußbereich.


---

## Was aus Referenzseiten übernommen wurde

**michael-milz.vercel.app**, eine Praxisseite: Die Überschriften sprechen vom
Besucher aus, nicht vom Betrieb. Statt „Unsere Leistungen" steht dort „Mit
welchen Beschwerden kommen Sie zu mir?". Das ist übertragbar: Ein Spediteur
sucht keine „Leistungsübersicht", er hat ein Fahrzeug, das steht.

Ebenfalls dort: Das Vertrauenselement steht weit oben, nicht erst im unteren
Drittel.

## Knöpfe

**Logos auf dunklem Grund** bekommen eine helle Fläche darunter. Umfärben
hilft nicht: Viele Logodateien sind selbst weiß hinterlegt, ein Invertieren
macht daraus einen schwarzen Kasten.

**Manche Logos sind weiße Grafik auf Transparenz** und auf hellem Grund
unsichtbar. Das TÜV-Logo von rolltruck.de fehlte deshalb in der hellen
Kartenfassung. Beim Holen wird jetzt gemessen, wie viele Bildpunkte wirklich
dunkel sind; unter vier Prozent heißt: braucht dunklen Grund. Der Wert steht
in `bilder/herkunft.json` als `brauchtDunkel` und muss an den Baustein
weitergereicht werden.

Der Durchschnitt taugt dafür nicht. Das Vergölst-Logo ist ein gelber Kasten
mit dunkler Schrift, kam auf 0,68 mittlere Helligkeit und wäre fälschlich auf
dunklen Grund gewandert.

`knopfPille` ist der betonte Knopf für Kopfbereiche: Text in einer Pille,
daneben ein eigener Kreis mit Pfeil, der beim Überfahren hinauswandert,
während ein zweiter von links hereinkommt. Nur einmal je Seite verwenden,
sonst verliert er seine Wirkung.


## Hervorgehobene Karten

Auf einer Karte mit `wichtig: true` ist der Grund bereits die Akzentfarbe.
Alles, was sonst den Akzent als Schriftfarbe nimmt, stünde dort unsichtbar:
Die Kennzahl im Bento kam auf Kontrast 1,0, rot auf rot. Innerhalb solcher
Karten wird die Schriftfarbe deshalb auf Weiß umgestellt. Wer eigene Farben
in einer Karte setzt, muss das bedenken.


## Nichts kürzen

Kein Baustein darf Einträge weglassen, weil sie nicht ins Muster passen. Hat
ein Betrieb zehn Leistungen, stehen zehn auf der Seite. Passt die Anzahl nicht
zum Raster, gleicht sich das Raster an, nicht der Inhalt. Die Ausschnitte auf
den Prüfseiten sind nur dort, um verschiedene Anzahlen zu zeigen.

## Zeichen

`zeichen(name)` bricht bei einem unbekannten Namen ab und nennt die
vorhandenen. Vorher lieferte es stillschweigend nichts, und auf der Seite
stand ein leerer Kasten: Im Fußbereich blieb der runde Knopf für soziale
Netzwerke leer, weil es `pfeilauf` im Zeichensatz nicht gab. Ein
fehlgeschlagener Bau ist besser als eine Seite mit unsichtbaren Zeichen.


## Vertrauen: Auszeichnungen, Siegel, Partnermarken

Zwei Fassungen, Prüfseite `_vertrauen`. Kundenstimmen gehören nicht hierher,
die werden ein eigener Baustein.

`vertrauenDuo` — zwei Karten nebeneinander. Links Siegel und Marken als
Kacheln, darunter Überschrift und ein Absatz, der sagt, was die Auszeichnung
wert ist. Rechts ein Foto vom Betrieb mit einer Aussage und der Bewertung.
Erste Wahl, sobald ein brauchbares Foto da ist. Ohne `bild` läuft die linke
Karte auf die ganze Breite, das trägt auch. Drei bis neun Kacheln.

`vertrauenStreu` — Überschrift und Vorlauf links, rechts ein Streufeld aus
Kacheln mit absichtlichen Lücken. Braucht kein Foto. Fünf bis vierzehn Logos
sitzen am besten. Das Raster wächst mit der Anzahl: drei Spalten bis drei
Logos, vier bis sechs, danach fünf, und so viele Zeilen, dass rund vierzig
Prozent belegt sind. Bei zwei Logos standen sonst dreiundzwanzig leere
Kacheln daneben, das sah nicht luftig aus, sondern leer.

### Die Maske darf keine Logos fressen

Das Streufeld wird nach außen ausgeblendet, damit die leeren Kacheln
weich auslaufen. Beim ersten Bau lag diese Maske auch über dem Kachelfeld
der Duo-Karte: achtzehn Logos kamen auf Deckkraft 0, darunter beide
Siegel "Werkstatt des Jahres". Ein Baustein für Auszeichnungen, der
Auszeichnungen unsichtbar macht. Die Maske ist dort jetzt weg; das
Auslaufen übernehmen die leeren Füllkacheln.

Im Streufeld bleibt sie, aber der Baustein rechnet vor dem Bauen aus,
welche Fassung alle belegten Kacheln über Deckkraft 0,6 hält — weit,
dicht, oder gar keine. Bei sechsundzwanzig Logos ist das Feld so voll,
dass es nichts mehr auszublenden gibt, und die Maske fällt weg.

### Kacheln sind 4:3, nicht quadratisch

Die Vorlage benutzt quadratische Kacheln, weil dort quadratische
Markenzeichen liegen. Was wir von echten Seiten holen, sind breite
Schriftzüge: das TÜV-Logo ist 630 × 302. Im Quadrat blieben davon
fünfzig Pixel Breite übrig, der Schriftzug war nicht mehr zu lesen.

### Sterne werden nicht geraten

`bewertung({ note, anzahl, quelle })` zeigt Sterne nur, wenn eine Note da
ist. Bei Roll Truckservice haben wir 301 Bewertungen, aber keine Note —
dann steht nur die Zahl. Die Note wird aus dem gemessenen Wert gefüllt,
nicht gerundet: eine Reihe leerer Sterne, darüber eine beschnittene Reihe
voller. 4,7 ergibt 94 Prozent Breite, gemessen 86 von 92 Pixeln.

### Klassennamen, die es nicht gibt

`entwuerfe/pruefen.mjs` misst eine gebaute Seite auf Querüberlauf,
Kontrast, nicht geladene Bilder, zu klein geratene Logos, von einer Maske
verschluckte Logos — und auf Klassennamen, zu denen es keine Regel gibt.
Der letzte Punkt kam dazu, weil ich in diesem Baustein zweimal eine
Klasse geschrieben habe, die es nicht gibt: `stapel-2` statt `stapel-3`,
und `sterne__leer` ohne Regel. Beides fällt beim Hinsehen nicht auf, die
Abstände sitzen nur falsch. Die anderen fünf Prüfseiten sind sauber.


## Kundenstimmen

Drei Fassungen, Prüfseite `_stimmen`. Beispiele erfunden und
branchenneutral, als Porträt das Platzhalterbild.

Unter drei Stimmen gibt es kein Modul — die Bausteine brechen ab. Zu lange
Bewertungen werden am Satzende gekürzt. Keine Vorzeile; die bekommt eine
eigene Kategorie.

`stimmenSpalten` — drei langsam laufende Spalten, oben und unten
ausgeblendet. Die einzige Fassung ohne Bilder und damit die einzige, die
allein aus Google-Bewertungen entsteht. Hält beim Überfahren an.

`stimmenBuehne` — eine Stimme auf einmal, daneben ein Stapel Porträts.
Braucht Bilder.

`stimmenBilder` — Zitat über einem Foto. Braucht Bilder.

### Was der Browser mitbringt, und was es kostet

`blockquote` und `figure` bekommen vom Browser je 40 Pixel Rand links und
rechts. Beim Zitat stand der Text dadurch eingerückt statt bündig. Bei den
Karten war die Wirkung größer und schwerer zu sehen: Die Lücke zwischen den
Spalten war 97 Pixel breit, obwohl `gap` auf 14 stand — die Lücke kam gar
nicht vom `gap`, sondern vom Rand der Karten, und die Karten waren
entsprechend schmal. Nach `blockquote,figure{margin:0}` sind die Karten 362
statt 282 Pixel breit.

### Der Schleier über dem Foto, zweimal falsch

Erst begann der Verlauf bei 35 Prozent Höhe — auf einem hellen Foto stand
das Zitat damit auf Weiß. Dann lag er über der ganzen Karte und fraß das
Gesicht. Jetzt trägt die Karte nur einen Hauch, und der dunkle Grund hängt
am Textblock: Der ist genau so hoch wie der Text, also stimmt es bei jeder
Zitatlänge.

### Der Stapel

Bei 32 Prozent Versatz und 0,84 Größe ragte von den hinteren Karten nur ein
Rand hervor, ihre Initialen lagen hinter der mittleren. Jetzt sind sie fast
so groß wie die Mitte, leicht gedreht, und schauen oben und seitlich heraus.
