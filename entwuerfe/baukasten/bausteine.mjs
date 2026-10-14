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
      ${wenn(text, `<p class="lead lead--zwei">${esc(text)}</p>`)}
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

export function leistungen({ titel, text, eintraege, spalten = 3,
                             mittig = false, iconStil = 'kasten', tief = false }) {
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}" id="leistungen">
  ${schale(`<div class="stapel-3 kopf-eng ${wenn(mittig, 'kopf-mittig')}" style="margin-bottom:var(--a-4)">
      <h2>${esc(titel)}</h2>
      ${wenn(text, `<p class="lead lead--zwei">${esc(kuerze(text, 150))}</p>`)}
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
      ${wenn(text, `<p class="lead lead--zwei">${esc(text)}</p>`)}
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
      ${wenn(text, `<p class="lead lead--zwei">${esc(text)}</p>`)}
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
  telefon:    'M8.5 4.5l2 3.5l-2 1.5a11 11 0 0 0 6 6l1.5-2l3.5 2l-1 3a2 2 0 0 1-2 1.3A16 16 0 0 1 4.2 7.5A2 2 0 0 1 5.5 5.5z',
  fax:        'M7 9V4h10v5M7 18h10v3H7zM5 9h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2M17.5 12.5h.01',
  brief2:     'M3 7l9 6l9-6M3 7v10h18V7z',
  ort:        'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11M12 10m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  pfeilrechts:'M5 12h13M13 6l6 6l-6 6',
  pfeillinks: 'M19 12H6M11 6l-6 6l6 6',
  pfeilauf:   'M7 17L17 7M9 7h8v8',
  facebook:   'M13 21v-8h2.5l.5-3h-3V8.3c0-.8.2-1.3 1.4-1.3H16V4.3A18 18 0 0 0 13.9 4C11.7 4 10 5.3 10 8v2H7.5v3H10v8z',
  instagram:  'M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7M16.9 7.1v.01',
  linkedin:   'M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 9h2v11H4zM10 20V9h2v1.5a3.5 3.5 0 0 1 6 2.5V20h-2v-6a2 2 0 0 0-4 0v6z',
  youtube:    'M3 9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9.5l5 2.5l-5 2.5z',
};

/* Ein unbekannter Name lieferte vorher stillschweigend nichts, und auf der
   Seite stand ein leerer Kasten. Der Agent wird Namen raten, deshalb bricht
   der Bau jetzt ab und nennt die vorhandenen. Ein fehlgeschlagener Bau ist
   besser als eine Seite mit unsichtbaren Zeichen. */
export const zeichen = (n) => {
  if (!n) return '';
  if (!ZEICHEN[n])
    throw new Error(`Unbekanntes Zeichen "${n}". Vorhanden: ${Object.keys(ZEICHEN).join(', ')}`);
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ZEICHEN[n]}"/></svg>`;
};

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
      <h1>${esc(titel)}</h1>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
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
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
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

export function verlaufSeitlich({ titel, text, schritte, tief = false }) {
  if (schritte.length < 3)
    throw new Error(`verlaufSeitlich: ${schritte.length} Schritt(e) — unter 3 ist es kein Verlauf.`);
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="verlauf-seitlich">
    <div class="stapel-3">
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
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
export function verlaufWaagerecht({ titel, text, stationen, bisHier = stationen.length, tief = false }) {
  if (stationen.length < 3)
    throw new Error(`verlaufWaagerecht: ${stationen.length} Station(en) — unter 3 ist es kein Verlauf.`);
  if (stationen.length > 5)
    throw new Error(`verlaufWaagerecht: ${stationen.length} Stationen — ueber 5 wird es eng; `
      + 'dafuer ist verlaufSeitlich da.');
  /* Unter den Punkten ist wenig Platz. Lange Texte brechen das Raster auf
     und machen die Reihe unruhig. */
  stationen = stationen.map((st) => ({ ...st, text: st.text ? kuerze(st.text, 150) : st.text }));
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel-3" style="margin-bottom:var(--a-4);max-width:62ch">
      ${wenn(titel, () => `<h2>${esc(titel)}</h2>`)}
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
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
  /* Jeder Schritt braucht sein eigenes Zeichen. Vorher fiel jeder ohne
     Angabe auf den Haken zurück — vier gleiche Haken untereinander sagen
     nichts und sahen aus wie ein Fehler. */
  const ohne = schritte.filter((x) => !x.icon).length;
  if (ohne) throw new Error(`verlaufSchmal: ${ohne} Schritt(e) ohne Zeichen. `
    + 'Jeder Schritt braucht ein eigenes — sonst stehen gleiche Zeichen untereinander.');
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
          <span class="verlauf-kasten">${zeichen(s.icon)}</span>
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
  /* Die Logoleiste läuft und sitzt auf der Breite der Navigation, nicht auf
     der des Textblocks — sonst springt die Kante. Unter acht Logos wirkt ein
     Laufband leer, deshalb wird die Liste bis dahin wiederholt. */
  let spur = marken;
  if (spur.length) { while (spur.length < 8) spur = spur.concat(marken); }
  return `
<header class="hero-mitte" id="start">
  <div class="hero-mitte__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  ${schale(`<div class="hero-mitte__in">
    ${wenn(ueber, () => `<p class="plakette plakette--hell">${esc(ueber)}</p>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
    ${wenn(knopfHaupt || knoepfe.length, () => `<div class="knopfreihe knopfreihe--breit" style="justify-content:center">
      ${wenn(knopfHaupt, () => knopfPille(knopfHaupt))}${knoepfe.map(knopf).join('')}</div>`)}
  </div>`)}
  ${wenn(spur.length, () => schale(`<div class="logowand-lauf hero-mitte__lauf">
    <div class="logowand-lauf__spur" style="--dauer:44s">${
      [...spur, ...spur].map(logoBild).join('')}</div>
  </div>`))}
</header>`;
}

export function heroGeteilt({ plakette, titel, text, merkmale = [], knoepfe = [], bild, bildAlt = '', tief = false }) {
  return `
<header class="hero-geteilt${tief ? ' auf-dunkel hero-geteilt--tief' : ''}" id="start">
  <div class="hero-geteilt__bild"><img src="${esc(bild)}" alt="${esc(bildAlt)}" fetchpriority="high"></div>
  ${schale(`<div class="hero-geteilt__in stapel-3">
    ${wenn(plakette, () => `<span class="plakette" style="margin:0">${esc(plakette)}</span>`)}
    <h1>${esc(titel)}</h1>
    ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
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

/* Zwei gemessene Eigenschaften aus herkunft.json, keine geratenen:

   einfarbig    Das Logo hat keine Farbe (Sättigung nahe null). Dann darf es
                umgefärbt werden und nimmt die Schriftfarbe an — vier der
                Kundenlogos sind weiße Grafik und wären sonst auf hellem
                Grund unsichtbar. Dunkle Kacheln für vier von sieben Logos
                hätten die Wand fleckig gemacht.
   brauchtDunkel Das Logo ist hell, aber farbig — umfärben würde die Marke
                verfälschen. Dann bekommt es eine dunkle Fläche. */
const logoBild = (l) => `<img src="${esc(l.pfad)}" alt="${esc(l.name)}"` +
  `${l.einfarbig ? ' data-einfarbig' : l.brauchtDunkel ? ' data-invers' : ''} loading="lazy">`;

/* Keine Vorzeile mehr: Die gehoert in ein eigenes Modul, nicht in jedes. */
function logoKopf({ titel, titelLeise }) {
  if (!titel) return '';
  return `<div class="logowand-kopf">
    <h2>${wenn(titelLeise, () => `<em>${esc(titelLeise)}</em> `)}${esc(titel)}</h2>
  </div>`;
}

export function logowandGitter({ titel, titelLeise, logos, nachsatz, tief = false }) {
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ titel, titelLeise }) +
    `<div class="logowand-gitter" data-erscheinen>${logos.map(logoBild).join('')}</div>` +
    wenn(nachsatz, () => `<p class="klein" style="text-align:center;margin-top:var(--a-3)">${esc(nachsatz)}</p>`))}
</section>`;
}

export function logowandKarten({ titel, titelLeise, logos, nachsatz, tief = false }) {
  /* Mit zwei Logos wirkt eine Partnerwand wie eine Entschuldigung. */
  if (logos.length < 4)
    throw new Error(`logowandKarten: ${logos.length} Logo(s) — unter 4 lieber weglassen.`);
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ titel, titelLeise }) +
    `<div class="logowand-karten" style="--spalten:${Math.min(4, logos.length)};` +
      `--spalten-klein:${Math.min(2, logos.length)}">` +
      `${logos.map((l) => `<div>${logoBild(l)}</div>`).join('')}</div>` +
    wenn(nachsatz, () => `<p class="klein" style="text-align:center;margin-top:var(--a-3)">${esc(nachsatz)}</p>`))}
</section>`;
}

export function logowandLauf({ titel, titelLeise, logos, nachsatz, dauer = 38, tief = false }) {
  /* Zu wenige Logos reißen im Laufband eine Lücke. Deshalb so oft
     wiederholen, bis mindestens acht zusammenkommen, und das Ganze dann
     noch einmal für den nahtlosen Übergang. */
  let reihe = [...logos];
  while (reihe.length < 8 && logos.length) reihe = reihe.concat(logos);
  const spur = reihe.concat(reihe).map(logoBild).join('');
  return `
<section class="abschnitt--eng ${wenn(tief, 'abschnitt--tief')}">
  ${schale(logoKopf({ titel, titelLeise }))}
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

const BENTO_MIN = 5;
export function leistungenBento({ titel, text, mittig = false, eintraege, tief = false }) {
  /* Mit vier Karten bleibt vom Bento nur eine grosse und drei kleine — das
     ist kein Bento mehr, sondern ein unausgewogenes Raster. */
  if (eintraege.length < BENTO_MIN)
    throw new Error(`leistungenBento: ${eintraege.length} Leistungen — unter ${BENTO_MIN} `
      + 'nimmt man leistungen mit gleichmaessigem Raster.');
  /* Bei genau sechs stehen die Karten gleich gross nebeneinander. Eine
     hervorgehobene bleibt hervorgehoben, sie wird nur nicht groesser. */
  const gleich = eintraege.length === 6;
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
  ${schale(`<div class="stapel-3 kopf-eng ${wenn(mittig, 'kopf-mittig')}" style="margin-bottom:var(--a-4)">
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(kuerze(text, 150))}</p>`)}
    </div>
    ${gleich
      ? `<div class="bento bento--gleich">${eintraege.map((e) => `<div>${karte(e)}</div>`).join('')}</div>`
      : `<div class="bento"${knapp}>
      <div class="bento__gross">${karte(erste, true)}</div>
      ${rest.map((e, i) => `<div${breiten[i]}>${karte(e)}</div>`).join('')}
    </div>`}`)}
</section>`;
}

/* ══ Fußbereiche ═════════════════════════════════════════════════
   fussKontakt  Logo und Anschrift links, Öffnungszeiten in der Mitte,
                ein Knopf rechts. Für Betriebe, bei denen Erreichbarkeit
                das Wichtigste ist: Handwerk, Praxis, Gastronomie, Werkstatt.
                Erste Wahl.
   fussSpalten  Logo mit kurzem Text, daneben Linkspalten und Kontakt. Für
                Betriebe mit vielen Unterseiten. Kein Newsletter-Feld: Wir
                bauen keine Anmeldung, die niemand entgegennimmt.           */

const fussZeile = (icon, inhalt) =>
  `<div class="fuss__zeile">${zeichen(icon)}<span>${inhalt}</span></div>`;

function fussUnten({ betrieb, jahr, recht = [] }) {
  return `<div class="fuss__unten">
    <span style="opacity:.75">© ${esc(betrieb)} ${jahr}</span>
    ${wenn(recht.length, () => `<nav class="fuss__recht">${recht.map((r) =>
      `<a href="${esc(r.href)}">${esc(r.text)}</a>`).join('')}</nav>`)}
  </div>`;
}

export function fussKontakt({ betrieb, logo, anschrift = [], telefon, telefonText,
                              zweitnummer, zweitnummerLabel, fax, email, zeiten = [],
                              zeitenHinweis, knopf: haupt, recht = [],
                              jahr = new Date().getFullYear(), dunkel = false }) {
  return `
<footer class="fuss ${dunkel ? 'auf-dunkel' : 'abschnitt--gedaempft'}">
  <div class="schale">
    <div class="fuss__gitter fuss__gitter--drei">
      <div>
        ${wenn(logo, () => `<img class="fuss__logo" src="${esc(logo)}" alt="${esc(betrieb)}">`)}
        ${wenn(anschrift.length, () => `<p class="klein" style="margin-bottom:var(--a-2)">${anschrift.map(esc).join('<br>')}</p>`)}
        <div class="fuss__zeilen">
          ${wenn(telefon, () => fussZeile('telefon', `<a href="tel:${esc(telefon)}">${esc(telefonText ?? telefon)}</a>`))}
          ${wenn(zweitnummer, () => fussZeile('notruf',
            `<a href="tel:${esc(zweitnummer)}">${esc(zweitnummerLabel ?? zweitnummer)}</a>`))}
          ${wenn(fax, () => fussZeile('fax', `Fax: ${esc(fax)}`))}
          ${wenn(email, () => fussZeile('brief2', `<a href="mailto:${esc(email)}">${esc(email)}</a>`))}
        </div>
      </div>
      <div>
        ${wenn(zeiten.length, () => `<h3>Öffnungszeiten</h3>
          <table class="fuss__zeiten"><tbody>${zeiten.map((z) =>
            `<tr><td>${esc(z.tag)}</td><td>${esc(z.zeit)}</td></tr>`).join('')}</tbody></table>
          ${wenn(zeitenHinweis, () => `<p class="klein" style="margin-top:var(--a-2)">${esc(zeitenHinweis)}</p>`)}`)}
      </div>
      <div>${wenn(haupt, () => knopf({ ...haupt, art: haupt.art ?? 'wichtig' }))}</div>
    </div>
    ${fussUnten({ betrieb, jahr, recht })}
  </div>
</footer>`;
}

export function fussSpalten({ betrieb, logo, text, spalten = [], telefon, telefonText,
                              email, anschrift = [], sozial = [], recht = [],
                              jahr = new Date().getFullYear(), dunkel = true }) {
  return `
<footer class="fuss ${dunkel ? 'auf-dunkel' : 'abschnitt--gedaempft'}">
  <div class="schale">
    <div class="fuss__gitter fuss__gitter--spalten" style="--fuss-spalten:${spalten.length + 2}">
      <div>
        ${wenn(logo, () => `<img class="fuss__logo" src="${esc(logo)}" alt="${esc(betrieb)}">`)}
        ${wenn(text, () => `<p class="klein" style="max-width:34ch">${esc(text)}</p>`)}
        ${wenn(sozial.length, () => `<div class="fuss__sozial" style="margin-top:var(--a-3)">${sozial.map((s) =>
          `<a href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${zeichen(s.icon ?? 'pfeilauf')}</a>`).join('')}</div>`)}
      </div>
      ${spalten.map((sp) => `<div><h3>${esc(sp.titel)}</h3>
        <nav class="fuss__liste">${sp.links.map((l) =>
          `<a href="${esc(l.href)}">${esc(l.text)}</a>`).join('')}</nav></div>`).join('')}
      <div>
        <h3>Kontakt</h3>
        ${wenn(anschrift.length, () => `<p class="klein" style="margin-bottom:var(--a-2)">${anschrift.map(esc).join('<br>')}</p>`)}
        <div class="fuss__zeilen">
          ${wenn(telefon, () => fussZeile('telefon', `<a href="tel:${esc(telefon)}">${esc(telefonText ?? telefon)}</a>`))}
          ${wenn(email, () => fussZeile('brief2', `<a href="mailto:${esc(email)}">${esc(email)}</a>`))}
        </div>
      </div>
    </div>
    ${fussUnten({ betrieb, jahr, recht })}
  </div>
</footer>`;
}

/* ══ Vertrauen ═══════════════════════════════════════════════════
   Auszeichnungen, Siegel, Partnermarken, Bewertungen. Nicht
   Kundenstimmen — die sind ein eigener Baustein.

   vertrauenDuo    Zwei Karten: links Siegel und Marken in Kacheln mit
                   Überschrift und Erklärung, rechts ein Foto vom Betrieb
                   mit Aussage und Bewertung. Braucht ein Bild und drei
                   bis acht Kacheln.
   vertrauenStreu  Überschrift und Vorlauf links, rechts ein Streufeld aus
                   Kacheln mit absichtlichen Lücken. Braucht kein Bild,
                   trägt fünf bis vierzehn Logos gut.                     */

const STERN = 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z';
const sternReihe = (n) => Array.from({ length: n },
  () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STERN}"/></svg>`).join('');

/* Eine Note wird nur angezeigt, wenn eine da ist. Bewertungszahl ohne
   Note ist der Normalfall bei gescrapten Daten — dann steht nur die Zahl.
   Sterne werden nie geraten. */
export function bewertung({ note, anzahl, quelle }) {
  const teile = [];
  if (typeof note === 'number') {
    const anteil = Math.max(0, Math.min(1, note / 5));
    teile.push(`<span class="sterne" role="img" aria-label="${esc(note.toLocaleString('de-DE'))} von 5 Sternen">` +
      `<span class="sterne__leer">${sternReihe(5).replace(/<svg /g, '<svg class="leer" ')}</span>` +
      `<span class="sterne__voll" style="width:${(anteil * 100).toFixed(1)}%">${sternReihe(5)}</span>` +
      `</span>`);
    teile.push(`<span class="vertrauen__anzahl"><b>${esc(note.toLocaleString('de-DE'))}</b> von 5` +
      `${wenn(anzahl, () => ` · ${esc(Number(anzahl).toLocaleString('de-DE'))} Bewertungen`)}` +
      `${wenn(quelle, () => ` bei ${esc(quelle)}`)}</span>`);
  } else if (anzahl) {
    teile.push(`<span class="vertrauen__anzahl"><b>${esc(Number(anzahl).toLocaleString('de-DE'))}</b> Bewertungen` +
      `${wenn(quelle, () => ` bei ${esc(quelle)}`)}</span>`);
  }
  return teile.length ? `<div class="vertrauen__wertung">${teile.join('')}</div>` : '';
}

const kachel = (l) => `<div class="vertrauen__kachel">${logoBild(l)}</div>`;

/* Große Fassung für die Bildkarte: Die Note trägt den Block, Sterne und
   Anzahl stehen darunter. Eine nackte Zahl neben einem Foto übersieht man. */
export function bewertungGross({ note, anzahl, quelle }) {
  if (typeof note !== 'number' && !anzahl) return '';
  if (typeof note !== 'number') {
    return `<div class="wertung-gross">
      <div class="wertung-gross__zahl">${esc(Number(anzahl).toLocaleString('de-DE'))}</div>
      <p class="wertung-gross__text">Bewertungen${wenn(quelle, () => ` bei ${esc(quelle)}`)}</p>
    </div>`;
  }
  const anteil = Math.max(0, Math.min(1, note / 5));
  return `<div class="wertung-gross">
    <div class="wertung-gross__zahl">${esc(note.toLocaleString('de-DE'))}<span>/5</span></div>
    <span class="sterne" role="img" aria-label="${esc(note.toLocaleString('de-DE'))} von 5 Sternen">
      <span class="sterne__leer">${sternReihe(5).replace(/<svg /g, '<svg class="leer" ')}</span>
      <span class="sterne__voll" style="width:${(anteil * 100).toFixed(1)}%">${sternReihe(5)}</span>
    </span>
    <p class="wertung-gross__text">${wenn(anzahl, () => `aus ${esc(Number(anzahl).toLocaleString('de-DE'))} Bewertungen`)}${
      wenn(quelle, () => ` bei ${esc(quelle)}`)}</p>
  </div>`;
}

export function vertrauenDuo({ ueber, titel, text, kacheln = [], bild, bildAlt = '',
  bildTitel, note, anzahl, quelle, tief = false }) {
  if (!kacheln.length) throw new Error('vertrauenDuo braucht mindestens eine Kachel.');
  /* Lücken auffüllen, damit die Reihen nicht abbrechen. Die leeren Kacheln
     sind Absicht — das Feld soll auslaufen, nicht abgezählt wirken. */
  const spalten = Math.min(4, kacheln.length);
  const voll = Math.ceil(kacheln.length / spalten) * spalten;
  const felder = kacheln.map(kachel).concat(
    Array.from({ length: voll - kacheln.length },
      () => '<div class="vertrauen__kachel vertrauen__kachel--leer"></div>'));
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="vertrauen">
    <div class="vertrauen__karte">
      <div class="vertrauen__kacheln" style="--spalten:${spalten}" data-erscheinen>${felder.join('')}</div>
      <div class="vertrauen__text stapel-3">
        <h2 style="font-size:var(--t-l)">${esc(titel)}</h2>
        ${wenn(text, () => `<p>${esc(text)}</p>`)}
      </div>
    </div>
    ${wenn(bild, () => `<div class="vertrauen__bild">
      <img class="hintergrund" src="${esc(bild)}" alt="${esc(bildAlt)}" loading="lazy">
      <div class="vertrauen__bildText">
        ${wenn(bildTitel, () => `<h3>${esc(bildTitel)}</h3>`)}
        ${bewertungGross({ note, anzahl, quelle })}
      </div>
    </div>`)}
  </div>`)}
</section>`;
}

/* Reihenfolge der Kacheln: von der Mitte nach außen, mit festem Versatz,
   damit es gestreut aussieht und nicht als Klotz. */
function streuFolge(spalten, zeilen) {
  const mx = (spalten - 1) / 2, my = (zeilen - 1) / 2;
  return Array.from({ length: spalten * zeilen }, (_, i) => i).sort((a, b) => {
    const d = (i) => Math.hypot((i % spalten) - mx, Math.floor(i / spalten) - my);
    return (d(a) - d(b)) || (((a * 7) % 11) - ((b * 7) % 11));
  });
}

/* Die Maske soll Lücken weichzeichnen, nie Logos. Deshalb hier ausrechnen,
   welche Fassung alle belegten Kacheln über Alpha 0,6 hält — und wenn keine
   das schafft, ganz ohne Maske arbeiten. */
const MASKEN = [{ marke: '', stops: [.52, .82] }, { marke: ' data-dicht', stops: [.72, .97] }];
function maskeWaehlen(spalten, zeilen, folge, anzahl) {
  const alpha = (i) => {
    const nx = ((i % spalten) - (spalten - 1) / 2) / (spalten / 2);
    const ny = (Math.floor(i / spalten) - (zeilen - 1) / 2) / (zeilen / 2);
    return Math.hypot(nx, ny);
  };
  const radien = folge.slice(0, anzahl).map(alpha);
  for (const { marke, stops: [s1, s2] } of MASKEN) {
    const schlechtestes = Math.max(...radien);
    const a = schlechtestes <= s1 ? 1 : schlechtestes >= s2 ? 0 : 1 - (schlechtestes - s1) / (s2 - s1);
    if (a >= .6) return marke;
  }
  return ' data-offen';
}

const STREU_MIN = 5, STREU_MAX = 24;
export function vertrauenStreu({ ueber, titel, text, logos = [], nachsatz, tief = false }) {
  /* Unter fünf Logos ist das Feld mehr Lücke als Inhalt — das sieht nicht
     luftig aus, sondern dünn. Über vierundzwanzig wird es eine Wand, und
     dafür gibt es logowandGitter. Das Feld wächst, aber nicht endlos. */
  if (logos.length < STREU_MIN)
    throw new Error(`vertrauenStreu: ${logos.length} Logo(s) — unter ${STREU_MIN} `
      + 'nimmt man logowandKarten.');
  if (logos.length > STREU_MAX)
    throw new Error(`vertrauenStreu: ${logos.length} Logos — über ${STREU_MAX} `
      + 'wird das Feld eine Wand; dafür ist logowandGitter da.');
  /* Das Feld wächst und schrumpft mit der Anzahl. Bei zwei Logos sollen
     nicht dreiundzwanzig leere Kacheln daneben stehen; Ziel sind rund
     40 % belegte Felder. Gekürzt wird nie — nur das Raster wird größer. */
  const spalten = logos.length <= 3 ? 3 : logos.length <= 6 ? 4 : 5;
  const zeilen = Math.max(3, Math.ceil(logos.length / spalten),
    Math.min(9, Math.round(logos.length / (spalten * 0.4))));
  const folge = streuFolge(spalten, zeilen);
  const eckenIndex = new Set([0, spalten - 1, spalten * (zeilen - 1), spalten * zeilen - 1]);
  /* Von der Mitte nach außen allein ergibt einen geschlossenen Klotz: Die
     Logos standen dicht an dicht und das Feld hatte keine Bewegung. Zuerst
     werden deshalb nur die Felder eines Schachbrettmusters belegt — so
     liegt zwischen zwei Logos immer eine leere Kachel. Reicht das nicht,
     kommen die übrigen dran. */
  const ohneEcken = folge.filter((i) => !eckenIndex.has(i));
  const gerade = (i) => ((i % spalten) + Math.floor(i / spalten)) % 2 === 0;
  const frei = [...ohneEcken.filter(gerade), ...ohneEcken.filter((i) => !gerade(i))];
  const belegt = new Map(logos.map((l, i) => [frei[i], l]));
  const maske = maskeWaehlen(spalten, zeilen, frei, logos.length);
  /* Ohne die vier Ecken wird aus dem Rechteck eine Raute. Vorher standen
     die Kacheln als sauberer Block nebeneinander, und genau das nahm dem
     Feld die Bewegung. Die Ecken bleiben leer — kein Rahmen, keine Fläche. */
  const ecken = new Set([0, spalten - 1, spalten * (zeilen - 1), spalten * zeilen - 1]);
  const felder = Array.from({ length: spalten * zeilen }, (_, i) => ecken.has(i)
    ? '<div class="streu__ecke"></div>'
    : belegt.has(i)
      ? `<div class="streu__feld">${logoBild(belegt.get(i))}</div>`
      : '<div class="streu__feld streu__feld--leer"></div>').join('');
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="raster raster--2" style="align-items:center">
    <div class="stapel-3">
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
      ${wenn(nachsatz, () => `<p class="klein">${esc(nachsatz)}</p>`)}
    </div>
    <div class="streu"${maske} style="--spalten:${spalten};--zeilen:${zeilen}" data-erscheinen>${felder}</div>
  </div>`)}
</section>`;
}


/* ══ Kundenstimmen ═══════════════════════════════════════════════
   Unter drei Stimmen gibt es kein Modul. Zwei Karten nebeneinander sehen
   nicht nach Zuspruch aus, sondern nach Mangel — und ein laufendes Band
   aus zwei Karten wiederholt sich sichtbar. Die Bausteine brechen
   deshalb ab, statt etwas Schwaches zu bauen.

   Keine Vorzeile. Die gehört in eine eigene Kategorie, nicht in jedes
   Modul.

   stimmenSpalten  Drei langsam laufende Spalten, oben und unten
                   ausgeblendet. Die einzige Fassung, die ohne Bilder
                   auskommt — und damit die einzige, die allein aus
                   Google-Bewertungen entsteht. Ab sechs Stimmen am besten.
   stimmenBilder   Zitat über einem Foto. Das Foto ist die Karte, deshalb
                   steht unten nur der Name. Ohne Bilder gibt es diese
                   Fassung nicht; der Baustein bricht ab.
   stimmenBuehne   Eine Stimme auf einmal, daneben ein Stapel Porträts, mit
                   Vor und Zurück. Braucht Bilder, sonst bricht sie ab.
                   Drei bis sechs ausgesuchte Stimmen.                       */

/* Unter drei Stimmen kein Modul. */
const MINDEST_STIMMEN = 3;
function pruefeStimmen(name, stimmen) {
  if (stimmen.length < MINDEST_STIMMEN)
    throw new Error(`${name}: ${stimmen.length} Stimme(n) — unter ${MINDEST_STIMMEN} `
      + 'wird kein Kundenstimmen-Modul gebaut.');
}
function pruefeBilder(name, stimmen) {
  const ohne = stimmen.filter((s) => !s.bild).length;
  if (ohne) throw new Error(`${name}: ${ohne} Stimme(n) ohne Bild. `
    + 'Diese Fassung braucht Bilder — sonst stimmenSpalten nehmen.');
}

/* Eine sehr lange Bewertung wird gekürzt, nicht umgeschrieben: Schnitt am
   Satzende, danach ein Auslassungszeichen. Das ist etwas anderes als
   Einträge wegzulassen — keine Stimme fällt weg, nur ihr Ende. */
export function kuerze(text, max = 300) {
  const t = String(text ?? '').trim();
  if (t.length <= max) return t;
  const bis = t.slice(0, max);
  const satz = Math.max(bis.lastIndexOf('. '), bis.lastIndexOf('! '), bis.lastIndexOf('? '));
  if (satz > max * 0.5) return bis.slice(0, satz + 1) + ' …';
  const wort = bis.lastIndexOf(' ');
  return (wort > 0 ? bis.slice(0, wort) : bis).replace(/[,;:]$/, '') + ' …';
}

const ANFUEHRUNG = 'M4.6 17.3C3.6 16.2 3 15 3 13c0-3.5 2.5-6.6 6-8.2l.9 1.4c-3.3 1.8-4 4.2-4.2 5.6'
  + 'c.5-.3 1.2-.4 1.9-.3c1.8.2 3.2 1.7 3.2 3.5a3.5 3.5 0 0 1-3.5 3.5c-1.1 0-2.1-.5-2.7-1.2z'
  + 'm10 0C13.6 16.2 13 15 13 13c0-3.5 2.5-6.6 6-8.2l.9 1.4c-3.3 1.8-4 4.2-4.2 5.6'
  + 'c.5-.3 1.2-.4 1.9-.3c1.8.2 3.2 1.7 3.2 3.5a3.5 3.5 0 0 1-3.5 3.5c-1.1 0-2.1-.5-2.7-1.2z';

/* "Sabine Vogt" → SV, "M. Keller" → MK. Zwei Zeichen reichen; drei wirken
   im Kreis gedrängt. */
export const initialen = (name) => String(name || '').split(/[\s.]+/).filter(Boolean)
  .slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const kopf = (s) => `<div class="stimme__kopf">
  ${s.bild
    ? `<img class="stimme__bild" src="${esc(s.bild)}" alt="" loading="lazy">`
    : `<span class="stimme__initialen" aria-hidden="true">${esc(initialen(s.name))}</span>`}
  <span class="stimme__wer"><b>${esc(s.name)}</b>${wenn(s.rolle, () => `<span>${esc(s.rolle)}</span>`)}</span>
</div>`;

/* Noten nur zeigen, wenn eine da ist. Geraten wird nichts. */
const noten = (n) => (typeof n === 'number' && n > 0)
  ? `<div class="stimme__noten" role="img" aria-label="${esc(n)} von 5 Sternen">${sternReihe(Math.round(n))}</div>`
  : '';

const stimmeKarte = (s) => `<figure class="stimme">
  ${noten(s.note)}
  <blockquote>${esc(kuerze(s.text))}</blockquote>
  <figcaption>${kopf(s)}</figcaption>
</figure>`;

function stimmenKopf({ titel, text }) {
  if (!titel && !text) return '';
  return `<div class="stapel-3" style="text-align:center;max-width:46rem;margin-inline:auto">
    ${wenn(titel, () => `<h2>${esc(titel)}</h2>`)}
    ${wenn(text, () => `<p class="lead lead--zwei">${esc(text)}</p>`)}
  </div>`;
}

export function stimmenSpalten({ titel, text, stimmen = [], tief = false }) {
  pruefeStimmen('stimmenSpalten', stimmen);
  /* Drei Spalten, aber nie mehr als es Stimmen gibt — zwei Stimmen auf drei
     Spalten hieße: jede Spalte zeigt eine einzige Karte im Kreis. */
  const anzahl = Math.min(3, stimmen.length);
  const spalten = Array.from({ length: anzahl }, (_, i) =>
    stimmen.filter((_, j) => j % anzahl === i));
  /* Verschiedene Dauern, damit die Spalten nicht im Gleichschritt laufen. */
  const dauer = [46, 58, 52];
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(stimmenKopf({ titel, text }) +
    `<div class="stimmen-spalten" style="margin-top:var(--a-4)">` +
    spalten.map((sp, i) =>
      `<div class="stimmen-spalte" style="--dauer:${dauer[i]}s">` +
      /* Zweimal dieselbe Liste: die Hälfte ist genau eine Listenhöhe, der
         Sprung bei -50 % fällt deshalb nicht auf. */
      sp.map(stimmeKarte).join('') + sp.map(stimmeKarte).join('') +
      `</div>`).join('') +
    `</div>`)}
</section>`;
}

export function stimmenBilder({ titel, text, stimmen = [], tief = false }) {
  pruefeStimmen('stimmenBilder', stimmen);
  pruefeBilder('stimmenBilder', stimmen);
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(stimmenKopf({ titel, text }) +
    `<div class="stimmen-bilder" style="margin-top:var(--a-4)">` +
    stimmen.map((s) => `<figure class="stimme-bild">
      <img src="${esc(s.bild)}" alt="" loading="lazy">
      <div class="stimme-bild__in">
        <svg class="stimme-bild__zeichen" viewBox="0 0 24 24" aria-hidden="true"><path d="${ANFUEHRUNG}"/></svg>
        ${noten(s.note)}
        <blockquote>${esc(kuerze(s.text))}</blockquote>
        <figcaption class="stimme__kopf">
          <span class="stimme__wer"><b>${esc(s.name)}</b>${
            wenn(s.rolle, () => `<span>${esc(s.rolle)}</span>`)}</span>
        </figcaption>
      </div>
    </figure>`).join('') +
    `</div>`)}
</section>`;
}

export function stimmenBuehne({ titel, stimmen = [], tief = false }) {
  pruefeStimmen('stimmenBuehne', stimmen);
  pruefeBilder('stimmenBuehne', stimmen);
  const id = 'buehne' + Math.random().toString(36).slice(2, 7);
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="buehne" data-buehne id="${id}">
    <div class="buehne__stapel">
      ${stimmen.map((s, i) => `<div class="buehne__bild" data-wo="${i === 0 ? 'mitte' : 'weg'}">
        ${s.bild
          ? `<img src="${esc(s.bild)}" alt="" loading="lazy">`
          : `<span aria-hidden="true">${esc(initialen(s.name))}</span>`}
      </div>`).join('')}
    </div>
    <div class="buehne__text stapel-3">
      ${wenn(titel, () => `<h2 style="font-size:var(--t-l)">${esc(titel)}</h2>`)}
      <div data-buehne-inhalt aria-live="polite">
        ${noten(stimmen[0].note)}
        <blockquote>${esc(kuerze(stimmen[0].text))}</blockquote>
        ${kopf(stimmen[0])}
      </div>
      ${wenn(stimmen.length > 1, () => `<div class="buehne__knoepfe">
        <button class="buehne__knopf" type="button" data-buehne-zurueck aria-label="Vorherige Stimme">
          ${zeichen('pfeillinks')}</button>
        <button class="buehne__knopf" type="button" data-buehne-vor aria-label="Nächste Stimme">
          ${zeichen('pfeilrechts')}</button>
      </div>`)}
    </div>
  </div>`)}
  <script type="application/json" data-buehne-daten="${id}">${
    JSON.stringify(stimmen.map((s) => ({ text: kuerze(s.text), name: s.name, rolle: s.rolle ?? null,
      note: s.note ?? null, bild: s.bild ?? null }))).replace(/</g, '\\u003c')}</script>
</section>`;
}

export const BUEHNE_SKRIPT = `
<script>
(function () {
  var sterne = 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z';
  function kuerzel(n) {
    return String(n || '').split(/[\\s.]+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); }).join('');
  }
  function sicher(t) {
    var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML;
  }
  document.querySelectorAll('[data-buehne]').forEach(function (b) {
    var quelle = document.querySelector('[data-buehne-daten="' + b.id + '"]');
    if (!quelle) return;
    var stimmen; try { stimmen = JSON.parse(quelle.textContent); } catch (e) { return; }
    if (!stimmen.length) return;
    var bilder = b.querySelectorAll('.buehne__bild');
    var inhalt = b.querySelector('[data-buehne-inhalt]');
    var i = 0, n = stimmen.length;

    function zeichne() {
      bilder.forEach(function (el, k) {
        var wo = 'weg';
        if (k === i) wo = 'mitte';
        else if (k === (i - 1 + n) % n) wo = 'links';
        else if (k === (i + 1) % n) wo = 'rechts';
        el.setAttribute('data-wo', wo);
      });
      var s = stimmen[i];
      var note = '';
      if (typeof s.note === 'number' && s.note > 0) {
        var r = '';
        for (var k = 0; k < Math.round(s.note); k++)
          r += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + sterne + '"/></svg>';
        note = '<div class="stimme__noten" role="img" aria-label="' + Math.round(s.note) +
               ' von 5 Sternen">' + r + '</div>';
      }
      var kopf = '<div class="stimme__kopf">' + (s.bild
        ? '<img class="stimme__bild" src="' + sicher(s.bild) + '" alt="">'
        : '<span class="stimme__initialen" aria-hidden="true">' + sicher(kuerzel(s.name)) + '</span>')
        + '<span class="stimme__wer"><b>' + sicher(s.name) + '</b>'
        + (s.rolle ? '<span>' + sicher(s.rolle) + '</span>' : '') + '</span></div>';
      inhalt.innerHTML = note + '<blockquote>' + sicher(s.text) + '</blockquote>' + kopf;
    }
    var vor = b.querySelector('[data-buehne-vor]');
    var zurueck = b.querySelector('[data-buehne-zurueck]');
    if (vor) vor.addEventListener('click', function () { i = (i + 1) % n; zeichne(); });
    if (zurueck) zurueck.addEventListener('click', function () { i = (i - 1 + n) % n; zeichne(); });
    zeichne();
  });
})();
</script>`;

/* ══ Kundenstimmen: zwei Fassungen nach Vorbildern ════════════════
   stimmenNote   Logowand, in der eine Kachel durch eine dunkle Karte mit
                 der Gesamtnote ersetzt ist. Am besten mit acht Logos: Dann
                 füllen Wand und Karte zusammen ein sauberes Rechteck.
                 Nach dem Vorbild von
                 kl-unternehmerberatung.de. Erschlägt Partnermarken und
                 Bewertung in einem Block und braucht keine einzelnen
                 Stimmen — damit die einzige Fassung, die auch bei einem
                 Betrieb ohne Rezensionstexte funktioniert.
   stimmenReihe  Waagerechter Schieber mit hohen Fotokarten, nach dem
                 Vorbild von webflow.com. Jede Karte trägt eine Kennzahl,
                 ein Zitat und einen Namen. Braucht Bilder.               */

const QUELLEN = {
  google:     { name: 'Google',     link: (u) => u },
  trustpilot: { name: 'Trustpilot', link: (u) => u },
};

/* Halbkreis als Anzeige. Die Länge des Bogens wird gerechnet, nicht
   geschätzt: Bei r = 55 sind es π·55 Einheiten. */
const BOGEN_R = 55;
const BOGEN_LAENGE = Math.PI * BOGEN_R;

export function notenkarte({ note, anzahl, quelle = 'google', href, satz }) {
  if (typeof note !== 'number')
    throw new Error('notenkarte braucht eine Note — geraten wird keine.');
  const q = QUELLEN[quelle];
  if (!q) throw new Error(`notenkarte: unbekannte Quelle "${quelle}". `
    + `Vorhanden: ${Object.keys(QUELLEN).join(', ')}`);
  const anteil = Math.max(0, Math.min(1, note / 5));
  const zahl = esc(note.toLocaleString('de-DE'));
  const anzahlText = anzahl
    ? `${Number(anzahl).toLocaleString('de-DE')} Bewertungen`
    : null;
  return `<div class="notenkarte">
  <div class="notenkarte__anzeige">
    <svg viewBox="0 0 140 84" aria-hidden="true">
      <path class="notenkarte__grund" d="M15 72 A${BOGEN_R} ${BOGEN_R} 0 0 1 125 72"/>
      <path class="notenkarte__wert" d="M15 72 A${BOGEN_R} ${BOGEN_R} 0 0 1 125 72"
            style="stroke-dasharray:${BOGEN_LAENGE.toFixed(2)};stroke-dashoffset:${
              (BOGEN_LAENGE * (1 - anteil)).toFixed(2)}"/>
    </svg>
    <span class="notenkarte__zahl">${zahl}</span>
  </div>
  <p class="notenkarte__text">${esc(satz ?? 'Unsere Kunden bewerten die Zusammenarbeit mit')}
    <b>${zahl} von 5,0 Sternen</b>${wenn(anzahlText, () => ' aus ' + (href
      ? `<a href="${esc(q.link(href))}" target="_blank" rel="noopener">${esc(anzahlText)}</a>`
      : esc(anzahlText)) + ` bei ${esc(q.name)}`)}.</p>
</div>`;
}

export function stimmenNote({ titel, text, logos = [], note, anzahl,
  quelle = 'google', href, satz, tief = false }) {
  if (logos.length < 4)
    throw new Error(`stimmenNote: ${logos.length} Logo(s) — unter 4 trägt die Wand nicht.`);
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="stapel-3 kopf-eng" style="margin-bottom:var(--a-4)">
      ${wenn(titel, () => `<h2>${esc(titel)}</h2>`)}
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(kuerze(text, 150))}</p>`)}
    </div>
    <div class="wand-note" style="--zeile:${Math.max(1, Math.ceil((logos.length + 4) / 4) - 1)}">
      ${logos.map((l) => `<div class="wand-note__kachel">${logoBild(l)}</div>`).join('')}
      ${notenkarte({ note, anzahl, quelle, href, satz })}
    </div>`)}
</section>`;
}

export function stimmenReihe({ titel, text, stimmen = [], tief = false }) {
  pruefeStimmen('stimmenReihe', stimmen);
  pruefeBilder('stimmenReihe', stimmen);
  const id = 'reihe' + Math.random().toString(36).slice(2, 7);
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}">
  ${schale(`<div class="reihe__kopf">
      <div class="stapel-3 kopf-eng">
        ${wenn(titel, () => `<h2>${esc(titel)}</h2>`)}
        ${wenn(text, () => `<p class="lead lead--zwei">${esc(kuerze(text, 150))}</p>`)}
      </div>
      ${wenn(stimmen.length > 1, () => `<div class="reihe__knoepfe">
        <button class="buehne__knopf" type="button" data-reihe-zurueck="${id}"
          aria-label="Vorherige Stimme">${zeichen('pfeillinks')}</button>
        <button class="buehne__knopf" type="button" data-reihe-vor="${id}"
          aria-label="Nächste Stimme">${zeichen('pfeilrechts')}</button>
      </div>`)}
    </div>`)}
  <div class="reihe" id="${id}" tabindex="0" role="group" aria-label="Kundenstimmen, waagerecht blätterbar">
    ${`<div class="reihe__spur">
      ${stimmen.map((s) => `<figure class="reihe__karte">
        <img src="${esc(s.bild)}" alt="" loading="lazy">
        ${wenn(s.logo, () => `<img class="reihe__logo" src="${esc(s.logo)}" alt="${esc(s.firma ?? '')}" loading="lazy">`)}
        <div class="reihe__in">
          ${wenn(s.zahl, () => `<div class="reihe__zahl">${esc(s.zahl)}</div>`)}
          ${wenn(s.zahlLabel, () => `<p class="reihe__label">${esc(s.zahlLabel)}</p>`)}
          ${wenn(!s.zahl && typeof s.note === 'number', () => `<div class="stimme__noten">${
            sternReihe(Math.round(s.note))}</div>`)}
          <blockquote>${esc(kuerze(s.text, 240))}</blockquote>
          <figcaption class="stimme__kopf">
            <span class="stimme__wer"><b>${esc(s.name)}</b>${
              wenn(s.rolle, () => `<span>${esc(s.rolle)}</span>`)}</span>
          </figcaption>
        </div>
        ${wenn(s.href, () => `<a class="reihe__pfeil" href="${esc(s.href)}"
          aria-label="Mehr zu ${esc(s.name)}">${zeichen('pfeilauf')}</a>`)}
      </figure>`).join('')}
    </div>`}
  </div>
</section>`;
}

export const REIHE_SKRIPT = `
<script>
(function () {
  document.querySelectorAll('[data-reihe-vor]').forEach(function (knopf) {
    verdrahte(knopf, 1);
  });
  document.querySelectorAll('[data-reihe-zurueck]').forEach(function (knopf) {
    verdrahte(knopf, -1);
  });
  function verdrahte(knopf, richtung) {
    var id = knopf.getAttribute('data-reihe-vor') || knopf.getAttribute('data-reihe-zurueck');
    var reihe = document.getElementById(id);
    if (!reihe) return;
    knopf.addEventListener('click', function () {
      var karte = reihe.querySelector('.reihe__karte');
      if (!karte) return;
      /* Um genau eine Karte weiter, Abstand eingerechnet. Eine feste
         Pixelzahl ginge bei jeder Bildschirmbreite daneben. */
      var spur = reihe.querySelector('.reihe__spur');
      var abstand = parseFloat(getComputedStyle(spur).columnGap) || 0;
      reihe.scrollBy({ left: richtung * (karte.getBoundingClientRect().width + abstand),
                       behavior: 'smooth' });
    });
  }
  /* Knöpfe abschalten, wo es nicht weitergeht. */
  document.querySelectorAll('.reihe').forEach(function (reihe) {
    var vor = document.querySelector('[data-reihe-vor="' + reihe.id + '"]');
    var zurueck = document.querySelector('[data-reihe-zurueck="' + reihe.id + '"]');
    function stand() {
      if (zurueck) zurueck.disabled = reihe.scrollLeft < 8;
      if (vor) vor.disabled = reihe.scrollLeft + reihe.clientWidth >= reihe.scrollWidth - 8;
    }
    reihe.addEventListener('scroll', stand, { passive: true });
    window.addEventListener('resize', stand);
    stand();
  });
})();
</script>`;

/* ══ Termin ══════════════════════════════════════════════════════
   terminAnfrage  Links die Überschrift und was nach der Anfrage passiert,
                  rechts eine Karte mit Telefonnummer, Zeiten und dem
                  Hauptknopf.

   Bewusst kein Kalender: Ein eingebettetes Buchungswerkzeug in einem
   Entwurf bucht in unseren Kalender, nicht in den des Betriebs, und zieht
   ein fremdes Werkzeug samt Zustimmungspflicht auf die Seite. Harmonia
   Swingers macht es genauso — die Seite heißt Booking und führt auf eine
   Anfrage. Wird jemand Kunde, kommt an dieselbe Stelle sein eigener
   Kalender; dafür ist `einbettung` da.                                    */

export function terminAnfrage({ titel, text, schritte = [], telefon, telefonText,
  knopf, zeiten = [], hinweis, einbettung, tief = false }) {
  if (!telefon && !knopf && !einbettung)
    throw new Error('terminAnfrage: ohne Telefonnummer, Knopf oder Einbettung '
      + 'führt der Block nirgendwohin.');
  if (schritte.length && schritte.length < 2)
    throw new Error('terminAnfrage: ein einzelner Schritt ist kein Ablauf.');
  return `
<section class="abschnitt ${wenn(tief, 'abschnitt--tief')}" id="termin">
  ${schale(`<div class="termin">
    <div class="stapel-3 kopf-eng">
      <h2>${esc(titel)}</h2>
      ${wenn(text, () => `<p class="lead lead--zwei">${esc(kuerze(text, 150))}</p>`)}
      ${wenn(schritte.length, () => `<ol class="termin__schritte">
        ${schritte.map((s, i) => `<li>
          <span class="termin__nummer">${i + 1}</span>
          <div><b>${esc(s.titel)}</b>${wenn(s.text, () => `<span>${esc(s.text)}</span>`)}</div>
        </li>`).join('')}
      </ol>`)}
    </div>
    <div class="termin__karte">
      ${wenn(einbettung, () => `<div class="termin__einbettung">${einbettung}</div>`)}
      ${wenn(!einbettung, () => `
        ${wenn(telefon, () => `<a class="termin__ruf" href="tel:${esc(telefon)}">
          ${zeichen('telefon')}<span>${esc(telefonText ?? telefon)}</span></a>`)}
        ${wenn(zeiten.length, () => `<dl class="termin__zeiten">
          ${zeiten.map((z) => `<div><dt>${esc(z.tag)}</dt><dd>${esc(z.zeit)}</dd></div>`).join('')}
        </dl>`)}
        ${wenn(knopf, () => knopf.art === 'pille' ? knopfPille(knopf) : knopf2(knopf))}
        ${wenn(hinweis, () => `<p class="klein termin__hinweis">${esc(hinweis)}</p>`)}`)}
    </div>
  </div>`)}
</section>`;
}

/* Der Hauptknopf im Terminblock füllt die Karte. */
const knopf2 = ({ text, href, neu = false }) =>
  `<a class="knopf knopf--wichtig knopf--voll" href="${esc(href)}"` +
  `${neu ? ' target="_blank" rel="noopener"' : ''}>${esc(text)}</a>`;
