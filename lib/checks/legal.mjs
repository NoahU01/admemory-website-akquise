import { finding, clamp } from './_util.mjs';

/* Rechtliches — hier sind Befunde doppelt wertvoll: Verkaufsargument UND oft der
   eigentliche Grund, warum ein Unternehmen handeln muss. */
export function checkLegal({ desktop }) {
  const d = desktop.dom, f = []; let score = 100;
  const host = new URL(desktop.finalUrl).hostname;

  const has = (rx) => d.links.some((l) => rx.test(l.text) || rx.test(l.href));
  if (!has(/impressum/i)) { score -= 25; f.push(finding('high', 'Kein Impressum verlinkt — in Deutschland Pflicht, abmahnfähig.')); }
  if (!has(/datenschutz|privacy/i)) { score -= 25; f.push(finding('high', 'Keine Datenschutzerklärung verlinkt — Pflicht nach DSGVO.')); }

  const reqHosts = new Set(desktop.requests.map((r) => { try { return new URL(r.url).hostname; } catch { return ''; } }));
  const gfonts = [...reqHosts].some((h) => /fonts\.(googleapis|gstatic)\.com/.test(h));
  const gmaps = d.iframes.some((s) => /google\.[a-z.]+\/maps|maps\.google/.test(s)) || [...reqHosts].some((h) => /maps\.googleapis\.com/.test(h));
  const yt = d.iframes.some((s) => /youtube\.com|youtu\.be/.test(s) && !/youtube-nocookie/.test(s));
  const ga = [...reqHosts].some((h) => /google-analytics\.com|googletagmanager\.com|analytics\.google\.com/.test(h));
  const fb = [...reqHosts].some((h) => /connect\.facebook\.net|facebook\.com\/tr/.test(h));

  if (gfonts) { score -= 12; f.push(finding('high', 'Google Fonts werden direkt von Google geladen — dafür gab es 2022/23 eine Abmahnwelle (Übermittlung der IP-Adresse ohne Einwilligung).', 'fonts.googleapis.com / fonts.gstatic.com')); }
  if ((ga || fb) && !d.hasCookieBanner) { score -= 15; f.push(finding('high', `${ga ? 'Google Analytics' : 'Facebook-Pixel'} läuft ohne erkennbaren Cookie-Hinweis — Tracking ohne Einwilligung.`)); }
  if (gmaps && !d.hasCookieBanner) { score -= 6; f.push(finding('medium', 'Google Maps ist ohne Einwilligung eingebettet.')); }
  if (yt && !d.hasCookieBanner) { score -= 5; f.push(finding('medium', 'YouTube-Video ohne Einwilligung eingebettet (kein nocookie-Modus).')); }

  // Widersprüchliche Kontaktdaten — beim Acanto standen zwei E-Mail-Adressen auf der Seite
  const mails = [...new Set((desktop.html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).map((m) => m.toLowerCase())
    .filter((m) => !/example|sentry|wixpress|wordpress|schema\.org|w3\.org|\.png|\.jpg|\.svg/.test(m)))];
  const own = mails.filter((m) => m.split('@')[1].replace(/^www\./, '').includes(host.replace(/^www\./, '').split('.')[0]));
  if (own.length >= 2) { score -= 8; f.push(finding('medium', `Auf der Seite stehen ${own.length} verschiedene E-Mail-Adressen des Betriebs — Gäste wissen nicht, welche gilt.`, own.join(' · '))); }

  const phones = [...new Set((d.text.match(/(\+49|0)[\s\d()\/.-]{7,}\d/g) || []).map((p) => p.replace(/\D/g, '')).filter((p) => p.length >= 9 && p.length <= 14))];
  if (phones.length >= 3) { score -= 4; f.push(finding('low', `${phones.length} verschiedene Telefonnummern auf der Startseite.`)); }

  return { score: clamp(score), findings: f, data: { impressum: has(/impressum/i), datenschutz: has(/datenschutz|privacy/i),
    cookieBanner: d.hasCookieBanner, googleFonts: gfonts, analytics: ga, fbPixel: fb, maps: gmaps, youtube: yt, emails: own, phones: phones.length } };
}
