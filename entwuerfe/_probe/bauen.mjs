/* Prüfseite für neue Bausteine. Jede Variante dreimal: mit echten Daten,
   mit zu viel Inhalt und mit zu wenig. Was hier zerbricht, zerbricht später
   bei irgendeinem Betrieb — nur merkt es dann niemand. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { verlaufSeitlich, verlaufWaagerecht, verlaufSchmal } from '../baukasten/bausteine.mjs';

const echt = [
  { marke: '1876', titel: 'Gründung', text: 'Martin Schmidt beginnt mit der Güterbeförderung.' },
  { marke: '1994', titel: 'Roll Truck-Service GmbH', text: 'Die Werkstatt wird eigenständig.' },
  { marke: '2000', titel: 'Vertragswerkstatt', text: 'Volvo Trucks und Iveco kommen dazu.' },
  { marke: '2020', titel: 'LNG-Tankstelle', text: 'Auf dem eigenen Firmengelände.' },
  { marke: '2024', titel: 'Werkstatt des Jahres', text: 'Ausgezeichnet durch autoservice praxis.' },
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

const html = seite({
  titel: 'Prüfseite für Verlaufs-Bausteine im Baukasten',
  beschreibung: 'Interne Prüfseite: Jede Verlaufsvariante mit echten Daten, mit Überlänge und mit nur einem Eintrag.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    teil('V1 · echte Daten', verlaufSeitlich({ ueber: 'Der Betrieb', titel: 'Seit 1876 in Familienhand',
      text: 'Aus der Güterbeförderung wurde über fünf Generationen eine Firmengruppe. Die Werkstatt ist seit 1994 eigenständig.',
      schritte: echt })),
    teil('V1 · Überlänge und leerer Text', verlaufSeitlich({ ueber: 'Härtefall',
      titel: 'Eine ungewöhnlich lange Überschrift, die über mehrere Zeilen läuft',
      text: 'Kurz.', schritte: lang })),
    teil('V1 · nur ein Eintrag', verlaufSeitlich({ titel: 'Nur eine Station', schritte: eines })),

    teil('V2 · echte Daten', verlaufWaagerecht({ ueber: 'Historie', titel: 'Fünf Stationen',
      text: 'Von der Güterbeförderung zur Vertragswerkstatt.', stationen: echt })),
    teil('V2 · neun Stationen', verlaufWaagerecht({ titel: 'Zu viele Stationen', stationen: viele })),
    teil('V2 · laufender Vorgang', verlaufWaagerecht({ titel: 'Erst zur Hälfte erreicht',
      stationen: echt.slice(0, 4), bisHier: 2 })),

    teil('V3 · echte Daten', verlaufSchmal({ plakette: 'So läuft es ab', titel: 'Vom Anruf bis zur Abfahrt',
      text: 'Vier Schritte, die bei jedem Einsatz gleich sind.',
      schritte: [
        { icon: 'notruf', titel: 'Sie rufen an', text: 'Rund um die Uhr, auch am Wochenende.' },
        { icon: 'uhr', titel: 'Wir nennen eine Zeit', text: 'Sie wissen sofort, wann jemand bei Ihnen ist.' },
        { icon: 'werkzeug', titel: 'Vor Ort', text: 'Reparatur, wenn es geht. Abschleppen, wenn nötig.' },
        { icon: 'haken', titel: 'In der Werkstatt', text: 'Instandsetzung durch die eigene Mannschaft.' },
      ] })),
    teil('V3 · Überlänge', verlaufSchmal({ titel: 'Mit sehr langen Texten', schritte: lang })),
  ].join('\n'),
});
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Prüfseite geschrieben:', (html.length / 1024).toFixed(1), 'kB');
