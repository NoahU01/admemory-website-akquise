/* Prüfseite für die Logoleisten. Allgemeine Beispiele mit Platzhalter-
   Wortmarken, daneben echte Partnerlogos von Roll Truckservice — teils
   freigestellt, teils weiß hinterlegt. Genau diese Mischung bekommen wir
   von alten Seiten. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { MARKEN } from '../baukasten/beispiele.mjs';
import { logowandKarten, logowandLauf, ERSCHEINEN_SKRIPT } from '../baukasten/bausteine.mjs';

const P = '../rolltruck/bilder/';
const herkunft = JSON.parse(fs.readFileSync(new URL('../rolltruck/bilder/herkunft.json', import.meta.url), 'utf8'));
const logo = (name, datei) => ({ name, pfad: P + datei, brauchtDunkel: !!herkunft[datei]?.brauchtDunkel });
const echt = [
  logo('Schmitz Cargobull', 'partner_SchmitzCargobull.png'),
  logo('Vergölst', 'partner_Verglst.png'),
  logo('Krone', 'partner_Krone.png'),
  logo('TÜV', 'partner_TV.png'),
];
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;
const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};

const html = seite({
  titel: 'Prüfseite für die Logoleisten im Baukasten',
  beschreibung: 'Interne Prüfseite: Karten und Laufband mit Platzhaltern und echten Logos.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('logowandKarten · vier Marken · erste Wahl'),
    bsp('logowandKarten', logowandKarten({ titelLeise: 'Wir arbeiten mit', titel: 'diesen Marken.',
      logos: MARKEN.slice(0, 4) })),

    marke('logowandKarten · mit echten Logos von Roll Truckservice'),
    logowandKarten({ titelLeise: 'Vertragspartner für', titel: 'sechs Marken.', logos: echt }),

    marke('logowandLauf · acht Marken · läuft, hält beim Überfahren an'),
    bsp('logowandLauf', logowandLauf({ titelLeise: 'Seit über zwanzig Jahren',
      titel: 'an unserer Seite.', logos: MARKEN })),

    marke('logowandLauf · auf dunklem Grund'),
    logowandLauf({ titel: 'Dieselben Marken, dunkler Grund.', logos: MARKEN, tief: true }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('Karten mit zwei Logos', () => logowandKarten({ titel: 'x', logos: MARKEN.slice(0, 2) }))}</li>
      </ul>
    </div>`,
  ].join('\n'),
  skripte: ERSCHEINEN_SKRIPT,
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_logos geschrieben,', (html.length / 1024).toFixed(1), 'kB');
