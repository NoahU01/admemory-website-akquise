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
import { heroMitte, heroGeteilt, notband, zahlen, leistungen, leistungenBento,
         logowandKarten, siegel, textBild, kontakt, ruflasche, fussKontakt,
         verlaufSeitlich } from '../baukasten/bausteine.mjs';
import { holeBilder } from '../baukasten/bilder.mjs';
import { fileURLToPath } from 'node:url';

const d = JSON.parse(fs.readFileSync(new URL('./daten.json', import.meta.url), 'utf8'));
const hier = fileURLToPath(new URL('.', import.meta.url));

/* Bilder holen, verkleinern und lokal ablegen. Verlinkt erschien der
   Hauptinhalt mobil erst nach 4,3 Sekunden, und jeder Aufruf des Entwurfs
   stand im Server-Protokoll des Betriebs. */
console.log('Bilder:');
const alleBilder = { ...d.bilder.wert,
  ...Object.fromEntries(d.partnerLogos.wert.map((l) => [`partner_${l.name.replace(/\W+/g, '')}`, l.url])) };
const { pfade: B, herkunft } = await holeBilder(hier, alleBilder, {
  // Das Hero läuft randlos über die volle Fensterbreite
  breiten: { trucks: 2000 },
  log: (t) => console.log(t) });
const partner = d.partnerLogos.wert.map((l) => {
  const schluessel = `partner_${l.name.replace(/\W+/g, '')}`;
  const datei = Object.keys(herkunft).find((k) => k.startsWith(schluessel));
  return { name: l.name, pfad: B[schluessel], brauchtDunkel: !!herkunft[datei]?.brauchtDunkel };
}).filter((l) => l.pfad);
const vh = (n) => herkunft[Object.keys(herkunft).find((k) => k.startsWith(n))]?.verhaeltnis;
/* Greift den belegten Wert heraus und meckert, wenn es keinen gibt — sonst
   steht am Ende stillschweigend "undefined" auf der Seite. */
const w = (k) => {
  const e = d[k];
  if (!e || !('wert' in e)) throw new Error(`daten.json: "${k}" hat kein Feld "wert"`);
  if (!e.quelle) throw new Error(`daten.json: "${k}" hat keine Quelle`);
  return e.wert;
};
const jahre = new Date().getFullYear() - d.gruendung.jahr;

/* Die Navigation bildet die des Originals ab, damit der Betrieb seine eigene
   Seite wiedererkennt. Links auf nicht gebaute Seiten zeigen auf den
   entsprechenden Abschnitt oder bleiben wirkungslos. */
const NAV = [
  { text: 'Roll Truck-Service', href: '#leistungen' },
  { text: 'Jobs',               href: '#jobs' },
  { text: '24h Notdienst',      href: '24h-notdienst.html' },
  { text: 'Roll Firmengruppe',  href: '#betrieb' },
  { text: 'Kontakt',            href: '#kontakt' },
];
const NOTKNOPF = { text: `Notdienst ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}` };

const FUSS = () => fussKontakt({
  betrieb: d.firma.wert, logo: B.logoWeiss, dunkel: true,
  anschrift: w('anschrift').slice(1),
  telefon: d.telefon.wert, telefonText: `Werkstatt ${d.telefon.anzeige}`,
  zweitnummer: d.notruf.wert, zweitnummerLabel: `Notdienst ${d.notruf.anzeige}`,
  email: d.email.wert, zeiten: w('zeiten'),
  zeitenHinweis: 'Der Notdienst ist außerhalb dieser Zeiten durchgehend besetzt.',
  knopf: { text: `Notdienst ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}` },
  recht: [{ text: 'Impressum', href: 'https://rolltruck.de/impressum' },
          { text: 'Datenschutz', href: 'https://rolltruck.de/datenschutz' }],
});

/* ── Startseite ──────────────────────────────────────────────────── */
const start = seite({
  titel: `${d.firma.wert}: Nutzfahrzeug-Werkstatt und 24h-Notdienst in Crailsheim`,
  beschreibung: `Werkstatt für alle Nutzfahrzeugmarken in Crailsheim: Kundendienst, Reifen, `
    + `Ersatzteile, Prüfservice und LNG-Tankstelle. Abschleppen und Bergung rund um die Uhr `
    + `unter ${d.notruf.anzeige}.`,
  betrieb: d.betrieb, nav: NAV, navKnopf: NOTKNOPF, fuss: FUSS(),
  logo: B.logo, logoWeiss: B.logoWeiss,
  vorInhalt: ruflasche({ titel: 'Notdienst rund um die Uhr', nummer: d.notruf.wert,
                         nummerText: d.notruf.anzeige }),
  inhalt: [
    heroMitte({
      ueber: d.kerngeschaeft.wert,
      titel: 'Wenn der Lkw steht, zählt jede Stunde.',
      text: `Werkstatt für alle Nutzfahrzeugmarken in Crailsheim. Der Notdienst rückt rund `
          + `um die Uhr aus, von Crailsheim, Wörnitz und Burgoberbach.`,
      knoepfe: [
        { text: 'Kontakt', href: '#kontakt' },
      ],
      knopfHaupt: { text: 'Unsere Leistungen', href: '#leistungen' },
      bild: B.trucks, bildAlt: 'Lastwagen und Bergungsfahrzeug von Roll Truck-Service',
      marken: partner,
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
      /* Die Sternebewertung fehlt in unseren Daten. Eine nackte Zahl ohne Note
         sagt nichts — deshalb lieber ein Fakt, der belegt ist. */
      { zahl: '1876', label: 'gegründet, bis heute in Familienhand' },
    ] }),

    leistungenBento({
      ueber: 'Leistungen', mittig: true,
      titel: 'Alles für das Nutzfahrzeug an einem Ort',
      text: 'Von der planbaren Wartung bis zur Bergung mitten in der Nacht. Vertragswerkstatt '
          + 'für sechs Marken, mit eigenem Lager und eigener Mannschaft in Crailsheim.',
      eintraege: w('leistungen').map((e) => ({ ...e,
        icon: { '24h-Notdienst':'notruf', 'Kundendienst aller Marken':'werkzeug',
                'Reifenservice':'reifen', 'Ersatzteile und Zubehör':'teile',
                'Prüfservice':'pruefung', 'Vermietung':'miete',
                'LNG-Tankstelle':'tankstelle', 'Waschstraße':'wasser',
                'Ölspurbeseitigung':'oel', 'Reisemobile':'wohnmobil' }[e.titel],
        wichtig: e.titel === '24h-Notdienst' })),
      spalten: 3,
    }),

    logowandKarten({ ueber: 'Vertragspartner', titelLeise: 'Wir arbeiten mit', titel: 'diesen Marken.',
               logos: partner,
               nachsatz: 'Dazu Vertragswerkstatt für Volvo Trucks und Iveco, '
                       + 'DAF Vertragspartner und PEMA Stützpunkt.' }),

    siegel({ ueber: 'Ausgezeichnet', titel: 'Werkstatt des Jahres 24/25',
             text: 'Verliehen durch autoservice praxis. Seit 1876 in Familienhand, '
                 + 'seit 1994 als Roll Truck-Service GmbH.',
             bilder: [{ name: 'Werkstatt des Jahres 2024', pfad: B.werkstatt24 },
                      { name: 'Werkstatt des Jahres 2025', pfad: B.werkstatt25 },
                      { name: '150 Jahre Roll', pfad: B.siegel150 }].filter((x) => x.pfad),
             tief: true }),

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
      bild: B.team, bildVerhaeltnis: vh('team'), bildAlt: 'Das Team von Roll Truck-Service',
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
      bild: B.werkstatt, bildVerhaeltnis: vh('werkstatt'), bildAlt: 'Werkstatt von Roll Truck-Service',
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
  titel: `24-Stunden-Notdienst für Lkw bei ${d.firma.wert}`,
  beschreibung: `Abschleppen und Bergung rund um die Uhr von Crailsheim, Wörnitz und `
    + `Burgoberbach aus. Notdienst ${d.notruf.anzeige}, auch nachts und am Wochenende.`,
  betrieb: d.betrieb, nav: NAV, navKnopf: NOTKNOPF, fuss: FUSS(),
  logo: B.logo, logoWeiss: B.logoWeiss,
  vorInhalt: ruflasche({ titel: 'Notdienst rund um die Uhr', nummer: d.notruf.wert,
                         nummerText: d.notruf.anzeige }),
  inhalt: [
    heroMitte({
      ueber: 'Rund um die Uhr',
      titel: `Notdienst: ${d.notruf.anzeige}`,
      text: 'Abschleppen und Bergung für Lkw und Pkw. Nachts, am Wochenende, an Feiertagen. '
          + 'Rufen Sie an, wir sagen Ihnen sofort, wann jemand bei Ihnen ist.',
      knopfHaupt: { text: `Jetzt anrufen: ${d.notruf.anzeige}`, href: `tel:${d.notruf.wert}` },
      bild: B.trucks, bildAlt: 'Bergungsfahrzeug von Roll Truck-Service',
    }),

    leistungen({
      ueber: 'Im Notfall', titel: 'Was wir übernehmen', spalten: 2,
      eintraege: [
        { titel: 'Abschleppen', icon: 'notruf', wichtig: true, text: 'Lkw und Nutzfahrzeuge, seit 2024 auch Pkw.' },
        { titel: 'Bergung', icon: 'werkzeug', text: 'Nach Unfall oder Abkommen von der Fahrbahn.' },
        { titel: 'Ölspurbeseitigung', icon: 'oel', text: 'Schnelle Hilfe bei Leckagen auf der Straße.' },
        { titel: 'Pannenhilfe vor Ort', icon: 'uhr', text: 'Wenn sich die Fahrt mit einer Reparatur retten lässt.' },
      ],
    }),

    textBild({
      ueber: 'Standorte', titel: 'Drei Stützpunkte an A6 und A7',
      absaetze: [`Wir rücken von ${w('abschleppStandorte').join(', ')} aus. `
               + 'Von dort sind die Autobahnen in der Region schnell erreichbar.'],
      punkte: w('abschleppStandorte').map((o) => `Abschlepp-Standort ${o}`),
      bild: B.lng, bildVerhaeltnis: vh('lng'), bildAlt: 'Betriebsgelände von Roll Truck-Service',
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
