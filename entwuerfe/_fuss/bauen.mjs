/* Prüfseite für die Fußbereiche. Der Fuß der Seite selbst ist die dunkle
   Kontaktfassung — sie steht unten und ist damit zugleich Beispiel.

   Die abgespeckten Fassungen sind raus: Einen Fußbereich ohne Telefonzeiten
   oder ohne Spalten bauen wir nicht, dafür ist er zu wichtig. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { fussKontakt, fussSpalten } from '../baukasten/bausteine.mjs';

const P = '../rolltruck/bilder/';
const zeiten = [
  { tag: 'Montag bis Freitag', zeit: '6:00 – 20:00 Uhr' },
  { tag: 'Samstag', zeit: '7:00 – 13:00 Uhr' },
  { tag: 'Notdienst', zeit: 'rund um die Uhr' },
];
const recht = [{ text: 'Impressum', href: '#' }, { text: 'Datenschutz', href: '#' }];
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Fußbereiche im Baukasten',
  beschreibung: 'Interne Prüfseite: Beide Fußbereiche hell und dunkel, mit vielen und mit wenigen Angaben.',
  betrieb: 'Baukasten', nav: [],
  fuss: fussKontakt({ betrieb: 'Roll Truckservice GmbH', logo: P + 'logoWeiss.png', dunkel: true,
    anschrift: ['Ludwig-Erhard-Straße 102', '74564 Crailsheim'],
    telefon: '+497951297930', telefonText: 'Werkstatt 07951 29793-0',
    zweitnummer: '+4979516048', zweitnummerLabel: 'Notdienst 07951 6048',
    fax: '07951 29793-39', email: 'info@rolltruck.de', zeiten,
    zeitenHinweis: 'Der Notdienst ist außerhalb dieser Zeiten durchgehend besetzt.',
    knopf: { text: 'Notdienst 07951 6048', href: 'tel:+4979516048' }, recht }),
  inhalt: [
    marke('fussKontakt · hell, voll bestückt'),

    bsp('fussKontakt', fussKontakt({ betrieb: 'Roll Truckservice GmbH', logo: P + 'logo.png',
      anschrift: ['Ludwig-Erhard-Straße 102', '74564 Crailsheim'],
      telefon: '+497951297930', telefonText: 'Werkstatt 07951 29793-0',
      zweitnummer: '+4979516048', zweitnummerLabel: 'Notdienst 07951 6048',
      fax: '07951 29793-39', email: 'info@rolltruck.de', zeiten,
      zeitenHinweis: 'Der Notdienst ist außerhalb dieser Zeiten durchgehend besetzt.',
      knopf: { text: 'Notdienst 07951 6048', href: 'tel:+4979516048' }, recht })),

    marke('fussSpalten · dunkel, drei Spalten'),

    bsp('fussSpalten', fussSpalten({ betrieb: 'Roll Truckservice GmbH', logo: P + 'logoWeiss.png', dunkel: true,
      text: 'Werkstatt für alle Nutzfahrzeugmarken in Crailsheim, mit Notdienst rund um die Uhr.',
      spalten: [
        { titel: 'Leistungen', links: [{ text: 'Kundendienst', href: '#' }, { text: 'Reifenservice', href: '#' },
          { text: 'Ersatzteile', href: '#' }, { text: 'Prüfservice', href: '#' }] },
        { titel: 'Betrieb', links: [{ text: 'Geschichte', href: '#' }, { text: 'Jobs', href: '#' },
          { text: 'Ausbildung', href: '#' }] },
      ],
      anschrift: ['Ludwig-Erhard-Straße 102', '74564 Crailsheim'],
      telefon: '+497951297930', telefonText: '07951 29793-0', email: 'info@rolltruck.de',
      sozial: [{ name: 'LinkedIn', href: '#', icon: 'pfeilauf' }], recht })),

    /* Darunter folgt der Fußbereich der Prüfseite selbst — die dunkle
       Kontaktfassung. Ohne diese Trennung standen zwei Fußbereiche
       unmittelbar untereinander und sahen aus wie einer. */
    marke('fussKontakt · dunkel — das ist zugleich der Fuß dieser Seite'),

  ].join('\n'),
});
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Fuß-Prüfseite:', (html.length / 1024).toFixed(1), 'kB');
