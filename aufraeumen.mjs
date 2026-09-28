#!/usr/bin/env node
/* Dubletten zusammenführen und Portale entfernen.
     node aufraeumen.mjs              nur anzeigen, nichts ändern
     node aufraeumen.mjs --anwenden   tatsächlich zusammenführen und löschen

   Dubletten entstanden, weil auf die volle URL geschlüsselt wurde: Google
   listet Händlergruppen je Standort einzeln, und nach einer Weiterleitung
   landet dieselbe Firma unter einem anderen Pfad. Behalten wird die Zeile mit
   dem vollständigsten Scan; ihr Feedback, Entwurf und Versandstand bleiben.   */
import 'dotenv/config';
import { db, dbAktiv, normalisiereUrl } from './lib/db.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const anwenden = process.argv.includes('--anwenden');

const PORTAL = /elektrikerportal|kfzwerkstatt\.io|werkstaetten\.net|sloi\.me|mobile\.de|autoscout24\.|[\w-]+-haendler\.de|[\w-]+-erleben\.de|handwerkerportal|wlw\.de|kununu\.|jameda\.|doctolib\.|provenexpert|speisekartenweb|lieferando|pizza\.de|restaurant-guru|tripadvisor|yelp\.|gelbeseiten|dasoertliche|11880\.|golocal\.|metro\.bar|opentable\.|\.business\.site|vertretung\.allianz\.de|[\w-]+\.remax\.de/i;

const alle = [];
for (let von = 0; ; von += 1000) {
  const { data, error } = await db().from('unternehmen')
    .select('id,name,website,status,quality_score,lead_score,seiten_geprueft,letzter_scan,entwurf_url,mail_gesendet_am,feedback,google_reviews,standorte')
    .order('id').range(von, von + 999);
  if (error) { console.error(error.message); process.exit(1); }
  alle.push(...data);
  if (data.length < 1000) break;
}
console.log(`\n${alle.length} Zeilen geladen\n`);

// ── Portale ──────────────────────────────────────────────────────────
const portale = alle.filter((r) => PORTAL.test(r.website));
console.log(`PORTALE UND FREMDAUFTRITTE: ${portale.length}`);
for (const r of portale.slice(0, 10)) console.log('  ' + r.website.replace(/^https?:\/\//, '').slice(0, 60));
if (portale.length > 10) console.log(`  … und ${portale.length - 10} weitere`);

// ── Dubletten je Host ────────────────────────────────────────────────
const behalten = new Set(portale.map((r) => r.id));   // Portale nicht als Sieger wählen
const nachHost = new Map();
for (const r of alle) {
  if (behalten.has(r.id)) continue;
  const h = normalisiereUrl(r.website);
  if (!nachHost.has(h)) nachHost.set(h, []);
  nachHost.get(h).push(r);
}

/* Wer gewinnt: Arbeit, die dranhängt, schlägt alles. Danach der vollständigere
   Scan, dann der neuere. */
const rang = (r) => [
  r.mail_gesendet_am ? 1 : 0,
  r.entwurf_url ? 1 : 0,
  (r.feedback?.length ?? 0) > 0 ? 1 : 0,
  r.quality_score !== null ? 1 : 0,
  r.seiten_geprueft ?? 0,
  Date.parse(r.letzter_scan ?? 0) || 0,
];
const besser = (a, b) => { const x = rang(a), y = rang(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] > y[i]; return a.id < b.id; };

const zuLoeschen = [], zuAendern = [];
for (const [host, zeilen] of nachHost) {
  if (zeilen.length === 1) { if (zeilen[0].website !== host) zuAendern.push({ id: zeilen[0].id, website: host }); continue; }
  const sieger = zeilen.reduce((a, b) => (besser(a, b) ? a : b));
  const rest = zeilen.filter((r) => r.id !== sieger.id);
  zuAendern.push({ id: sieger.id, website: host,
    // Mehrfachnennungen sind ein Größensignal, das nicht verloren gehen soll
    standorte: Math.max(sieger.standorte ?? 1, zeilen.length),
    google_reviews: Math.max(...zeilen.map((r) => r.google_reviews ?? 0)) || null });
  zuLoeschen.push(...rest.map((r) => r.id));
}

console.log(`\nDUBLETTEN: ${nachHost.size} Hostnamen aus ${alle.length - portale.length} Zeilen`);
console.log(`  zusammenzuführen: ${zuLoeschen.length} Zeilen`);
console.log(`  Adressen zu kürzen: ${zuAendern.filter((z) => z.website).length}`);
const beispiele = [...nachHost].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
for (const [host, zeilen] of beispiele)
  console.log(`  ${host.replace('https://', '').padEnd(30)} ${zeilen.length} Zeilen → behalte "${zeilen.reduce((a, b) => (besser(a, b) ? a : b)).name?.slice(0, 30)}"`);

console.log(`\nNACHHER: ${nachHost.size} Betriebe (vorher ${alle.length}, davon ${portale.length} Portale und ${zuLoeschen.length} Dubletten)`);

if (!anwenden) { console.log('\nNur angezeigt. Zum Ausführen:  node aufraeumen.mjs --anwenden\n'); process.exit(0); }

// ── Ausführen ────────────────────────────────────────────────────────
console.log('\nFühre zusammen …');
for (const z of zuAendern) {
  const { id, ...felder } = z;
  const { error } = await db().from('unternehmen').update(felder).eq('id', id);
  if (error && !/duplicate key/.test(error.message)) console.error('  Fehler bei', id, error.message);
}
const raus = [...zuLoeschen, ...portale.map((r) => r.id)];
for (let i = 0; i < raus.length; i += 100) {
  const { error } = await db().from('unternehmen').delete().in('id', raus.slice(i, i + 100));
  if (error) console.error('  Löschen fehlgeschlagen:', error.message);
}
const { count } = await db().from('unternehmen').select('*', { count: 'exact', head: true });
console.log(`\nFertig. ${count} Betriebe in der Tabelle.\n`);
process.exit(0);
