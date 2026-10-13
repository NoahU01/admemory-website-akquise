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

export function leistungen({ ueber, titel, text, eintraege, spalten = 3,
                             mittig = false, iconStil = 'kasten', tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}" id="leistungen">
  ${schale(`<div class="stapel-3" style="margin-bottom:var(--a-4)">
      ${wenn(ueber, `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, `<p class="lead">${esc(text)}</p>`)}
    </div>
    <div class="raster raster--${spalten}">
      ${eintraege.map((e) => {
        const innen = `${wenn(e.icon, () => `<div class="karte__icon karte__icon--${iconStil}">${zeichen(e.icon)}</div>`)}` +
          `<h3>${esc(e.titel)}</h3>${wenn(e.text, () => `<p class="klein">${esc(e.text)}</p>`)}`;
        // Eine Karte darf herausstechen, damit das Raster nicht gleichförmig wirkt
        const k = 'karte' + (e.wichtig ? ' karte--wichtig' : '') + (e.href ? ' karte--klickbar' : '');
        return e.href ? `<a class="${k}" href="${esc(e.href)}">${innen}</a>`
                      : `<div class="${k}">${innen}</div>`;
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

/* ── Icons ────────────────────────────────────────────────────────
   Ein Strichstil über die ganze Seite. Gemischte Stile lassen eine
   Oberfläche zusammengesetzt wirken, auch wenn jedes Zeichen für sich gut ist. */
export const ZEICHEN = {
  notruf:     'M12 3a9 9 0 0 1 9 9M12 7a5 5 0 0 1 5 5M8.5 4.5l2 3.5l-2 1.5a11 11 0 0 0 6 6l1.5-2l3.5 2l-1 3a2 2 0 0 1-2 1.3A16 16 0 0 1 4.2 7.5A2 2 0 0 1 5.5 5.5z',
  werkzeug:   'M14.7 6.3a4 4 0 0 1 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9M9 9L4.5 4.5M7 11L2.5 6.5',
  reifen:     'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21',
  teile:      'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l8 4.5l8-4.5',
  pruefung:   'M9 11l2.5 2.5L16 9M12 3l7 3v6c0 4.2-2.9 7.8-7 9c-4.1-1.2-7-4.8-7-9V6z',
  miete:      'M5 17h14M6 17V9l6-4l6 4v8M9 17v-4h6v4',
  tankstelle: 'M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M3 20h12M7 8h4M16 9l3 2v7a1.5 1.5 0 0 1-3 0v-4h-2',
  wasser:     'M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3',
  oel:        'M5 19h14M7 19v-5a5 5 0 0 1 10 0v5M12 9V5M9.5 6.5L12 4l2.5 2.5',
  wohnmobil:  'M3 16V8a2 2 0 0 1 2-2h9l5 5v5M3 16h18M7.5 16a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0M15 16a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0M6 9h4v3H6z',
  uhr:        'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  haus:       'M3 20h18M5 20V8l7-4l7 4v12M10 20v-5h4v5',
  leute:      'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16.5 4.5a3.5 3.5 0 0 1 0 6.9M21 20v-1a5 5 0 0 0-3.5-4.8',
  haken:      'M20 6L9 17l-5-5',
  stern:      'M12 3.5l2.6 5.4l5.9.8l-4.3 4.1l1 5.9L12 17l-5.2 2.7l1-5.9L3.5 9.7l5.9-.8z',
};
export const zeichen = (n) => ZEICHEN[n]
  ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ZEICHEN[n]}"/></svg>` : '';

/* ── Hero: Bild über die volle Breite, Text darüber ──────────────
   Trägt weiter als die geteilte Anordnung, wenn das Bild auch abgedunkelt
   noch etwas zeigt. */
export function heroVoll({ ueber, titel, text, knoepfe = [], bild, bildAlt = '' }) {
  return `
<header class="hero-voll" id="start">
  <div class="hero-voll__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  ${schale(`<div class="stapel-3" style="color:#fff">
    ${wenn(ueber, () => `<p class="ueber" style="color:#ffb4b4">${esc(ueber)}</p>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead" style="color:#e6ebf2;opacity:1">${esc(text)}</p>`)}
    ${wenn(knoepfe.length, () => `<div class="knopfreihe">${knoepfe.map(knopf).join('')}</div>`)}
  </div>`)}
</header>`;
}

/* ── Hero: Text oben, breites Bildband darunter ──────────────────
   Für Bilder im Panoramaformat, die als Ausschnitt nichts hergeben. */
export function heroBand({ ueber, titel, text, knoepfe = [], bild, bildAlt = '', tief = true }) {
  return `
<header class="abschnitt ${tief ? 'abschnitt--tief' : ''}" id="start">
  ${schale(`<div class="stapel-3" style="max-width:62ch">
      ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
      <h1>${esc(titel)}</h1>
      ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
      ${wenn(knoepfe.length, () => `<div class="knopfreihe">${knoepfe.map(knopf).join('')}</div>`)}
    </div>
    ${wenn(bild, () => `<div class="hero-band__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}"
       fetchpriority="high"></div>`)}`)}
</header>`;
}

/* ── Sticky-Lasche ───────────────────────────────────────────────
   Nur verwenden, wenn ein Anruf wirklich das Ziel ist. */
export function ruflasche({ titel, nummer, nummerText, icon = 'notruf' }) {
  return `
<a class="ruflasche kein-druck" href="tel:${esc(nummer)}" aria-label="${esc(titel)}: ${esc(nummerText ?? nummer)}">
  <span class="ruflasche__zeichen">${zeichen(icon)}</span>
  <span class="ruflasche__text"><b>${esc(titel)}</b><span>${esc(nummerText ?? nummer)}</span></span>
</a>`;
}

/* ── Logoband ────────────────────────────────────────────────────
   Markennamen als Textpille wirken billig. Logos oder gar nichts. */
export function logoband({ ueber, titel, logos, nachsatz, tief = false }) {
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel-3">
    ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
    ${wenn(titel, () => `<h2 style="font-size:var(--t-l)">${esc(titel)}</h2>`)}
    <div class="logoband">${logos.map((l) =>
      `<img src="${esc(l.pfad)}" alt="${esc(l.name)}" loading="lazy">`).join('')}</div>
    ${wenn(nachsatz, () => `<p class="klein">${esc(nachsatz)}</p>`)}
  </div>`)}
</section>`;
}

/* ── Auszeichnungen ──────────────────────────────────────────────
   Siegel groß zeigen, nicht als Dekoration am Rand. */
export function siegel({ ueber, titel, text, bilder, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="raster raster--2" style="align-items:center">
    <div class="stapel-3">
      ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    </div>
    <div class="siegel">${bilder.map((b) =>
      `<img src="${esc(b.pfad)}" alt="${esc(b.name)}" loading="lazy">`).join('')}</div>
  </div>`)}
</section>`;
}

/* ══ Verläufe ════════════════════════════════════════════════════
   Drei Fassungen für dieselbe Art Inhalt: Abläufe, Historie, Vorgehen.

   verlaufSeitlich   Viele Schritte mit je zwei bis drei Zeilen Text.
                     Braucht links genug Text, sonst steht die Spalte leer.
                     Trägt vier bis sieben Einträge.
   verlaufWaagerecht Wenige Stationen, sehr kurze Texte, am besten drei bis
                     fünf. Gut für "so läuft es ab" oder eine Jahreszahlen-
                     reihe. Bei mehr als fünf wird es am Rechner eng.
   verlaufSchmal     Lange Erklärtexte, ruhige Seite. Keine Konkurrenz durch
                     Bilder daneben. Trägt drei bis sechs Einträge.        */

export function verlaufSeitlich({ ueber, titel, text, schritte, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="verlauf-seitlich">
    <div class="stapel-3">
      ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    </div>
    <ol class="verlauf-liste">
      ${schritte.map((s, i) => {
        const marke = String(s.marke ?? i + 1);
        /* Ein Haken vor jedem Titel passt zu einer Checkliste, nicht zu einer
           Historie. Deshalb nur, wenn ausdrücklich gewünscht. */
        const kopf = s.icon
          ? `<div class="verlauf-kopf">${zeichen(s.icon)}<div><h3>${esc(s.titel)}</h3>` +
            `${wenn(s.text, () => `<p class="klein" style="margin-top:.4rem">${esc(s.text)}</p>`)}</div></div>`
          : `<h3>${esc(s.titel)}</h3>` +
            `${wenn(s.text, () => `<p class="klein" style="margin-top:.4rem">${esc(s.text)}</p>`)}`;
        return `<li class="verlauf-schritt">
        <span class="verlauf-nummer">${esc(marke)}</span>
        <div class="karte">${kopf}</div></li>`;
      }).join('')}
    </ol>
  </div>`)}
</section>`;
}

/* bisHier: bis zu welcher Station der Verlauf als erreicht gilt. Bei einer
   Firmenhistorie sind das alle; bei einem laufenden Vorgang nur ein Teil. */
export function verlaufWaagerecht({ ueber, titel, text, stationen, bisHier = stationen.length, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel-3" style="margin-bottom:var(--a-4);max-width:62ch">
      ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
      ${wenn(titel, () => `<h2>${esc(titel)}</h2>`)}
      ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    </div>
    <ol class="verlauf-waagerecht">
      ${stationen.map((s, i) => `<li class="verlauf-punkt"${i < bisHier ? ' data-erreicht' : ''}>
        ${wenn(s.marke, () => `<p class="verlauf-datum">${esc(s.marke)}</p>`)}
        <h3>${esc(s.titel)}</h3>
        ${wenn(s.text, () => `<p class="klein">${esc(s.text)}</p>`)}</li>`).join('')}
    </ol>`)}
</section>`;
}

export function verlaufSchmal({ plakette, titel, text, schritte, tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="verlauf-schmal">
    <div style="margin-bottom:var(--a-4)">
      ${wenn(plakette, () => `<span class="plakette">${esc(plakette)}</span>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead" style="margin-top:.75rem">${esc(text)}</p>`)}
    </div>
    <ol>
      ${schritte.map((s) => `<li>
        <div class="verlauf-spur">
          <span class="verlauf-kasten">${zeichen(s.icon ?? 'haken')}</span>
          <span class="verlauf-strich"></span>
        </div>
        <div class="verlauf-text">
          <h3>${esc(s.titel)}</h3>
          ${wenn(s.text, () => `<p class="klein">${esc(s.text)}</p>`)}
        </div></li>`).join('')}
    </ol>
  </div>`)}
</section>`;
}

/* ══ Hero-Varianten ══════════════════════════════════════════════
   heroMitte    Ganzflächiges Bild, Text mittig darüber, große leichte
                Überschrift. Die einnehmendste Fassung. Braucht ein Bild, das
                abgedunkelt noch trägt, und eine Überschrift unter acht Wörtern.
   heroGeteilt  Links Text mit Merkmalen und Knöpfen, rechts ein Bild, das zum
                Rand ausblendet. Für ein einzelnes gutes Bild, und wenn drei
                Merkmale sofort genannt werden sollen.
   heroTiefe    Wie heroMitte, aber das Bild wandert beim Scrollen langsamer.
                Nur bei einem ruhigen, tiefen Motiv. Bei einem unruhigen Bild
                wirkt die Bewegung billig.                                    */

const PFEIL = 'M7 17L17 7M9 7h8v8';

/* Pillenknopf mit abgesetztem Pfeilkreis. */
export function knopfPille({ text, href, neu = false }) {
  const pfeil = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PFEIL}"/></svg>`;
  return `<a class="knopf-pille" href="${esc(href)}"${wenn(neu, ' target="_blank" rel="noopener"')}>
    <span class="knopf-pille__text">${esc(text)}</span>
    <span class="knopf-pille__kreis">${pfeil}${pfeil}</span></a>`;
}

export function heroMitte({ ueber, titel, text, knopfHaupt, knoepfe = [], bild, bildAlt = '', marken = [] }) {
  return `
<header class="hero-mitte" id="start">
  <div class="hero-mitte__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  ${schale(`<div class="hero-mitte__in">
    ${wenn(ueber, () => `<p class="ueber" style="color:#ffb4b4;margin:0">${esc(ueber)}</p>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    ${wenn(knopfHaupt || knoepfe.length, () => `<div class="knopfreihe" style="justify-content:center">
      ${wenn(knopfHaupt, () => knopfPille(knopfHaupt))}${knoepfe.map(knopf).join('')}</div>`)}
    ${wenn(marken.length, () => `<div class="logoband" style="justify-content:center;margin-top:var(--a-2)">
      ${marken.map((m) => `<img src="${esc(m.pfad)}" alt="${esc(m.name)}" loading="lazy">`).join('')}</div>`)}
  </div>`)}
</header>`;
}

export function heroGeteilt({ plakette, titel, text, merkmale = [], knoepfe = [], bild, bildAlt = '' }) {
  return `
<header class="hero-geteilt" id="start">
  <div class="hero-geteilt__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  ${schale(`<div class="hero-geteilt__in stapel-3">
    ${wenn(plakette, () => `<span class="plakette" style="margin:0">${esc(plakette)}</span>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    ${wenn(merkmale.length, () => `<ul class="merkmale">${merkmale.map((m) =>
      `<li>${zeichen(m.icon ?? 'haken')}<span>${esc(m.text ?? m)}</span></li>`).join('')}</ul>`)}
    ${wenn(knoepfe.length, () => `<div class="knopfreihe">${knoepfe.map(knopf).join('')}</div>`)}
  </div>`)}
</header>`;
}

export function heroTiefe({ ueber, titel, text, knopfHaupt, knoepfe = [], bild, bildAlt = '' }) {
  return `
<header class="hero-tiefe" id="start" data-tiefe>
  <div class="hero-tiefe__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  <div class="hero-tiefe__in">
    ${wenn(ueber, () => `<p class="ueber" style="color:#ffb4b4;margin:0">${esc(ueber)}</p>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead" style="color:#e9eef4;opacity:1;max-width:46rem">${esc(text)}</p>`)}
    ${wenn(knopfHaupt || knoepfe.length, () => `<div class="knopfreihe" style="justify-content:center">
      ${wenn(knopfHaupt, () => knopfPille(knopfHaupt))}${knoepfe.map(knopf).join('')}</div>`)}
  </div>
</header>`;
}

/* Das Skript für die Tiefenwirkung. Nur einbinden, wenn heroTiefe verwendet
   wird: Ohne Bewegung braucht die Seite kein Skript. Läuft ohne
   Fremdbibliothek und hält sich an die Systemeinstellung für reduzierte
   Bewegung. */
export const TIEFE_SKRIPT = `
<script>
(function () {
  var el = document.querySelector('[data-tiefe] .hero-tiefe__bild');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var laeuft = false;
  function schieben() {
    var y = window.scrollY;
    if (y < window.innerHeight * 1.2) el.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0)';
    laeuft = false;
  }
  addEventListener('scroll', function () {
    if (!laeuft) { laeuft = true; requestAnimationFrame(schieben); }
  }, { passive: true });
  schieben();
})();
</script>`;

/* ══ Logowände ═══════════════════════════════════════════════════
   logowandGitter  Viele Logos, frei umbrechend, erscheinen beim
                   Hereinscrollen nacheinander. Ab etwa sechs Logos.
   logowandKarten  Raster mit feinen Fugen. Erste Wahl bei vier bis acht
                   Logos, und die beste Fassung für weiß hinterlegte
                   Dateien, weil die Karte ohnehin weiß ist.
   logowandLauf    Endloses Laufband. Braucht mindestens sechs Logos, sonst
                   klafft eine Lücke. Die Liste wird dafür so oft wiederholt,
                   bis genug zusammenkommt.                                 */

/* brauchtDunkel kommt aus herkunft.json: beim Holen gemessen, weil weiße
   Grafik auf Transparenz sonst auf hellem Grund unsichtbar bleibt. */
const logoBild = (l) => `<img src="${esc(l.pfad)}" alt="${esc(l.name)}"` +
  `${l.brauchtDunkel ? ' data-invers' : ''} loading="lazy">`;

function logoKopf({ ueber, titel, titelLeise }) {
  if (!ueber && !titel) return '';
  return `<div class="logowand-kopf">
    ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
    ${wenn(titel, () => `<h2>${wenn(titelLeise, () => `<em>${esc(titelLeise)}</em> `)}${esc(titel)}</h2>`)}
  </div>`;
}

export function logowandGitter({ ueber, titel, titelLeise, logos, nachsatz, tief = false }) {
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ ueber, titel, titelLeise }) +
    `<div class="logowand-gitter" data-erscheinen>${logos.map(logoBild).join('')}</div>` +
    wenn(nachsatz, () => `<p class="klein" style="text-align:center;margin-top:var(--a-3)">${esc(nachsatz)}</p>`))}
</section>`;
}

export function logowandKarten({ ueber, titel, titelLeise, logos, nachsatz, tief = false }) {
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ ueber, titel, titelLeise }) +
    `<div class="logowand-karten" style="--spalten:${Math.min(4, logos.length)};` +
      `--spalten-klein:${Math.min(2, logos.length)}">` +
      `${logos.map((l) => `<div>${logoBild(l)}</div>`).join('')}</div>` +
    wenn(nachsatz, () => `<p class="klein" style="text-align:center;margin-top:var(--a-3)">${esc(nachsatz)}</p>`))}
</section>`;
}

export function logowandLauf({ ueber, titel, titelLeise, logos, nachsatz, dauer = 38, tief = false }) {
  /* Zu wenige Logos reißen im Laufband eine Lücke. Deshalb so oft
     wiederholen, bis mindestens acht zusammenkommen, und das Ganze dann
     noch einmal für den nahtlosen Übergang. */
  let reihe = [...logos];
  while (reihe.length < 8 && logos.length) reihe = reihe.concat(logos);
  const spur = reihe.concat(reihe).map(logoBild).join('');
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ ueber, titel, titelLeise }))}
  <div class="logowand-lauf"><div class="logowand-lauf__spur" style="--dauer:${dauer}s"
       aria-label="${esc(logos.map((l) => l.name).join(', '))}">${spur}</div></div>
  ${wenn(nachsatz, () => schale(`<p class="klein" style="text-align:center;margin-top:var(--a-3)">${esc(nachsatz)}</p>`))}
</section>`;
}

/* Lässt Elemente mit data-erscheinen beim Hereinscrollen auftauchen. Ohne
   Fremdbibliothek, und wer reduzierte Bewegung eingestellt hat, sieht sie
   sofort. Nur einbinden, wenn ein solcher Baustein auf der Seite steht. */
export const ERSCHEINEN_SKRIPT = `
<script>
(function () {
  var teile = document.querySelectorAll('[data-erscheinen]');
  if (!teile.length) return;
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    teile.forEach(function (t) { t.setAttribute('data-sichtbar', ''); });
    return;
  }
  var w = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.setAttribute('data-sichtbar', '');
      w.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  teile.forEach(function (t) { w.observe(t); });
})();
</script>`;

/* ══ Leistungen ══════════════════════════════════════════════════
   leistungen       Gleichmäßiges Raster. Mit mittig:true steht die Kopfzeile
                    zentriert, mit iconStil 'kreis' oder 'kasten' ändert sich
                    die Icon-Fassung.
   leistungenBento  Ungleich große Karten: Die erste ist doppelt so breit und
                    hoch und trägt die wichtigste Leistung mit mehr Text und
                    einer Kennzahl. Bricht das gleichförmige Raster auf, das
                    eine Seite schnell nach Baukasten aussehen lässt. Trägt
                    fünf bis neun Einträge.                                  */

export function leistungenBento({ ueber, titel, text, mittig = false, eintraege, tief = false }) {
  const [erste, ...rest] = eintraege;
  const karte = (e, gross = false) => {
    const innen =
      `${wenn(e.icon, () => `<div class="karte__icon karte__icon--kasten">${zeichen(e.icon)}</div>`)}` +
      `<h3>${esc(e.titel)}</h3>` +
      `${wenn(e.text, () => `<p class="klein" style="margin-top:.4rem">${esc(e.text)}</p>`)}` +
      `${wenn(gross && e.punkte?.length, () => `<ul class="liste" style="margin-top:var(--a-2)">` +
        `${e.punkte.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`)}` +
      `${wenn(gross && e.zahl, () => `<div class="bento__fuss"><div class="bento__zahl">${esc(e.zahl)}</div>` +
        `<div class="bento__zahlLabel">${esc(e.zahlLabel ?? '')}</div></div>`)}`;
    const k = 'karte' + (e.wichtig ? ' karte--wichtig' : '') + (e.href ? ' karte--klickbar' : '');
    return e.href ? `<a class="${k}" href="${esc(e.href)}">${innen}</a>` : `<div class="${k}">${innen}</div>`;
  };
  /* Das Raster gleicht sich selbst aus. Die große Karte belegt zwei Spalten
     und zwei Zeilen, daneben passen vier kleine. Danach vier je Zeile. Bleibt
     am Ende ein einzelner Eintrag übrig, läuft er über die ganze Breite; sind
     es zwei, teilen sie sich die Zeile. Sonst endet das Raster ausgefranst,
     und der Agent müsste die Anzahl im Kopf ausrechnen. */
  const breiten = new Array(rest.length).fill('');
  const uebrig = rest.length - 4;
  if (uebrig > 0) {
    const letzteZeile = uebrig % 4;
    if (letzteZeile === 1) breiten[rest.length - 1] = ' class="bento__voll"';
    else if (letzteZeile === 2) {
      breiten[rest.length - 1] = ' class="bento__breit"';
      breiten[rest.length - 2] = ' class="bento__breit"';
    } else if (letzteZeile === 3) breiten[rest.length - 1] = ' class="bento__breit"';
  }
  const knapp = eintraege.length < 5 ? ' data-knapp' : '';

  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}" id="leistungen">
  ${schale(`<div class="stapel-3 ${wenn(mittig, 'kopf-mittig')}" style="margin-bottom:var(--a-4)">
      ${wenn(ueber, () => `<p class="ueber">${esc(ueber)}</p>`)}
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead">${esc(text)}</p>`)}
    </div>
    <div class="bento"${knapp}>
      <div class="bento__gross">${karte(erste, true)}</div>
      ${rest.map((e, i) => `<div${breiten[i]}>${karte(e)}</div>`).join('')}
    </div>`)}
</section>`;
}
