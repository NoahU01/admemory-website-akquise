/* Prüfseite für die Leistungs-Fassungen. Allgemeines Beispiel, daneben der
   echte Fall. Gestrichene Grenzfälle stehen unten als Probe: Was der
   Baukasten verweigert, soll sichtbar sein. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { LEISTUNGEN } from '../baukasten/beispiele.mjs';
import { leistungen, leistungenBento } from '../baukasten/bausteine.mjs';

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;
const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};

const html = seite({
  titel: 'Prüfseite für die Leistungs-Fassungen im Baukasten',
  beschreibung: 'Interne Prüfseite: Bento und gleichmäßiges Raster.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('leistungenBento · neun Leistungen · mittige Kopfzeile'),
    bsp('leistungenBento', leistungenBento({ mittig: true,
      titel: 'Alles rund um Strom an einem Ort',
      text: 'Von der Hausinstallation bis zur Anlagenprüfung im Betrieb.',
      eintraege: LEISTUNGEN })),

    marke('leistungenBento · genau sechs · alle gleich groß, Hervorhebung bleibt'),
    leistungenBento({ titel: 'Sechs Leistungen',
      text: 'Bei sechs Einträgen stehen die Karten gleich groß nebeneinander.',
      eintraege: LEISTUNGEN.slice(0, 6) }),

    marke('leistungen · gleichmäßiges Raster, Icon im Kreis, mittig'),
    bsp('leistungen', leistungen({ mittig: true, iconStil: 'kreis', spalten: 3,
      titel: 'Was wir machen',
      text: 'Gleich gewichtet, wenn keine Leistung die wichtigste ist.',
      eintraege: LEISTUNGEN.slice(0, 6) })),

    marke('leistungen · elf Einträge, linksbündig, Icon im Kasten'),
    leistungen({ spalten: 4, titel: 'Elf Einträge',
      text: 'Das Raster trägt auch lange Listen, ohne zu kürzen.',
      eintraege: [...LEISTUNGEN, { titel: 'Zählerwechsel', icon: 'haken', text: 'Austausch alter Zähler.' },
        { titel: 'Beratung vor Ort', icon: 'leute', text: 'Aufmaß und Angebot beim Kunden.' }] }),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('Bento mit drei Leistungen', () => leistungenBento({ titel: 'x', eintraege: LEISTUNGEN.slice(0, 3) }))}</li>
      </ul>
    </div>`,
  ].join('\n'),
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_leistungen geschrieben,', (html.length / 1024).toFixed(1), 'kB');
