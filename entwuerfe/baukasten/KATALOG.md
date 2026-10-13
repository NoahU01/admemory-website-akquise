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
| `kontakt` | Anschrift, Zeiten, Telefon. Immer am Seitenende. |
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
