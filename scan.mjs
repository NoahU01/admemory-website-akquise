#!/usr/bin/env node
/* Website-Bewerter mit zweistufigem Verfahren.

   Stufe 1 — Vorauswahl, kostenlos, ~10 s je Betrieb:
     node scan.mjs --stufe1 --list urls.txt
     node scan.mjs --stufe1 --aus-db            alle mit Status 'neu'
     node scan.mjs --stufe1 --alle              auch schon gescannte (nach Änderungen am Bewerter)

   Stufe 2 — Vollbewertung mit Design-Urteil und Lighthouse, ~50 s, ~11 ct:
     node scan.mjs <url>                        einzelne Seite
     node scan.mjs --stufe2 --top=10            die zehn besten aus Stufe 1

   Weitere Schalter:  --gleichzeitig=4  --branche=handwerk                  */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { stufe1, stufe2, parallel } from './lib/stufen.mjs';
import { printReport } from './lib/report.mjs';
import { speichereScan, dbAktiv, db } from './lib/db.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const istStufe1 = args.includes('--stufe1');
const gleichzeitig = Number(flag('gleichzeitig', istStufe1 ? 4 : 2));
const brancheHinweis = flag('branche', null);

// ── Was soll gescannt werden? ────────────────────────────────────────
let urls = args.filter((a) => !a.startsWith('--'));
const externeSignale = new Map();
const normHost = (u) => { try { return new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; } };
const listIdx = args.indexOf('--list');
if (listIdx > -1) urls = fs.readFileSync(args[listIdx + 1], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));

if (args.includes('--aus-db') || args.includes('--alle') || args.includes('--top') || flag('top', null)) {
  if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
  const top = Number(flag('top', 0));
  /* --alle nimmt auch schon gescannte Betriebe. Gebraucht, wenn sich der
     Bewerter geändert hat: Stufe 1 ist gratis, ein Neulauf kostet nur Zeit.
     Betriebe mit Entwurf oder gesendeter Mail bleiben außen vor — dort hängt
     Arbeit dran, die ein Neuscan nicht anfassen soll. */
  const alle = args.includes('--alle');
  const status = alle ? ['neu', 'gescannt'] : ['neu'];

  /* Supabase liefert höchstens 1000 Zeilen je Abfrage. Ohne Blättern fällt bei
     größeren Beständen der Rest stillschweigend weg — bei 1036 offenen Betrieben
     wären 36 nie gescannt worden, ohne jede Fehlermeldung. */
  let data = [], error = null;
  if (top) {
    ({ data, error } = await db().from('unternehmen')
      .select('website,lead_score,status,google_rating,google_reviews,standorte')
      .eq('status', 'gescannt').order('lead_score', { ascending: false }).limit(top));
  } else {
    const SEITE = 1000;
    for (let von = 0; ; von += SEITE) {
      const { data: teil, error: e } = await db().from('unternehmen')
        .select('website,lead_score,status,google_rating,google_reviews,standorte')
        .in('status', status).order('id', { ascending: true }).range(von, von + SEITE - 1);
      if (e) { error = e; break; }
      data.push(...teil);
      if (teil.length < SEITE) break;
    }
  }
  if (error) { console.error(error.message); process.exit(1); }
  urls = data.map((u) => u.website).filter(Boolean);
  // Sterne und Bewertungszahl gehen in den Lead-Wert ein — bisher lagen sie
  // ungenutzt in der Tabelle, weil der Bewerter sie nie zu sehen bekam.
  for (const u of data) if (u.website) externeSignale.set(normHost(u.website), { rating: u.google_rating, reviews: u.google_reviews, standorte: u.standorte });
  console.log(`${urls.length} Betriebe aus der Datenbank geladen${top ? ` (beste ${top} nach Lead-Wert)` : alle ? " (neu + bereits gescannt)" : " (Status 'neu')"}`);
}
if (!urls.length) { console.error('Nichts zu tun. --list <datei>, --aus-db oder --top=N angeben.'); process.exit(1); }

if (!istStufe1 && !process.env.ANTHROPIC_API_KEY)
  console.log('\n⚠  Kein ANTHROPIC_API_KEY — das Design-Urteil (22 % Gewicht) wird übersprungen.\n');

console.log(`\n${istStufe1 ? 'STUFE 1 — Vorauswahl' : 'STUFE 2 — Vollbewertung'}: ${urls.length} Betrieb${urls.length > 1 ? 'e' : ''}, ${gleichzeitig} gleichzeitig\n`);
const beginn = Date.now();

const ergebnisse = await parallel(urls, gleichzeitig, async (raw, i) => {
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  const host = new URL(url).hostname.replace(/^www\./, '');
  const outDir = path.join('results', host);
  const nr = `[${String(i + 1).padStart(String(urls.length).length)}/${urls.length}]`;
  let result;
  try {
    const schritte = [];
    result = await (istStufe1 ? stufe1 : stufe2)(url, outDir, brancheHinweis, (s) => schritte.push(s), externeSignale.get(host) || {});
    console.log(`${nr} ${host.padEnd(34)} Qual ${String(result.total).padStart(3)} · Lead ${String(result.leadScore).padStart(3)} · ${result.findings.length} Befunde   ${schritte.join(' · ')}`);
  } catch (e) {
    console.log(`${nr} ${host.padEnd(34)} FEHLER: ${e.message.slice(0, 60)}`);
    result = { url, scannedAt: new Date().toISOString(), error: String(e.message), total: null, grade: '–', leadScore: null, categories: {}, findings: [], stufe: istStufe1 ? 1 : 2 };
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `scan${result.stufe === 1 ? '-stufe1' : ''}.json`), JSON.stringify(result, null, 2));

  if (!result.error && dbAktiv()) {
    try { await speichereScan(result); }
    catch (e) { console.log(`${' '.repeat(nr.length)} ${host.padEnd(34)} Supabase: ${e.message.slice(0, 60)}`); }
  }
  return result;
});

// ── Übersicht ────────────────────────────────────────────────────────
const ok = ergebnisse.filter((r) => !r.error);
const dauer = (Date.now() - beginn) / 1000;
console.log(`\n${'─'.repeat(78)}`);
console.log(`${ok.length} von ${urls.length} bewertet in ${dauer.toFixed(0)} s  (${(dauer / urls.length).toFixed(1)} s je Betrieb)`);

if (ok.length > 1) {
  console.log('\nLead  Qual  Note          Befunde     Betrieb');
  for (const r of [...ok].sort((a, b) => (b.leadScore ?? -1) - (a.leadScore ?? -1))) {
    const unvollstaendig = ['impression', 'mobile', 'content']
      .some((k) => r.categories?.[k] && (r.categories[k].score === null || r.categories[k].score === undefined));
    console.log(`${String(r.leadScore ?? '–').padStart(4)}  ${String(r.total ?? '–').padStart(4)}  ${r.grade.padEnd(12)} ${String(r.findings.filter((f) => f.severity === 'high').length).padStart(2)} schwer/${String(r.findings.length).padStart(2)}  ${new URL(r.finalUrl || r.url).hostname.replace(/^www\./, '')}${unvollstaendig && !istStufe1 ? '  ⚠ unvollständig' : ''}`);
  }
}
if (istStufe1) {
  console.log(`\nStufe 1 ist eine Vorauswahl ohne Design-Urteil und ohne Lighthouse.`);
  console.log(`Für die aussichtsreichsten Betriebe jetzt:  node scan.mjs --stufe2 --top=10\n`);
} else if (ok.length === 1) {
  printReport(ok[0]);
}

/* Node bleibt nach großen Läufen hängen — offene Handles aus dem Supabase-Client
   und gelegentlich ein Browser, dessen close() nicht durchkam. Alles ist zu
   diesem Zeitpunkt gespeichert und ausgegeben, also beenden wir selbst. Ohne das
   bleiben bei einem täglichen Lauf Chrome-Prozesse liegen. */
await new Promise((r) => setTimeout(r, 200));   // stdout leeren lassen
process.exit(0);
