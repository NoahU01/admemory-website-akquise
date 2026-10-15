/* Prüfseite für die Knöpfe. Jede Fassung hell und dunkel, weil fast jeder
   Knopf im Baukasten irgendwann auf beiden Gründen steht. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { knopf, knopfPaar, knopfPille } from '../baukasten/bausteine.mjs';

const block = (titel, inhalt, tief = false) => `
<section class="abschnitt--eng ${tief ? 'abschnitt--tief' : ''}">
  <div class="schale">
    <p class="ueber">${titel}</p>
    <div style="margin-top:var(--a-3)">${inhalt}</div>
  </div>
</section>`;

const html = seite({
  /* Schwarz statt der Akzentfarbe: In der Bibliothek geht es um Form und
     Maße, nicht um die Farbe eines bestimmten Kunden. */
  akzent: '#11161d',
  titel: 'Prüfseite für die Knöpfe im Baukasten',
  beschreibung: 'Interne Prüfseite: alle Knopffassungen hell und dunkel.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    block('knopfPaar · einer führt, einer bietet an · erste Wahl',
      bsp('knopfPaar', knopfPaar({ haupt: { text: 'Termin anfragen', href: '#termin' },
                  neben: { text: 'Leistungen ansehen', href: '#leistungen' } }))),

    block('knopfPaar · große Fassung für Kopfbereiche',
      knopfPaar({ haupt: { text: 'Termin anfragen', href: '#termin' },
                  neben: { text: 'Leistungen ansehen', href: '#leistungen' }, gross: true })),

    block('knopfPaar · beide sichtbar, der zweite mit Umriss',
      knopfPaar({ haupt: { text: 'Termin anfragen', href: '#termin' },
                  neben: { text: 'Rückruf anfordern', href: '#kontakt', art: 'rand' } })),

    block('Einzeln · gefüllt, Umriss, leise',
      [knopf({ text: 'Termin anfragen', href: '#', art: 'wichtig' }),
       knopf({ text: 'Rückruf anfordern', href: '#', art: 'rand' }),
       knopf({ text: 'Mehr erfahren', href: '#', art: 'leise' })]
        .join(' ')),

    block('Dieselben auf dunklem Grund',
      [knopf({ text: 'Termin anfragen', href: '#', art: 'wichtig' }),
       knopf({ text: 'Rückruf anfordern', href: '#', art: 'rand' }),
       knopf({ text: 'Mehr erfahren', href: '#', art: 'leise' })]
        .join(' '), true),

    block('Vollrund · die schlanke Fassung · hell',
      bsp('knopfRund', [knopf({ text: 'Termin anfragen', href: '#', art: 'wichtig', rund: true }),
       knopf({ text: 'Rückruf anfordern', href: '#', art: 'rand', rund: true }),
       knopf({ text: 'Mehr erfahren', href: '#', art: 'leise', rund: true })].join(' '))),

    block('Vollrund · auf dunklem Grund',
      [knopf({ text: 'Termin anfragen', href: '#', art: 'wichtig', rund: true }),
       knopf({ text: 'Rückruf anfordern', href: '#', art: 'rand', rund: true })].join(' '), true),

    block('Vollrund · große Fassung als Paar',
      knopfPaar({ haupt: { text: 'Termin anfragen', href: '#' },
                  neben: { text: 'Leistungen ansehen', href: '#' }, gross: true, rund: true })),

    block('knopfPille · Pfeil wandert beim Überfahren · nur einmal je Seite',
      bsp('knopfPille', knopfPille({ text: 'Unsere Leistungen', href: '#leistungen' })), true),

    block('Sehr langer Text · bricht um statt überzulaufen',
      knopfPaar({ haupt: { text: 'Unverbindliche Anfrage für einen Vor-Ort-Termin stellen', href: '#' },
                  neben: { text: 'Oder rufen Sie einfach an: 07951 123456-0', href: 'tel:+4979511234560' } })),
  ].join('\n'),
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_knoepfe geschrieben,', (html.length / 1024).toFixed(1), 'kB');
