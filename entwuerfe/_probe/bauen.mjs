/* Prüfseite für die Verlaufs-Bausteine. Allgemeines Beispiel, daneben der
   echte Fall. Die gestrichenen Grenzfälle stehen unten als Probe: Was der
   Baukasten verweigert, soll sichtbar sein statt nur vereinbart. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { verlaufSeitlich, verlaufWaagerecht, verlaufSchmal } from '../baukasten/bausteine.mjs';

/* Zwei bis drei Sätze je Eintrag. Ein einzelner kurzer Satz lässt die Karte
   leer wirken, besonders neben einer großen Überschrift. */
const echt = [
  { marke: '1876', titel: 'Gründung', text: 'Martin Schmidt beginnt mit der Güterbeförderung. Aus dem Fuhrunternehmen wird über die Jahrzehnte eine Firmengruppe, die bis heute in Familienhand ist.' },
  { marke: '1994', titel: 'Roll Truck-Service GmbH', text: 'Die Werkstatt wird aus der Spedition herausgelöst und eigenständig. Ab hier steht das Nutzfahrzeug im Mittelpunkt, nicht mehr der eigene Fuhrpark.' },
  { marke: '2000', titel: 'Vertragswerkstatt', text: 'Volvo Trucks und Iveco kommen als Vertragspartner dazu. Drei Jahre später folgt DAF, später Schmitz Cargobull und Vergölst.' },
  { marke: '2020', titel: 'LNG-Tankstelle', text: 'Auf dem eigenen Firmengelände entsteht eine LNG-Tankstelle. Für Speditionen in der Region ist das die nächstgelegene Zapfstelle.' },
  { marke: '2024', titel: 'Werkstatt des Jahres', text: 'Ausgezeichnet durch autoservice praxis als Werkstatt des Jahres 24/25. Im selben Jahr kommt der Pkw-Abschleppdienst dazu.' },
];
const lang = [
  { marke: '2019', titel: 'Erschließung der Abschlepp-Niederlassung Wörnitz mit eigenem Bereitschaftsdienst',
    text: 'Ein sehr langer Beschreibungstext, der prüft, ob die Karte umbricht statt zu überlaufen, und ob die Nummer an der Linie dabei an ihrem Platz bleibt, auch wenn der Text über mehrere Zeilen geht und die Karte dadurch deutlich höher wird als vorgesehen.' },
  { marke: '2022', titel: 'Kurz', text: '' },
];
const viele = Array.from({ length: 9 }, (_, i) => ({ marke: 2016 + i, titel: `Station ${i + 1}`, text: 'Kurzer Text.' }));
const eines = [{ marke: '1876', titel: 'Gegründet', text: 'Mehr gibt die Quelle nicht her.' }];

const teil = (ueberschrift, inhalt) =>
  `<div class="schale" style="padding-top:var(--a-4)"><p class="ueber">${ueberschrift}</p></div>${inhalt}<hr class="trenner">`;

const allgemein = [
  { marke: '1984', titel: 'Gegründet', text: 'Als Zweimannbetrieb in einer angemieteten Halle. Die ersten Aufträge kamen aus der Nachbarschaft, und ein Teil dieser Kunden ist bis heute geblieben.' },
  { marke: '1998', titel: 'Erster eigener Standort', text: 'Umzug ins Gewerbegebiet mit eigener Werkstatt und Lager. Ab hier konnten wir Material vorhalten, statt es für jeden Auftrag zu bestellen.' },
  { marke: '2012', titel: 'Meisterbetrieb', text: 'Eintragung in die Handwerksrolle und erste eigene Ausbildung. Seitdem haben vierzehn Lehrlinge hier gelernt, neun davon sind geblieben.' },
  { marke: '2019', titel: 'Photovoltaik', text: 'Aufbau der Sparte für Anlagen und Speicher. Der erste eigene Speicher steht seit 2020 auf unserem eigenen Dach.' },
  { marke: '2024', titel: 'Vierzig Jahre', text: 'Zwölf Monteure, zwei Meister, drei Servicewagen. Der Betrieb ist in zweiter Generation in Familienhand.' },
];
const stationen = [
  { marke: '1', titel: 'Anruf', text: 'Sie schildern kurz, worum es geht.' },
  { marke: '2', titel: 'Termin', text: 'Wir nennen einen festen Termin, kein Zeitfenster.' },
  { marke: '3', titel: 'Vor Ort', text: 'Aufmaß, Angebot und, wenn es passt, gleich die Arbeit.' },
  { marke: '4', titel: 'Abnahme', text: 'Gemeinsam durchgehen, dann die Rechnung.' },
];
const schritte = [
  { titel: 'Anruf oder Nachricht', text: 'Werktags gehen wir ans Telefon, sonst rufen wir am selben Tag zurück.' },
  { titel: 'Termin innerhalb einer Woche', text: 'Bei Störungen am selben Tag, sonst nach Absprache.' },
  { titel: 'Festpreis vor der Arbeit', text: 'Was vorher genannt wird, steht hinterher auf der Rechnung.' },
  { titel: 'Abnahme und Übergabe', text: 'Alles wird gemeinsam durchgegangen und dokumentiert.' },
];

const probe = (was, fn) => {
  try { fn(); return `${was}: KEIN ABBRUCH — das ist ein Fehler`; }
  catch (e) { return `${was}: ${e.message}`; }
};

const html = seite({
  titel: 'Prüfseite für Verlaufs-Bausteine im Baukasten',
  beschreibung: 'Interne Prüfseite: Die drei Verlaufsfassungen allgemein und mit echten Daten.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    teil('verlaufSeitlich · allgemein · erste Wahl', bsp('verlaufSeitlich', verlaufSeitlich({
      titel: 'Seit 1984 in Familienhand',
      text: 'Vierzig Jahre in derselben Stadt, in zweiter Generation. Was hier steht, ist nicht die Firmengeschichte für den Prospekt, sondern das, was für einen Auftrag heute noch zählt: gewachsene Mannschaft, eigenes Lager, feste Ansprechpartner.',
      schritte: allgemein }))),

    teil('verlaufSeitlich · mit echten Daten von Roll Truckservice', verlaufSeitlich({
      titel: 'Seit 1876 in Familienhand',
      text: 'Aus einem Fuhrunternehmen wurde über fünf Generationen eine Firmengruppe. Die Werkstatt ist seit 1994 eigenständig.',
      schritte: echt })),

    teil('verlaufWaagerecht · vier Stationen', bsp('verlaufWaagerecht', verlaufWaagerecht({
      titel: 'So läuft es ab',
      text: 'Vier Schritte vom Anruf bis zur Abnahme, ohne Zwischenstellen.',
      stationen }))),

    teil('verlaufSchmal · allgemein', bsp('verlaufSchmal', verlaufSchmal({
      plakette: 'So arbeiten wir',
      titel: 'Vom Anruf bis zur Abnahme',
      text: 'Vier Punkte, die wir zusagen.',
      schritte }))),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('Verlauf mit einem Eintrag', () => verlaufSeitlich({ titel: 'x', schritte: allgemein.slice(0, 1) }))}</li>
        <li>${probe('Waagerecht mit neun Stationen', () => verlaufWaagerecht({ titel: 'x',
          stationen: Array.from({ length: 9 }, (_, i) => ({ marke: i + 1, titel: 'S', text: 'x' })) }))}</li>
      </ul>
    </div>`,
  ].join('\n'),
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_probe geschrieben,', (html.length / 1024).toFixed(1), 'kB');
