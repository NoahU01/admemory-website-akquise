/* Prüfseite für den Terminblock. Bewusst ohne eingebetteten Kalender —
   die Begründung steht im Baustein. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { terminAnfrage } from '../baukasten/bausteine.mjs';

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;
const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};
const zeiten = [
  { tag: 'Montag bis Donnerstag', zeit: '7:00 – 17:00 Uhr' },
  { tag: 'Freitag', zeit: '7:00 – 13:00 Uhr' },
  { tag: 'Störungsdienst', zeit: 'rund um die Uhr' },
];
const schritte = [
  { titel: 'Sie melden sich', text: 'Telefonisch oder über das Formular, mit ein paar Sätzen zum Anliegen.' },
  { titel: 'Wir melden uns am selben Tag', text: 'Werktags innerhalb von drei Stunden, auch wenn es nur eine Rückfrage ist.' },
  { titel: 'Fester Termin, kein Zeitfenster', text: 'Sie bekommen eine Uhrzeit. Verschiebt sie sich, rufen wir vorher an.' },
];

const html = seite({
  titel: 'Prüfseite für den Terminblock im Baukasten',
  beschreibung: 'Interne Prüfseite: Terminanfrage hell und dunkel.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('terminAnfrage · mit Ablauf, Telefonnummer und Zeiten'),
    bsp('terminAnfrage', terminAnfrage({
      titel: 'Termin anfragen',
      text: 'Kein Kalender, kein Konto, keine Anmeldung — ein Anruf oder drei Zeilen genügen.',
      schritte,
      telefon: '+4979511234560', telefonText: '07951 123456-0',
      zeiten,
      knopf: { text: 'Anfrage schreiben', href: '#kontakt' },
      hinweis: 'Außerhalb der Zeiten ist der Störungsdienst besetzt.',
    })),

    marke('terminAnfrage · auf dunklem Grund, ohne Ablauf'),
    terminAnfrage({
      titel: 'Termin anfragen',
      text: 'Dieselbe Fassung ohne Ablauf und auf dunklem Grund.',
      telefon: '+4979511234560', telefonText: '07951 123456-0',
      zeiten: zeiten.slice(0, 2),
      knopf: { text: 'Anfrage schreiben', href: '#kontakt' }, tief: true,
    }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('Termin ohne Telefon, Knopf und Einbettung', () => terminAnfrage({ titel: 'x' }))}</li>
        <li>${probe('Ablauf mit einem einzigen Schritt', () => terminAnfrage({ titel: 'x',
          telefon: '+49', schritte: [{ titel: 'a' }] }))}</li>
      </ul>
    </div>`,
  ].join('\n'),
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_termin geschrieben,', (html.length / 1024).toFixed(1), 'kB');
