/* Bausteine für Entwürfe.

   Jede Funktion gibt ein fertiges HTML-Stück zurück. Der Agent entscheidet,
   welche er verwendet, in welcher Reihenfolge und womit er sie füllt — das
   Aussehen entscheidet er nicht. Alle Bausteine nehmen ihre Maße und Farben
   aus stil.css.

   Neue Bausteine gehören hierher, nicht in die einzelne Seite. Was einmal
   gebraucht wird, wird meist wieder gebraucht. */

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g,
  (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

/* Nimmt wahlweise eine Funktion, damit das Textstück nicht ausgewertet wird,
   solange die Bedingung falsch ist. Sonst scheitert `wenn(x, `${x.feld}`)`
   genau dann, wenn es nichts tun sollte. */
const wenn = (b, s) => (b ? (typeof s === 'function' ? s() : s) : '');

/* Ein Bild mit dem Seitenverhältnis seiner Quelle, wenn bekannt. Ohne Angabe
   bleibt 16:9 — das passt für Fotos, aber nicht für Banner. */
function bildKasten(src, alt, { verhaeltnis, zuerst = false } = {}) {
  if (!src) return '';
  const klasse = verhaeltnis ? 'bild bild--eigen' : 'bild bild--breit';
  const stil = verhaeltnis ? ` style="--vh:${verhaeltnis}"` : '';
  const laden = zuerst ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
  return `<div class="${klasse}"${stil}><img src="${esc(src)}" alt="${esc(alt)}"${laden}></div>`;
}
const schale = (inhalt) => `<div class="schale">${inhalt}</div>`;

/* Kopfbereich. Bei einem Notdienst gehört die Nummer hierher und nicht in den
   Fußbereich — wer nachts auf der Autobahn steht, scrollt nicht. */
export function hero({ ueber, titel, text, knoepfe = [], bild, bildAlt = '',
                       bildVerhaeltnis, tief = true }) {
  return `
<header class="abschnitt ${tief ? 'abschnitt--tief' : ''}" id="start">
  ${schale(`<div class="raster raster--2" style="align-items:center">
    <div class="stapel-3">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h1>${esc(titel)}</h1>
      ${wenn(text, `<p class="lead">${esc(text)}</p>`)}
      ${wenn(knoepfe.length, `<div class="knopfreihe">${knoepfe.map(knopf).join('')}</div>`)}
    </div>
    ${bildKasten(bild, bildAlt, { verhaeltnis: bildVerhaeltnis, zuerst: true })}
  </div>`)}
</header>`;
}

export const knopf = ({ text, href, art = 'rand', neu = false }) =>
  `<a class="knopf knopf--${art}" href="${esc(href)}"${wenn(neu, ' target="_blank" rel="noopener"')}>${esc(text)}</a>`;

/* Notfallband: eine Zeile, eine Nummer, nichts drumherum. Nur verwenden, wenn
   es wirklich einen Notdienst gibt. */
export function notband({ titel, text, nummer, nummerText }) {
  return `
<section class="abschnitt--eng" style="background:var(--akzent);color:var(--akzent-text)">
  ${schale(`<div style="display:flex;flex-wrap:wrap;gap:var(--a-2);align-items:center;justify-content:space-between">
    <div><strong style="font-size:var(--t-l)">${esc(titel)}</strong>
      ${wenn(text, `<p style="opacity:.92;margin-top:.2rem">${esc(text)}</p>`)}</div>
    <a class="knopf" href="tel:${esc(nummer)}"
       style="background:#fff;color:var(--akzent);border-color:#fff;font-size:var(--t-l);font-weight:700">
      ${esc(nummerText ?? nummer)}</a>
  </div>`)}
</section>`;
}

export function leistungen({ ueber, titel, text, eintraege, spalten = 3, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}" id="leistungen">
  ${schale(`<div class="stapel-3" style="margin-bottom:var(--a-4)">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, `<p class="lead">${esc(text)}</p>`)}
    </div>
    <div class="raster raster--${spalten}">
      ${eintraege.map((e) => {
        const innen = `<h3>${esc(e.titel)}</h3>${wenn(e.text, `<p class="klein">${esc(e.text)}</p>`)}`;
        return e.href
          ? `<a class="karte karte--klickbar" href="${esc(e.href)}">${innen}</a>`
          : `<div class="karte">${innen}</div>`;
      }).join('')}
    </div>`)}
</section>`;
}

export function zahlen({ eintraege, tief = true }) {
  return `
<section class="abschnitt--eng ${tief ? 'abschnitt--tief' : 'abschnitt--gedaempft'}"
         style="padding-block:var(--a-4)">
  ${schale(`<div class="raster raster--4">
    ${eintraege.map((e) => `<div><div class="zahl">${esc(e.zahl)}</div>
      <div class="zahl-label">${esc(e.label)}</div></div>`).join('')}
  </div>`)}
</section>`;
}

export function textBild({ ueber, titel, absaetze = [], punkte = [], bild, bildAlt = '',
                           bildVerhaeltnis, knoepfe = [], bildRechts = true, tief = false }) {
  const txt = `<div class="stapel-3">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${absaetze.map((a) => `<p>${esc(a)}</p>`).join('')}
      ${wenn(punkte.length, `<ul class="liste">${punkte.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`)}
      ${wenn(knoepfe.length, `<div class="knopfreihe">${knoepfe.map(knopf).join('')}</div>`)}
    </div>`;
  const img = bildKasten(bild, bildAlt, { verhaeltnis: bildVerhaeltnis });
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="raster raster--2" style="align-items:center">
    ${bildRechts ? txt + img : img + txt}
  </div>`)}
</section>`;
}

export function markenband({ titel, marken, tief = false }) {
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel">
    ${wenn(titel, `<p class="ueber" style="margin:0">${esc(titel)}</p>`)}
    <div class="marken">${marken.map((m) => `<span class="marke">${esc(m)}</span>`).join('')}</div>
  </div>`)}
</section>`;
}

/* Zeitleiste für Betriebe mit Geschichte. Bei rolltruck.de lag die
   Firmenhistorie bis 1876 auf einer Unterseite, die niemand öffnet. */
export function zeitleiste({ ueber, titel, text, punkte, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel-3" style="margin-bottom:var(--a-4)">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, `<p class="lead">${esc(text)}</p>`)}
    </div>
    <div class="raster raster--3">
      ${punkte.map((p) => `<div class="karte">
        <div class="zahl" style="font-size:var(--t-xl)">${esc(p.jahr)}</div>
        <p class="klein" style="margin-top:.4rem">${esc(p.text)}</p></div>`).join('')}
    </div>`)}
</section>`;
}

export function kontakt({ ueber, titel, text, anschrift, telefon, telefonText, notruf, notrufText,
                          email, zeiten = [], karteHref, tief = true }) {
  return `
<section class="abschnitt ${tief ? 'abschnitt--tief' : 'abschnitt--gedaempft'}" id="kontakt">
  ${schale(`<div class="raster raster--2">
    <div class="stapel-3">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, `<p class="lead">${esc(text)}</p>`)}
      <div class="knopfreihe">
        ${wenn(telefon, () => knopf({ text: telefonText ?? telefon, href: `tel:${telefon}`, art: 'wichtig' }))}
        ${wenn(email, () => knopf({ text: email, href: `mailto:${email}` }))}
      </div>
      ${wenn(notruf, `<p class="klein" style="margin-top:var(--a-1)">Außerhalb der Zeiten:
        <a href="tel:${esc(notruf)}" style="font-weight:600">${esc(notrufText ?? notruf)}</a></p>`)}
    </div>
    <div class="karte">
      ${wenn(anschrift, () => `<h3>Anschrift</h3><p class="klein">${anschrift.map(esc).join('<br>')}</p>
        ${wenn(karteHref, () => `<p style="margin-top:var(--a-1)"><a href="${esc(karteHref)}"
          target="_blank" rel="noopener" class="klein" style="font-weight:600">Route planen</a></p>`)}`)}
      ${wenn(zeiten.length, `<hr class="trenner" style="margin-block:var(--a-2)">
        <h3>Öffnungszeiten</h3>
        <table style="width:100%;border-collapse:collapse;font-size:var(--t-s)">
          ${zeiten.map((z) => `<tr><td style="padding:.3rem 0;color:var(--text-2)">${esc(z.tag)}</td>
            <td style="padding:.3rem 0;text-align:right;font-variant-numeric:tabular-nums">${esc(z.zeit)}</td></tr>`).join('')}
        </table>`)}
    </div>
  </div>`)}
</section>`;
}
