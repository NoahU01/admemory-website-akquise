import { finding, clamp } from './_util.mjs';

/* Inhalt & Nutzen — Punkte werden VERDIENT, nicht abgezogen.
   Eine Seite, die nur das Nötigste hat, landet bei ~50. Das spreizt echte Qualität
   von Baukasten-Mittelmaß, das „nichts falsch macht". */
const RX = {
  hours: /öffnungszeiten|opening hours|geöffnet|ruhetag|\b(mo|di|mi|do|fr|sa|so)\.?\s*[–-]\s*(mo|di|mi|do|fr|sa|so)\b|\d{1,2}[:.]\d{2}\s*(–|-|bis)\s*\d{1,2}[:.]\d{2}/i,
  phone: /(\+49|0)[\s\d()\/.-]{7,}\d/,
  address: /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß-]+/,
  cta: /reservier|tisch|bestell|anfrage|anfragen|kontakt|termin|angebot|buchen|anrufen/i,
  menu: /speisekarte|speisen|menü|menu|karte|getränke|preise|leistungen|angebot/i,
  reserve: /reservier|opentable|resmio|quandoo|bookatable|termin/i,
  order: /lieferando|wolt|uber\s?eats|bestell/i,
};

export function checkContent({ desktop }) {
  const d = desktop.dom, f = []; let pts = 0;
  const text = d.text;
  const earn = (n) => { pts += n; };

  if (RX.hours.test(text)) earn(14); else f.push(finding('high', 'Öffnungszeiten sind auf der Startseite nicht zu finden — die meistgesuchte Information bei einem lokalen Betrieb.'));
  const telLinks = d.links.filter((l) => l.href.startsWith('tel:'));
  if (telLinks.length) earn(10);
  else if (RX.phone.test(text)) { earn(4); f.push(finding('medium', 'Die Telefonnummer ist nicht antippbar — auf dem Handy muss man sie abtippen.', 'kein tel:-Link')); }
  else f.push(finding('high', 'Keine Telefonnummer auf der Startseite.'));
  if (RX.address.test(text)) earn(6); else f.push(finding('medium', 'Keine Adresse auf der Startseite erkennbar.'));

  const ctaLinks = d.links.filter((l) => RX.cta.test(l.text));
  if (ctaLinks.length) earn(10); else f.push(finding('high', 'Keine klare Handlungsaufforderung (Reservieren, Anrufen, Anfragen) auf der Startseite.'));

  const menuLinks = d.links.filter((l) => RX.menu.test(l.text) || RX.menu.test(l.href));
  const pdfMenus = menuLinks.filter((l) => /\.pdf(\?|$)/i.test(l.href));
  const htmlMenus = menuLinks.filter((l) => !/\.pdf(\?|$)/i.test(l.href) && !/^(tel|mailto):/.test(l.href));
  const imgMenus = d.imgs.filter((i) => RX.menu.test(i.src) || RX.menu.test(i.alt || ''));
  if (htmlMenus.length) earn(14);
  if (pdfMenus.length && !htmlMenus.length) f.push(finding('high', 'Die Karte gibt es nur als PDF — auf dem Handy unhandlich, für Google unsichtbar, nicht filterbar.', pdfMenus[0].href));
  else if (pdfMenus.length) f.push(finding('low', 'Teile der Karte liegen zusätzlich als PDF vor.', pdfMenus[0].href));
  if (imgMenus.length >= 2 && !htmlMenus.length) f.push(finding('high', 'Die Karte ist als Bild eingebunden — nicht lesbar für Suchmaschinen, nicht zoombar für Gäste.'));
  if (!menuLinks.length) f.push(finding('medium', 'Kein Verweis auf Karte, Leistungen oder Angebot von der Startseite aus.'));

  if (d.headings.h1.length === 1) earn(5); else if (!d.headings.h1.length) f.push(finding('medium', 'Die Startseite hat keine Hauptüberschrift (H1).'));
  if (d.wordCount >= 250) earn(10); else if (d.wordCount >= 120) earn(5);
  else f.push(finding('medium', `Die Startseite hat nur rund ${d.wordCount} Wörter Text — zu wenig, um Gäste oder Google zu überzeugen.`));
  if (d.headings.h2 >= 3) earn(5);
  const ownImgs = d.imgs.filter((i) => i.w >= 600 && !/logo|icon|placeholder/i.test(i.src)).length;
  if (ownImgs >= 4) earn(8); else if (ownImgs >= 1) earn(3);
  else f.push(finding('medium', 'Keine großformatigen Fotos auf der Startseite — man sieht nicht, was einen erwartet.'));

  const social = d.links.filter((l) => /facebook|instagram/i.test(l.href)).length;
  if (social) earn(4);
  const reserve = d.links.some((l) => RX.reserve.test(l.href) || RX.reserve.test(l.text));
  const order = d.links.some((l) => RX.order.test(l.href + l.text));
  if (reserve) earn(7); if (order) earn(3);
  const mailto = d.links.some((l) => l.href.startsWith('mailto:'));
  if (mailto) earn(4);

  return { score: clamp(pts), findings: f,
    data: { hoursFound: RX.hours.test(text), telLink: !!telLinks.length, address: RX.address.test(text), ctaCount: ctaLinks.length,
            menuLinks: menuLinks.length, htmlMenus: htmlMenus.length, pdfMenus: pdfMenus.length, wordCount: d.wordCount,
            h1: d.headings.h1, h2Count: d.headings.h2, photos: ownImgs, social, reserve, order, mailto } };
}
