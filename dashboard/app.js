/* Icons im Strichstil des Analytics-Dashboards: 24×24, nur Pfade, keine
   Flächen, gleiche Strichstärke. Gemischte Stile lassen eine Oberfläche
   zusammengesetzt wirken, auch wenn jedes Zeichen für sich gut ist. */
const ICONS = {
  dashboard: 'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z',
  datenbank: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3s-3.6 3-8 3s-8-1.3-8-3M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  pfeilab:   'M6 9l6 6l6-6',
  chevron:   'M9 6l6 6l-6 6',
  schliessen:'M6 6l12 12M18 6L6 18',
  befund:    'M12 9v4M12 17h.01M10.3 3.9L2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  stift:     'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z',
  auftrag:   'M9 11l3 3l8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  status:    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  betrieb:   'M3 20h18M5 20V8l7-4l7 4v12M10 20v-5h4v5',
  geld:      'M12 3v18M16 7.5a3.5 3.5 0 0 0-3.5-2.5h-1a3 3 0 0 0 0 6h1a3 3 0 0 1 0 6h-1A3.5 3.5 0 0 1 8 16.5',
  leute:     'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16.5 4.5a3.5 3.5 0 0 1 0 6.9M21 20v-1a5 5 0 0 0-3.5-4.8',
  brief:     'M3 7l9 6l9-6M3 7v10h18V7z',
  pfeilauf:  'M7 17L17 7M9 7h8v8',
  token:     'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l8 4.5l8-4.5',
  haken:     'M20 6L9 17l-5-5',
  uhr:       'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  zurueck:   'M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  baustein:  'M4 8l8-4l8 4l-8 4zM4 8v8l8 4l8-4V8M12 12v8',
  /* Die sechs Modularten. Gleicher Strich wie der Rest: nur Pfade, 1,6
     Breite, runde Enden. Kopf- und Fußbereich unterscheiden sich allein
     durch die Höhe der Trennlinie — das reicht bei 18 Pixeln gerade noch. */
  kopfbereich:'M3 5h18v14H3zM3 11h18M6.5 8h7',
  fussbereich:'M3 5h18v14H3zM3 15h18M6.5 17.3h6',
  siegel:     'M12 3l7 2.8v5.2c0 4.1-2.8 7.3-7 8.6c-4.2-1.3-7-4.5-7-8.6V5.8zM9.2 11.6l2 2l3.8-3.8',
  /* Nicht die Bento-Form nehmen: die ist bei 18 Pixeln vom Dashboard-
     Zeichen nicht zu unterscheiden. Eine breite Karte über zwei kleinen
     trifft die Leistungen genauso und bleibt eigenständig. */
  bento:      'M4 5h16v5H4zM4 14h7v5H4zM13 14h7v5h-7z',
  /* Drei Kacheln nebeneinander verkleben bei 18 Pixeln zu einem Klecks.
     Rahmen mit zwei Marken darin bleibt lesbar — in Originalgröße geprüft. */
  /* Kundenstimmen: Sprechblase mit zwei Zeilen. Nicht die Anführungs-
     zeichen aus dem Baukasten — als Strich gezeichnet werden daraus bei
     18 Pixeln zwei Kringel, die man nicht erkennt. */
  /* Für den Aufklapper an den Bibliothekskarten. */
  buch:       'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13v4H6a2 2 0 0 1-2-2z',
  band:       'M3 7h18v5H3zM6 16h12M8 20h8',
  navigation: 'M3 6h18M3 12h12M3 18h18M19 12h2',
  knopf:      'M3 9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM8.5 12h7',
  stimmen:    'M4 5h16v11H9l-4 4v-4H4zM8 9h8M8 12.5h5',
  logowand:   'M3 6h18v12H3zM7.6 12m-1.9 0a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0-3.8 0M13 10h4.2v4h-4.2z',
  verlauf:    'M6 5.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 18.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 7.5v9M11 5.5h9M11 18.5h7',
};
/* Ein unbekannter Name ergab bisher d="undefined" — ein leerer Kasten, der
   beim Hinsehen nicht auffällt. Jetzt gibt es ein Ersatzzeichen und eine
   Meldung in der Konsole, statt stillschweigend nichts. */
function ic(n, k = ''){
  const d = ICONS[n];
  if (!d) console.warn('Unbekanntes Zeichen "' + n + '". Vorhanden: ' + Object.keys(ICONS).join(', '));
  return '<svg class="ic ' + k + '" viewBox="0 0 24 24" aria-hidden="true"><path d="'
    + (d || ICONS.baustein) + '"/></svg>';
}

const SEITEN = [
  { gruppe: 'Start' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard',
    titel: 'Dashboard', lede: 'Wo die Akquise gerade steht.' },
  { gruppe: 'Bestand' },
  { id: 'datenbank', label: 'Datenbank', icon: 'datenbank',
    titel: 'Datenbank', lede: 'Alle erfassten Betriebe, filterbar.' },
];

/* Die Bibliothek wird beim ersten Aufruf nachgeladen und dann in die
   Navigation eingehängt — eine Gruppe mit einem Unterpunkt je Modulart.
   Quelle ist bibliothek.json, die der Baukasten selbst schreibt. */
let bibliothek = null;
let klappen = { bib: true };
try {
  const g = localStorage.getItem('klappen');
  if (g) klappen = { ...klappen, ...JSON.parse(g) };
} catch { /* ohne Speicher bleibt es beim Standard */ }
const merkeKlappen = () => {
  try { localStorage.setItem('klappen', JSON.stringify(klappen)); } catch {}
};

async function ladeBibliothek(){
  if (bibliothek) return bibliothek;
  const r = await fetch('/bibliothek.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('Bibliothek nicht gefunden (' + r.status + ').');
  bibliothek = await r.json();
  /* Nur einhängen, was noch nicht drin steht — zeichneNav läuft mehrfach. */
  if (!SEITEN.some((x) => x.id && x.id.startsWith('bib:'))) {
    SEITEN.push({ gruppe: 'Bibliothek', klappe: 'bib' });
    for (const g of bibliothek.gruppen) {
      SEITEN.push({ id: 'bib:' + g.id, label: g.name, icon: g.icon || 'baustein',
        unter: 'bib', titel: g.name, lede: g.zweck });
    }
  }
  return bibliothek;
}

/* Begriffe, die in der Oberfläche auftauchen — bewusst ohne Fachjargon.
   'etabliert' klang nach einer Phase und meinte die Betriebsgröße. */
const PHASE = {
  neu:'Gesammelt', gescannt:'Bewertet', entwurf_gebaut:'Wartet auf dich',
  feedback_gegeben:'Feedback gegeben', freigegeben:'Freigegeben', versendet:'Versendet',
  geantwortet:'Geantwortet', kunde:'Kunde', abgelehnt:'Abgelehnt', pausiert:'Zurückgestellt',
};
const PHASENFARBE = {
  entwurf_gebaut:'pille--warn', geantwortet:'pille--good', kunde:'pille--good',
  abgelehnt:'pille--bad',
};
const BUDGET  = { mittelstand:'Mittelstand', etabliert:'etabliert', klein:'klein', kleinst:'kleinst' };
const BRANCHE = { gastro:'Gastro', handwerk:'Handwerk', gesundheit:'Praxis', beratung:'Beratung',
                  handel:'Handel', dienstleistung:'Dienstleistung', autohaus:'Autohaus', industrie:'Industrie' };
const SCHWERE = { high:'schwer', medium:'mittel', low:'leicht' };
const PRUEFTIEFE = {
  1: { label:'Phase 1', hinweis:'Schnellprüfung ohne Design-Urteil und Technik — im Mittel 8 Punkte zu gut' },
  2: { label:'Phase 2', hinweis:'vollbewertet: alle acht Kategorien, plus zwei Unterseiten' },
};
const VERBRAUCHSPHASE = { scan_stufe1:'Phase 1', scan_stufe2:'Phase 2',
                          entwurf:'Entwürfe bauen', mail:'Mail-Entwürfe' };
const RINGFARBEN = ['var(--s1)','var(--s2)','var(--s3)','var(--s4)','var(--s5)'];

let seite = 'dashboard', daten = [], uebersicht = null, offen = null;
let filter = { status:'', stufe:'', budget:'', branche:'', minScore:'', maxScore:'' };

const el = (id) => document.getElementById(id);
const text = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const zahl = (n) => n == null ? '–' : n.toLocaleString('de-DE');
const euro = (n) => n == null ? '–' : n.toLocaleString('de-DE') + ' €';
/* Beträge ausschreiben. '2777 Tsd. €' muss man erst im Kopf umrechnen —
   2.777.000 € liest man einfach. */
const tsd  = (n) => n == null ? '–' : n.toLocaleString('de-DE') + ' €';
const datum = (s) => s ? new Date(s).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '–';

async function hole(pfad, opt) {
  const a = await fetch(pfad, { credentials:'same-origin', ...opt });
  /* Ein 401 von der Anmeldung heißt "Passwort falsch", ein 401 von allen
     anderen Stellen heißt "Sitzung abgelaufen". Vorher wurde beides zu
     "nicht angemeldet" — bei falschem Passwort stand da also eine Meldung,
     die nicht sagt, was zu tun ist. */
  if (a.status === 401 && !pfad.startsWith('/api/anmelden')) {
    zeigeTor();
    throw new Error('Sitzung abgelaufen — bitte neu anmelden.');
  }
  if (!a.ok) throw new Error((await a.json().catch(() => ({}))).fehler || `Fehler ${a.status}`);
  return a.json();
}

/* ── Anmeldung ──────────────────────────────────────────────────── */
function zeigeTor(){ el('tor').hidden = false; el('app').hidden = true; el('blatt').hidden = true; }
function zeigeApp(){
  el('tor').hidden = true; el('app').hidden = false; zeichneNav(); lade();
  /* Ohne diesen Aufruf stünde der Reiter erst da, nachdem man ihn
     angeklickt hat — und anklicken kann man ihn dann nicht. */
  ladeBibliothek().then(zeichneNav).catch(() => {});
}

el('anmeldung').addEventListener('submit', async (e) => {
  e.preventDefault();
  el('torFehler').textContent = '';
  try {
    await hole('/api/anmelden', { method:'POST', headers:{'Content-Type':'application/json'},
                                  body: JSON.stringify({ passwort: el('passwort').value }) });
    el('passwort').value = '';
    zeigeApp();
  } catch (f) { el('torFehler').textContent = f.message; }
});
el('abmelden').addEventListener('click', async () => {
  await fetch('/api/anmelden', { method:'DELETE', credentials:'same-origin' });
  zeigeTor();
});

/* ── Navigation ─────────────────────────────────────────────────── */
const PFEIL = 'M6 9l6 6l6-6';

function zeichneNav(){
  /* Unterpunkte einer klappbaren Gruppe kommen in einen eigenen Kasten,
     damit sie zusammen ein- und ausblenden. Auf dem Handy ist die Leiste
     waagerecht und die Gruppenüberschrift ausgeblendet — dort muss der
     Kasten durchgereicht werden, sonst wäre die Bibliothek unerreichbar.
     Das erledigt display:contents im Stil. */
  let offen = null;
  const stuecke = [];
  for (const s of SEITEN) {
    if (s.gruppe && s.klappe) {
      const auf = klappen[s.klappe] !== false;
      const drin = seite.startsWith(s.klappe + ':');
      stuecke.push('<button class="navklappe' + (drin && !auf ? ' navklappe--aktiv' : '') +
        '" data-klappe="' + s.klappe + '"' +
        ' aria-expanded="' + auf + '" aria-controls="navunter-' + s.klappe + '">' +
        '<span class="navtext">' + text(s.gruppe) + '</span>' +
        '<svg class="ic navpfeil" viewBox="0 0 24 24" aria-hidden="true"><path d="' + PFEIL + '"/></svg>' +
        '</button><div class="navunter" id="navunter-' + s.klappe + '"' +
        (auf ? '' : ' hidden') + '>');
      offen = s.klappe;
      continue;
    }
    if (s.gruppe) {
      if (offen) { stuecke.push('</div>'); offen = null; }
      stuecke.push('<div class="navgruppentitel">' + text(s.gruppe) + '</div>');
      continue;
    }
    stuecke.push(navKnopf(s));
  }
  if (offen) stuecke.push('</div>');
  el('nav').innerHTML = stuecke.join('');
}

function navKnopf(s){
  return [s].map((s) => {
    let n = s.id === 'datenbank' && uebersicht ? uebersicht.kennzahlen.gesamt : null;
    if (s.id && s.id.startsWith('bib:') && bibliothek) {
      const g = bibliothek.gruppen.find((x) => 'bib:' + x.id === s.id);
      n = g ? g.bausteine.length : null;
    }
    return '<button data-id="' + s.id + '" aria-current="' + (s.id === seite) + '">' +
           ic(s.icon) + '<span class="navtext">' + text(s.label) + '</span>' +
           (n ? '<span class="navzahl">' + zahl(n) + '</span>' : '') + '</button>';
  }).join('');
}
el('nav').addEventListener('click', (e) => {
  const k = e.target.closest('button[data-klappe]');
  if (k) {
    klappen[k.dataset.klappe] = k.getAttribute('aria-expanded') !== 'true';
    merkeKlappen(); zeichneNav(); return;
  }
  const b = e.target.closest('button[data-id]');
  if (!b || b.dataset.id === seite) return;
  seite = b.dataset.id;
  zeichneNav(); lade();
});

/* Wer weiterklickt, während noch geladen wird, bekam bisher die alte
   Antwort über die neue Seite gelegt: Der Dashboard-Abruf lief noch, und
   als er zurückkam, überschrieb er die inzwischen geöffnete Bibliothek.
   Jeder Ladevorgang merkt sich deshalb, für welche Seite er gedacht war. */
let ladelauf = 0;

async function lade(){
  const lauf = ++ladelauf;
  const fuer = seite;
  const veraltet = () => lauf !== ladelauf || seite !== fuer;
  const s = SEITEN.find((x) => x.id === seite) || { titel: 'Lade …', lede: '' };
  el('titel').textContent = s.titel;
  el('untertitel').textContent = s.lede;
  el('inhalt').innerHTML = '<div class="hint">Lade …</div>';
  try {
    if (seite.startsWith('bib:')) {
      await ladeBibliothek();
      if (veraltet()) return;
      zeichneNav(); zeichneBibliothek();
    } else if (seite === 'dashboard') {
      const u = await hole('/api/uebersicht');
      if (veraltet()) return;
      uebersicht = u; zeichneNav(); zeichneDashboard();
    } else {
      await ladeDatenbank(veraltet);
      if (veraltet()) return;
    }
    ladeAgent();
  } catch (f) {
    if (veraltet()) return;
    el('inhalt').innerHTML = '<div class="hint">' + text(f.message) + '</div>';
  }
}

async function ladeAgent(){
  try {
    const r = await hole('/api/warteschlange');
    if (r.hinweis) { el('agentstand').textContent = r.hinweis; return; }
    const o = r.auftraege.filter((a) => a.status !== 'fehler').length;
    const f = r.auftraege.filter((a) => a.status === 'fehler').length;
    el('agentstand').textContent = (o || f)
      ? [o ? o + ' beim Agenten' : '', f ? f + ' Fehler' : ''].filter(Boolean).join(' · ')
      : 'Agent: nichts offen';
  } catch {}
}

/* ── Dashboard ──────────────────────────────────────────────────── */
function kachel(wert, label, icon, fuss){
  return '<div class="card kpi"><div class="label">' + ic(icon) + text(label) + '</div>' +
         '<div class="value">' + wert + '</div>' +
         '<div class="foot">' + text(fuss ?? '') + '</div></div>';
}

/* Ring als SVG: ein Kreis je Anteil, versetzt über stroke-dashoffset. Ohne
   Fremdbibliothek, weil die Seite keine externen Skripte laden darf. */
function ring(teile, gesamt){
  if (!gesamt) return '<p class="lede">Noch nichts verbraucht.</p>';
  const U = 2 * Math.PI * 42;
  let offset = 0;
  const kreise = teile.map((t, i) => {
    const anteil = t.wert / gesamt;
    const s = '<circle cx="56" cy="56" r="42" fill="none" stroke="' + RINGFARBEN[i % 5] +
      '" stroke-width="15" stroke-dasharray="' + (anteil * U).toFixed(2) + ' ' + U.toFixed(2) +
      '" stroke-dashoffset="' + (-offset * U).toFixed(2) + '" transform="rotate(-90 56 56)"/>';
    offset += anteil;
    return s;
  }).join('');
  const legende = teile.map((t, i) =>
    '<span><i style="background:' + RINGFARBEN[i % 5] + '"></i>' + text(t.label) +
    '<b>' + t.anzeige + '</b></span>').join('');
  return '<div class="ring"><svg viewBox="0 0 112 112" width="112" height="112">' +
         '<circle cx="56" cy="56" r="42" fill="none" stroke="var(--sunk)" stroke-width="15"/>' +
         kreise + '</svg><div class="legende">' + legende + '</div></div>';
}

function zeichneDashboard(){
  const u = uebersicht, k = u.kennzahlen;
  const wartetAufDich = k.wartend ?? 0;

  const kpis = '<div class="grid g4">' +
    kachel(zahl(k.bewertet), 'Bewertet', 'leute',
           'von ' + zahl(k.gesamt) + ' gescrapten Betrieben') +
    kachel(zahl(k.voll), 'In Phase 2', 'haken',
           zahl(k.schnell) + ' erst in Phase 1') +
    kachel(zahl(wartetAufDich), 'Wartet auf dich', 'uhr',
           k.offeneAuftraege ? k.offeneAuftraege + ' Aufträge beim Agenten'
                             : (wartetAufDich ? 'ansehen und entscheiden' : 'gerade nichts')) +
    kachel(tsd(k.potenzialOffen), 'Offenes Potenzial', 'geld',
           u.neueSpalten === false ? 'ohne Auftragswerte — Migration 05 fehlt' : 'ohne Kunden und Absagen') +
    '</div>';

  /* Funnel: jede Stufe als Anteil der vorigen. Die Durchlaufquote daneben ist
     die Zahl, die zählt — wo verliert die Akquise ihre Betriebe? */
  const f0 = u.funnel[0].anzahl || 1;
  const pipeline = '<div class="card"><h2>' + ic('status') + 'Funnel</h2>' +
    '<p class="sub">Jede Stufe enthält alle, die weiter sind.</p>' +
    u.funnel.map((p, i) => {
      const vor = i ? u.funnel[i-1].anzahl : null;
      const quote = vor ? (vor ? Math.round((p.anzahl / vor) * 100) : 0) : null;
      return '<div class="bar-row" title="' + text(p.hinweis) + '">' +
        '<span class="flabel">' + text(p.label) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' +
          Math.max(p.anzahl ? 2 : 0, (p.anzahl / f0) * 100).toFixed(1) + '%' +
          (p.key === 'kunde' ? ';background:var(--good)' : '') + '"></span></span>' +
        '<span class="bar-val">' + zahl(p.anzahl) +
          (quote != null && vor ? ' <span style="color:var(--ink-3)">' + quote + '%</span>' : '') +
        '</span></div>';
    }).join('') +
    '</div>';

  const vb = (u.verbrauch ?? []).filter((v) => Number(v.euro) > 0 || Number(v.tokens_ein) > 0);
  const gesamtEuro = vb.reduce((s, v) => s + Number(v.euro ?? 0), 0);
  const verbrauch = '<div class="card"><h2>' + ic('token') + 'Verbrauch</h2>' +
    '<p class="sub">' + (u.verbrauchFehlt
      ? 'Die Tabelle fehlt noch — Migration 05 einspielen.'
      : gesamtEuro ? 'Bisher ' + gesamtEuro.toFixed(2).replace('.', ',') + ' € für ' +
          zahl(vb.reduce((s, v) => s + Number(v.laeufe ?? 0), 0)) + ' Läufe.'
        : 'Noch nichts erfasst. Wird ab dem nächsten Lauf mitgeschrieben.') + '</p>' +
    (u.verbrauchFehlt || !vb.length ? ''
      : ring(vb.map((v) => ({ label: VERBRAUCHSPHASE[v.phase] ?? v.phase,
                              wert: Number(v.euro ?? 0),
                              anzeige: Number(v.euro).toFixed(2).replace('.', ',') + ' €' })), gesamtEuro)) +
    '</div>';

  /* Das frühere Modul "Bearbeitet" zeigte Aktivität je Tag aus dem Scan-Datum.
     Da alle Betriebe an zwei Tagen gescannt wurden, waren das zwei Balken ohne
     Aussage. Solange es keine echte Bearbeitungshistorie gibt, zeigen wir
     stattdessen, wie belastbar der Bestand ist — das ist die Frage, die vor
     dem ersten Anschreiben zählt. */
  const tiefe = '<div class="card"><h2>' + ic('befund') + 'Prüftiefe</h2>' +
    '<p class="sub">Nur Phase 2 taugt für einen Pitch. Phase 1 fehlen das Design-Urteil ' +
    'und die Technikmessung — zusammen ein Drittel der Gewichtung.</p>' +
    [['Phase 2 — vollbewertet', k.voll, 'var(--good)'],
     ['Phase 1 — schnellgeprüft', k.schnell, 'var(--warn)'],
     ['noch nicht bewertet', k.gesamt - k.bewertet, 'var(--ink-3)']]
      .filter(([, n]) => n > 0).map(([l, n, farbe]) =>
        '<div class="bar-row"><span class="flabel">' + l + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' +
          Math.max(2, (n / Math.max(k.gesamt, 1)) * 100).toFixed(1) + '%;background:' + farbe + '"></span></span>' +
        '<span class="bar-val">' + zahl(n) + '</span></div>').join('') +
    (k.gesperrt ? '<p class="sub" style="margin:.9rem 0 0">' + zahl(k.gesperrt) +
      (k.gesperrt === 1 ? ' Betrieb konnte' : ' Betriebe konnten') +
      ' nicht vollständig gescannt werden — meist Bot-Schutz.</p>' : '') +
    '</div>';

  const versand = '<div class="card"><h2>' + ic('brief') + 'Versand</h2>' +
    '<p class="sub">Was rausging und was zurückkam.</p>' +
    '<div class="zeile"><span>Versendet</span><span class="mono">' + zahl(k.versendet) + '</span></div>' +
    '<div class="zeile"><span>Geantwortet</span><span class="mono">' + zahl(k.geantwortet) + '</span></div>' +
    '<div class="zeile"><span>Antwortrate</span><span class="mono">' +
      (k.antwortrate != null ? k.antwortrate + ' %' : '–') + '</span></div>' +
    '<div class="zeile"><span>Daraus Kunden</span><span class="mono">' +
      zahl(u.funnel.find((p) => p.key === 'kunde')?.anzahl ?? 0) + '</span></div>' +
    (k.gesperrt ? '<div class="zeile"><span>Unvollständig gescannt</span><span class="mono">' +
      zahl(k.gesperrt) + '</span></div>' : '') +
    '</div>';

  el('inhalt').innerHTML = kpis + '<div class="grid g2 mt">' + pipeline + verbrauch + '</div>' +
                           '<div class="grid g2 mt">' + tiefe + versand + '</div>';
}

/* ── Datenbank ──────────────────────────────────────────────────── */
async function ladeDatenbank(veraltet = () => false){
  const p = new URLSearchParams();
  if (filter.status)  p.set('status', filter.status);
  if (filter.budget)  p.set('groesse', filter.budget);
  if (filter.branche) p.set('branche', filter.branche);
  if (filter.stufe)   p.set('stufe', filter.stufe);
  const r = await hole('/api/liste?' + p);
  if (veraltet()) return;
  daten = r.betriebe;
  // Score-Grenzen filtert die Oberfläche, damit das Zurücksetzen ohne neue
  // Anfrage auskommt und das Schieben sich sofort auswirkt.
  const von = filter.minScore === '' ? null : Number(filter.minScore);
  const bis = filter.maxScore === '' ? null : Number(filter.maxScore);
  const sichtbar = daten.filter((b) =>
    (von == null || (b.quality_score ?? -1) >= von) &&
    (bis == null || (b.quality_score ?? 999) <= bis));
  zeichneDatenbank(sichtbar, r.anzahl);
}

function auswahl(id, label, werte, gewaehlt){
  return '<div class="fgruppe"><label for="' + id + '">' + text(label) + '</label>' +
    '<select id="' + id + '"><option value="">alle</option>' +
    werte.map(([v, t]) => '<option value="' + v + '"' + (String(v) === String(gewaehlt) ? ' selected' : '') + '>' +
      text(t) + '</option>').join('') + '</select></div>';
}

function zeichneDatenbank(sichtbar, gesamt){
  const gesetzt = Object.values(filter).some((v) => v !== '');
  const leiste = '<div class="filter">' +
    auswahl('fStatus', 'Phase', Object.entries(PHASE), filter.status) +
    auswahl('fStufe', 'Prüftiefe', [[2, 'Phase 2 — vollbewertet'], [1, 'Phase 1 — schnellgeprüft']], filter.stufe) +
    auswahl('fBudget', 'Budget', Object.entries(BUDGET), filter.budget) +
    auswahl('fBranche', 'Branche', Object.entries(BRANCHE), filter.branche) +
    '<div class="fgruppe"><label for="fMin">Qualitäts-Score</label><span class="fspanne">' +
      '<input id="fMin" type="number" min="0" max="100" placeholder="ab" value="' + text(filter.minScore) + '">' +
      '<span>bis</span>' +
      '<input id="fMax" type="number" min="0" max="100" placeholder="bis" value="' + text(filter.maxScore) + '">' +
    '</span></div>' +
    (gesetzt ? '<button class="zuruecksetzen" id="fReset">' + ic('zurueck') + 'Zurücksetzen</button>' : '') +
    '<span class="treffermenge">' + zahl(sichtbar.length) +
      (sichtbar.length !== gesamt ? ' von ' + zahl(gesamt) : '') +
      (sichtbar.length === 1 ? ' Betrieb' : ' Betriebe') + '</span>' +
    '</div>';

  const karten = !sichtbar.length
    ? '<div class="hint">Keine Betriebe mit diesen Filtern.</div>'
    : '<div class="liste">' + sichtbar.map((b) => {
        const host = (b.website ?? '').replace(/^https?:\/\//, '');
        const pillen = [];
        if (b.branche) pillen.push('<span class="pille">' + text(BRANCHE[b.branche] ?? b.branche) + '</span>');
        pillen.push('<span class="pille ' + (PHASENFARBE[b.status] ?? 'pille--phase') + '">' +
                    text(PHASE[b.status] ?? b.status) + '</span>');
        const wert = b.auftragswert ?? b.preis_bis;
        if (wert) pillen.push('<span class="pille">' + euro(wert) + '</span>');
        if (b.scan_stufe) pillen.push('<span class="pille' + (b.scan_stufe === 2 ? ' pille--good' : '') +
          '">' + PRUEFTIEFE[b.scan_stufe].label + '</span>');
        if (b.scan_unvollstaendig) pillen.push('<span class="pille pille--bad">Scan unvollständig</span>');
        if (b.befunde_schwer) pillen.push('<span class="pille pille--bad">' + b.befunde_schwer +
          ' schwere Mängel</span>');
        return '<button class="treffer" data-id="' + b.id + '">' +
          '<span class="t-kopf"><span class="t-titel">' +
            '<span class="t-name">' + text(b.name) + '</span>' +
            '<span class="t-url">' + text(host) + '</span></span>' +
          '<span class="t-wert"><b>' + (b.lead_score ?? '–') + '</b><span>Lead</span></span></span>' +
          '<span class="pillen">' + pillen.join('') + '</span></button>';
      }).join('') + '</div>';

  el('inhalt').innerHTML = leiste + karten;

  const setze = (id, feld) => el(id)?.addEventListener('change', (e) => {
    filter[feld] = e.target.value; ladeDatenbank();
  });
  setze('fStatus', 'status'); setze('fStufe', 'stufe');
  setze('fBudget', 'budget'); setze('fBranche', 'branche');
  setze('fMin', 'minScore');  setze('fMax', 'maxScore');
  el('fReset')?.addEventListener('click', () => {
    filter = { status:'', stufe:'', budget:'', branche:'', minScore:'', maxScore:'' };
    ladeDatenbank();
  });
}

el('inhalt').addEventListener('click', (e) => {
  const t = e.target.closest('.treffer[data-id]');
  if (t) oeffne(t.dataset.id);
});

/* ── Detailblatt ────────────────────────────────────────────────── */
async function oeffne(id){
  el('blatt').hidden = false;
  el('bName').textContent = 'Lade …'; el('bUnter').textContent = ''; el('bRumpf').innerHTML = '';
  try { offen = await hole('/api/betrieb?id=' + encodeURIComponent(id)); zeichneBlatt(); }
  catch (f) { el('bRumpf').innerHTML = '<div class="hint">' + text(f.message) + '</div>'; }
}
function schliesse(){ el('blatt').hidden = true; offen = null; }
el('bZu').addEventListener('click', schliesse);
el('blatt').addEventListener('click', (e) => { if (e.target === el('blatt')) schliesse(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el('blatt').hidden) schliesse(); });

function zeichneBlatt(){
  const b = offen, k = b.kategorien || {};
  const host = (b.website || '').replace(/^https?:\/\//, '');
  el('bName').textContent = b.name;
  el('bUnter').textContent = [BRANCHE[b.branche] ?? b.branche, b.stadt, PHASE[b.status]]
    .filter(Boolean).join(' · ');
  const w = (n, l) => '<div class="wert"><b>' + (n ?? '–') + '</b><span>' + l + '</span></div>';
  const z = (l, v) => '<div class="zeile"><span>' + l + '</span><span>' + v + '</span></div>';
  const knopf = (tun, wert, label, icon, klasse) =>
    '<button class="tat ' + (klasse ?? '') + '" data-tun="' + tun + '"' +
    (wert ? ' data-wert="' + wert + '"' : '') + '>' + (icon ? ic(icon) : '') + label + '</button>';

  el('bRumpf').innerHTML =
    '<div class="card"><h3>' + ic('dashboard') + 'Bewertung</h3><div class="werte">' +
      w(b.quality_score, 'Qualität') + w(b.lead_score, 'Lead') + w(k.impression, 'Eindruck') +
      w(k.mobile, 'Mobil') + w(k.content, 'Inhalt') + w(k.tech, 'Technik') + '</div>' +
      (b.scan_unvollstaendig ? '<p class="meldung meldung--fehler">' + text(b.scan_hinweis ?? 'Scan unvollständig') + '</p>' : '') +
      (b.scan_stufe === 1 ? '<p class="meldung meldung--warn">Phase 1 — Design-Urteil und Technik fehlen, der Wert liegt im Mittel 8 Punkte zu hoch.</p>' : '') +
    '</div>' +

    '<div class="card"><h3>' + ic('betrieb') + 'Betrieb</h3>' +
      z('Website', '<a href="' + text(b.website) + '" target="_blank" rel="noopener noreferrer">' + text(host) + '</a>') +
      z('Budget-Einstufung', text(BUDGET[b.groesse_stufe] ?? '–') +
        (b.groesse_score != null ? ' <span class="mono">(' + b.groesse_score + ')</span>' : '')) +
      z('Preisrahmen, geschätzt', '<span class="mono">' +
        (b.preis_von ? euro(b.preis_von) + ' – ' + euro(b.preis_bis) : '–') + '</span>') +
      z('Google', '<span class="mono">' + (b.google_rating ?? '–') + ' ★ · ' + zahl(b.google_reviews ?? 0) + '</span>') +
      z('Letzter Scan', '<span class="mono">' + datum(b.letzter_scan) + '</span>') +
      (b.groesse_signale?.length ? z('Größensignale', text(b.groesse_signale.join(', '))) : '') +
      (b.entwurf_url ? z('Entwurf', '<a href="' + text(b.entwurf_url) + '" target="_blank" rel="noopener noreferrer">ansehen</a>') : '') +
    '</div>' +

    '<div class="card"><h3>' + ic('geld') + 'Auftragswert</h3>' +
      '<p class="sub" style="margin:-.3rem 0 .7rem">Der Preisrahmen ist aus der Betriebsgröße geschätzt. Sobald du eine Zahl hast, gilt deine.</p>' +
      '<div class="wertzeile"><input class="feld" id="wertFeld" type="number" min="0" step="50" ' +
        'placeholder="' + (b.preis_bis ?? 'Betrag in Euro') + '" value="' + (b.auftragswert ?? '') + '">' +
        knopf('wert', '', 'Setzen', 'haken', 'tat--haupt') + '</div>' +
    '</div>' +

    '<details class="klapp"' + ((b.befunde.length && b.befunde.length <= 6) ? ' open' : '') + '>' +
      '<summary>' + ic('befund') + 'Befunde' + (b.befunde.length ? ' (' + b.befunde.length + ')' : '') +
      ic('pfeilab', 'pfeil') + '</summary><div>' +
      (b.befunde.length ? b.befunde.slice(0, 60).map((f) =>
        '<div class="befund"><span class="punktmarke ' + text(f.severity) + '"></span><p>' +
        text(f.text ?? f.titel ?? f.message ?? '') + '<br><em>' +
        text(SCHWERE[f.severity] ?? f.severity ?? '') + (f.category ? ' · ' + text(f.category) : '') +
        '</em></p></div>').join('')
        : '<p class="lede" style="margin:0">Keine Befunde erfasst.</p>') +
    '</div></details>' +

    '<div class="card"><h3>' + ic('stift') + 'Korrektur an den Agenten</h3>' +
      '<textarea class="feld" id="fbText" placeholder="Was soll am Entwurf anders werden?"></textarea>' +
      '<div class="knopfreihe">' + knopf('feedback', '', 'Feedback speichern', 'haken', 'tat--haupt') + '</div>' +
      '<h3 style="margin:1.4rem 0 .75rem">' + ic('auftrag') + 'Auftrag geben</h3><div class="knopfreihe">' +
        knopf('auftrag', 'entwurf_bauen', 'Entwurf bauen') +
        knopf('auftrag', 'entwurf_neu_bauen', 'Neu bauen') +
        knopf('auftrag', 'scan_stufe2', 'Vollbewertung') +
        knopf('auftrag', 'mail_vorbereiten', 'Mail vorbereiten') + '</div>' +
      '<h3 style="margin:1.4rem 0 .75rem">' + ic('status') + 'Phase setzen</h3><div class="knopfreihe">' +
        knopf('status', 'freigegeben', 'Freigegeben') +
        knopf('status', 'versendet', 'Versendet') +
        knopf('status', 'geantwortet', 'Geantwortet') +
        knopf('status', 'kunde', 'Kunde') +
        knopf('status', 'pausiert', 'Zurückstellen') +
        knopf('status', 'abgelehnt', 'Abgelehnt', '', 'tat--warn') + '</div>' +
      '<div class="meldung" id="bMeldung" role="status"></div>' +
    '</div>' +

    (b.feedback?.length ? '<details class="klapp"><summary>' + ic('stift') + 'Bisheriges Feedback (' +
      b.feedback.length + ')' + ic('pfeilab', 'pfeil') + '</summary><div><ul class="verlauf">' +
      b.feedback.map((f) => '<li><b>Runde ' + (f.runde ?? '?') + '</b> · ' + datum(f.am) + '<br>' +
        text(f.text) + '</li>').join('') + '</ul></div></details>' : '') +

    (b.auftraege?.length ? '<details class="klapp"><summary>' + ic('auftrag') + 'Aufträge (' +
      b.auftraege.length + ')' + ic('pfeilab', 'pfeil') + '</summary><div><ul class="verlauf">' +
      b.auftraege.map((a) => '<li><b>' + text(a.art) + '</b> · ' + text(a.status) + ' · ' + datum(a.angelegt_am) +
        (a.fehler ? '<br><span style="color:var(--bad-ink)">' + text(a.fehler) + '</span>' : '') +
        '</li>').join('') + '</ul></div></details>' : '');
}

el('bRumpf').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-tun]');
  if (!b || !offen) return;
  const m = el('bMeldung');
  const nutzlast = { id: offen.id, was: b.dataset.tun, wert: b.dataset.wert };
  const fb = el('fbText')?.value.trim() ?? '';
  if (b.dataset.tun === 'feedback') {
    if (!fb) { m.className = 'meldung meldung--fehler'; m.textContent = 'Bitte erst etwas schreiben.'; return; }
    nutzlast.anweisung = fb;
  }
  if (b.dataset.tun === 'auftrag') nutzlast.anweisung = fb || null;
  if (b.dataset.tun === 'wert') nutzlast.wert = el('wertFeld')?.value ?? '';

  b.disabled = true;
  m.className = 'meldung'; m.textContent = 'Wird gespeichert …';
  try {
    const r = await hole('/api/aktion', { method:'POST', headers:{'Content-Type':'application/json'},
                                          body: JSON.stringify(nutzlast) });
    m.textContent = r.hinweis ?? 'Gespeichert.';
    await oeffne(offen.id);
    if (seite === 'datenbank') ladeDatenbank(); else lade();
    ladeAgent();
  } catch (f) { m.className = 'meldung meldung--fehler'; m.textContent = f.message; }
  finally { b.disabled = false; }
});

hole('/api/stand').then(zeigeApp).catch(zeigeTor);


/* ── Bibliothek ─────────────────────────────────────────────────────
   Zeigt je Modulart die Fassungen mit Bild, wann man sie nimmt und wo
   die Grenzen liegen. Die Bilder entstehen aus den Prüfseiten des
   Baukastens, nicht aus einer zweiten Beschreibung. */
function zeichneBibliothek(){
  const g = bibliothek.gruppen.find((x) => 'bib:' + x.id === seite);
  if (!g) { el('inhalt').innerHTML = '<div class="hint">Diese Modulart gibt es nicht.</div>'; return; }

  /* Nur Bild und Name. Alles Weitere steht im Pop-up — eine Übersicht mit
     zwei Absätzen je Karte vergleicht sich nicht. */
  el('inhalt').innerHTML =
    '<p class="bibkopf">Stand ' + text(bibliothek.stand) + '. Klick auf eine Fassung zeigt sie groß.</p>' +
    '<div class="bibgitter">' + g.bausteine.map((b, i) =>
      '<button class="bibkachel" type="button" data-bib="' + i + '">' +
        '<span class="bibkachel__bild">' +
          (b.bild ? '<img src="/' + text(b.bild) + '" alt="" loading="lazy">' : '') +
        '</span>' +
        '<span class="bibkachel__fuss">' +
          '<span class="bibkachel__name">' + text(b.name) + '</span>' +
          (b.erste ? '<span class="pille pille--good">erste Wahl</span>' : '') +
        '</span>' +
      '</button>').join('') +
    '</div>';
}

/* ── Pop-up ─────────────────────────────────────────────────────────
   Zeigt die Fassung als eigene Seite im Rahmen, nicht als Bild: Was im
   Pop-up steht, ist dasselbe HTML, das ein Entwurf bekäme. */
function zeigeBaustein(b, g){
  const basis = 'https://entwuerfe.admemory.de/';
  el('bsName').textContent = b.name;
  el('bsUnter').textContent = b.id;
  el('bsRumpf').innerHTML =
    '<div class="bsrahmen"><iframe src="' + basis + text(b.seite) + '" title="' + text(b.name) + '"' +
      ' loading="lazy" referrerpolicy="no-referrer"></iframe></div>' +
    '<div class="bszeilen">' +
      '<div class="bib__zeile">' + ic('uhr') + '<div><b>Wann</b>' + text(b.wann) + '</div></div>' +
      '<div class="bib__zeile">' + ic('befund') + '<div><b>Grenzen</b>' + text(b.grenzen) + '</div></div>' +
    '</div>' +
    '<div class="bib__fuss">' +
      '<a href="' + basis + text(b.seite) + '" target="_blank" rel="noopener">' +
        ic('pfeilauf') + 'In eigenem Fenster öffnen</a>' +
      '<a href="' + basis + text(g.seite) + '/" target="_blank" rel="noopener">' +
        ic('pfeilauf') + 'Prüfseite mit allen Härtefällen</a>' +
    '</div>';
  el('bausteinblatt').hidden = false;
}

el('inhalt').addEventListener('click', (e) => {
  const k = e.target.closest('button[data-bib]');
  if (!k) return;
  const g = bibliothek.gruppen.find((x) => 'bib:' + x.id === seite);
  if (g) zeigeBaustein(g.bausteine[+k.dataset.bib], g);
});
el('bsZu').addEventListener('click', () => { el('bausteinblatt').hidden = true; el('bsRumpf').innerHTML = ''; });
el('bausteinblatt').addEventListener('click', (e) => {
  if (e.target.id === 'bausteinblatt') { el('bausteinblatt').hidden = true; el('bsRumpf').innerHTML = ''; }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el('bausteinblatt').hidden) {
    el('bausteinblatt').hidden = true; el('bsRumpf').innerHTML = '';
  }
});

