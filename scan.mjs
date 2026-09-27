#!/usr/bin/env node
/* Website-Bewerter — Startseite plus bis zu zwei Unterseiten.
     node scan.mjs <url> …              bewertet jede Seite
     node scan.mjs --list urls.txt      eine URL pro Zeile
     node scan.mjs --branche=handwerk   Branche vorgeben statt erkennen
     node scan.mjs --nur-start          ohne Unterseiten (schneller)          */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { collect, collectSeite, ensureDir } from './lib/browser.mjs';
import { checkMobile } from './lib/checks/mobile.mjs';
import { checkTech } from './lib/checks/tech.mjs';
import { checkContent } from './lib/checks/content.mjs';
import { checkFreshness } from './lib/checks/freshness.mjs';
import { checkSeo } from './lib/checks/seo.mjs';
import { checkLegal } from './lib/checks/legal.mjs';
import { checkImpression } from './lib/checks/impression.mjs';
import { erkenneBranche, profilVon } from './lib/branchen.mjs';
import { waehleUnterseiten } from './lib/unterseiten.mjs';
import { fasseZusammen, checkVollstaendigkeit } from './lib/aggregat.mjs';
import { total, lead, grade, leadGrade } from './lib/score.mjs';
import { printReport } from './lib/report.mjs';
import { speichereScan, dbAktiv } from './lib/db.mjs';

const args = process.argv.slice(2);
let urls = args.filter((a) => !a.startsWith('--'));
const brancheArg = args.find((a) => a.startsWith('--branche='));
const brancheHinweis = brancheArg ? brancheArg.split('=')[1] : null;
const nurStart = args.includes('--nur-start');
const listIdx = args.indexOf('--list');
if (listIdx > -1) urls = fs.readFileSync(args[listIdx + 1], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
if (!urls.length) { console.error('Aufruf: node scan.mjs <url> …  oder  node scan.mjs --list urls.txt'); process.exit(1); }

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('\n⚠  Kein ANTHROPIC_API_KEY — die Kategorie „Eindruck & Design" (24 % Gewicht) wird übersprungen.\n');
}

const summary = [];
for (const raw of urls) {
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  const host = new URL(url).hostname.replace(/^www\./, '');
  const outDir = ensureDir(path.join('results', host));
  process.stdout.write(`\n▶ ${url}\n  Startseite … `);
  let result;
  try {
    const start = await collect(url, outDir);
    const branche = erkenneBranche(start.desktop.dom, start.rawHtml, brancheHinweis);
    const profil = profilVon(branche.key);
    process.stdout.write(`ok (${start.desktop.status}) · ${profil.label}\n`);

    // ── Unterseiten wählen und holen ────────────────────────────────
    const auswahl = nurStart ? [] : waehleUnterseiten(start.desktop.dom, start.finalUrl, branche.key);
    const weitere = [];
    for (const [i, s] of auswahl.entries()) {
      process.stdout.write(`  Unterseite (${s.grund}) … `);
      try {
        const d = await collectSeite(s.url, outDir, `unter${i + 1}`);
        weitere.push({ ...d, grund: s.grund, label: s.grund });
        process.stdout.write('ok\n');
      } catch (e) { process.stdout.write(`übersprungen (${e.message.slice(0, 40)})\n`); }
    }
    if (!auswahl.length && !nurStart) console.log('  (keine Unterseiten gefunden — vermutlich eine Single-Page)');

    // ── Regelchecks: Mobil und Inhalt je Seite, Rest nur Startseite ──
    process.stdout.write('  prüfe … ');
    const alle = [{ ...start, label: 'Startseite' }, ...weitere];
    const proSeite = alle.map((s, i) => ({
      url: s.finalUrl, label: s.label, titel: s.desktop.dom.title,
      text: s.desktop.dom.text, links: s.desktop.dom.links,
      kategorien: {
        mobile:  checkMobile(s),
        content: checkContent({ ...s, branche }),
        ...(i === 0 ? {} : {}),
      },
      findings: [],
    }));
    // Startseite trägt die globalen Kategorien
    proSeite[0].kategorien.freshness = checkFreshness(start);
    proSeite[0].kategorien.seo       = checkSeo({ ...start, isDraft: start.isDraft });
    proSeite[0].kategorien.legal     = checkLegal(start);
    process.stdout.write('Lighthouse … ');
    proSeite[0].kategorien.tech      = await checkTech(start);

    // ── Design über alle Seiten, ein Aufruf ─────────────────────────
    process.stdout.write('Eindruck … ');
    const imp = await checkImpression(alle.map((s) => ({
      label: s.label, url: s.finalUrl, desktopShot: s.desktop.shot, mobileShot: s.mobile.shot,
    })));
    proSeite.forEach((p, i) => { p.kategorien.impression = imp.proSeite[i] || imp.gesamt; });
    if (imp.gesamt.skipped) proSeite[0].kategorien.impression = imp.gesamt;

    // Befunde je Seite einsammeln
    proSeite.forEach((p) => {
      p.findings = Object.entries(p.kategorien).flatMap(([k, c]) => (c.findings || []).map((f) => ({ ...f, category: f.category || k })));
    });

    // ── Zusammenfassen ──────────────────────────────────────────────
    const { kategorien, befunde } = fasseZusammen(proSeite);
    kategorien.completeness = checkVollstaendigkeit(proSeite, branche.key, profil);
    const alleBefunde = [...befunde, ...kategorien.completeness.findings.map((f) => ({ ...f, seiten: ['Auftritt gesamt'] }))]
      .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
    process.stdout.write('fertig\n');

    const t = total(kategorien);
    result = {
      url, finalUrl: start.finalUrl, scannedAt: new Date().toISOString(),
      total: t, grade: grade(t), leadScore: lead(t), leadGrade: leadGrade(lead(t)),
      branche, categories: kategorien, findings: alleBefunde,
      seiten: proSeite.map((p, i) => ({ url: p.url, label: p.label, titel: p.titel,
        scores: Object.fromEntries(Object.entries(p.kategorien).map(([k, c]) => [k, c.score])),
        screenshots: { desktop: alle[i].desktop.shot, mobile: alle[i].mobile.shot } })),
      screenshots: { desktop: start.desktop.shot, mobile: start.mobile.shot, desktopFull: start.desktop.shotFull, mobileFull: start.mobile.shotFull },
      meta: { title: start.desktop.dom.title, generator: start.desktop.dom.generator, status: start.desktop.status, seitenGeprueft: alle.length },
    };
  } catch (e) {
    console.log(`FEHLER: ${e.message}`);
    result = { url, scannedAt: new Date().toISOString(), error: String(e.message), total: null, grade: '–', leadScore: null, categories: {}, findings: [] };
  }
  fs.writeFileSync(path.join(outDir, 'scan.json'), JSON.stringify(result, null, 2));
  if (!result.error) printReport(result);

  if (!result.error && dbAktiv()) {
    try {
      const u = await speichereScan(result);
      console.log(`  → in Supabase gespeichert: ${u.name} (Status ${u.status})\n`);
    } catch (e) { console.log(`  → Supabase: ${e.message}\n`); }
  }
  summary.push({ host, total: result.total, grade: result.grade, leadScore: result.leadScore ?? null,
                 seiten: result.meta?.seitenGeprueft ?? 0,
                 findings: result.findings.length, high: result.findings.filter((f) => f.severity === 'high').length });
}

if (urls.length > 1) {
  console.log('\nÜBERSICHT — sortiert nach Lead-Wert (lohnendste zuerst)');
  console.log('─'.repeat(78));
  console.log('Lead  Qual  Note          Seiten  Befunde        Seite');
  for (const s of summary.sort((a, b) => (b.leadScore ?? -1) - (a.leadScore ?? -1)))
    console.log(`${String(s.leadScore ?? '–').padStart(4)}  ${String(s.total ?? '–').padStart(4)}  ${s.grade.padEnd(12)} ${String(s.seiten).padStart(4)}    ${String(s.high).padStart(2)} schwer/${String(s.findings).padStart(2)}    ${s.host}`);
}
