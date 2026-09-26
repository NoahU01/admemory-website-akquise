#!/usr/bin/env node
/* Arbeitsliste im Terminal — zum Durchgehen ohne Browser.
     node liste.mjs                      alle, nach Dringlichkeit sortiert
     node liste.mjs entwurf_gebaut       nur einen Status
     node liste.mjs --feedback <id> "…"  Korrektur notieren, Status setzen
     node liste.mjs --status <id> freigegeben                                */
import 'dotenv/config';
import { arbeitsliste, feedbackHinzufuegen, setStatus, dbAktiv } from './lib/db.mjs';

if (!dbAktiv()) { console.error('SUPABASE_URL und SUPABASE_SERVICE_KEY fehlen in .env'); process.exit(1); }
const a = process.argv.slice(2);

if (a[0] === '--feedback') {
  const runde = await feedbackHinzufuegen(a[1], a.slice(2).join(' '));
  console.log(`Feedback-Runde ${runde} gespeichert, Status auf 'feedback_gegeben'.`);
} else if (a[0] === '--status') {
  await setStatus(a[1], a[2]);
  console.log(`Status auf '${a[2]}' gesetzt.`);
} else {
  const rows = await arbeitsliste({ status: a[0] || null });
  if (!rows.length) { console.log('Nichts gefunden.'); process.exit(0); }
  console.log(`\n${'Status'.padEnd(17)}${'Lead'.padStart(5)}${'Qual'.padStart(5)}  ${'Befunde'.padStart(8)}  ${'Branche'.padEnd(15)}Name`);
  console.log('─'.repeat(92));
  for (const r of rows) {
    console.log(`${r.status.padEnd(17)}${String(r.lead ?? '–').padStart(5)}${String(r.qualitaet ?? '–').padStart(5)}  ` +
      `${String(r.schwere_befunde ?? 0).padStart(2)}!/${String(r.befunde ?? 0).padStart(2)}  ` +
      `${(r.branche || '–').padEnd(15)}${r.name}`);
    if (r.entwurf_url) console.log(`${' '.repeat(17)}Entwurf: ${r.entwurf_url}`);
    if (r.letztes_feedback) console.log(`${' '.repeat(17)}Letztes Feedback: ${r.letztes_feedback.slice(0, 70)}`);
    console.log(`${' '.repeat(17)}\x1b[2m${r.id}\x1b[0m  ${r.website || ''}`);
  }
  console.log('');
}
