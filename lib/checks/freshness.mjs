import { finding, clamp } from './_util.mjs';

/* Aktualität: wirkt die Seite gepflegt oder seit Jahren unberührt?
   Die Platzhalter-Liste stammt aus echten Funden (die Acanto-Seite hatte
   noch „137 Seacoast Ave, New York" und „Excuisite food" aus dem Theme —
   und zwar nur im Roh-HTML, nicht im gerenderten DOM). */
const PLACEHOLDERS = [
  /lorem ipsum/i, /seacoast ave/i, /new york, ny/i, /excuisite|exquisite food/i, /book a table/i,
  /your text here|ihr text hier/i, /sample text|beispieltext/i, /coming soon/i, /under construction|im aufbau/i,
  /john doe|max mustermann/i, /\(123\)\s?456-?7890|\+1 \(234\)/,
];
const COVID = /corona|covid|2g\b|3g\b|maskenpflicht|abstandsregel|lockdown/i;

export function checkFreshness({ desktop, rawHtml = '' }) {
  const d = desktop.dom, html = desktop.html + '\n' + rawHtml, f = []; let score = 100;
  const year = new Date().getFullYear();

  const years = [...(d.text + ' ' + html).matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[–-]\s*)?(20\d{2})/gi)].map((m) => +m[1]);
  const copyright = years.length ? Math.max(...years) : null;
  if (copyright && year - copyright >= 3) { score -= 20; f.push(finding('high', `Das Copyright im Fußbereich steht auf ${copyright} — die Seite wirkt seit ${year - copyright} Jahren unberührt.`, `© ${copyright}`)); }
  else if (copyright && year - copyright >= 1) { score -= 6; f.push(finding('low', `Copyright-Jahr ${copyright} ist nicht aktuell.`)); }

  const ph = PLACEHOLDERS.filter((rx) => rx.test(html));
  if (ph.length) { score -= 20; f.push(finding('high', 'Im Quelltext stehen noch Platzhalter aus der Design-Vorlage — die Seite wurde nie fertig eingerichtet.', ph.map((rx) => html.match(rx)?.[0]).filter(Boolean).slice(0, 3).join(' · '))); }

  if (COVID.test(d.text)) { score -= 15; f.push(finding('high', 'Auf der Seite stehen noch Corona-Hinweise.', d.text.match(COVID)?.[0])); }

  const gen = d.generator || '';
  const wp = gen.match(/WordPress\s*([\d.]+)/i);
  if (wp && parseFloat(wp[1]) < 6.0) { score -= 12; f.push(finding('medium', `Die Seite läuft auf einer veralteten WordPress-Version (${wp[1]}) — ein Sicherheitsrisiko.`, gen)); }
  const jq = html.match(/jquery[/-]v?([1-2])\.(\d+)/i);
  if (jq) { score -= 6; f.push(finding('low', `Veraltete jQuery-Version ${jq[1]}.${jq[2]} eingebunden.`)); }

  const engl = (d.text.match(/\b(This website uses cookies|Read more|Learn more|Privacy Overview|Necessary cookies)\b/g) || []).length;
  if (d.lang?.startsWith('de') && engl >= 2) { score -= 8; f.push(finding('medium', 'Auf der deutschen Seite stehen englische Textreste (z. B. im Cookie-Hinweis).', d.text.match(/This website uses cookies|Privacy Overview/)?.[0])); }

  const dates = [...d.text.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/g)].map((m) => +m[3]);
  const newest = dates.length ? Math.max(...dates) : null;
  if (newest && year - newest >= 3) { score -= 8; f.push(finding('medium', `Das jüngste Datum auf der Seite ist von ${newest}.`)); }

  return { score: clamp(score), findings: f, data: { copyright, placeholders: ph.length, covid: COVID.test(d.text), generator: gen || null, newestDate: newest } };
}
