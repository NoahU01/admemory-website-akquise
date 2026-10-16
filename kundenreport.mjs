#!/usr/bin/env node
/* Baut den Report, der beim Betrieb ankommt.

     node kundenreport.mjs parkhotel-ilshofen.com
     node kundenreport.mjs --top=20            die besten Leads mit Stufe-2-Scan
     node kundenreport.mjs --alle              alles, wofür ein Stufe-2-Scan vorliegt

   Voraussetzung ist ein Stufe-2-Scan (results/<host>/scan.json). Stufe 1 hat
   weder Design-Urteil noch Lighthouse — daraus wird kein Report, der etwas
   aussagt, und einen halben schicken wir nicht raus.

   Absenderangaben über die .env:
     ABSENDER_TELEFON, ABSENDER_EMAIL, ABSENDER_PERSON, ABSENDER_ORT          */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { kundenreport } from './lib/kundenreport.mjs';
import { db, dbAktiv } from './lib/db.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const ZIEL = 'entwuerfe/report';

const ABSENDER = {
  firma: 'AdMemory',
  person: process.env.ABSENDER_PERSON || 'Noah Hermanns',
  ort: process.env.ABSENDER_ORT || 'Ilshofen',
  telefon: process.env.ABSENDER_TELEFON || null,
  email: process.env.ABSENDER_EMAIL || null,
  web: 'admemory.de',
};
if (!ABSENDER.telefon && !ABSENDER.email)
  console.log('⚠  Kein ABSENDER_TELEFON und keine ABSENDER_EMAIL in der .env — der Report geht ohne Kontaktzeile raus.\n');

const normHost = (u) => { try { return new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; } };

// ── Welche Betriebe? ─────────────────────────────────────────────────
const mitScan = fs.existsSync('results')
  ? fs.readdirSync('results').filter((h) => fs.existsSync(path.join('results', h, 'scan.json')))
  : [];

let hosts = args.filter((a) => !a.startsWith('--')).map(normHost);
if (args.includes('--alle')) hosts = mitScan;
else if (flag('top', null)) {
  if (!dbAktiv()) { console.error('Supabase nicht konfiguriert — --top braucht die Datenbank.'); process.exit(1); }
  const { data, error } = await db().from('unternehmen')
    .select('website,lead_score').not('score_eindruck', 'is', null)
    .order('lead_score', { ascending: false }).limit(300);
  if (error) { console.error(error.message); process.exit(1); }
  hosts = data.map((u) => normHost(u.website)).filter((h) => mitScan.includes(h)).slice(0, Number(flag('top', 10)));
}
if (!hosts.length) { console.error('Nichts zu tun. Host angeben, --alle oder --top=N.'); process.exit(1); }

// ── Stammdaten aus der Datenbank ─────────────────────────────────────
const stamm = new Map();
if (dbAktiv()) {
  const { data } = await db().from('unternehmen').select('name,stadt,website,telefon').limit(1000);
  for (const u of data ?? []) if (u.website) stamm.set(normHost(u.website), u);
}

/* Bilder: die Rohaufnahmen sind PNG mit bis zu 6 MB. Für ein Dokument, das per
   Mail oder als PDF verschickt wird, ist das unbrauchbar — also verkleinern und
   als JPEG ablegen. sips gehört zu macOS, das spart eine Abhängigkeit.
   results/ ist gitignored, entwuerfe/report/ nicht: nur das, was wirklich in
   den Report geht, landet im Repo. */
function bildAblegen(quelle, ziel, kante, guete = 78) {
  if (!fs.existsSync(quelle)) return null;
  fs.mkdirSync(path.dirname(ziel), { recursive: true });
  execFileSync('sips', ['-Z', String(kante), '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(guete), quelle, '--out', ziel], { stdio: 'ignore' });
  return path.basename(path.dirname(ziel)) + '/' + path.basename(ziel);
}

/* Unser eigenes Logo liegt einmal neben den Reports, nicht in jedem Ordner.
   Bei 500 Reports wären das sonst 500 Kopien derselben Datei. */
const LOGO_QUELLE = 'entwuerfe/baukasten/beispiel-bilder/marken/admemory.png';
let logoPfad = null;
if (fs.existsSync(LOGO_QUELLE)) {
  fs.mkdirSync(ZIEL, { recursive: true });
  fs.copyFileSync(LOGO_QUELLE, path.join(ZIEL, 'admemory.png'));
  logoPfad = '../admemory.png';
}

let gebaut = 0;
for (const host of hosts) {
  const scanDatei = path.join('results', host, 'scan.json');
  if (!fs.existsSync(scanDatei)) { console.log(`${host.padEnd(34)} übersprungen — kein Stufe-2-Scan`); continue; }
  const scan = JSON.parse(fs.readFileSync(scanDatei, 'utf8'));
  if (scan.error || scan.stufe !== 2) { console.log(`${host.padEnd(34)} übersprungen — Scan unbrauchbar`); continue; }

  const ordner = path.join(ZIEL, host);
  fs.mkdirSync(path.join(ordner, 'bilder'), { recursive: true });

  const bilder = {
    mobil: bildAblegen(path.join('results', host, 'mobile.png'), path.join(ordner, 'bilder', 'handy.jpg'), 560),
    logo: logoPfad,   // einmal für alle, nicht einmal je Report
  };

  const html = kundenreport({ scan, betrieb: stamm.get(host) || {}, bilder, absender: ABSENDER });
  fs.writeFileSync(path.join(ordner, 'index.html'), html);

  const kb = Math.round(Buffer.byteLength(html) / 1024);
  console.log(`${host.padEnd(34)} ${String(scan.total ?? '–').padStart(3)} Qual · `
    + `${String((scan.findings || []).filter((f) => f.severity === 'high').length).padStart(2)} schwer · ${kb} kB   ${ordner}/index.html`);
  gebaut++;
}

console.log(`\n${gebaut} Report${gebaut === 1 ? '' : 's'} gebaut.`);
process.exit(0);
