/* Prüfseite für die Logowände. Echte Dateien von Roll Truckservice: teils
   freigestellt, teils weiß hinterlegt. Genau diese Mischung bekommen wir
   von den alten Seiten. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { logowandGitter, logowandKarten, logowandLauf, ERSCHEINEN_SKRIPT } from '../baukasten/bausteine.mjs';

const P = '../rolltruck/bilder/';
/* brauchtDunkel aus der Messung beim Holen übernehmen, statt es zu raten. */
const herkunft = JSON.parse(fs.readFileSync(new URL('../rolltruck/bilder/herkunft.json', import.meta.url), 'utf8'));
const logo = (name, datei) => ({ name, pfad: P + datei, brauchtDunkel: !!herkunft[datei]?.brauchtDunkel });
const vier = [
  logo('Schmitz Cargobull', 'partner_SchmitzCargobull.png'),
  logo('Vergölst', 'partner_Verglst.png'),
  logo('Krone', 'partner_Krone.png'),
  logo('TÜV', 'partner_TV.png'),
];
const acht = [...vier, ...vier.map((l) => ({ ...l, name: l.name + ' ' }))];
const zwei = vier.slice(0, 2);
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Logowände im Baukasten',
  beschreibung: 'Interne Prüfseite: Die drei Logowand-Fassungen mit vier, acht und zwei Logos.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('Karten · vier Logos · erste Wahl'),

    bsp('logowandKarten', logowandKarten({ ueber: 'Vertragspartner', titelLeise: 'Wir arbeiten mit', titel: 'diesen Marken.',
      logos: vier, nachsatz: 'Dazu Vertragswerkstatt für Volvo Trucks und Iveco, DAF Vertragspartner und PEMA Stützpunkt.' })),

    marke('Karten · zwei Logos'),
    logowandKarten({ ueber: 'Vertragspartner', logos: zwei }),

    marke('Gitter · acht Logos · erscheinen beim Hereinscrollen'),

    bsp('logowandGitter', logowandGitter({ ueber: 'Vertragspartner und Stützpunkt', titelLeise: 'Seit über zwanzig Jahren',
      titel: 'an unserer Seite.', logos: acht })),

    marke('Gitter · auf dunklem Grund'),
    logowandGitter({ ueber: 'Vertragspartner', logos: vier, tief: true }),

    marke('Laufband · vier Logos, wiederholt sich bis es trägt'),

    bsp('logowandLauf', logowandLauf({ ueber: 'Vertragspartner', logos: vier })),

    marke('Laufband · acht Logos, dunkel'),
    logowandLauf({ ueber: 'Vertragspartner', logos: acht, tief: true, dauer: 46 }),

    '<div class="abschnitt"><div class="schale"><p class="lead">Scrollbereich, damit das Erscheinen sichtbar wird.</p></div></div>',
    ERSCHEINEN_SKRIPT,
  ].join('\n'),
});
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Logo-Prüfseite:', (html.length / 1024).toFixed(1), 'kB');
