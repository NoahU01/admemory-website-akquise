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

export function seite({ titel, beschreibung, akzent = '#b4121a', basis = '',
                        nav = [], navKnopf, inhalt, fuss, betrieb, jahr = new Date().getFullYear() }) {
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
    <a class="nav__marke" href="${basis}index.html">${esc(betrieb)}</a>
    <div class="nav__links">
      ${nav.map((n) => `<a class="nav__link" href="${esc(n.href)}">${esc(n.text)}</a>`).join('')}
    </div>
    <div class="nav__rest">
      ${wenn(navKnopf, () => `<a class="knopf knopf--wichtig nav__knopf" href="${esc(navKnopf.href)}">${esc(navKnopf.text)}</a>`)}
    </div>
  </div>
</nav>

<main id="inhalt">
${inhalt}
</main>

<footer class="abschnitt--eng" style="background:var(--tief);color:var(--text-auf-tief);
        padding-block:var(--a-4) calc(var(--a-4) + var(--unten))">
  <div class="schale">
    <div class="raster raster--3">${fuss}</div>
    <hr class="trenner" style="border-color:var(--linie-tief);margin-block:var(--a-3)">
    <p class="klein" style="color:#8b97a6">
      ${esc(betrieb)} · ${jahr} — Entwurfsfassung, nicht für Suchmaschinen freigegeben.
    </p>
  </div>
</footer>
</body>
</html>`;
}

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
  return fehlt;
}
