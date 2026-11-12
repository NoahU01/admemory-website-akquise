#!/usr/bin/env node
/* Baut aus allem, was auf der Platte liegt, eine Tabelle zum Ansehen.

     node archiv-blatt.mjs            schreibt betriebe.csv
     node archiv-blatt.mjs --ziel=x.csv

   Warum es das gibt: Die Supabase-Datenbank ist weg, und für den jetzigen
   Zweck braucht es auch keine mehr — Scanner und Report kommen ohne aus.
   Was es weiter braucht, ist die LISTE: welche Betriebe gibt es, wie stehen
   sie da, wie erreicht man sie. Das ist eine Tabelle, kein Dienst, und eine
   Tabelle pausiert nicht.

   Zwei Quellen werden zusammengeführt:
     results/sicherung-unternehmen-2026-09-28.json  Stammdaten und Kontakt
     results/<host>/scan*.json                      die Bewertung, neuer

   Beim Entdoppeln werden Felder feldweise aufgefüllt statt einen Datensatz
   zu verwerfen. Genau daran ist es im Betrieb schiefgegangen: Nach dem
   Entdoppeln standen in der Datenbank nur noch 252 Telefonnummern, in der
   Sicherung davor waren es 1069.                                           */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const ZIEL = flag('ziel', 'betriebe.csv');
const SICHERUNG = 'results/sicherung-unternehmen-2026-09-28.json';

const host = (u) => { try { return new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };
const leer = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);

// ── Stammdaten, feldweise entdoppelt ────────────────────────────────
const betriebe = new Map();
for (const z of JSON.parse(fs.readFileSync(SICHERUNG, 'utf8'))) {
  const h = host(z.website);
  if (!h) continue;
  if (!betriebe.has(h)) { betriebe.set(h, { host: h }); }
  const b = betriebe.get(h);
  for (const [k, v] of Object.entries(z)) if (leer(b[k]) && !leer(v)) b[k] = v;
}
const ausSicherung = betriebe.size;

// ── Scans drüberlegen, sie sind neuer ───────────────────────────────
const KAT = { impression: 'design', mobile: 'mobil', content: 'inhalt', completeness: 'vollstaendigkeit',
              tech: 'technik', freshness: 'aktualitaet', seo: 'auffindbarkeit', legal: 'rechtliches' };
let mitScan = 0;
for (const ordner of fs.existsSync('results') ? fs.readdirSync('results') : []) {
  const voll = path.join('results', ordner, 'scan.json');
  const teil = path.join('results', ordner, 'scan-stufe1.json');
  const datei = fs.existsSync(voll) ? voll : fs.existsSync(teil) ? teil : null;
  if (!datei) continue;
  let s; try { s = JSON.parse(fs.readFileSync(datei, 'utf8')); } catch { continue; }
  if (s.error) continue;
  const h = host(s.finalUrl || s.url) || ordner.toLowerCase();
  if (!betriebe.has(h)) betriebe.set(h, { host: h, website: s.finalUrl || s.url });
  const b = betriebe.get(h);
  mitScan++;
  b.quality_score = s.total ?? b.quality_score;
  b.lead_score = s.leadScore ?? b.lead_score;
  b.scan_stufe = s.stufe;
  b.letzter_scan = s.scannedAt;
  for (const [k, n] of Object.entries(KAT)) {
    const w = s.categories?.[k]?.score;
    if (typeof w === 'number') b['s_' + n] = w;
  }
  const f = s.findings || [];
  b.befunde_schwer = f.filter((x) => x.severity === 'high').length;
  b.befunde_gesamt = f.length;
  if (s.groesse) { b.groesse_stufe = s.groesse.stufe; b.preis_von = s.groesse.preisVon; b.preis_bis = s.groesse.preisBis; }
  if (s.branche?.key) b.branche = s.branche.key;
  if (!b.name || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(b.name)) {
    const t = s.meta?.title;
    if (t) {
      const teile = String(t).split(/\s+[-–—|]\s+|:\s+/).map((x) => x.trim())
        .filter((x) => x && !/^(home|start|startseite|index|(herzlich )?willkommen\b.*)$/i.test(x));
      const gut = teile.find((x) => x.length <= 45);
      if (gut) b.name = gut;
    }
  }
}

// ── Schreiben ───────────────────────────────────────────────────────
const SPALTEN = [
  ['Name', 'name'], ['Stadt', 'stadt'], ['Branche', 'branche'],
  ['Website', 'website'], ['Telefon', 'telefon'], ['E-Mail', 'email'],
  ['Google-Note', 'google_rating'], ['Bewertungen', 'google_reviews'],
  ['Lead-Wert', 'lead_score'], ['Qualität', 'quality_score'],
  ['Design', 's_design'], ['Mobil', 's_mobil'], ['Inhalt', 's_inhalt'],
  ['Vollständigkeit', 's_vollstaendigkeit'], ['Technik', 's_technik'],
  ['Aktualität', 's_aktualitaet'], ['Auffindbarkeit', 's_auffindbarkeit'],
  ['Rechtliches', 's_rechtliches'],
  ['Befunde schwer', 'befunde_schwer'], ['Befunde gesamt', 'befunde_gesamt'],
  ['Größenstufe', 'groesse_stufe'], ['Preis von', 'preis_von'], ['Preis bis', 'preis_bis'],
  ['Scan-Stufe', 'scan_stufe'], ['Geprüft am', 'letzter_scan'], ['Status', 'status'],
  /* Was in der Datenbank 'notiz' hiess, war der Google-Suchbegriff, ueber den
     der Betrieb gefunden wurde. Nuetzlich, aber keine Notiz — die Spalte dafuer
     bleibt leer und gehoert Noah. */
  ['Herkunft', 'notiz'], ['Notiz', '__leer'],
];

const zelle = (v) => {
  if (leer(v)) return '';
  let s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) s = s.slice(0, 10).split('-').reverse().join('.');
  // Dezimaltrennzeichen deutsch, damit Sheets die Zahl als Zahl liest
  if (/^-?\d+\.\d+$/.test(s)) s = s.replace('.', ',');
  return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const zeilen = [...betriebe.values()]
  .sort((a, b) => (b.lead_score ?? -1) - (a.lead_score ?? -1) || (a.name || '').localeCompare(b.name || ''));

const csv = [SPALTEN.map(([k]) => k).join(';')]
  .concat(zeilen.map((b) => SPALTEN.map(([, f]) => zelle(b[f])).join(';')))
  .join('\n');

fs.writeFileSync(ZIEL, '﻿' + csv, 'utf8');   // BOM, sonst zerlegt Excel die Umlaute

const mit = (f) => zeilen.filter((b) => !leer(b[f])).length;
console.log(`${ZIEL} geschrieben: ${zeilen.length} Betriebe`);
console.log(`  aus der Sicherung entdoppelt: ${ausSicherung}, Scans eingelesen: ${mitScan}`);
console.log(`  Telefon ${mit('telefon')} · Google-Note ${mit('google_rating')} · Lead-Wert ${mit('lead_score')}`);
console.log(`  mit Design-Note (Stufe 2): ${mit('s_design')} · mit Stadt: ${mit('stadt')}`);
