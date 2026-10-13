/* Prüfseite für die Leistungs-Fassungen, mit den echten zehn Leistungen von
   Roll Truckservice und mit zu wenigen beziehungsweise zu vielen Einträgen. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { leistungen, leistungenBento } from '../baukasten/bausteine.mjs';

const echt = [
  { titel: '24h-Notdienst', icon: 'notruf', wichtig: true,
    text: 'Abschleppen und Bergung rund um die Uhr, für Lkw und seit 2024 auch für Pkw. Wir rücken von drei Standorten aus.',
    punkte: ['Crailsheim, Wörnitz, Burgoberbach', 'Auch nachts und am Wochenende', 'Ölspurbeseitigung inklusive'],
    zahl: '24/7', zahlLabel: 'erreichbar, jeden Tag im Jahr' },
  { titel: 'Kundendienst aller Marken', icon: 'werkzeug', text: 'Wartung und Reparatur für alle Nutzfahrzeugmarken.' },
  { titel: 'Reifenservice', icon: 'reifen', text: 'Reifen aller Marken für Nutzfahrzeuge.' },
  { titel: 'Ersatzteile und Zubehör', icon: 'teile', text: 'Teile aus dem eigenen Lager.' },
  { titel: 'Prüfservice', icon: 'pruefung', text: 'Wiederkehrende Prüfungen am Fahrzeug.' },
  { titel: 'Vermietung', icon: 'miete', text: 'Fahrzeuge zur Miete.' },
  { titel: 'LNG-Tankstelle', icon: 'tankstelle', text: 'Seit 2020 auf dem eigenen Firmengelände.' },
  { titel: 'Waschstraße', icon: 'wasser', text: 'Bio-Lkw-Waschanlage in Crailsheim.' },
  { titel: 'Reisemobile', icon: 'wohnmobil', text: 'Wartung und Reparatur für Wohnmobile.' },
];
const wenige = echt.slice(0, 3);
const viele = [...echt, { titel: 'Zusatzleistung A', icon: 'haken', text: 'Kurz.' },
                        { titel: 'Zusatzleistung B', icon: 'haken', text: 'Kurz.' }];
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Leistungs-Fassungen im Baukasten',
  beschreibung: 'Interne Prüfseite: Bento und Raster mit neun, drei und elf Einträgen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('Bento · neun Leistungen · mittige Kopfzeile'),
    leistungenBento({ ueber: 'Leistungen', mittig: true, titel: 'Alles für das Nutzfahrzeug an einem Ort',
      text: 'Von der planbaren Wartung bis zur Bergung mitten in der Nacht. Vertragswerkstatt für sechs Marken, mit eigenem Lager und eigener Mannschaft.',
      eintraege: echt }),

    marke('Bento · nur drei Leistungen'),
    leistungenBento({ ueber: 'Leistungen', titel: 'Drei Einträge', eintraege: wenige }),

    marke('Bento · sechs Einträge (Rest 1)'),
    leistungenBento({ titel: 'Sechs Einträge', eintraege: echt.slice(0, 6) }),

    marke('Bento · sieben Einträge (Rest 2)'),
    leistungenBento({ titel: 'Sieben Einträge', eintraege: echt.slice(0, 7) }),

    marke('Raster · mittige Kopfzeile, Icon im Kreis'),
    leistungen({ ueber: 'Leistungen', mittig: true, iconStil: 'kreis',
      titel: 'Alles für das Nutzfahrzeug an einem Ort',
      text: 'Von der planbaren Wartung bis zur Bergung mitten in der Nacht.',
      eintraege: echt.slice(1, 7) }),

    marke('Raster · elf Einträge, linksbündig, Icon im Kasten'),
    leistungen({ ueber: 'Leistungen', titel: 'Elf Einträge', eintraege: viele }),
  ].join('\n'),
});
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Leistungs-Prüfseite:', (html.length / 1024).toFixed(1), 'kB');
