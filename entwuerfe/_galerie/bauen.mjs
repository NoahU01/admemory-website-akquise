/* Prüfseite für die Bildergalerie. Alle fünf Fassungen mit den freien
   Beispielbildern.

   Vorher und Nachher: Wir haben kein echtes Paar vom selben Ort. Für die
   Bibliothek wird das Vorher-Bild aus demselben Foto erzeugt und
   entsättigt — nur so zeigt der Regler das, was er zeigen soll:
   denselben Ausschnitt in zwei Zuständen. Bei einem echten Betrieb
   kommen zwei echte Aufnahmen hinein. */
import fs from 'node:fs';
import { seite } from '../baukasten/seite.mjs';
import { bsp } from '../baukasten/katalog.mjs';
import { ALLGEMEIN } from '../baukasten/beispiele.mjs';
import { galerieGitter, galerieZiehharmonika, galerieReihe, galerieCollage,
         galerieVorherNachher, GALERIE_SKRIPT } from '../baukasten/bausteine.mjs';

const A = ALLGEMEIN;
const bilder = [
  { pfad: A.handwerk, text: 'Neuinstallation in einem Mehrfamilienhaus' },
  { pfad: A.werkstatt, text: 'Eigene Werkstatt in Crailsheim' },
  { pfad: A.bau,       text: 'Rohbau-Elektrik für ein Bürogebäude' },
  { pfad: A.werkzeug,  text: 'Werkbank und Prüfgeräte' },
  { pfad: A.team,      text: 'Planung im Büro' },
  { pfad: A.buero,     text: 'Netzwerktechnik im Betrieb' },
  { pfad: A.beratung,  text: 'Übergabe beim Kunden' },
  { pfad: A.lkw,       text: 'Servicewagen im Einsatz' },
];
const arbeiten = [
  { marke: 'Sanierung', titel: 'Altbau Hauptstraße', pfad: A.bau,
    text: 'Komplette Neuinstallation in einem Gebäude von 1908, bei laufendem Betrieb im Erdgeschoss.' },
  { marke: 'Gewerbe', titel: 'Bürohaus Lindenweg', pfad: A.buero,
    text: 'Netzwerk, Beleuchtung und Ladepunkte für siebzig Arbeitsplätze.' },
  { marke: 'Industrie', titel: 'Halle Gewerbepark', pfad: A.werkstatt,
    text: 'Umstellung auf LED und Prüfung der ortsfesten Anlagen nach DGUV V3.' },
  { marke: 'Privat', titel: 'Einfamilienhaus Burgberg', pfad: A.handwerk,
    text: 'Photovoltaik mit Speicher und Wallbox, Anmeldung beim Netzbetreiber inklusive.' },
  { marke: 'Service', titel: 'Störungsdienst', pfad: A.lkw,
    text: 'Drei Servicewagen, rund um die Uhr besetzt.' },
];
const karten = arbeiten.map((a) => ({ marke: a.marke, titel: a.titel, pfad: a.pfad, href: '#' }));
const marke = (t) => `<div class="schale" style="padding-block:var(--a-3)"><p class="ueber">${t}</p></div>`;
const probe = (was, fn) => { try { fn(); return `${was}: KEIN ABBRUCH — Fehler`; }
  catch (e) { return `${was}: ${e.message}`; } };

const html = seite({
  titel: 'Prüfseite für die Bildergalerie im Baukasten',
  beschreibung: 'Interne Prüfseite: fünf Fassungen für Bilder und Referenzen.',
  betrieb: 'Baukasten', nav: [], fuss: '<div><p class="klein">Interne Prüfseite</p></div>',
  inhalt: [
    marke('galerieGitter · Mauerwerk, Klick öffnet groß · erste Wahl'),
    bsp('galerieGitter', galerieGitter({
      titel: 'Arbeiten aus den letzten Monaten',
      text: 'Alle Bilder stammen von eigenen Baustellen, keine Katalogfotos.',
      bilder })),

    marke('galerieZiehharmonika · ein Feld breit, die anderen schmal'),
    bsp('galerieZiehharmonika', galerieZiehharmonika({
      titel: 'Fünf Arbeiten, fünf Aufgaben',
      text: 'Fahren Sie über ein Feld, um mehr zu sehen.',
      arbeiten })),

    marke('galerieReihe · waagerechter Schieber mit Karten'),
    bsp('galerieReihe', galerieReihe({
      titel: 'Referenzen',
      text: 'Nach Bereichen sortiert, von privat bis Industrie.',
      karten })),

    marke('galerieCollage · Anreißer, führt auf die Galerie'),
    bsp('galerieCollage', galerieCollage({
      titel: 'Was wir gebaut haben, steht noch',
      text: 'Über vierzig Projekte im Umkreis von dreißig Kilometern, vom Einfamilienhaus bis zur Produktionshalle.',
      knoepfe: [{ text: 'Alle Referenzen', href: '#galerie', art: 'wichtig' },
                { text: 'Kontakt aufnehmen', href: '#kontakt', art: 'leise' }],
      bilder: [{ pfad: A.bau, text: 'Rohbau' }, { pfad: A.handwerk, text: 'Installation' },
               { pfad: A.werkstatt, text: 'Werkstatt' }] })),

    marke('galerieVorherNachher · Regler zwischen zwei Zuständen'),
    bsp('galerieVorherNachher', galerieVorherNachher({
      titel: 'Vorher und nachher',
      text: 'Ziehen Sie den Regler, um den Unterschied zu sehen.',
      paare: [
        { titel: 'Altbau Hauptstraße, Treppenhaus', vorher: A.bau, nachher: A.handwerk },
        { titel: 'Bürohaus Lindenweg, Großraum', vorher: A.buero, nachher: A.team },
      ] })),

    `<div class="schale" style="padding-block:var(--a-4)">
      <p class="ueber">Was der Baukasten verweigert</p>
      <ul class="klein" style="margin-top:var(--a-2);line-height:1.9">
        <li>${probe('Raster mit vier Bildern', () => galerieGitter({ titel: 'x', bilder: bilder.slice(0, 4) }))}</li>
        <li>${probe('Ziehharmonika mit neun Arbeiten', () => galerieZiehharmonika({ titel: 'x',
          arbeiten: Array.from({ length: 9 }, () => arbeiten[0]) }))}</li>
        <li>${probe('Collage mit fünf Bildern', () => galerieCollage({ titel: 'x', bilder: bilder.slice(0, 5) }))}</li>
        <li>${probe('Vergleich ohne Nachher', () => galerieVorherNachher({ titel: 'x',
          paare: [{ titel: 'a', vorher: A.bau }] }))}</li>
      </ul>
    </div>`,
  ].join('\n'),
  skripte: GALERIE_SKRIPT,
});
fs.writeFileSync(new URL('index.html', import.meta.url), html);
console.log('_galerie geschrieben,', (html.length / 1024).toFixed(1), 'kB');
