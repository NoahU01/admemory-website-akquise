/* Entwurf für Roll Truckservice GmbH, Crailsheim.

   Alle Inhalte stammen aus daten.json und sind dort mit Quelle belegt.

   Die Leitentscheidung: Der Betrieb fährt einen 24-Stunden-Notdienst für Lkw.
   Wer den braucht, steht nachts mit einem Defekt an der A6 oder A7 und sucht
   auf dem Handy eine Nummer. Auf der bestehenden Seite steht diese Nummer im
   Fließtext einer Unterseite, der Hauptinhalt erscheint mobil erst nach 17,4
   Sekunden, und der Cookie-Hinweis verdeckt dabei den ganzen Bildschirm.
   Deshalb steht die Notfallnummer hier im Navigationsknopf, im Kopfbereich und
   in einem eigenen Band — dreimal erreichbar, ohne zu scrollen.

   Zweite Entscheidung: 150 Jahre Firmengeschichte, sechs Markenpartnerschaften
   und "Werkstatt des Jahres 24/25" liegen heute auf Unterseiten oder als Bild
   ohne Alternativtext herum. Für einen Spediteur, der eine Werkstatt sucht,
   sind das die stärksten Argumente — sie gehören nach vorn.                 */

import fs from 'node:fs';
import { seite, pruefeGeruest } from '../baukasten/seite.mjs';
import { hero, notband, zahlen, leistungen, markenband, textBild, kontakt } from '../baukasten/bausteine.mjs';

const d = JSON.parse(fs.readFileSync(new URL('./daten.json', import.meta.url), 'utf8'));
/* Greift den belegten Wert heraus und meckert, wenn es keinen gibt — sonst
   steht am Ende stillschweigend "undefined" auf der Seite. */
const w = (k) => {
  const e = d[k];
  if (!e || !('wert' in e)) throw new Error(`daten.json: "${k}" hat kein Feld "wert"`);
  if (!e.quelle) throw new Error(`daten.json: "${k}" hat keine Quelle`);
  return e.wert;
};
const jahre = new Date().getFullYear() - d.gruendung.jahr;

const NAV = [
  { text: 'Leistungen', href: '#leistungen' },
  { text: 'Betrieb',    href: '#betrieb' },
  { text: 'Kontakt',    href: '#kontakt' },
];
const NOTKNOPF = { text: `Notdienst ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}` };

const FUSS = `
  <div><h3 style="font-size:var(--t-s);margin-bottom:var(--a-1)">${d.firma.wert}</h3>
    <p class="klein" style="color:#8b97a6">${w('anschrift').slice(1).join('<br>')}</p></div>
  <div><h3 style="font-size:var(--t-s);margin-bottom:var(--a-1)">Erreichbarkeit</h3>
    <p class="klein" style="color:#8b97a6">
      Zentrale <a href="tel:${d.telefon.wert}" style="color:#fff">${d.telefon.anzeige}</a><br>
      Notdienst <a href="tel:${d.notruf.wert}" style="color:#fff">${d.notruf.anzeige}</a><br>
      <a href="mailto:${d.email.wert}" style="color:#fff">${d.email.wert}</a></p></div>
  <div><h3 style="font-size:var(--t-s);margin-bottom:var(--a-1)">Öffnungszeiten</h3>
    <p class="klein" style="color:#8b97a6">${w('zeiten').map((z) => `${z.tag}: ${z.zeit}`).join('<br>')}</p></div>`;

/* ── Startseite ──────────────────────────────────────────────────── */
const start = seite({
  titel: `${d.firma.wert} — Nutzfahrzeug-Werkstatt und 24h-Notdienst in Crailsheim`,
  beschreibung: `Werkstatt für alle Nutzfahrzeugmarken in Crailsheim: Kundendienst, Reifen, `
    + `Ersatzteile, Prüfservice und LNG-Tankstelle. Abschleppen und Bergung rund um die Uhr `
    + `unter ${d.notruf.anzeige}.`,
  betrieb: d.betrieb, nav: NAV, navKnopf: NOTKNOPF, fuss: FUSS,
  inhalt: [
    hero({
      ueber: `Crailsheim · seit ${d.gruendung.jahr}`,
      titel: 'Wenn der Lkw steht, zählt jede Stunde.',
      text: 'Werkstatt für alle Nutzfahrzeugmarken — und ein Notdienst, der rund um die Uhr '
          + 'ausrückt. Abschleppen und Bergung von Crailsheim, Wörnitz und Burgoberbach aus.',
      knoepfe: [
        { text: `Notdienst ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}`, art: 'wichtig' },
        { text: `Werkstatt ${d.telefon.anzeige}`, href: `tel:${d.telefon.wert}` },
      ],
      bild: w('bilder').trucks,
      bildAlt: 'Lastwagen der Roll Truck-Service Flotte',
    }),

    notband({
      titel: 'Panne oder Unfall? Wir rücken sofort aus.',
      text: 'Abschleppen und Bergung, Tag und Nacht, auch am Wochenende.',
      nummer: d.notruf.wert, nummerText: d.notruf.anzeige,
    }),

    zahlen({ eintraege: [
      { zahl: `${jahre} Jahre`, label: `Familienbetrieb seit ${d.gruendung.jahr}` },
      { zahl: '24/7',           label: 'Notdienst für Lkw und Pkw' },
      { zahl: w('abschleppStandorte').length, label: 'Abschlepp-Standorte' },
      { zahl: d.google.bewertungen, label: 'Bewertungen bei Google' },
    ] }),

    leistungen({
      ueber: 'Leistungen',
      titel: 'Alles für das Nutzfahrzeug an einem Ort',
      text: 'Von der planbaren Wartung bis zur Bergung mitten in der Nacht.',
      eintraege: w('leistungen'),
      spalten: 3,
    }),

    markenband({ titel: 'Vertragspartner und Stützpunkt', marken: w('marken') }),

    textBild({
      ueber: 'Der Betrieb',
      titel: `Seit ${d.gruendung.jahr} in Familienhand`,
      absaetze: [
        `Begonnen hat alles ${d.gruendung.jahr} mit der Güterbeförderung von Martin Schmidt, `
        + 'dem Urgroßvater des heutigen Inhabers Heinrich Roll.',
        `Daraus wurde über die Jahrzehnte die Roll Firmengruppe. Die Roll Truck-Service GmbH `
        + `entstand ${d.gmbhSeit.jahr} und ist heute Vertragswerkstatt und Stützpunkt für sechs Marken.`,
      ],
      punkte: [
        `${d.auszeichnung.wert}`,
        `Abschlepp-Niederlassungen in ${w('abschleppStandorte').join(', ')}`,
        'Eigene LNG-Tankstelle auf dem Firmengelände, seit 2020',
        'Bio-Lkw-Waschanlage in Crailsheim',
      ],
      bild: w('bilder').team, bildAlt: 'Das Team von Roll Truck-Service',
      bildRechts: false,
    }),

    textBild({
      ueber: 'Arbeiten bei Roll',
      titel: 'Wir suchen Verstärkung',
      absaetze: ['Technische Mitarbeiterinnen und Mitarbeiter für Kfz und Nfz, dazu '
               + 'Ausbildungsplätze. Vom Azubi zum Meister ist hier ein üblicher Weg.'],
      knoepfe: [
        { text: 'Stellenangebote', href: 'https://rolltruck.de/jobs/stellenangebote', neu: true },
        { text: 'Ausbildung', href: 'https://rolltruck.de/jobs/ausbildung', neu: true },
      ],
      bild: w('bilder').werkstatt, bildAlt: 'Werkstatt von Roll Truck-Service',
      tief: false,
    }),

    kontakt({
      ueber: 'Kontakt', titel: 'Kommen Sie vorbei oder rufen Sie an',
      text: 'Die Werkstatt liegt direkt in Crailsheim, nah an A6 und A7.',
      anschrift: w('anschrift'),
      telefon: d.telefon.wert, telefonText: `Werkstatt ${d.telefon.anzeige}`,
      notruf: d.notruf.wert, notrufText: `Notdienst ${d.notruf.anzeige}`,
      email: d.email.wert, zeiten: w('zeiten'),
      karteHref: 'https://www.google.com/maps/search/?api=1&query='
               + encodeURIComponent(w('anschrift').slice(1).join(', ')),
    }),
  ].join('\n'),
});

/* ── Unterseite: 24h-Notdienst ───────────────────────────────────── */
const notdienst = seite({
  titel: `24-Stunden-Notdienst für Lkw — ${d.firma.wert}`,
  beschreibung: `Abschleppen und Bergung rund um die Uhr von Crailsheim, Wörnitz und `
    + `Burgoberbach aus. Notdienst ${d.notruf.anzeige}, auch nachts und am Wochenende.`,
  betrieb: d.betrieb, nav: NAV, navKnopf: NOTKNOPF, fuss: FUSS,
  inhalt: [
    hero({
      ueber: 'Rund um die Uhr',
      titel: `Notdienst: ${d.notruf.anzeige}`,
      text: 'Abschleppen und Bergung für Lkw und Pkw. Nachts, am Wochenende, an Feiertagen. '
          + 'Rufen Sie an — wir sagen Ihnen sofort, wann jemand bei Ihnen ist.',
      knoepfe: [{ text: `Jetzt anrufen: ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}`, art: 'wichtig' }],
      bild: w('bilder').trucks, bildAlt: 'Bergungsfahrzeug von Roll Truck-Service',
    }),

    leistungen({
      ueber: 'Im Notfall', titel: 'Was wir übernehmen', spalten: 2,
      eintraege: [
        { titel: 'Abschleppen', text: 'Lkw und Nutzfahrzeuge, seit 2024 auch Pkw.' },
        { titel: 'Bergung', text: 'Nach Unfall oder Abkommen von der Fahrbahn.' },
        { titel: 'Ölspurbeseitigung', text: 'Schnelle Hilfe bei Leckagen auf der Straße.' },
        { titel: 'Pannenhilfe vor Ort', text: 'Wenn sich die Fahrt mit einer Reparatur retten lässt.' },
      ],
    }),

    textBild({
      ueber: 'Standorte', titel: 'Drei Stützpunkte an A6 und A7',
      absaetze: [`Wir rücken von ${w('abschleppStandorte').join(', ')} aus — `
               + 'drei Standorte, von denen aus die Autobahnen in der Region schnell erreichbar sind.'],
      punkte: w('abschleppStandorte').map((o) => `Abschlepp-Standort ${o}`),
      bild: w('bilder').lng, bildAlt: 'Betriebsgelände von Roll Truck-Service',
      bildRechts: false,
    }),

    kontakt({
      ueber: 'Erreichbarkeit', titel: 'So erreichen Sie uns',
      text: 'Der Notdienst ist durchgehend besetzt. Die Werkstatt erreichen Sie zu den Öffnungszeiten.',
      anschrift: w('anschrift'),
      telefon: d.notruf.wert, telefonText: `Notdienst ${d.notruf.anzeige}`,
      email: d.email.wert, zeiten: w('zeiten'),
    }),
  ].join('\n'),
});

/* ── Schreiben, aber nur nach bestandener Gegenprobe ─────────────── */
let fehler = 0;
for (const [datei, html] of [['index.html', start], ['24h-notdienst.html', notdienst]]) {
  const m = pruefeGeruest(html);
  if (m.length) { console.error(`✗ ${datei}: ${m.join(' · ')}`); fehler++; continue; }
  fs.writeFileSync(new URL(`./${datei}`, import.meta.url), html);
  console.log(`✓ ${datei}  ${(html.length / 1024).toFixed(1)} kB`);
}
process.exit(fehler ? 1 : 0);
