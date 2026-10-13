/* Prüfseite für die Vertrauens-Module. Echte Siegel und Partnerlogos von
   Roll Truckservice, dazu die Grenzfälle: ohne Note, ohne Bild, mit sehr
   langer Überschrift, mit zu wenigen und mit zu vielen Logos. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { vertrauenDuo, vertrauenStreu, siegel, ERSCHEINEN_SKRIPT } from '../baukasten/bausteine.mjs';

const P = '../rolltruck/bilder/';
const herkunft = JSON.parse(fs.readFileSync(new URL('../rolltruck/bilder/herkunft.json', import.meta.url), 'utf8'));
const bild = (name, datei) => ({ name, pfad: P + datei, brauchtDunkel: !!herkunft[datei]?.brauchtDunkel });

const auszeichnungen = [
  bild('Werkstatt des Jahres 2024', 'werkstatt24.svg'),
  bild('Werkstatt des Jahres 2025', 'werkstatt25.svg'),
  bild('150 Jahre Roll', 'siegel150.svg'),
];
const partner = [
  bild('Schmitz Cargobull', 'partner_SchmitzCargobull.png'),
  bild('Vergölst', 'partner_Verglst.png'),
  bild('Krone', 'partner_Krone.png'),
  bild('TÜV', 'partner_TV.png'),
];
/* Weißes Logo auf Transparenz: muss in der Kachel dunkel hinterlegt sein. */
const weiss = bild('Roll Truckservice weiß', 'logoWeiss.png');
const viele = (n) => Array.from({ length: n }, (_, i) => ({ ...partner[i % 4], name: partner[i % 4].name + ' ' + (i + 1) }));

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Vertrauens-Module im Baukasten',
  beschreibung: 'Interne Prüfseite: Auszeichnungen, Siegel und Partnermarken in beiden Fassungen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('Duo · echter Fall Roll Truckservice · Bewertungszahl ohne Note'),

    bsp('vertrauenDuo', vertrauenDuo({
      ueber: 'Nutzfahrzeug-Werkstatt in Crailsheim',
      titel: 'Zweimal in Folge Werkstatt des Jahres.',
      text: 'Die Auszeichnung vergibt eine Fachjury an Betriebe, die bei Erreichbarkeit, '
        + 'Durchlaufzeit und Diagnosequalität vorne liegen. Dazu kommen vier Vertragspartner '
        + 'und eine Werkstattkette, die seit 150 Jahren in Familienhand ist.',
      kacheln: [...auszeichnungen, ...partner, weiss],
      bild: P + 'werkstatt.jpg', bildAlt: 'Blick in die Werkstatthalle von Roll Truckservice',
      bildTitel: 'Zwölf Hebebühnen, eigener Abschleppdienst, Notdienst rund um die Uhr.',
      anzahl: 301, quelle: 'Google',
    })),

    marke('Duo · mit Note 4,7 · halber Stern wird aus der Note gerechnet'),
    vertrauenDuo({
      ueber: 'Auszeichnungen', titel: 'Geprüft, bewertet, ausgezeichnet.',
      text: 'Drei Siegel und vier Marken. Mehr braucht es nicht, um zu zeigen, '
        + 'dass hier nicht improvisiert wird.',
      kacheln: [...auszeichnungen, ...partner],
      bild: P + 'team.jpg', bildAlt: 'Das Team von Roll Truckservice',
      bildTitel: 'Siebzehn Leute, die alle schon lange da sind.',
      note: 4.7, anzahl: 301, quelle: 'Google', tief: true,
    }),

    marke('Duo · Grenzfall: kein Bild, nur drei Kacheln, sehr lange Überschrift'),
    vertrauenDuo({
      titel: 'Ausgezeichnet als Werkstatt des Jahres 2024 und 2025 durch die Fachjury '
        + 'der Nutzfahrzeug-Branche und damit zweimal in Folge an der Spitze',
      text: 'Ohne Bild läuft die Karte auf die ganze Breite.',
      kacheln: auszeichnungen,
    }),

    marke('Duo · Grenzfall: eine einzige Kachel, kein Text, keine Bewertung'),
    vertrauenDuo({ titel: 'Werkstatt des Jahres.', kacheln: [auszeichnungen[0]], bild: P + 'lng.jpg', bildAlt: 'LNG-Zapfsäule' }),

    marke('Streu · sieben Logos · erste Wahl'),

    bsp('vertrauenStreu', vertrauenStreu({
      ueber: 'Vertragspartner', titel: 'Alles aus einer Hand.',
      text: 'Wir sind Vertragswerkstatt für Volvo Trucks und Iveco, DAF Vertragspartner, '
        + 'PEMA Stützpunkt und Servicepartner von Schmitz Cargobull, Krone und Vergölst. '
        + 'Ein Ansprechpartner für Zugmaschine, Auflieger und Reifen.',
      logos: [...partner, ...auszeichnungen],
      nachsatz: 'Dazu Prüfstützpunkt für die Hauptuntersuchung nach § 29 StVZO.',
    })),

    marke('Streu · Grenzfall: zwei Logos'),
    vertrauenStreu({ ueber: 'Partner', titel: 'Zwei Marken, ein Stützpunkt.',
      text: 'Bei wenigen Logos bleibt das Feld bewusst luftig.', logos: partner.slice(0, 2) }),

    marke('Streu · Grenzfall: 26 Logos · es wird nichts gekürzt, das Feld wächst'),
    vertrauenStreu({ ueber: 'Vertragspartner', titel: 'Sechsundzwanzig Marken.',
      text: 'Mehr als vierzehn Logos werden dicht. Dann zieht die Maske weiter auf, '
        + 'damit kein Logo im Rand verschwindet. Oberhalb davon ist die Logowand die bessere Wahl.',
      logos: viele(26) }),

    marke('Streu · auf dunklem Grund'),
    vertrauenStreu({ ueber: 'Vertragspartner', titel: 'Dieselben Marken, dunkler Grund.',
      text: 'Die Kacheln bleiben hell, damit die Logos nicht ausgeblichen wirken.',
      logos: [...partner, weiss], tief: true }),

    marke('Zum Vergleich: der alte Baustein siegel'),
    siegel({ ueber: 'Auszeichnungen', titel: 'Werkstatt des Jahres 2024 und 2025.',
      text: 'Der bisherige Stand.', bilder: auszeichnungen }),
  ].join('\n'),
  skripte: ERSCHEINEN_SKRIPT,
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_vertrauen/index.html geschrieben,', (html.length / 1024).toFixed(1), 'kB');
