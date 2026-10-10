import { finding, clamp } from './_util.mjs';
import { profilVon } from '../branchen.mjs';

/* Inhalt & Nutzen — Punkte werden VERDIENT, nicht abgezogen.
   Wonach gesucht wird, kommt aus dem Branchenprofil: Ein Dachdecker hat keine
   Speisekarte, eine Praxis keine Reservierung. Die Punktzahlen bleiben für alle
   Branchen identisch, damit die Scores vergleichbar sind. */
const RX = {
  phone:   /(\+49|0)[\s\d()\/.-]{7,}\d/,
  address: /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß-]+/,
  kontakt: /kontakt|impressum|anfahrt|so finden sie uns|standort/i,
};

export function checkContent({ desktop, branche }) {
  const d = desktop.dom, f = []; let pts = 0;
  const P = profilVon(branche?.key);
  const text = d.text;
  const earn = (n) => { pts += n; };
  const begriff = { gastro: 'Speisekarte', handel: 'Sortiment' }[branche?.key] || 'Leistungsübersicht';

  // ── Grundinformationen ───────────────────────────────────────────────
  const zeitenDa = P.zeiten.test(text);
  if (zeitenDa) earn(14);
  else f.push(finding('high', `${branche?.key === 'gesundheit' ? 'Sprechzeiten' : 'Öffnungszeiten'} sind auf der Startseite nicht zu finden — eine der meistgesuchten Informationen bei einem lokalen Betrieb.`));

  const telLinks = d.links.filter((l) => l.href.startsWith('tel:'));
  if (telLinks.length) earn(10);
  else if (RX.phone.test(text)) { earn(4); f.push(finding('medium', 'Die Telefonnummer ist nicht antippbar — auf dem Handy muss man sie abtippen.', 'kein tel:-Link')); }
  else f.push(finding('high', 'Keine Telefonnummer auf der Startseite.'));

  if (RX.address.test(text)) earn(6); else f.push(finding('medium', 'Keine Adresse auf der Startseite erkennbar.'));

  // ── Abschluss: kommt der Besucher zum Handeln? ───────────────────────
  /* Dieselbe Lücke wie in der Fold-Prüfung: Ein tel:- oder mailto:-Link ist ein
     Abschluss, auch wenn nur eine Nummer daraufsteht. Bei Notdiensten und im
     Handwerk ist genau das der übliche Weg — die wurden bisher dafür
     abgewertet, dass sie anrufen lassen statt ein Formular anzubieten. */
  const ctaLinks = d.links.filter((l) =>
    P.abschluss.test(l.text) ||
    /^(tel:|mailto:|sms:|whatsapp:)/i.test(l.href || '') ||
    /^[\d\s()\/+.-]{7,}$/.test((l.text || '').trim()));
  if (ctaLinks.length) earn(10);
  else f.push(finding('high', 'Keine klare Handlungsaufforderung auf der Startseite — ein Besucher weiß nicht, was er als Nächstes tun soll.'));

  // ── Das Angebot: wie ist es aufbereitet? ─────────────────────────────
  const angebotLinks = d.links.filter((l) => P.angebot.test(l.text) || P.angebot.test(l.href));
  const pdfs = angebotLinks.filter((l) => /\.pdf(\?|$)/i.test(l.href));
  const htmlAngebot = angebotLinks.filter((l) => !/\.pdf(\?|$)/i.test(l.href) && !/^(tel|mailto):/.test(l.href));
  const bildAngebot = d.imgs.filter((i) => P.angebot.test(i.src) || P.angebot.test(i.alt || ''));
  const angebotImText = P.angebot.test(text);

  if (htmlAngebot.length) earn(14);
  else if (angebotImText) earn(7);          // steht auf der Startseite, aber ohne eigene Seite
  if (pdfs.length && !htmlAngebot.length) f.push(finding('high', `Die ${begriff} gibt es nur als PDF — auf dem Handy unhandlich, für Google unsichtbar.`, pdfs[0].href));
  else if (pdfs.length) f.push(finding('low', `Teile der ${begriff} liegen zusätzlich als PDF vor.`, pdfs[0].href));
  if (bildAngebot.length >= 2 && !htmlAngebot.length) f.push(finding('high', `Die ${begriff} ist als Bild eingebunden — nicht lesbar für Suchmaschinen, nicht zoombar.`));
  if (!angebotLinks.length && !angebotImText) f.push(finding('high', `Keine ${begriff} auffindbar — man erfährt nicht, was der Betrieb anbietet.`));

  // ── Vertrauen ────────────────────────────────────────────────────────
  const vertrauen = P.vertrauen.test(text) || d.links.some((l) => P.vertrauen.test(l.text));
  if (vertrauen) earn(7);
  else f.push(finding('medium', 'Nichts, was Vertrauen schafft — keine Referenzen, kein Team, keine Geschichte des Betriebs.'));

  // ── Struktur und Substanz ────────────────────────────────────────────
  if (d.headings.h1.length === 1) earn(5);
  else if (!d.headings.h1.length) f.push(finding('medium', 'Die Startseite hat keine Hauptüberschrift (H1).'));
  if (d.wordCount >= 250) earn(10); else if (d.wordCount >= 120) earn(5);
  else f.push(finding('medium', `Die Startseite hat nur rund ${d.wordCount} Wörter Text — zu wenig, um Besucher oder Google zu überzeugen.`));
  if (d.headings.h2 >= 3) earn(5);

  const fotos = d.imgs.filter((i) => i.w >= 600 && !/logo|icon|placeholder/i.test(i.src)).length;
  if (fotos >= 4) earn(8); else if (fotos >= 1) earn(3);
  else f.push(finding('medium', 'Keine großformatigen Fotos auf der Startseite — man sieht nicht, was einen erwartet.'));

  // ── Komfort ──────────────────────────────────────────────────────────
  if (d.links.some((l) => /facebook|instagram|linkedin/i.test(l.href))) earn(4);
  const buchung = d.links.some((l) => P.buchung.test(l.href) || P.buchung.test(l.text));
  if (buchung) earn(3);
  if (d.links.some((l) => l.href.startsWith('mailto:'))) earn(4);

  return {
    score: clamp(pts), findings: f,
    data: { branche: branche?.key, branchenLabel: P.label, zeiten: zeitenDa, telLink: !!telLinks.length,
            address: RX.address.test(text), ctaCount: ctaLinks.length, angebotLinks: angebotLinks.length,
            htmlAngebot: htmlAngebot.length, pdfs: pdfs.length, angebotImText, vertrauen, buchung,
            wordCount: d.wordCount, h1: d.headings.h1, h2Count: d.headings.h2, fotos },
  };
}
