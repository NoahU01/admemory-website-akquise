#!/usr/bin/env node
/* Firmennamen aus der Sicherung zurückholen.
     node namen-zurueck.mjs              nur anzeigen
     node namen-zurueck.mjs --anwenden   schreiben

   Beim Zusammenführen der Dubletten wurde die Zeile mit dem vollständigsten
   Scan behalten — und das war oft die vom Scanner selbst angelegte, die als
   Namen nur den Hostnamen trug. Die echten Namen von Google stehen in der
   Sicherung und werden hier über den Hostnamen wieder zugeordnet.           */
import 'dotenv/config';
import fs from 'node:fs';
import { db, dbAktiv, normalisiereUrl } from './lib/db.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const anwenden = process.argv.includes('--anwenden');

const datei = fs.readdirSync('results').filter((f) => f.startsWith('sicherung-unternehmen-')).sort().pop();
if (!datei) { console.error('Keine Sicherung in results/ gefunden'); process.exit(1); }
const sicherung = JSON.parse(fs.readFileSync('results/' + datei, 'utf8'));
console.log(`\nSicherung: ${datei} (${sicherung.length} Zeilen)`);

const istHostname = (name, website) => {
  if (!name) return true;
  const h = normalisiereUrl(website || '').replace(/^https:\/\//, '');
  return name === h || name === 'www.' + h || /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(name);
};

/* Je Host den besten Namen aus der Sicherung: einen, der kein Hostname ist.
   Bei mehreren den längsten — 'Autohaus Linke GmbH Audi' sagt mehr als 'Linke'. */
const besteNamen = new Map();
for (const r of sicherung) {
  if (!r.website || istHostname(r.name, r.website)) continue;
  const h = normalisiereUrl(r.website);
  const bisher = besteNamen.get(h);
  if (!bisher || r.name.length > bisher.length) besteNamen.set(h, r.name);
}
console.log(`echte Namen in der Sicherung: ${besteNamen.size}`);

const jetzt = [];
for (let von = 0; ; von += 1000) {
  const { data, error } = await db().from('unternehmen').select('id,name,website').order('id').range(von, von + 999);
  if (error) { console.error(error.message); process.exit(1); }
  jetzt.push(...data);
  if (data.length < 1000) break;
}

const zuSetzen = jetzt
  .filter((r) => istHostname(r.name, r.website))
  .map((r) => ({ id: r.id, alt: r.name, neu: besteNamen.get(normalisiereUrl(r.website || '')) }))
  .filter((z) => z.neu && z.neu !== z.alt);

console.log(`\n${jetzt.length} Betriebe, davon ${jetzt.filter((r) => istHostname(r.name, r.website)).length} mit Hostnamen als Namen`);
console.log(`davon wiederherstellbar: ${zuSetzen.length}\n`);
for (const z of zuSetzen.slice(0, 12)) console.log(`  ${z.alt.padEnd(34)} → ${z.neu}`);
if (zuSetzen.length > 12) console.log(`  … und ${zuSetzen.length - 12} weitere`);

if (!anwenden) { console.log('\nNur angezeigt. Zum Schreiben:  node namen-zurueck.mjs --anwenden\n'); process.exit(0); }

console.log('\nSchreibe …');
let n = 0;
for (const z of zuSetzen) {
  const { error } = await db().from('unternehmen').update({ name: z.neu }).eq('id', z.id);
  if (error) console.error('  ', z.alt, error.message); else n++;
}
console.log(`\n${n} Namen wiederhergestellt.\n`);
process.exit(0);
