/* Prüfseite für die Kundenstimmen. Die mit bsp() ausgezeichneten Beispiele
   sind neutral: erfundene Texte, als Porträt das Platzhalterbild.

   Was hier bewusst fehlt: eine Ansicht mit ein oder zwei Stimmen und eine
   mit Überlänge. Unter drei Stimmen wird kein Modul gebaut, und zu lange
   Bewertungen werden gekürzt. Beides ist im Baustein erzwungen, nicht nur
   vereinbart — die Proben unten zeigen, dass es wirklich abbricht. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { STIMMEN, STIMMEN_MIT_BILD } from '../baukasten/beispiele.mjs';
import { stimmenSpalten, stimmenBilder, stimmenBuehne, BUEHNE_SKRIPT } from '../baukasten/bausteine.mjs';

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

/* Was passiert, wenn man es falsch benutzt — als Text auf der Seite, damit
   die Regel sichtbar ist und nicht nur in einer Datei steht. */
const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};
const proben = [
  probe('zwei Stimmen', () => stimmenSpalten({ titel: 'x', stimmen: STIMMEN.slice(0, 2) })),
  probe('Bildkarten ohne Bilder', () => stimmenBilder({ titel: 'x', stimmen: STIMMEN.slice(0, 3) })),
  probe('Bühne ohne Bilder', () => stimmenBuehne({ titel: 'x', stimmen: STIMMEN.slice(0, 3) })),
];

const html = seite({
  titel: 'Prüfseite für die Kundenstimmen im Baukasten',
  beschreibung: 'Interne Prüfseite: Drei Fassungen für Kundenstimmen mit neutralen Beispielen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('stimmenSpalten · neun Stimmen · erste Wahl, braucht keine Bilder'),
    bsp('stimmenSpalten', stimmenSpalten({
      titel: 'Neun von neun würden wiederkommen.',
      text: 'Die Stimmen stammen aus den Google-Bewertungen. Zu lange Texte werden am Satzende gekürzt, nicht umgeschrieben.',
      stimmen: STIMMEN,
    })),

    marke('stimmenSpalten · auf dunklem Grund'),
    stimmenSpalten({ titel: 'Dieselben Stimmen, dunkler Grund.',
      stimmen: STIMMEN.slice(0, 6), tief: true }),

    marke('stimmenBuehne · vier Stimmen · braucht Porträts'),
    bsp('stimmenBuehne', stimmenBuehne({
      titel: 'Vier Stimmen, eine nach der anderen.',
      stimmen: STIMMEN_MIT_BILD.slice(0, 4),
    })),

    marke('stimmenBuehne · auf dunklem Grund'),
    stimmenBuehne({ titel: 'Dasselbe auf dunklem Grund.',
      stimmen: STIMMEN_MIT_BILD.slice(0, 3), tief: true }),

    marke('stimmenBilder · drei Stimmen · braucht Bilder'),
    bsp('stimmenBilder', stimmenBilder({
      titel: 'Drei Stimmen mit Bild.',
      text: 'Das Foto ist die Karte, unten steht nur der Name.',
      stimmen: STIMMEN_MIT_BILD.slice(0, 3),
    })),

    marke('stimmenBilder · sechs Stimmen'),
    stimmenBilder({ titel: 'Sechs Stimmen.', stimmen: STIMMEN_MIT_BILD.slice(0, 6) }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        ${proben.map((z) => `<li>${z}</li>`).join('')}
      </ul>
    </div>`,
  ].join('\n'),
  skripte: BUEHNE_SKRIPT,
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_stimmen/index.html geschrieben,', (html.length / 1024).toFixed(1), 'kB');
