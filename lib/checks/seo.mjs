import { finding, clamp, pct } from './_util.mjs';

/* Auffindbarkeit — Punkte werden verdient. Eine Seite ohne Grundlagen landet bei ~30. */
export function checkSeo({ desktop, robots, sitemap, isDraft }) {
  const d = desktop.dom, f = []; let pts = 0;
  const earn = (n) => { pts += n; };

  if (d.title && d.title.length >= 15 && d.title.length <= 70) earn(15);
  else if (d.title) { earn(8); f.push(finding('low', `Seitentitel mit ${d.title.length} Zeichen ist ${d.title.length < 15 ? 'zu kurz' : 'zu lang'} für Google.`, d.title)); }
  else f.push(finding('high', 'Die Seite hat keinen Seitentitel — Google zeigt dann die URL an.'));

  if (d.description && d.description.length >= 50 && d.description.length <= 165) earn(15);
  else if (d.description) { earn(8); f.push(finding('low', `Meta-Beschreibung mit ${d.description.length} Zeichen — Google zeigt 50 bis 160.`)); }
  else f.push(finding('high', 'Keine Meta-Beschreibung — Google setzt dann selbst einen Textausschnitt, oft unpassend.'));

  if (d.headings.h1.length === 1) earn(8);
  else if (d.headings.h1.length > 1) { earn(3); f.push(finding('medium', `${d.headings.h1.length} Hauptüberschriften (H1) auf einer Seite — Google erwartet genau eine.`)); }

  if (d.lang) earn(4); else f.push(finding('low', 'Die Seitensprache ist nicht angegeben (lang-Attribut).'));
  if (d.canonical) earn(4);
  if (d.og.title || d.og.image) earn(8); else f.push(finding('medium', 'Keine Vorschau-Angaben für WhatsApp, Facebook & Co. — geteilte Links zeigen kein Bild.'));

  const ld = d.jsonld.join(' ');
  const hasLocal = /"@type"\s*:\s*"?\[?[^\]]*?(Restaurant|LocalBusiness|FoodEstablishment|Organization|Store|Dentist|Physician|Hotel|Bakery|Cafe)/i.test(ld);
  const hasHours = /openingHours/i.test(ld);
  if (hasLocal) earn(hasHours ? 16 : 10);
  else f.push(finding('medium', 'Keine strukturierten Daten (Öffnungszeiten, Adresse, Typ) für Google hinterlegt — die Seite kann in der Suche nicht mit Zusatzinfos erscheinen.'));

  if (isDraft) earn(10);   // noindex, fehlende Sitemap sind beim Entwurf Absicht
  else {
    if (sitemap.ok) earn(6); else f.push(finding('low', 'Keine sitemap.xml gefunden.'));
    if (robots.ok) earn(4); else f.push(finding('low', 'Keine robots.txt gefunden.'));
    if (d.robotsMeta && /noindex/i.test(d.robotsMeta)) { pts = Math.min(pts, 10); f.push(finding('high', 'Die Seite ist per noindex für Suchmaschinen gesperrt — sie erscheint nicht bei Google.', d.robotsMeta)); }
  }

  const big = d.imgs.filter((i) => i.w > 50);
  const noAlt = big.filter((i) => i.alt === null || i.alt === '').length;
  const noAltPct = pct(noAlt, big.length);
  if (big.length && noAltPct <= 20) earn(10); else if (noAltPct <= 50) earn(5);
  else if (noAlt >= 3) f.push(finding('medium', `${noAltPct} % der Bilder haben keinen Alternativtext — unsichtbar für Google und Screenreader.`, `${noAlt} Bilder`));

  return { score: clamp(pts), findings: f, data: { title: d.title, titleLen: d.title?.length, descriptionLen: d.description?.length ?? 0,
    h1Count: d.headings.h1.length, lang: d.lang, structuredData: hasLocal, structuredHours: hasHours, sitemap: sitemap.ok, robots: robots.ok, noAltPct, isDraft: !!isDraft } };
}
