/* Rechnet die Einzelseiten zu einem Urteil über den Auftritt zusammen.
   Die Regeln stammen aus der Abstimmung mit Noah:
     Recht, Aktualität, Technik  → nur Startseite (gelten global bzw. dort wird gemessen)
     Design, Mobil               → Startseite doppelt gewichtet, Ausreißer nach unten
                                   zählen ebenfalls doppelt: eine schöne Startseite
                                   und eine miserable Karte ist ein schlechter
                                   Auftritt, kein mittelmäßiger
     Inhalt                      → bestes Ergebnis über alle Seiten, denn die
                                   Öffnungszeiten dürfen auf der Kontaktseite stehen */

export function mittelMitAusreisser(werte, gewichtStart = 2) {
  // Ohne Wert für die Startseite gibt es kein Urteil über den Auftritt. Sonst
  // hätte bei Sicilia die PDF-Speisekarte im Chrome-Viewer den Gesamtwert
  // bestimmt, weil die Startseiten-Bewertung abgestürzt war.
  if (typeof werte[0] !== 'number') return null;
  const gueltig = werte.filter((w) => typeof w === 'number');
  if (gueltig.length === 1) return gueltig[0];

  const [start, ...rest] = gueltig;
  // Der schlechteste Wert des gesamten Auftritts zählt zusätzlich — auch wenn das
  // die Startseite selbst ist. Sonst bliebe eine miserable Startseite mit guten
  // Unterseiten unauffällig.
  const schlechtester = Math.min(...gueltig);
  const summe = start * gewichtStart + rest.reduce((a, b) => a + b, 0) + schlechtester;
  const teiler = gewichtStart + rest.length + 1;
  return Math.round(summe / teiler);
}

export function fasseZusammen(seiten) {
  const start = seiten[0];
  const hol = (s, k) => (s.kategorien[k]?.score ?? null);

  const kategorien = {
    // global bzw. nur an der Startseite gemessen
    legal:      start.kategorien.legal,
    freshness:  start.kategorien.freshness,
    tech:       start.kategorien.tech,
    seo:        start.kategorien.seo,
    // über alle Seiten, Startseite und Ausreißer schwerer
    // PDF-Seiten liefern bewusst keinen Design-Wert und zählen hier nicht mit
    impression: { ...start.kategorien.impression,
                  score: mittelMitAusreisser([hol(seiten[0], 'impression'),
                    ...seiten.slice(1).map((s) => hol(s, 'impression')).filter((x) => x !== null)]) },
    mobile:     { ...start.kategorien.mobile,     score: mittelMitAusreisser(seiten.map((s) => hol(s, 'mobile'))) },
    // Inhalt: bestes Ergebnis, weil Informationen auf Unterseiten stehen dürfen
    content:    { ...start.kategorien.content,    score: Math.max(...seiten.map((s) => hol(s, 'content') ?? 0)) },
  };

  // Befunde aller Seiten, mit Angabe wo sie auftraten
  const befunde = seiten.flatMap((s, i) =>
    (s.findings || []).map((f) => ({ ...f, seite: s.label || (i === 0 ? 'Startseite' : s.url) })));

  // Doppelte zusammenfassen (Cookie-Banner steht auf jeder Seite)
  const gesehen = new Map();
  for (const f of befunde) {
    const key = f.text;
    if (!gesehen.has(key)) gesehen.set(key, { ...f, seiten: [f.seite] });
    else gesehen.get(key).seiten.push(f.seite);
  }
  const rang = { high: 0, medium: 1, low: 2 };
  const zusammengefasst = [...gesehen.values()]
    .map(({ seite, ...f }) => (f.seiten.length === seiten.length && seiten.length > 1
      ? { ...f, text: f.text, evidence: f.evidence, seiten: ['alle Seiten'] } : f))
    .sort((a, b) => rang[a.severity] - rang[b.severity]);

  return { kategorien, befunde: zusammengefasst };
}

/* Vollständigkeit: Fehlen wichtige Inhalte im gesamten Auftritt?
   Anders als „Inhalt" (Qualität der Aufbereitung) geht es hier darum, ob etwas
   überhaupt existiert — über alle geprüften Seiten hinweg. */
export function checkVollstaendigkeit(seiten, branche, profil) {
  const f = [];
  let pts = 0;
  const alleTexte = seiten.map((s) => s.text || '').join('\n');
  const alleLinks = seiten.flatMap((s) => s.links || []);
  const hatLink = (rx) => alleLinks.some((l) => rx.test(l.text) || rx.test(l.href));
  const imText = (rx) => rx.test(alleTexte);

  const pruefe = (name, treffer, punkte, hinweis) => {
    if (treffer) pts += punkte;
    else f.push({ severity: punkte >= 18 ? 'high' : 'medium', text: hinweis, evidence: null, category: 'completeness' });
  };

  pruefe('angebot', profil.angebot.test(alleTexte) || hatLink(profil.angebot), 25,
    `Im gesamten Auftritt ist nicht zu finden, was der Betrieb anbietet.`);
  pruefe('zeiten', profil.zeiten.test(alleTexte), 18,
    `Auf keiner geprüften Seite stehen ${branche === 'gesundheit' ? 'Sprechzeiten' : 'Öffnungszeiten'}.`);
  pruefe('kontakt', hatLink(/kontakt|anfahrt|standort/i) || imText(/\b\d{5}\s+[A-ZÄÖÜ]/), 18,
    'Keine eigene Kontaktmöglichkeit oder Adresse im Auftritt gefunden.');
  pruefe('impressum', hatLink(/impressum/i), 13,
    'Kein Impressum verlinkt — in Deutschland Pflicht.');
  pruefe('datenschutz', hatLink(/datenschutz|privacy/i), 13,
    'Keine Datenschutzerklärung verlinkt — Pflicht nach DSGVO.');
  pruefe('vertrauen', profil.vertrauen.test(alleTexte), 13,
    'Nichts, was Vertrauen schafft — keine Referenzen, kein Team, keine Geschichte.');

  return { score: Math.max(0, Math.min(100, pts)), findings: f, data: { gepruefteSeiten: seiten.length } };
}
