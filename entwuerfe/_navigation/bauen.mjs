/* Prüfseite für die Navigationen. Alle Fassungen untereinander, deshalb
   mit probe:true — sonst würde jede am oberen Rand kleben bleiben. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { LOGO } from '../baukasten/beispiele.mjs';
import { navKnopf, navTelefon, navSchwebend, navSchlicht,
         ankuendigung, ANKUENDIGUNG_SKRIPT } from '../baukasten/bausteine.mjs';

const punkte = [
  { text: 'Leistungen', href: '#leistungen' },
  { text: 'Der Betrieb', href: '#betrieb' },
  { text: 'Referenzen', href: '#referenzen' },
  { text: 'Jobs', href: '#jobs' },
  { text: 'Kontakt', href: '#kontakt' },
];
const wenige = punkte.slice(0, 3);
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;
const probe = (was, fn) => { try { fn(); return `${was}: KEIN ABBRUCH — Fehler`; }
  catch (e) { return `${was}: ${e.message}`; } };

const html = seite({
  titel: 'Prüfseite für die Navigationen im Baukasten',
  beschreibung: 'Interne Prüfseite: fünf Navigationsfassungen und das Ankündigungsband.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('navKnopf · wenige Punkte, ein großer Knopf · für kleine Betriebe'),
    bsp('navKnopf', navKnopf({ betrieb: 'Berger Elektrotechnik', logo: LOGO, logoEinfarbig: true, nav: wenige, probe: true,
      knopf: { text: 'Termin anfragen', href: '#termin' } })),

    marke('navTelefon · zweistöckig mit Telefonnummer oben'),
    bsp('navTelefon', navTelefon({ betrieb: 'Berger Elektrotechnik', logo: LOGO, logoEinfarbig: true, nav: punkte, probe: true,
      telefon: '+4979511234560', telefonText: '07951 123456-0',
      zeile: 'Mo–Do 7–17 Uhr · Fr 7–13 Uhr · Störungsdienst rund um die Uhr',
      knopf: { text: 'Termin anfragen', href: '#termin' } })),

    marke('navSchwebend · Leiste als Karte, mit Abstand zum Rand'),
    bsp('navSchwebend', navSchwebend({ betrieb: 'Berger Elektrotechnik', logo: LOGO, logoEinfarbig: true, nav: punkte, probe: true,
      leise: { text: 'Anrufen', href: 'tel:+49' },
      knopf: { text: 'Termin anfragen', href: '#termin' }, rund: true })),

    marke('navSchlicht · nur Wortmarken, kein Knopf'),
    bsp('navSchlicht', navSchlicht({ betrieb: 'Berger Elektrotechnik', logo: LOGO, logoEinfarbig: true, nav: punkte, probe: true })),

    marke('ankuendigung · dunkel und in der Akzentfarbe'),
    bsp('ankuendigung', ankuendigung({ text: 'Vom 23. Dezember bis 6. Januar ist das Büro geschlossen.',
      link: '#kontakt', linkText: 'Störungsdienst erreichen' })),
    ankuendigung({ text: 'Neu: Wallbox-Förderung bis 900 € — wir übernehmen den Antrag.',
      link: '#leistungen', tief: false }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('navKnopf mit fünf Punkten', () => navKnopf({ betrieb: 'x', nav: punkte }))}</li>
        <li>${probe('navTelefon ohne Nummer', () => navTelefon({ betrieb: 'x', nav: punkte }))}</li>
        <li>${probe('Ankündigung ohne Text', () => ankuendigung({}))}</li>
      </ul>
    </div>`,
  ].join('\n'),
  skripte: ANKUENDIGUNG_SKRIPT,
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_navigation geschrieben,', (html.length / 1024).toFixed(1), 'kB');
