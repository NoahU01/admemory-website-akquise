# Baukasten-Katalog

Welcher Baustein wann. Der Agent wählt danach, nicht nach Gefühl.

Jede Variante ist einmal gegen Extremfälle geprüft: sehr lange Überschrift,
fehlender Text, zu viele und zu wenige Einträge, 390 px Breite. Die Prüfseite
liegt unter `entwuerfe/_probe/`.

---

## Kopfbereiche

| Baustein | Wann |
|---|---|
| `hero` | Hochformatiges oder quadratisches Bild. Der sicherste, aber blasseste Aufbau. |
| `heroVoll` | Bild über die volle Breite, Text darüber. Braucht ein Bild, das auch abgedunkelt etwas zeigt. Die stärkste Fassung, erste Wahl bei brauchbarem Bildmaterial. |
| `heroBand` | Panoramabild, das als Ausschnitt nichts hergibt. Text oben, breites Band darunter. |

Ohne brauchbares Bild keine der drei: dann Text plus `zahlen`.

## Verläufe, Historie, Vorgehen

Alle drei tragen denselben Inhalt. Die Wahl hängt an Menge und Textlänge.

| Baustein | Trägt | Wann |
|---|---|---|
| `verlaufSeitlich` | 4 bis 7 Einträge | Links Fließtext, rechts Karten an einer Linie. Braucht links genug Text, sonst steht die Spalte leer. Jahreszahlen als `marke` werden automatisch zur Pille. `icon` nur setzen, wenn es wirklich eine Checkliste ist. |
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
