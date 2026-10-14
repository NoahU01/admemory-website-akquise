/* Beispieldaten für die Bibliothek. Bewusst erfunden und branchenneutral:
   Die Bibliothek soll zeigen, wie ein Modul allgemein aussieht, nicht wie es
   bei einem bestimmten Kunden aussieht. Das echte Material bleibt auf den
   Prüfseiten, wo es gegen die Wirklichkeit testet — verwaschene
   Panoramabanner, breite Schriftzug-Logos, fehlende Noten.

   Die Texte sind so lang, wie Google-Bewertungen wirklich sind: zwei bis
   vier Zeilen, keine Werbesprache. */

export const STIMMEN = [
  { text: 'Angerufen, zwei Stunden später war jemand da. Dass das überhaupt noch '
      + 'jemand so macht, hätte ich nicht gedacht.',
    name: 'M. Keller', rolle: 'Kunde seit 2019', note: 5 },
  { text: 'Preis wurde vorher genannt und am Ende stand genau das auf der Rechnung. '
      + 'Keine Überraschungen, keine Diskussion.',
    name: 'Sabine Vogt', rolle: 'Privatkundin', note: 5 },
  { text: 'Wir lassen hier seit Jahren alles machen. Wenn mal etwas nicht passt, '
      + 'wird es ohne Theater nachgebessert.',
    name: 'Thomas Reinhardt', rolle: 'Geschäftsführer', note: 4 },
  { text: 'Termin kurzfristig bekommen, Arbeit sauber erledigt, Werkstatt besenrein '
      + 'hinterlassen. Mehr erwarte ich nicht.',
    name: 'A. Brunner', rolle: 'Privatkunde', note: 5 },
  { text: 'Freundlich am Telefon und am Tresen. Man merkt, dass die Leute dort '
      + 'schon lange zusammenarbeiten.',
    name: 'Christine Wolf', rolle: 'Kundin seit 2021', note: 5 },
  { text: 'Einmal hat es länger gedauert als angekündigt, aber man hat uns von sich '
      + 'aus angerufen und Bescheid gesagt. Das rechne ich hoch an.',
    name: 'Jens Albrecht', rolle: 'Gewerbekunde', note: 4 },
  { text: 'Beratung ohne Verkaufsgerede. Mir wurde abgeraten von der teureren '
      + 'Variante, weil sie für meinen Fall nichts bringt.',
    name: 'Petra Hoffmann', rolle: 'Privatkundin', note: 5 },
  { text: 'Zweimal hier gewesen, zweimal am selben Tag fertig geworden. '
      + 'Für uns zählt genau das.',
    name: 'R. Seidel', rolle: 'Fuhrparkleiter', note: 5 },
  { text: 'Alteingesessener Betrieb, der weiß, was er tut. Die Preise sind fair, '
      + 'die Arbeit hält.',
    name: 'Markus Lang', rolle: 'Kunde seit 2015', note: 5 },
];

/* Ohne Noten — der Normalfall, wenn wir die Stimmen aus einem alten
   Gästebuch oder von der bestehenden Seite übernehmen. */
export const STIMMEN_OHNE_NOTE = STIMMEN.slice(0, 3).map(({ note, ...r }) => r);
