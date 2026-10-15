/* Prüfseite für die Kopfbereiche. Durchgehend allgemein: erfundener
   Betrieb, freie Bilder, Platzhalter-Wortmarken. Echtes Kundenmaterial
   gehört nicht in die Bibliothek — das wird am fertigen Entwurf geprüft,
   nicht am Katalog. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { ALLGEMEIN, MARKEN, LOGO } from '../baukasten/beispiele.mjs';
import { heroMitte, heroGeteilt, heroVoll, heroKarte } from '../baukasten/bausteine.mjs';

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
      /* Im Kopfbereich steht die einheitliche Platzhaltermarke statt der
         bunten Kundenlogos — sie ist einfarbig und wird auf dem dunklen
         Bild weiß. Acht Stück, wie die Regel es verlangt. */
      marken: Array.from({ length: 8 }, (_, i) =>
        ({ name: 'Partner ' + (i + 1), pfad: LOGO, einfarbig: true })),
    })),

    marke('heroGeteilt · allgemein · mit Merkmalen'),
    bsp('heroGeteilt', heroGeteilt({
      plakette: 'Elektrotechnik seit 1984',
      titel: 'Alles rund um Strom an einem Ort',
      text: 'Von der Hausinstallation bis zur Anlagenprüfung im Betrieb.\n'
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

    marke('heroKarte · Überschrift mit Hakenliste, Karte rechts, Infoleiste darunter'),
    bsp('heroKarte', heroKarte({
      plakette: 'Meisterbetrieb seit 1984',
      titel: 'Elektrotechnik, auf die Sie sich verlassen können',
      text: 'Installation, Prüfung und Störungsdienst für Privat und Gewerbe im Umkreis von 30 Kilometern.',
      punkte: [
        'Fester Termin, kein Zeitfenster von vier Stunden',
        'Festpreis vor der Arbeit, keine Nachforderung',
        'Störungsdienst rund um die Uhr erreichbar',
      ],
      knoepfe: [
        { text: 'Termin anfragen', href: '#termin', art: 'wichtig' },
        { text: 'Leistungen ansehen', href: '#leistungen', art: 'leise' },
      ],
      bild: ALLGEMEIN.handwerk, bildAlt: 'Elektriker bei der Arbeit',
      satz: 'Wir sind ein Familienbetrieb in zweiter Generation. Was wir zusagen, halten wir.',
      wer: 'Thomas Berger, Elektromeister',
      leiste: [
        { icon: 'ort', titel: 'Anschrift', zeilen: ['Hauptstraße 18', '74564 Crailsheim'] },
        { icon: 'uhr', titel: 'Öffnungszeiten', zeilen: ['Mo–Do 7–17 Uhr', 'Fr 7–13 Uhr'] },
        { icon: 'telefon', titel: 'Telefon', zeilen: ['07951 123456-0', 'Störungsdienst rund um die Uhr'] },
      ],
    })),

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
