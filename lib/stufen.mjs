/* Zwei Scan-Tiefen statt einer.

   Stufe 1 — Vorauswahl: nur die Startseite, nur Regelchecks.
     Kostet nichts und dauert rund 10 Sekunden. Damit lassen sich hunderte
     Betriebe durchsehen, um die Kandidaten zu finden, die sich lohnen.
     Kein Lighthouse (9 s) und kein Design-Urteil (11 ct) — beides wäre bei
     Betrieben verschwendet, die ohnehin nie angeschrieben werden.

   Stufe 2 — Vollbewertung: Startseite plus zwei Unterseiten, Lighthouse,
     Design-Urteil. Nur für die Betriebe, die aus Stufe 1 oben stehen.      */
import { collect, collectSeite, ensureDir } from './browser.mjs';
import { checkMobile } from './checks/mobile.mjs';
import { checkTech } from './checks/tech.mjs';
import { checkContent } from './checks/content.mjs';
import { checkFreshness } from './checks/freshness.mjs';
import { checkSeo } from './checks/seo.mjs';
import { checkLegal } from './checks/legal.mjs';
import { checkImpression } from './checks/impression.mjs';
import { erkenneBranche, profilVon } from './branchen.mjs';
import { waehleUnterseiten } from './unterseiten.mjs';
import { fasseZusammen, checkVollstaendigkeit } from './aggregat.mjs';
import { total, lead, grade, leadGrade } from './score.mjs';

const RANG = { high: 0, medium: 1, low: 2 };

export async function stufe1(url, outDir, brancheHinweis = null, log = () => {}) {
  const start = await collect(url, ensureDir(outDir), { ohneVollbild: true });
  const branche = erkenneBranche(start.desktop.dom, start.rawHtml, brancheHinweis);
  log(`${profilVon(branche.key).label}`);

  const kategorien = {
    mobile:    checkMobile(start),
    content:   checkContent({ ...start, branche }),
    freshness: checkFreshness(start),
    seo:       checkSeo(start),
    legal:     checkLegal(start),
  };
  const seite = { url: start.finalUrl, label: 'Startseite', titel: start.desktop.dom.title,
                  text: start.desktop.dom.text, links: start.desktop.dom.links, kategorien, findings: [] };
  kategorien.completeness = checkVollstaendigkeit([seite], branche.key, profilVon(branche.key));

  const findings = Object.entries(kategorien)
    .flatMap(([k, c]) => (c.findings || []).map((f) => ({ ...f, category: f.category || k })))
    .sort((a, b) => RANG[a.severity] - RANG[b.severity]);

  const t = total(kategorien);
  return {
    url, finalUrl: start.finalUrl, scannedAt: new Date().toISOString(), stufe: 1,
    total: t, grade: grade(t), leadScore: lead(t), leadGrade: leadGrade(lead(t)),
    branche, categories: kategorien, findings,
    seiten: [{ url: start.finalUrl, label: 'Startseite', titel: start.desktop.dom.title,
               scores: Object.fromEntries(Object.entries(kategorien).map(([k, c]) => [k, c.score])),
               screenshots: { desktop: start.desktop.shot, mobile: start.mobile.shot } }],
    screenshots: { desktop: start.desktop.shot, mobile: start.mobile.shot },
    meta: { title: start.desktop.dom.title, generator: start.desktop.dom.generator, status: start.desktop.status, seitenGeprueft: 1 },
  };
}

export async function stufe2(url, outDir, brancheHinweis = null, log = () => {}) {
  const dir = ensureDir(outDir);
  const start = await collect(url, dir);
  const branche = erkenneBranche(start.desktop.dom, start.rawHtml, brancheHinweis);
  log(`${profilVon(branche.key).label}`);

  const auswahl = waehleUnterseiten(start.desktop.dom, start.finalUrl, branche.key);
  const weitere = [];
  for (const [i, s] of auswahl.entries()) {
    try { weitere.push({ ...(await collectSeite(s.url, dir, `unter${i + 1}`)), label: s.grund }); }
    catch { /* eine nicht erreichbare Unterseite darf den Scan nicht stoppen */ }
  }
  const alle = [{ ...start, label: 'Startseite' }, ...weitere];

  const proSeite = alle.map((s) => ({
    url: s.finalUrl, label: s.label, titel: s.desktop.dom.title,
    text: s.desktop.dom.text, links: s.desktop.dom.links,
    kategorien: { mobile: checkMobile(s), content: checkContent({ ...s, branche }) },
    findings: [],
  }));
  proSeite[0].kategorien.freshness = checkFreshness(start);
  proSeite[0].kategorien.seo       = checkSeo(start);
  proSeite[0].kategorien.legal     = checkLegal(start);
  log('Lighthouse');
  proSeite[0].kategorien.tech      = await checkTech(start);

  log('Design');
  const imp = await checkImpression(alle.map((s) => ({
    label: s.label, url: s.finalUrl, desktopShot: s.desktop.shot, mobileShot: s.mobile.shot })));
  proSeite.forEach((p, i) => { p.kategorien.impression = imp.proSeite[i] || imp.gesamt; });
  if (imp.gesamt.skipped) proSeite[0].kategorien.impression = imp.gesamt;

  proSeite.forEach((p) => {
    p.findings = Object.entries(p.kategorien)
      .flatMap(([k, c]) => (c.findings || []).map((f) => ({ ...f, category: f.category || k })));
  });

  const { kategorien, befunde } = fasseZusammen(proSeite);
  kategorien.completeness = checkVollstaendigkeit(proSeite, branche.key, profilVon(branche.key));
  const findings = [...befunde, ...kategorien.completeness.findings.map((f) => ({ ...f, seiten: ['Auftritt gesamt'] }))]
    .sort((a, b) => RANG[a.severity] - RANG[b.severity]);

  const t = total(kategorien);
  return {
    url, finalUrl: start.finalUrl, scannedAt: new Date().toISOString(), stufe: 2,
    total: t, grade: grade(t), leadScore: lead(t), leadGrade: leadGrade(lead(t)),
    branche, categories: kategorien, findings,
    seiten: proSeite.map((p, i) => ({ url: p.url, label: p.label, titel: p.titel,
      scores: Object.fromEntries(Object.entries(p.kategorien).map(([k, c]) => [k, c.score])),
      screenshots: { desktop: alle[i].desktop.shot, mobile: alle[i].mobile.shot } })),
    screenshots: { desktop: start.desktop.shot, mobile: start.mobile.shot,
                   desktopFull: start.desktop.shotFull, mobileFull: start.mobile.shotFull },
    meta: { title: start.desktop.dom.title, generator: start.desktop.dom.generator,
            status: start.desktop.status, seitenGeprueft: alle.length },
  };
}

/* Mehrere Betriebe gleichzeitig abarbeiten. Ein Browser pro Aufgabe, deshalb
   nicht zu viele auf einmal — der Rechner ist sonst der Flaschenhals. */
export async function parallel(aufgaben, gleichzeitig, arbeit) {
  const ergebnisse = new Array(aufgaben.length);
  let naechste = 0;
  const arbeiter = Array.from({ length: Math.min(gleichzeitig, aufgaben.length) }, async () => {
    while (true) {
      const i = naechste++;
      if (i >= aufgaben.length) return;
      ergebnisse[i] = await arbeit(aufgaben[i], i);
    }
  });
  await Promise.all(arbeiter);
  return ergebnisse;
}
