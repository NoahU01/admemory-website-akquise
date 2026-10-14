/* Was in der Bibliothek im Dashboard steht. Eine Wahrheit, nicht zwei:
   die Beispiele sind dieselben, die auf den Prüfseiten stehen — dort mit
   bsp() ausgezeichnet, von hier beschrieben, von export-bibliothek.mjs
   abfotografiert. Wer einen Baustein ändert, ändert damit die Bibliothek. */

export const bsp = (id, html) => `<div data-bsp="${id}">${html}</div>`;

export const GRUPPEN = [
  { id: 'hero', icon: 'kopfbereich', name: 'Kopfbereiche', seite: '_hero',
    zweck: 'Der erste Bildschirm. Vorzeile mit dem Kerngeschäft, Überschrift, ein Satz, Knöpfe.' },
  { id: 'vertrauen', icon: 'siegel', name: 'Vertrauen', seite: '_vertrauen',
    zweck: 'Auszeichnungen, Siegel, Partnermarken, Bewertungen. Kundenstimmen kommen getrennt.' },
  { id: 'stimmen', icon: 'stimmen', name: 'Kundenstimmen', seite: '_stimmen',
    zweck: 'Was Kunden sagen. Aus den Google-Bewertungen übernommen, nie umgeschrieben.' },
  { id: 'leistungen', icon: 'bento', name: 'Leistungen', seite: '_leistungen',
    zweck: 'Was der Betrieb anbietet. Nie kürzen, auch wenn es nicht ins Raster passt.' },
  { id: 'logos', icon: 'logowand', name: 'Logowände', seite: '_logos',
    zweck: 'Partner und Marken als Logos, nie als Textpillen.' },
  { id: 'verlauf', icon: 'verlauf', name: 'Verläufe', seite: '_probe',
    zweck: 'Abläufe, Historie, Vorgehen — alles, was eine Reihenfolge hat.' },
  { id: 'fuss', icon: 'fussbereich', name: 'Fußbereiche', seite: '_fuss',
    zweck: 'Kontakt, Wege, Rechtliches. Immer auf dunklem Grund mit .auf-dunkel.' },
];

export const BAUSTEINE = [
  { id: 'heroMitte', gruppe: 'hero', name: 'Mittig mit Bild darunter', erste: true,
    wann: 'Erste Wahl. Trägt jedes Gewerbe und kommt mit einem einzigen Querformat aus.',
    grenzen: 'Braucht ein Bild im Breitformat. Partnerlogos darunter sind möglich, aber nicht nötig.' },
  { id: 'heroGeteilt', gruppe: 'hero',
    wann: 'Wenn es drei bis vier harte Merkmale gibt, die sofort stehen sollen.',
    name: 'Geteilt mit Merkmalen',
    grenzen: 'Die Merkmale brauchen Zeichen aus ZEICHEN. Bei nur einem Merkmal wirkt die Spalte leer.' },
  { id: 'heroVoll', gruppe: 'hero', name: 'Bild über die volle Breite',
    wann: 'Nur bei einem wirklich guten, großen Foto.',
    grenzen: 'Hat einen dunklen Grund hinterlegt, falls das Bild nicht lädt. Schlechte Fotos fallen hier am meisten auf.' },
  { id: 'heroBand', gruppe: 'hero', name: 'Schmales Band',
    wann: 'Für Unterseiten, nicht für die Startseite.',
    grenzen: 'Trägt keine lange Erklärung.' },

  { id: 'vertrauenDuo', gruppe: 'vertrauen', name: 'Kachelkarte neben Bildkarte', erste: true,
    wann: 'Erste Wahl, sobald ein brauchbares Foto vom Betrieb da ist.',
    grenzen: 'Drei bis neun Kacheln. Ohne Bild läuft die linke Karte auf volle Breite. Sterne nur, wenn eine Note vorliegt — sonst steht nur die Anzahl.' },
  { id: 'vertrauenStreu', gruppe: 'vertrauen', name: 'Streufeld mit Lücken',
    wann: 'Wenn kein Foto da ist, aber genug Logos.',
    grenzen: 'Fünf bis vierzehn Logos sitzen am besten. Das Raster wächst mit der Anzahl; ab etwa der Hälfte belegt fällt die Maske weg, damit sie kein Logo verschluckt.' },

  { id: 'stimmenSpalten', gruppe: 'stimmen', name: 'Laufende Spalten', erste: true,
    wann: 'Erste Wahl. Die einzige Fassung ohne Bilder — und damit die einzige, die allein aus Google-Bewertungen entsteht. Ab sechs Stimmen am besten.',
    grenzen: 'Unter drei Stimmen bricht der Baustein ab, darunter gibt es kein Modul. Beim Überfahren hält der Lauf an; wer Bewegung abgestellt hat, bekommt die Liste ohne Deckel.' },
  { id: 'stimmenBuehne', gruppe: 'stimmen', name: 'Eine nach der anderen',
    wann: 'Bei drei bis sechs ausgesuchten Stimmen, wenn es Porträts gibt.',
    grenzen: 'Ohne Bilder bricht der Baustein ab. Bei gleichen Bildern wirkt der Stapel flach — er lebt von verschiedenen Gesichtern.' },
  { id: 'stimmenBilder', gruppe: 'stimmen', name: 'Zitat über Foto',
    wann: 'Wenn es gute Bilder gibt. Das Foto ist die Karte, unten steht nur der Name.',
    grenzen: 'Ohne Bilder bricht der Baustein ab. Hochformate und Szenen aus dem Betrieb sitzen besser als quadratische Porträts, die unten angeschnitten werden.' },

  { id: 'leistungenBento', gruppe: 'leistungen', name: 'Bento-Raster', erste: true,
    wann: 'Erste Wahl bei fünf bis neun Leistungen.',
    grenzen: 'Die letzte Zeile gleicht sich an, damit keine Lücke bleibt. Unter fünf Einträgen wird es schmal.' },
  { id: 'leistungen', gruppe: 'leistungen', name: 'Gleichmäßiges Raster',
    wann: 'Bei sehr vielen Leistungen oder wenn alle gleich wichtig sind.',
    grenzen: 'Spaltenzahl einstellbar. Kürzt nie.' },

  { id: 'logowandKarten', gruppe: 'logos', name: 'Karten', erste: true,
    wann: 'Erste Wahl. Trägt schon ab zwei Logos.',
    grenzen: 'Weiße Grafik auf Transparenz bekommt dunklen Grund — gemessen, nicht geraten.' },
  { id: 'logowandGitter', gruppe: 'logos', name: 'Freies Gitter',
    wann: 'Ab etwa sechs Logos, erscheinen nacheinander beim Hereinscrollen.',
    grenzen: 'Ohne Rahmen; sehr helle Logos brauchen den dunklen Grund.' },
  { id: 'logowandLauf', gruppe: 'logos', name: 'Laufband',
    wann: 'Wenn viele Marken da sind und Bewegung passt.',
    grenzen: 'Braucht mindestens sechs Logos, sonst klafft eine Lücke. Die Liste wird dafür wiederholt.' },

  { id: 'verlaufSeitlich', gruppe: 'verlauf', name: 'Senkrecht mit Text daneben', erste: true,
    wann: 'Vier bis sieben Schritte mit je zwei bis drei Zeilen Text.',
    grenzen: 'Braucht links genug Text, sonst steht die Spalte leer.' },
  { id: 'verlaufWaagerecht', gruppe: 'verlauf', name: 'Waagerechte Stationen',
    wann: 'Drei bis fünf Stationen mit sehr kurzem Text.',
    grenzen: 'Ab sechs wird es am Rechner eng.' },
  { id: 'verlaufSchmal', gruppe: 'verlauf', name: 'Schmale Spalte',
    wann: 'Wenn der Verlauf neben anderem Inhalt stehen soll.',
    grenzen: 'Trägt keine langen Absätze.' },

  { id: 'fussKontakt', gruppe: 'fuss', name: 'Mit Kontaktspalte', erste: true,
    wann: 'Erste Wahl. Anschrift, Telefon, Zeiten direkt im Fuß.',
    grenzen: 'Logo auf dunklem Grund braucht die weiße Fassung, wenn es eine gibt.' },
  { id: 'fussSpalten', gruppe: 'fuss', name: 'Mehrspaltig',
    wann: 'Bei vielen Unterseiten, die verlinkt werden sollen.',
    grenzen: 'Bei zwei Unterseiten wirken die Spalten leer.' },
];
