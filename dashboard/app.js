/* Werkzeug: Übersicht und Betriebsliste mit Report-Knopf.

   Läuft lokal (node dashboard/lokal.mjs). Keine Anmeldung, keine Datenbank —
   die Liste kommt aus betriebe.csv, die Reports liegen als Dateien daneben.  */

const el = (id) => document.getElementById(id);
const text = (s) => String(s ?? '').replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICONS = {
  dashboard: 'M4 13h7V4H4zM13 20h7v-9h-7zM13 8h7V4h-7zM4 20h7v-4H4z',
  datenbank: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  report: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  platzhalter: 'M4 8l8-4l8 4l-8 4zM4 8v8l8 4l8-4V8M12 12v8',
};
const ic = (n, k = '') => {
  const d = ICONS[n];
  if (!d) console.warn('Icon fehlt:', n);
  return `<svg class="ic ${k}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d || ICONS.platzhalter}"/></svg>`;
};

const SEITEN = [
  { id: 'dashboard', label: 'Übersicht', icon: 'dashboard',
    titel: 'Übersicht', lede: 'Wo der Bestand gerade steht.' },
  { id: 'datenbank', label: 'Betriebe', icon: 'datenbank',
    titel: 'Betriebe', lede: 'Bewertung je Betrieb, Report auf Knopfdruck.' },
];

let seite = location.hash.slice(1) || 'dashboard';
let uebersicht = null;
let filter = { suche: '', nur: 'alle' };

async function hole(pfad, optionen) {
  const r = await fetch(pfad, optionen);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.fehler || `Fehler ${r.status}`);
  return d;
}

/* ── Navigation ───────────────────────────────────────────────────── */
function zeichneNav(){
  el('nav').innerHTML = SEITEN.map((s) => {
    const n = s.id === 'datenbank' && uebersicht ? uebersicht.kennzahlen.gesamt : null;
    return `<button data-id="${s.id}" aria-current="${s.id === seite}">${ic(s.icon)}` +
      `<span class="navtext">${text(s.label)}</span>` +
      (n ? `<span class="navzahl">${n}</span>` : '') + '</button>';
  }).join('');
}

el('nav').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-id]');
  if (!b || b.dataset.id === seite) return;
  seite = b.dataset.id; location.hash = seite;
  zeichneNav(); lade();
});

/* ── Laden ────────────────────────────────────────────────────────── */
let lauf = 0;
async function lade(){
  const meins = ++lauf, fuer = seite;
  const s = SEITEN.find((x) => x.id === seite) || SEITEN[0];
  el('titel').textContent = s.titel;
  el('untertitel').textContent = s.lede;
  el('inhalt').innerHTML = '<div class="hint">Lade …</div>';
  try {
    if (seite === 'dashboard') {
      uebersicht = await hole('/api/uebersicht');
      if (meins !== lauf || seite !== fuer) return;
      zeichneNav(); zeichneUebersicht();
    } else {
      await ladeListe(() => meins !== lauf || seite !== fuer);
    }
  } catch (f) {
    el('inhalt').innerHTML = `<div class="meldung meldung--fehler">${text(f.message)}</div>`;
  }
}

/* ── Übersicht ────────────────────────────────────────────────────── */
function zeichneUebersicht(){
  const k = uebersicht.kennzahlen;
  /* Klassennamen aus dem vorhandenen Stil: .label, .value, .foot. */
  const kachel = (wert, label, hinweis) =>
    `<div class="card kpi"><div class="label">${text(label)}</div>` +
    `<div class="value">${wert}</div>` +
    (hinweis ? `<div class="foot">${text(hinweis)}</div>` : '') + '</div>';

  el('inhalt').innerHTML =
    '<div class="grid g4">' +
      kachel(k.gesamt, 'Betriebe') +
      kachel(k.voll, 'Vollständig bewertet', `von ${k.gescannt} gescannt`) +
      kachel(k.reports, 'Reports gebaut') +
      kachel(k.lohnend, 'Lohnende Leads', 'Lead-Wert ab 38') +
    '</div>' +
    '<div class="grid g2 mt">' +
      kachel(k.telefon, 'Telefonnummern') +
      kachel(k.schwach, 'Seiten unter 55 Punkten') +
    '</div>' +
    (uebersicht.bereit
      ? `<div class="meldung mt">${uebersicht.bereit} lohnende Betriebe sind vollständig ` +
        'bewertet und haben noch keinen Report. Die kosten einen Klick und nichts weiter.</div>'
      : '');
}

/* ── Betriebe ─────────────────────────────────────────────────────── */
async function ladeListe(veraltet){
  const p = new URLSearchParams({ suche: filter.suche, nur: filter.nur });
  const d = await hole('/api/liste?' + p);
  if (veraltet()) return;

  const knopf = (b) => b.report
    ? `<a class="tat" href="/report/${text(b.host)}/" target="_blank" rel="noopener">Ansehen</a>` +
      `<button class="tat" data-pdf="${text(b.host)}">PDF</button>` +
      `<button class="tat" data-neu="${text(b.host)}" title="Neu scannen und neu bauen">↻</button>`
    : `<button class="tat tat--haupt" data-bau="${text(b.host)}">` +
      (b.stufe === 2 ? 'Report' : 'Scan + Report') + '</button>';

  const note = (w) => w === null ? '<span class="hint">–</span>'
    : `<span class="pille ${w < 45 ? 'pille--bad' : w < 65 ? 'pille--warn' : 'pille--good'}">${w}</span>`;

  el('inhalt').innerHTML =
    '<div class="filter">' +
      `<input class="feld" id="suche" placeholder="Name, Ort oder Domain" value="${text(filter.suche)}">` +
      ['alle', 'lohnend', 'voll', 'report'].map((w) =>
        `<button class="tat${filter.nur === w ? ' tat--haupt' : ''}" data-nur="${w}">` +
        { alle: 'Alle', lohnend: 'Lohnend', voll: 'Vollscan', report: 'Mit Report' }[w] + '</button>').join('') +
      `<span class="treffermenge">${d.gesamt} Treffer</span>` +
    '</div>' +
    '<table class="liste"><thead><tr>' +
      '<th>Betrieb</th><th>Qualität</th><th>Lead</th><th>Größe</th><th></th>' +
    '</tr></thead><tbody>' +
    d.zeilen.map((b) => `<tr data-host="${text(b.host)}">` +
      `<td class="t-name"><div class="t-titel">${text(b.name)}</div>` +
        `<div class="t-url">${text(b.host)}${b.stadt ? ' · ' + text(b.stadt) : ''}</div></td>` +
      `<td>${note(b.qualitaet)}</td>` +
      `<td>${b.lead === null ? '<span class="hint">–</span>' : text(b.lead)}</td>` +
      `<td class="hint">${text(b.groesse || '–')}</td>` +
      `<td class="knopfreihe"><div class="tatreihe">${knopf(b)}</div></td>` +
    '</tr>').join('') +
    '</tbody></table>' +
    (d.gesamt > d.zeilen.length
      ? `<p class="hint mt">${d.zeilen.length} von ${d.gesamt} gezeigt. Suche eingrenzen.</p>` : '');
}

/* Suche ohne Knopf, aber nicht bei jedem Tastendruck eine Anfrage. */
let tipp = null;
el('inhalt').addEventListener('input', (e) => {
  if (e.target.id !== 'suche') return;
  clearTimeout(tipp);
  const w = e.target.value;
  tipp = setTimeout(() => { filter.suche = w; ladeListe(() => false); }, 250);
});

el('inhalt').addEventListener('click', async (e) => {
  const f = e.target.closest('button[data-nur]');
  if (f) { filter.nur = f.dataset.nur; return ladeListe(() => false); }

  const b = e.target.closest('button[data-bau],button[data-pdf],button[data-neu]');
  if (!b) return;
  const host = b.dataset.bau || b.dataset.pdf || b.dataset.neu;
  const zeile = b.closest('tr');
  const reihe = b.closest('.tatreihe');
  const zelle = b.closest('td');
  const vorher = reihe.innerHTML;

  const dauer = b.dataset.pdf ? 'das dauert etwa eine halbe Minute'
    : zeile.querySelector('.tat--haupt')?.textContent.startsWith('Scan')
      ? 'Scan und Report, das dauert gut eine Minute' : 'das dauert etwa 20 Sekunden';
  reihe.innerHTML = `<span class="hint">läuft, ${dauer} …</span>`;

  try {
    const d = await hole('/api/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, pdf: !!b.dataset.pdf, neuScannen: !!b.dataset.neu }),
    });
    reihe.innerHTML =
      `<a class="tat" href="/report/${text(host)}/" target="_blank" rel="noopener">Ansehen</a>` +
      `<button class="tat" data-pdf="${text(host)}">PDF</button>` +
      `<button class="tat" data-neu="${text(host)}" title="Neu scannen und neu bauen">↻</button>`;
    if (d.pdf) zelle.insertAdjacentHTML('beforeend',
      `<span class="legende">PDF: ${text(d.pdf)}</span>`);
    if (seite === 'dashboard') lade();
  } catch (f) {
    reihe.innerHTML = vorher;
    zelle.insertAdjacentHTML('beforeend',
      `<span class="legende" style="color:var(--bad-ink)">${text(f.message)}</span>`);
  }
});

window.addEventListener('hashchange', () => {
  const neu = location.hash.slice(1) || 'dashboard';
  if (neu !== seite) { seite = neu; zeichneNav(); lade(); }
});

el('stand').textContent = 'lokal · ' + location.host;
zeichneNav();
lade();
