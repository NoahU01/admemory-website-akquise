/* Seitengerüst: Kopf, Navigation, Fußbereich.

   Das noindex steht hier fest verdrahtet, nicht als Einstellung. Ein Entwurf
   ohne Suchmaschinensperre ist der Nachbau einer fremden Firma im Google-Index
   — das darf keine Frage von Sorgfalt sein. Der HTTP-Header kommt zusätzlich
   aus vercel.json; beide Ebenen zusammen sind die Absicherung. */

import { esc } from './bausteine.mjs';

/* Die Fassung mit zwei Argumenten wertet das Textstück immer aus, auch wenn
   die Bedingung falsch ist — bei `wenn(knopf, `...${knopf.href}...`)` knallt
   es dann. Deshalb nimmt sie wahlweise eine Funktion entgegen. */
const wenn = (b, s) => (b ? (typeof s === 'function' ? s() : s) : '');

/* Eine unbekannte Angabe wird nicht mehr verschluckt. `skripte:` gab es
   lange nicht, wurde aber übergeben: Auf zwei Prüfseiten lief deshalb kein
   einziges Skript, und niemand sah es — die Seite stand ja da. */
const ERLAUBT = new Set(['titel', 'beschreibung', 'akzent', 'basis', 'logo', 'logoWeiss',
  'nav', 'navKnopf', 'inhalt', 'vorInhalt', 'fuss', 'betrieb', 'jahr', 'skripte']);

export function seite(angaben) {
  for (const k of Object.keys(angaben))
    if (!ERLAUBT.has(k))
      throw new Error(`seite(): unbekannte Angabe "${k}". Erlaubt: ${[...ERLAUBT].join(', ')}`);
  const { titel, beschreibung, akzent = '#b4121a', basis = '', logo, logoWeiss,
          nav = [], navKnopf, inhalt, vorInhalt = '', fuss, betrieb, skripte = '',
          jahr = new Date().getFullYear() } = angaben;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<title>${esc(titel)}</title>
${wenn(beschreibung, `<meta name="description" content="${esc(beschreibung)}">`)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<link rel="stylesheet" href="${basis}../baukasten/stil.css">
<style>:root{--akzent:${esc(akzent)}}</style>
</head>
<body>
<a href="#inhalt" class="knopf" style="position:absolute;left:-9999px;top:0;z-index:99"
   onfocus="this.style.left='1rem';this.style.top='1rem'"
   onblur="this.style.left='-9999px'">Zum Inhalt springen</a>

<nav class="nav kein-druck">
  <div class="schale nav__in">
    <a class="nav__marke" href="${basis}index.html">${logo
      ? `<img class="nav__logo" src="${esc(basis)}${esc(logo)}" alt="${esc(betrieb)}">`
      : esc(betrieb)}</a>
    <div class="nav__links">
      ${nav.map((n) => `<a class="nav__link" href="${esc(n.href)}">${esc(n.text)}</a>`).join('')}
    </div>
    <div class="nav__rest">
      ${wenn(navKnopf, () => `<a class="knopf knopf--wichtig nav__knopf" href="${esc(navKnopf.href)}">${esc(navKnopf.text)}</a>`)}
    </div>
  </div>
</nav>

${vorInhalt}
<main id="inhalt">
${inhalt}
</main>

${fuss}
${skripte}
</body>
</html>`;
}

/* Der Fußbereich kommt fertig von außen: fussKontakt oder fussSpalten aus
   bausteine.mjs. Vorher steckte er hier als festes Gerüst, in dem der Text
   nicht die Farben der dunklen Umgebung kannte. */

/* Gegenprobe vor dem Schreiben: Was hier durchfällt, darf gar nicht erst in
   den Ordner. Billiger als der Torwächter, der erst den Browser startet. */
export function pruefeGeruest(html) {
  const fehlt = [];
  if (!/<meta name="robots"[^>]*noindex/i.test(html)) fehlt.push('noindex-Meta fehlt');
  if (!/<html lang="de"/.test(html)) fehlt.push('Sprache nicht gesetzt');
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fehlt.push('Titel fehlt oder ist zu kurz');
  if (!/<meta name="description" content="[^"]{40,}"/.test(html)) fehlt.push('Beschreibung fehlt oder ist zu kurz');
  if ((html.match(/<h1/g) || []).length !== 1) fehlt.push('genau eine h1 erwartet');
  if (/<img(?![^>]*\balt=)/i.test(html)) fehlt.push('Bild ohne Alternativtext');
  /* Gedankenstriche lesen sich nach maschinell erzeugtem Text. Geprüft wird
     nur der sichtbare Inhalt, nicht Kommentare oder Attribute. */
  const sichtbar = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
                       .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  /* Zahlenbereiche wie "6:00 – 20:00" sind korrekte Typografie, kein
     Maschinentext. Nur der Gedankenstrich als Einschub zwischen Wörtern ist
     gemeint. */
  const einschub = sichtbar.replace(/\d\s*[–—-]\s*\d/g, '');
  if (/\s(—|--|–)\s/.test(einschub)) {
    const stelle = /(.{0,40})\s(?:—|--|–)\s(.{0,40})/.exec(einschub);
    fehlt.push(`Gedankenstrich im Text: "…${(stelle?.[1] ?? '').trim()} — ${(stelle?.[2] ?? '').trim()}…"`);
  }
  return fehlt;
}
