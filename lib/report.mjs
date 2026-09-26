import { WEIGHTS, total, lead, allFindings, grade, leadGrade } from './score.mjs';

const bar = (s) => s === null ? '  übersprungen ' : '█'.repeat(Math.round(s / 10)).padEnd(10, '░') + ' ' + String(s).padStart(3);
const sev = { high: '!!', medium: ' !', low: '  ' };

export function printReport(result) {
  const { url, categories } = result;
  const t = total(categories);
  const l = result.leadScore ?? lead(t);
  console.log(`\n${url}`);
  console.log('─'.repeat(64));
  console.log(`QUALITÄT   ${bar(t)} / 100   → ${grade(t)}`);
  console.log(`LEAD-WERT  ${bar(l)} / 100   → ${leadGrade(l)}   (je höher, desto lohnender als Kunde)`);
  console.log('─'.repeat(64));
  for (const [k, { w, label }] of Object.entries(WEIGHTS)) {
    console.log(`${label.padEnd(18)} ${bar(categories[k]?.score ?? null)}   (Gewicht ${w})`);
  }
  const fs = allFindings(categories);
  console.log(`\nBefunde (${fs.length}) — schwerste zuerst:`);
  for (const f of fs) {
    console.log(`  ${sev[f.severity]} ${f.text}`);
    if (f.evidence) console.log(`       ↳ ${String(f.evidence).slice(0, 110)}`);
  }
  if (categories.impression?.data) {
    const d = categories.impression.data;
    console.log(`\nEindruck (Claude): zeitgemäß ${d.zeitgemaess} · Bilder ${d.bildqualitaet} · Ordnung ${d.hierarchie} · verständlich ${d.verstaendlich} · wertig ${d.wertigkeit} · mobil ${d.mobil_nutzbar}  (je 1–5)`);
    if (d.staerken?.length) console.log(`  Stärken: ${d.staerken.join(' · ')}`);
  } else if (categories.impression?.skipped) {
    console.log(`\nEindruck übersprungen: ${categories.impression.skipped}`);
  }
  console.log('');
}
