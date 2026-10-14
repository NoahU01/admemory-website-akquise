/* Prüfseite für die Kundenstimmen. Die mit bsp() ausgezeichneten Beispiele
   sind bewusst neutral — die Bibliothek soll zeigen, wie ein Modul allgemein
   aussieht. Daneben die Härtefälle: eine einzige Stimme, sehr lange Texte,
   fehlende Noten, fehlende Bilder. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { STIMMEN, STIMMEN_OHNE_NOTE } from '../baukasten/beispiele.mjs';
import { stimmenSpalten, stimmenBilder, stimmenBuehne, BUEHNE_SKRIPT } from '../baukasten/bausteine.mjs';

/* Für die Bildkarten brauchen wir Fotos. Kundenporträts haben wir nie —
   hier stehen deshalb Betriebsbilder, wie sie ein Entwurf wirklich hätte. */
const B = ['../rolltruck/bilder/werkstatt.jpg', '../rolltruck/bilder/team.jpg', '../rolltruck/bilder/lng.jpg'];
const mitBild = STIMMEN.slice(0, 3).map((s, i) => ({ ...s, bild: B[i] }));
const lang = [{
  text: 'Ich schreibe selten Bewertungen, aber hier muss ich es tun. Wir hatten über '
    + 'Monate ein Problem, das drei andere Betriebe nicht gefunden haben, und man hat '
    + 'sich hier so lange damit beschäftigt, bis es weg war. Dabei wurde mir mehrfach '
    + 'angeboten, es sein zu lassen, wenn es zu teuer wird. Am Ende lag die Rechnung '
    + 'unter dem, was vorher im Raum stand. So etwas erlebt man heute kaum noch, '
    + 'und deswegen stehen hier fünf Sterne.',
  name: 'Dr. Hans-Jürgen Oberstätter-Lindemann', rolle: 'Geschäftsführender Gesellschafter', note: 5,
}, ...STIMMEN.slice(0, 2)];

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Kundenstimmen im Baukasten',
  beschreibung: 'Interne Prüfseite: Drei Fassungen für Kundenstimmen mit neutralen Beispielen und Härtefällen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('stimmenSpalten · neun Stimmen · erste Wahl'),
    bsp('stimmenSpalten', stimmenSpalten({
      ueber: 'Was Kunden sagen',
      titel: 'Neun von neun würden wiederkommen.',
      text: 'Die Stimmen stammen aus den Google-Bewertungen und sind ungekürzt übernommen.',
      stimmen: STIMMEN,
    })),

    marke('stimmenSpalten · Grenzfall: zwei Stimmen · nur zwei Spalten'),
    stimmenSpalten({ titel: 'Zwei Stimmen.', stimmen: STIMMEN.slice(0, 2) }),

    marke('stimmenSpalten · auf dunklem Grund'),
    stimmenSpalten({ ueber: 'Bewertungen', titel: 'Dieselben Stimmen, dunkler Grund.',
      stimmen: STIMMEN.slice(0, 6), tief: true }),

    marke('stimmenBuehne · eine Stimme auf einmal · erste Wahl bei wenigen'),
    bsp('stimmenBuehne', stimmenBuehne({
      ueber: 'Was Kunden sagen',
      titel: 'Vier Stimmen, eine nach der anderen.',
      stimmen: STIMMEN.slice(0, 4),
    })),

    marke('stimmenBuehne · Grenzfall: eine einzige Stimme · keine Knöpfe'),
    stimmenBuehne({ titel: 'Nur eine Stimme.', stimmen: STIMMEN.slice(0, 1) }),

    marke('stimmenBuehne · Grenzfall: sehr langer Text und sehr langer Name'),
    stimmenBuehne({ ueber: 'Härtefall', titel: 'Überlänge.', stimmen: lang, tief: true }),

    marke('stimmenBilder · mit Fotos'),
    bsp('stimmenBilder', stimmenBilder({
      ueber: 'Was Kunden sagen',
      titel: 'Drei Stimmen, drei Bilder aus dem Betrieb.',
      text: 'Nur nehmen, wenn es wirklich Bilder gibt.',
      stimmen: mitBild,
    })),

    marke('stimmenBilder · Grenzfall: ohne Bilder · Verlauf statt leerer Kasten'),
    stimmenBilder({ titel: 'Dieselben Karten ohne Foto.', stimmen: STIMMEN_OHNE_NOTE }),
  ].join('\n'),
  skripte: BUEHNE_SKRIPT,
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_stimmen/index.html geschrieben,', (html.length / 1024).toFixed(1), 'kB');
