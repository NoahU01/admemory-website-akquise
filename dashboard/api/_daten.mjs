/* Die Betriebsliste, gelesen aus betriebe.csv.

   Früher kam sie aus Supabase. Das Projekt ist weg, und für Scanner und
   Report wird keine Datenbank gebraucht — nur die Liste. Die liegt als
   Tabelle im Projektverzeichnis und entsteht mit `node archiv-blatt.mjs`
   aus results/ und der Sicherung. Eine Tabelle pausiert nicht.            */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BLATT = path.join(WURZEL, 'betriebe.csv');
export const REPORTS = path.join(WURZEL, 'entwuerfe/report');

/* Einmal einlesen und behalten, aber neu lesen, sobald die Datei sich
   geändert hat. Sonst sieht man nach `node archiv-blatt.mjs` den alten Stand
   und sucht den Fehler an der falschen Stelle. */
let zwischenspeicher = { stand: 0, zeilen: null };

function zerlege(text) {
  const zeilen = text.replace(/^﻿/, '').split('\n').filter((z) => z.trim());
  const kopf = zeilen[0].split(';');
  return zeilen.slice(1).map((z) => {
    // Anführungszeichen beachten, in Befundtexten stehen Semikolons
    const felder = []; let akt = '', inAnf = false;
    for (let i = 0; i < z.length; i++) {
      const c = z[i];
      if (c === '"') { if (inAnf && z[i + 1] === '"') { akt += '"'; i++; } else inAnf = !inAnf; }
      else if (c === ';' && !inAnf) { felder.push(akt); akt = ''; }
      else akt += c;
    }
    felder.push(akt);
    return Object.fromEntries(kopf.map((k, i) => [k, felder[i] ?? '']));
  });
}

const zahl = (v) => { const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };

export function betriebe() {
  if (!fs.existsSync(BLATT)) {
    execFileSync(process.execPath, ['archiv-blatt.mjs'], { cwd: WURZEL, stdio: 'ignore' });
  }
  const stand = fs.statSync(BLATT).mtimeMs;
  if (zwischenspeicher.zeilen && zwischenspeicher.stand === stand) return zwischenspeicher.zeilen;

  const zeilen = zerlege(fs.readFileSync(BLATT, 'utf8')).map((r) => {
    let host = null;
    try { host = new URL(r['Website']).hostname.replace(/^www\./, '').toLowerCase(); } catch {}
    return {
      host,
      name: r['Name'] || host || '—',
      stadt: r['Stadt'] || '',
      branche: r['Branche'] || '',
      website: r['Website'] || '',
      telefon: r['Telefon'] || '',
      note: zahl(r['Google-Note']),
      lead: zahl(r['Lead-Wert']),
      qualitaet: zahl(r['Qualität']),
      stufe: zahl(r['Scan-Stufe']),
      schwer: zahl(r['Befunde schwer']),
      groesse: r['Größenstufe'] || '',
      geprueft: r['Geprüft am'] || '',
    };
  }).filter((b) => b.host);

  zwischenspeicher = { stand, zeilen };
  return zeilen;
}

/* Welche Betriebe haben einen fertigen Report? Nicht gemerkt, sondern
   nachgesehen: Die Ordner sind die Wahrheit, eine zweite Liste wäre eine
   zweite Gelegenheit, falsch zu liegen. */
export function mitReport() {
  if (!fs.existsSync(REPORTS)) return new Set();
  return new Set(fs.readdirSync(REPORTS)
    .filter((d) => fs.existsSync(path.join(REPORTS, d, 'index.html'))));
}

export async function koerper(req) {
  const stuecke = [];
  for await (const s of req) stuecke.push(s);
  try { return JSON.parse(Buffer.concat(stuecke).toString() || '{}'); } catch { return {}; }
}
