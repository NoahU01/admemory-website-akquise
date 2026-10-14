/* Prüfseite für die Vertrauens-Module. Die mit bsp() ausgezeichneten
   Beispiele sind allgemein; daneben dieselbe Fassung mit echtem Material
   von Roll Truckservice, inklusive der echten Google-Note 4,4 aus 304
   Bewertungen. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { ALLGEMEIN, MARKEN } from '../baukasten/beispiele.mjs';
import { vertrauenDuo, vertrauenStreu, ERSCHEINEN_SKRIPT } from '../baukasten/bausteine.mjs';

const R = '../rolltruck/bilder/';
const herkunft = JSON.parse(fs.readFileSync(new URL('../rolltruck/bilder/herkunft.json', import.meta.url), 'utf8'));
const echt = (name, datei) => ({ name, pfad: R + datei, brauchtDunkel: !!herkunft[datei]?.brauchtDunkel });
const siegelEcht = [
  echt('Werkstatt des Jahres 2024', 'werkstatt24.svg'),
  echt('Werkstatt des Jahres 2025', 'werkstatt25.svg'),
  echt('150 Jahre Roll', 'siegel150.svg'),
  echt('Schmitz Cargobull', 'partner_SchmitzCargobull.png'),
  echt('Vergölst', 'partner_Verglst.png'),
  echt('Krone', 'partner_Krone.png'),
  echt('TÜV', 'partner_TV.png'),
];
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};
const proben = [
  probe('Streufeld mit zwei Logos', () => vertrauenStreu({ titel: 'x', logos: MARKEN.slice(0, 2) })),
  probe('Streufeld mit dreißig Logos', () => vertrauenStreu({ titel: 'x',
    logos: Array.from({ length: 30 }, (_, i) => MARKEN[i % MARKEN.length]) })),
];

const html = seite({
  titel: 'Prüfseite für die Vertrauens-Module im Baukasten',
  beschreibung: 'Interne Prüfseite: Auszeichnungen, Siegel und Partnermarken in beiden Fassungen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('vertrauenDuo · allgemein · erste Wahl'),
    bsp('vertrauenDuo', vertrauenDuo({
      ueber: 'Elektrotechnik für Gewerbe und Privat',
      titel: 'Geprüft, ausgezeichnet, weiterempfohlen.',
      text: 'Meisterbetrieb mit Innungszugehörigkeit, geprüfter Fachbetrieb für '
        + 'Blitzschutz und seit 2019 im Fachkreis Gebäudetechnik.',
      kacheln: MARKEN.slice(0, 7),
      bild: ALLGEMEIN.team, bildAlt: 'Team im Gespräch am Tisch',
      note: 4.8, anzahl: 127, quelle: 'Google',
    })),

    marke('vertrauenDuo · auf dunklem Grund'),
    vertrauenDuo({
      ueber: 'Elektrotechnik für Gewerbe und Privat',
      titel: 'Geprüft, ausgezeichnet, weiterempfohlen.',
      text: 'Dieselbe Fassung auf dunklem Grund.',
      kacheln: MARKEN.slice(0, 7),
      bild: ALLGEMEIN.beratung, bildAlt: 'Handschlag am Besprechungstisch',
      note: 4.8, anzahl: 127, quelle: 'Google', tief: true,
    }),

    marke('vertrauenDuo · mit echtem Material · Google-Note 4,4 aus 304 Bewertungen'),
    vertrauenDuo({
      ueber: 'Nutzfahrzeug-Werkstatt in Crailsheim',
      titel: 'Zweimal in Folge Werkstatt des Jahres.',
      text: 'Die Auszeichnung vergibt eine Fachjury an Betriebe, die bei Erreichbarkeit, '
        + 'Durchlaufzeit und Diagnosequalität vorne liegen.',
      kacheln: siegelEcht,
      bild: R + 'werkstatt.jpg', bildAlt: 'Blick in die Werkstatthalle',
      note: 4.4, anzahl: 304, quelle: 'Google',
    }),

    marke('vertrauenStreu · zwölf Logos · bewegt sich beim Überfahren'),
    bsp('vertrauenStreu', vertrauenStreu({
      ueber: 'Partner und Hersteller',
      titel: 'Alles aus einer Hand.',
      text: 'Wir arbeiten mit den Herstellern zusammen, deren Technik wir einbauen — '
        + 'das verkürzt Wege bei Ersatzteilen und Gewährleistung.',
      logos: [...MARKEN, ...MARKEN.slice(0, 4).map((m) => ({ ...m, name: m.name + ' Systeme' }))],
      nachsatz: 'Dazu Innungsbetrieb und eingetragener Fachbetrieb nach § 19 WHG.',
    })),

    marke('vertrauenStreu · auf dunklem Grund · achtzehn Logos'),
    vertrauenStreu({
      ueber: 'Partner und Hersteller', titel: 'Dieselben Marken, dunkler Grund.',
      text: 'Die Kacheln bleiben hell, damit die Logos nicht ausgeblichen wirken.',
      logos: Array.from({ length: 18 }, (_, i) => ({ ...MARKEN[i % MARKEN.length],
        name: MARKEN[i % MARKEN.length].name + ' ' + (i + 1) })),
      tief: true,
    }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        ${proben.map((z) => `<li>${z}</li>`).join('')}
      </ul>
    </div>`,
  ].join('\n'),
  skripte: ERSCHEINEN_SKRIPT,
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_vertrauen/index.html geschrieben,', (html.length / 1024).toFixed(1), 'kB');
