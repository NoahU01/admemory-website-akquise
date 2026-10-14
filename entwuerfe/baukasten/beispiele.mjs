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

/* Platzhalter-Porträt für die Bibliothek: Noahs eigenes Bild von
   admemory.de. Fremde Gesichter kommen hier nicht hinein — die anderen
   Porträts auf der Seite gehören anderen Leuten. Dasselbe Bild für alle
   Stimmen macht außerdem sofort klar, dass es ein Beispiel ist. */
export const PORTRAET = '../baukasten/beispiel-bilder/noah.webp';
export const STIMMEN_MIT_BILD = STIMMEN.map((s) => ({ ...s, bild: PORTRAET }));

/* Freie Bilder für die allgemeinen Beispiele. Alle CC0, Herkunft und
   Urheber stehen in beispiel-bilder/herkunft.json. Geholt mit
   bilder-holen.mjs, damit es nachvollziehbar bleibt. */
const BV = '../baukasten/beispiel-bilder/';
export const ALLGEMEIN = {
  werkstatt: BV + 'werkstatt.jpg',
  handwerk:  BV + 'handwerk.jpg',
  team:      BV + 'team.jpg',
  bau:       BV + 'bau.jpg',
  lkw:       BV + 'lkw.jpg',
  buero:     BV + 'buero.jpg',
  werkzeug:  BV + 'werkzeug.jpg',
  beratung:  BV + 'beratung.jpg',
};

/* Platzhalter-Marken für Logoleisten. Echte fremde Logos gehören nicht in
   eine allgemeine Bibliothek — diese sind als Schrift gezeichnet und
   offensichtlich erfunden. */
const wortmarke = (wort) => {
  /* Ein rohes & macht das SVG als XML ungültig — "Brandt & Co" lud gar
     nicht, und im Laufband klaffte eine Lücke. */
  const sauber = String(wort).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56">`
    + `<text x="110" y="38" text-anchor="middle" font-family="Inter,Arial,sans-serif" `
    + `font-size="26" font-weight="700" fill="#11161d" letter-spacing="-0.5">${sauber}</text></svg>`);
};
export const MARKEN = ['Nordhaus', 'Vektor', 'Stellar', 'Brandt & Co', 'Aurum',
  'Lindner', 'Pfeil', 'Keramos'].map((w) => ({ name: w, pfad: wortmarke(w) }));

/* Leistungen eines erfundenen Elektrobetriebs — breit genug, dass jede
   Rasterfassung damit vorführbar ist. */
export const LEISTUNGEN = [
  { titel: 'Störungsdienst', icon: 'notruf', wichtig: true,
    text: 'Wenn der Strom weg ist, zählt die erste Stunde. Wir sind rund um die Uhr erreichbar und im Notfall innerhalb von zwei Stunden vor Ort.',
    punkte: ['Rund um die Uhr erreichbar', 'Zwei Stunden Anfahrt im Umkreis', 'Auch an Wochenenden'],
    zahl: '2 h', zahlLabel: 'bis jemand da ist' },
  { titel: 'Elektroinstallation', icon: 'werkzeug', text: 'Neubau, Umbau und Sanierung für Privat und Gewerbe.' },
  { titel: 'Anlagenprüfung', icon: 'pruefung', text: 'Wiederkehrende Prüfung ortsfester Anlagen nach DGUV V3.' },
  { titel: 'Beleuchtung', icon: 'haus', text: 'Planung und Umbau auf LED, innen wie außen.' },
  { titel: 'Photovoltaik', icon: 'teile', text: 'Anlage, Speicher und Anmeldung beim Netzbetreiber.' },
  { titel: 'Ladetechnik', icon: 'tankstelle', text: 'Wallboxen für Zuhause und Ladepunkte für den Betrieb.' },
  { titel: 'Netzwerktechnik', icon: 'uhr', text: 'Datenverkabelung und Technikräume im Betrieb.' },
  { titel: 'Smart Home', icon: 'haken', text: 'Steuerung für Licht, Heizung und Rollläden.' },
  { titel: 'Wartungsvertrag', icon: 'miete', text: 'Feste Termine, feste Preise, ein Ansprechpartner.' },
];
