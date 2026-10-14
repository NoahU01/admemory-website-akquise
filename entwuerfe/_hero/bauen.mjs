/* Prüfseite für die Kopfbereiche. Durchgehend allgemein: erfundener
   Betrieb, freie Bilder, Platzhalter-Wortmarken. Echtes Kundenmaterial
   gehört nicht in die Bibliothek — das wird am fertigen Entwurf geprüft,
   nicht am Katalog. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { ALLGEMEIN, MARKEN } from '../baukasten/beispiele.mjs';
import { heroMitte, heroGeteilt, heroVoll } from '../baukasten/bausteine.mjs';

const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;

const html = seite({
  titel: 'Prüfseite für die Kopfbereiche im Baukasten',
  beschreibung: 'Interne Prüfseite: Die Hero-Fassungen allgemein und mit echtem Material.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('heroMitte · allgemein · erste Wahl'),
    bsp('heroMitte', heroMitte({
      ueber: 'Elektrotechnik für Gewerbe und Privat',
      titel: 'Strom ist kein Thema, bis er es ist.',
      text: 'Installation, Prüfung und Störungsdienst aus einer Hand. '
        + 'Im Notfall sind wir innerhalb von zwei Stunden da.',
      knopfHaupt: { text: 'Unsere Leistungen', href: '#leistungen' },
      knoepfe: [{ text: 'Kontakt aufnehmen', href: '#kontakt' }],
      bild: ALLGEMEIN.handwerk, bildAlt: 'Elektriker bei der Arbeit an einer Steckdose',
      marken: MARKEN,
    })),

    marke('heroGeteilt · allgemein · mit Merkmalen'),
    bsp('heroGeteilt', heroGeteilt({
      plakette: 'Elektrotechnik seit 1984',
      titel: 'Alles rund um Strom an einem Ort',
      text: 'Von der Hausinstallation bis zur Anlagenprüfung im Betrieb. '
        + 'Eigene Mannschaft, eigenes Lager, feste Ansprechpartner.',
      merkmale: [
        { icon: 'notruf', text: 'Störungsdienst rund um die Uhr' },
        { icon: 'werkzeug', text: 'Meisterbetrieb mit zwölf Monteuren' },
        { icon: 'pruefung', text: 'Prüfung ortsfester Anlagen nach DGUV V3' },
      ],
      knoepfe: [
        { text: 'Unsere Leistungen', href: '#leistungen', art: 'wichtig' },
        { text: 'Kontakt aufnehmen', href: '#kontakt' },
      ],
      bild: ALLGEMEIN.werkzeug, bildAlt: 'Werkbank mit Werkzeug',
    })),

    marke('heroGeteilt · auf dunklem Grund'),
    heroGeteilt({
      plakette: 'Elektrotechnik seit 1984',
      titel: 'Alles rund um Strom an einem Ort',
      text: 'Dieselbe Fassung auf dunklem Grund.',
      merkmale: [
        { icon: 'notruf', text: 'Störungsdienst rund um die Uhr' },
        { icon: 'werkzeug', text: 'Meisterbetrieb mit zwölf Monteuren' },
      ],
      knoepfe: [{ text: 'Unsere Leistungen', href: '#leistungen', art: 'wichtig' }],
      bild: ALLGEMEIN.handwerk, bildAlt: 'Elektriker bei der Arbeit',
      tief: true,
    }),

    marke('heroVoll · allgemein · Bild über die volle Breite'),
    bsp('heroVoll', heroVoll({
      ueber: 'Bauunternehmen im Hohenlohekreis',
      titel: 'Wir bauen, was stehen bleibt.',
      text: 'Rohbau, Sanierung und Außenanlagen für Privat und Gewerbe. '
        + 'Seit drei Generationen im Familienbesitz.',
      knoepfe: [
        { text: 'Projekte ansehen', href: '#projekte', art: 'wichtig' },
        { text: 'Kontakt aufnehmen', href: '#kontakt' },
      ],
      bild: ALLGEMEIN.bau, bildAlt: 'Handwerker auf einer Baustelle',
    })),
  ].join('\n'),
});

fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('Hero-Prüfseite:', (html.length / 1024).toFixed(1), 'kB');
