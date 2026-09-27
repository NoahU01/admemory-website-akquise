/* Zwei Zahlen, die nicht verwechselt werden dürfen:
   qualityScore — wie gut ist die Website (0 schlecht … 100 gut)
   leadScore    — wie lohnend ist der Betrieb als Kunde (0 uninteressant … 100 heißer Lead)
   Für die Pipeline zählt der leadScore: eine schwache Seite bei einem guten Betrieb. */

export const WEIGHTS = {
  impression:   { w: 22, label: 'Eindruck & Design' },   // der eigentliche Relaunch-Grund
  mobile:       { w: 20, label: 'Mobil' },
  content:      { w: 16, label: 'Inhalt & Nutzen' },
  completeness: { w: 12, label: 'Vollständigkeit' },     // fehlt Wesentliches im Auftritt?
  tech:         { w: 12, label: 'Technik & Tempo' },
  freshness:    { w:  9, label: 'Aktualität' },
  seo:          { w:  6, label: 'Auffindbarkeit' },
  legal:        { w:  3, label: 'Rechtliches' },
};

export function total(cats) {
  let sum = 0, wsum = 0;
  for (const [k, { w }] of Object.entries(WEIGHTS)) {
    const c = cats[k];
    if (!c || c.score === null || c.score === undefined) continue;
    sum += c.score * w; wsum += w;
  }
  if (!wsum) return null;
  let score = sum / wsum;

  /* Deckel: Eine Seite ist nie besser als ihre schwächste tragende Säule zulässt.
     Ohne das zieht guter Durchschnitt in Nebenkategorien einen miserablen
     Gesamteindruck nach oben — genau das Problem der ersten Kalibrierung. */
  const caps = [];
  if (cats.impression?.score !== null && cats.impression?.score !== undefined) caps.push(cats.impression.score + 25);
  if (cats.mobile?.score !== null && cats.mobile?.score !== undefined) caps.push(cats.mobile.score + 30);
  if (caps.length) score = Math.min(score, ...caps);

  return Math.round(score);
}

/* Lead-Score: schwache Seite + lebendiger Betrieb = lohnend.
   signals stammen später aus der Places API (Bewertungen, Anzahl Rezensionen).
   Ohne Signale ist er schlicht die Umkehrung der Qualität. */
export function lead(qualityScore, signals = {}) {
  if (qualityScore === null) return null;
  const need = 100 - qualityScore;
  const { rating = null, reviews = null } = signals;
  let vitality = 0.5;
  if (rating !== null && reviews !== null) {
    const r = Math.max(0, Math.min(1, (rating - 3.4) / 1.4));                    // 3,4★ = 0 … 4,8★ = 1
    const v = Math.max(0, Math.min(1, Math.log10(Math.max(1, reviews)) / 2.4));  // 1 … ~250 Bewertungen
    vitality = 0.35 * r + 0.65 * v;
  }
  return Math.round(need * (0.55 + 0.45 * vitality));
}

export function allFindings(cats) {
  const rank = { high: 0, medium: 1, low: 2 };
  return Object.entries(cats).flatMap(([k, c]) => (c.findings || []).map((f) => ({ ...f, category: k })))
    .sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function grade(score) {
  if (score === null) return '–';
  if (score >= 85) return 'gut';
  if (score >= 70) return 'solide';
  if (score >= 55) return 'ausbaufähig';
  if (score >= 40) return 'schwach';
  return 'kritisch';
}

export function leadGrade(l) {
  if (l === null) return '–';
  if (l >= 55) return 'heißer Lead';
  if (l >= 38) return 'lohnend';
  if (l >= 22) return 'eher nicht';
  return 'kein Bedarf';
}
