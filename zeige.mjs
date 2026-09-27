#!/usr/bin/env node
/* Vollständige Bewertung eines Betriebs — alles, was zur Beurteilung nötig ist.
     node zeige.mjs acanto              sucht nach Name oder Website
     node zeige.mjs acanto --befunde    nur die Befundliste
     node zeige.mjs --alle              Kategorie-Tabelle über alle Betriebe   */
import 'dotenv/config';
import { db, dbAktiv } from './lib/db.mjs';
import { WEIGHTS, grade, leadGrade } from './lib/score.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const args = process.argv.slice(2);
const suchbegriff = args.find((a) => !a.startsWith('--'));
const c = db();

const bar = (s) => s === null || s === undefined ? '  übersprungen' : '█'.repeat(Math.round(s / 10)).padEnd(10, '░') + ' ' + String(s).padStart(3);

if (args.includes('--alle') || !suchbegriff) {
  const { data } = await c.from('unternehmen').select('name,quality_score,lead_score,scan_details,befunde').order('quality_score', { ascending: false });
  const sp = Object.keys(WEIGHTS);
  console.log('\n' + 'Betrieb'.padEnd(34) + 'Qual  Lead ' + sp.map((k) => WEIGHTS[k].label.slice(0, 6).padStart(7)).join('') + '   Seiten');
  console.log('─'.repeat(34 + 11 + sp.length * 7 + 9));
  for (const u of data) {
    const k = u.scan_details?.kategorien || {};
    console.log(u.name.slice(0, 33).padEnd(34)
      + String(u.quality_score ?? '–').padStart(4) + String(u.lead_score ?? '–').padStart(6) + ' '
      + sp.map((s) => String(k[s]?.score ?? '–').padStart(7)).join('')
      + String(u.scan_details?.seiten?.length ?? u.scan_details?.meta?.seitenGeprueft ?? '?').padStart(8));
  }
  console.log('\nGewichte: ' + sp.map((k) => `${WEIGHTS[k].label} ${WEIGHTS[k].w}`).join(' · ') + '\n');
  process.exit(0);
}

const { data: treffer } = await c.from('unternehmen').select('*')
  .or(`name.ilike.%${suchbegriff}%,website.ilike.%${suchbegriff}%`).limit(5);
if (!treffer?.length) { console.error(`Nichts gefunden zu "${suchbegriff}"`); process.exit(1); }
if (treffer.length > 1) { console.log('Mehrere Treffer:'); treffer.forEach((t) => console.log('  ' + t.name + '  ' + t.website)); process.exit(0); }

const u = treffer[0];
const d = u.scan_details || {};
console.log(`\n${u.name}   ${u.website}`);
console.log('─'.repeat(74));
console.log(`QUALITÄT   ${bar(u.quality_score)} / 100   → ${grade(u.quality_score)}`);
console.log(`LEAD-WERT  ${bar(u.lead_score)} / 100   → ${leadGrade(u.lead_score)}`);
console.log(`Branche: ${d.branche?.key ?? u.branche ?? '?'}${d.branche?.quelle ? ` (${d.branche.quelle})` : ''}   Status: ${u.status}`);
if (u.google_rating) console.log(`Google: ${u.google_rating}★ aus ${u.google_reviews} Bewertungen`);
console.log('─'.repeat(74));

if (!args.includes('--befunde')) {
  for (const [k, { w, label }] of Object.entries(WEIGHTS)) {
    const cat = d.kategorien?.[k];
    console.log(`${label.padEnd(19)}${bar(cat?.score)}   (Gewicht ${w})${cat?.uebersprungen ? '  ← ' + cat.uebersprungen : ''}`);
  }
  if (d.seiten?.length > 1) {
    console.log('\nGeprüfte Seiten:');
    for (const s of d.seiten)
      console.log(`  ${(s.label || '?').padEnd(20)} Design ${String(s.scores?.impression ?? '–').padStart(3)} · Mobil ${String(s.scores?.mobile ?? '–').padStart(3)} · Inhalt ${String(s.scores?.content ?? '–').padStart(3)}   ${s.url}`);
  }
  const imp = d.kategorien?.impression?.data;
  if (imp?.zeitgemaess) {
    console.log(`\nDesign-Urteil (Startseite): zeitgemäß ${imp.zeitgemaess} · Bilder ${imp.bildqualitaet} · Ordnung ${imp.hierarchie} · verständlich ${imp.verstaendlich} · wertig ${imp.wertigkeit} · mobil ${imp.mobil_nutzbar}   (je 1–5)`);
    if (imp.staerken?.length) console.log('  Stärken: ' + imp.staerken.join(' · '));
  }
}

const sev = { high: '!!', medium: ' !', low: '  ' };
console.log(`\nBefunde (${(u.befunde || []).length}) — schwerste zuerst:`);
for (const f of u.befunde || []) {
  const wo = f.seiten?.length && f.seiten[0] !== 'Startseite' ? `  [${f.seiten.join(', ')}]` : '';
  console.log(`  ${sev[f.severity]} ${f.text}${wo}`);
  if (f.evidence) console.log(`       ↳ ${String(f.evidence).slice(0, 100)}`);
}
if (d.screenshots?.desktop) console.log(`\nScreenshots: ${d.screenshots.desktop.replace(/\/[^/]+$/, '/')}`);
if (u.feedback?.length) { console.log('\nDein Feedback:'); u.feedback.forEach((f) => console.log(`  Runde ${f.runde} (${new Date(f.datum).toLocaleDateString('de-DE')}): ${f.text}`)); }
console.log('');
