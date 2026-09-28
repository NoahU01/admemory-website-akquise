#!/usr/bin/env node
/* Überblick nach einem Scan-Lauf: Wo lohnt sich die Arbeit?
     node auswertung.mjs            Verteilung und die aussichtsreichsten Betriebe
     node auswertung.mjs --top=25   mehr Zeilen                                  */
import 'dotenv/config';
import { db, dbAktiv } from './lib/db.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const top = Number((process.argv.find((a) => a.startsWith('--top=')) || '--top=15').split('=')[1]);

// Supabase liefert höchstens 1000 Zeilen je Abfrage — ohne Blättern zeigte die
// Auswertung 1000 von 1301 Betrieben und behauptete, das seien alle.
const data = [];
for (let von = 0; ; von += 1000) {
  const { data: teil, error } = await db().from('arbeitsliste')
    .select('name,stadt,branche,qualitaet,lead,groesse_stufe,groesse_score,preis_von,preis_bis,website,schwere_befunde,google_reviews')
    .range(von, von + 999);
  if (error) { console.error(error.message); process.exit(1); }
  data.push(...teil);
  if (teil.length < 1000) break;
}

const mitScan = data.filter((r) => r.qualitaet !== null);
console.log(`\n${data.length} Betriebe, davon ${mitScan.length} bewertet\n`);

const zaehle = (feld, sortiert = null) => {
  const m = new Map();
  for (const r of mitScan) m.set(r[feld] ?? '–', (m.get(r[feld] ?? '–') ?? 0) + 1);
  const zeilen = sortiert ? sortiert.map((k) => [k, m.get(k) ?? 0]) : [...m].sort((a, b) => b[1] - a[1]);
  for (const [k, n] of zeilen) {
    const anteil = Math.round((n / mitScan.length) * 100);
    console.log('  ' + String(k).padEnd(16) + String(n).padStart(4) + '  ' + '█'.repeat(Math.round(n / mitScan.length * 40)) + ` ${anteil} %`);
  }
};

console.log('BRANCHEN');       zaehle('branche');
console.log('\nBETRIEBSGRÖSSE'); zaehle('groesse_stufe', ['mittelstand', 'etabliert', 'klein', 'kleinst', '–']);

const summe = mitScan.reduce((s, r) => s + (r.preis_bis ?? 0), 0);
console.log(`\nPotenzial über alle bewerteten Betriebe: ${(summe / 1000).toFixed(0)} Tsd. € (obere Preisgrenze)\n`);

console.log(`DIE ${top} AUSSICHTSREICHSTEN`);
console.log('Lead  Qual  Größe        Preisrahmen      Schwer  Betrieb');
for (const r of mitScan.sort((a, b) => (b.lead ?? -1) - (a.lead ?? -1)).slice(0, top)) {
  console.log(
    String(r.lead ?? '–').padStart(4),
    String(r.qualitaet ?? '–').padStart(5),
    ' ' + String(r.groesse_stufe ?? '–').padEnd(12),
    (r.preis_von ? `${r.preis_von}–${r.preis_bis} €` : '–').padStart(14),
    String(r.schwere_befunde ?? 0).padStart(6),
    ' ' + (r.name ?? '').slice(0, 34));
}
console.log();
process.exit(0);
