import { WEIGHTS, total, lead, allFindings, grade, leadGrade } from './score.mjs';

const bar = (s) => s === null ? '  übersprungen ' : '█'.repeat(Math.round(s / 10)).padEnd(10, '░') + ' ' + String(s).padStart(3);
const sev = { high: '!!', medium: ' !', low: '  ' };

export function printReport(result) {
  const { url, categories } = result;
  const t = total(categories);
  const l = result.leadScore ?? lead(t);
  console.log(`\n${url}`);
  console.log('─'.repeat(64));
  // Fällt eine schwer gewichtete Kategorie aus, ist der Gesamtscore wertlos.
  // Das darf nicht klein in einer Zeile stehen, während oben "gut" prangt.
  const fehlend = ['impression', 'mobile', 'content']
    .filter((k) => categories[k] && (categories[k].score === null || categories[k].score === undefined))
    .map((k) => ({ k, label: WEIGHTS[k].label, w: WEIGHTS[k].w, grund: categories[k].skipped }));
  if (fehlend.length) {
    const fehlgewicht = fehlend.reduce((a, f) => a + f.w, 0);
    console.log('\n  ⚠  SCAN UNVOLLSTÄNDIG — der Gesamtwert ist nicht belastbar.');
    for (const f of fehlend) console.log(`     ${f.label} (${f.w} % Gewicht) fehlt: ${String(f.grund || '').slice(0, 90)}`);
    console.log(`     Zusammen ${fehlgewicht} % der Bewertung fehlen; die übrigen Kategorien wirken dadurch zu gut.`);
  }
  console.log(`QUALITÄT   ${bar(t)} / 100   → ${grade(t)}${fehlend.length ? '   (unvollständig)' : ''}`);
  console.log(`LEAD-WERT  ${bar(l)} / 100   → ${leadGrade(l)}   (je höher, desto lohnender als Kunde)`);
  console.log('─'.repeat(64));
  for (const [k, { w, label }] of Object.entries(WEIGHTS)) {
    console.log(`${label.padEnd(18)} ${bar(categories[k]?.score ?? null)}   (Gewicht ${w})`);
  }
  if (result.seiten?.length > 1) {
    console.log('\nGeprüfte Seiten:');
    for (const s of result.seiten)
      console.log(`  ${s.label.padEnd(20)} Design ${String(s.scores.impression ?? '–').padStart(3)} · Mobil ${String(s.scores.mobile ?? '–').padStart(3)} · Inhalt ${String(s.scores.content ?? '–').padStart(3)}   ${s.url}`);
  }
  const fs = result.findings ?? allFindings(categories);
  console.log(`\nBefunde (${fs.length}) — schwerste zuerst:`);
  for (const f of fs) {
    const wo = f.seiten && f.seiten.length && f.seiten[0] !== 'Startseite' ? `  [${f.seiten.join(', ')}]` : '';
    console.log(`  ${sev[f.severity]} ${f.text}${wo}`);
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
