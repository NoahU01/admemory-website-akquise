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
| `heroGeteilt` | Links Text mit drei Merkmalen und Knöpfen, rechts ein Bild, das zum Rand ausblendet. Wenn drei Argumente sofort genannt werden sollen, oder bei einem Bild mit klarem Motiv auf einer Seite. |
| `heroTiefe` | Wie `heroMitte`, aber das Bild wandert beim Scrollen langsamer. **Nur bei einem ruhigen, tiefen Motiv.** Bei einem unruhigen Bild wirkt die Bewegung billig. Braucht `TIEFE_SKRIPT` am Seitenende. |
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
| `leistungen` | Raster aus Karten mit Icon. Eine darf `wichtig: true` tragen und sticht farbig heraus. |
| `textBild` | Ein Gedanke mit einem Bild daneben. `bildRechts` abwechseln, aber nicht öfter als zweimal hintereinander. |
| `zahlen` | Vier Kennzahlen. Nur mit belegten Werten, keine Zahl ohne Aussage. |
| `zeitleiste` | Älter als die Verlaufsbausteine, Karten im Raster. Für Verläufe lieber einen der drei oben. |

## Vertrauen

| Baustein | Wann |
|---|---|
| `logoband` | Partner und Marken. **Immer als Logo, nie als Textpille.** Liegt kein Logo vor, gehört der Name in einen Satz daneben. |
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

`knopfPille` ist der betonte Knopf für Kopfbereiche: Text in einer Pille,
daneben ein eigener Kreis mit Pfeil, der beim Überfahren hinauswandert,
während ein zweiter von links hereinkommt. Nur einmal je Seite verwenden,
sonst verliert er seine Wirkung.
