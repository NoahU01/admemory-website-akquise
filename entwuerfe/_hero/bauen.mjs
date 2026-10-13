/* Prüfseite für die Hero-Varianten. Echte Bilder von Roll Truckservice,
   damit sichtbar wird, wie sie mit dem Material umgehen, das wir wirklich
   bekommen: Panoramabanner, keine Hochformate, mittlere Qualität. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { heroMitte, heroGeteilt, heroTiefe, TIEFE_SKRIPT } from '../baukasten/bausteine.mjs';

const B = {
  trucks: '../rolltruck/bilder/trucks.jpg',
  team: '../rolltruck/bilder/team.jpg',
  werkstatt: '../rolltruck/bilder/werkstatt.jpg',
};
const partner = [
  { name: 'Schmitz Cargobull', pfad: '../rolltruck/bilder/partner_SchmitzCargobull.png' },
  { name: 'Vergölst', pfad: '../rolltruck/bilder/partner_Verglst.png' },
  { name: 'Krone', pfad: '../rolltruck/bilder/partner_Krone.png' },
];
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Hero-Varianten im Baukasten',
  beschreibung: 'Interne Prüfseite: Die drei Hero-Fassungen mit echtem Bildmaterial und mit Überlänge.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('heroMitte · mit Partnerlogos'),
    heroMitte({
      ueber: 'Werkstatt & Notdienst für Nutzfahrzeuge',
      titel: 'Wenn der Lkw steht, zählt jede Stunde.',
      text: 'Werkstatt für alle Nutzfahrzeugmarken in Crailsheim. Der Notdienst rückt rund um die Uhr aus, von Crailsheim, Wörnitz und Burgoberbach.',
      knopfHaupt: { text: 'Unsere Leistungen', href: '#leistungen' },
      knoepfe: [{ text: 'Kontakt', href: '#kontakt' }],
      bild: B.trucks, bildAlt: 'Lastwagen von Roll Truck-Service',
      marken: partner,
    }),

    marke('heroMitte · Überlänge, ohne Logos'),
    heroMitte({
      ueber: 'Eine ungewöhnlich lange Vorzeile, die prüft, ob sie umbricht',
      titel: 'Eine Überschrift mit deutlich mehr Wörtern als vorgesehen, die über drei Zeilen laufen muss',
      text: 'Kurz.',
      knopfHaupt: { text: 'Mit einem sehr langen Knopftext', href: '#' },
      bild: B.werkstatt, bildAlt: 'Werkstatt',
    }),

    marke('heroGeteilt · mit Merkmalen'),
    heroGeteilt({
      plakette: 'Seit 1876',
      titel: 'Alles für das Nutzfahrzeug an einem Ort',
      text: 'Von der planbaren Wartung bis zur Bergung mitten in der Nacht. Vertragswerkstatt für sechs Marken, mit eigenem Lager und eigener Mannschaft.',
      merkmale: [
        { icon: 'notruf', text: 'Notdienst rund um die Uhr' },
        { icon: 'werkzeug', text: 'Vertragswerkstatt für sechs Marken' },
        { icon: 'haus', text: 'Drei Abschlepp-Standorte an A6 und A7' },
      ],
      knoepfe: [
        { text: 'Unsere Leistungen', href: '#leistungen', art: 'wichtig' },
        { text: 'Kontakt', href: '#kontakt' },
      ],
      bild: B.trucks, bildAlt: 'Lastwagen von Roll Truck-Service',
    }),

    marke('heroTiefe · Bild wandert beim Scrollen'),
    heroTiefe({
      ueber: 'Rund um die Uhr',
      titel: 'Notdienst',
      text: 'Abschleppen und Bergung für Lkw und Pkw. Nachts, am Wochenende, an Feiertagen.',
      knopfHaupt: { text: 'Jetzt anrufen', href: 'tel:+4979516048' },
      bild: B.trucks, bildAlt: 'Bergungsfahrzeug',
    }),
    '<div class="abschnitt"><div class="schale"><p class="lead">Scrollbereich, damit die Tiefenwirkung sichtbar wird.</p></div></div>',
    TIEFE_SKRIPT,
  ].join('\n'),
});
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Hero-Prüfseite:', (html.length / 1024).toFixed(1), 'kB');
