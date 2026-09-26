#!/usr/bin/env node
/* Website-Bewerter.
   node scan.mjs <url> [<url> …]   — bewertet jede Seite, schreibt results/<host>/scan.json + Screenshots
   node scan.mjs --list urls.txt   — eine URL pro Zeile */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { collect, ensureDir } from './lib/browser.mjs';
import { checkMobile } from './lib/checks/mobile.mjs';
import { checkTech } from './lib/checks/tech.mjs';
import { checkContent } from './lib/checks/content.mjs';
import { checkFreshness } from './lib/checks/freshness.mjs';
import { checkSeo } from './lib/checks/seo.mjs';
import { checkLegal } from './lib/checks/legal.mjs';
import { checkImpression } from './lib/checks/impression.mjs';
import { total, lead, allFindings, grade, leadGrade } from './lib/score.mjs';
import { printReport } from './lib/report.mjs';

const args = process.argv.slice(2);
let urls = args.filter((a) => !a.startsWith('--'));
const listIdx = args.indexOf('--list');
if (listIdx > -1) urls = fs.readFileSync(args[listIdx + 1], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
if (!urls.length) { console.error('Aufruf: node scan.mjs <url> …  oder  node scan.mjs --list urls.txt'); process.exit(1); }

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('\n⚠  Kein ANTHROPIC_API_KEY — die Kategorie „Eindruck & Design" (24 % Gewicht) wird übersprungen.');
  console.log('   Key in die Datei .env eintragen, dann ist sie dabei.\n');
}

const summary = [];
for (const raw of urls) {
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  const host = new URL(url).hostname.replace(/^www\./, '');
  const outDir = ensureDir(path.join('results', host));
  process.stdout.write(`\n▶ ${url}\n  lade Desktop + Mobil … `);
  let result;
  try {
    const data = await collect(url, outDir);
    process.stdout.write(`ok (${data.desktop.status}, ${(data.desktop.loadMs / 1000).toFixed(1)} s)\n  prüfe … `);
    const categories = {
      mobile:    checkMobile(data),
      content:   checkContent(data),
      freshness: checkFreshness(data),
      seo:       checkSeo(data),
      legal:     checkLegal(data),
    };
    process.stdout.write('Lighthouse … ');
    categories.tech = await checkTech(data);
    process.stdout.write('Eindruck … ');
    categories.impression = await checkImpression(data);
    process.stdout.write('fertig\n');

    const t = total(categories);
    result = {
      url, finalUrl: data.finalUrl, scannedAt: new Date().toISOString(),
      total: t, grade: grade(t), leadScore: lead(t), leadGrade: leadGrade(lead(t)),
      categories, findings: allFindings(categories),
      screenshots: { desktop: data.desktop.shot, mobile: data.mobile.shot, desktopFull: data.desktop.shotFull, mobileFull: data.mobile.shotFull },
      meta: { title: data.desktop.dom.title, generator: data.desktop.dom.generator, status: data.desktop.status },
    };
  } catch (e) {
    console.log(`FEHLER: ${e.message}`);
    result = { url, scannedAt: new Date().toISOString(), error: String(e.message), total: null, grade: '–', leadScore: null, categories: {}, findings: [] };
  }
  fs.writeFileSync(path.join(outDir, 'scan.json'), JSON.stringify(result, null, 2));
  if (!result.error) printReport(result);
  summary.push({ host, total: result.total, grade: result.grade, leadScore: result.leadScore ?? null,
                 findings: result.findings.length, high: result.findings.filter((f) => f.severity === 'high').length });
}

if (urls.length > 1) {
  console.log('\nÜBERSICHT — sortiert nach Lead-Wert (lohnendste zuerst)');
  console.log('─'.repeat(72));
  console.log('Lead  Qual  Note          Befunde        Seite');
  for (const s of summary.sort((a, b) => (b.leadScore ?? -1) - (a.leadScore ?? -1)))
    console.log(`${String(s.leadScore ?? '–').padStart(4)}  ${String(s.total ?? '–').padStart(4)}  ${s.grade.padEnd(12)} ${String(s.high).padStart(2)} schwer/${String(s.findings).padStart(2)}    ${s.host}`);
}
