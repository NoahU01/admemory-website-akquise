#!/usr/bin/env node
/* Betriebe finden und in die Datenbank legen.
     node sammeln.mjs "Malerbetrieb" "Crailsheim"
     node sammeln.mjs "Restaurant" "Schwäbisch Hall" --min-bewertungen=10
     node sammeln.mjs --liste suchen.txt        Zeilen der Form: Was;Ort
     node sammeln.mjs ... --trocken             nur anzeigen, nichts speichern   */
import 'dotenv/config';
import fs from 'node:fs';
import { suche, filtern } from './lib/sammler.mjs';
import { upsertUnternehmen, dbAktiv } from './lib/db.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const trocken = args.includes('--trocken');
const minBew = Number(flag('min-bewertungen', 0));
const minSterne = Number(flag('min-sterne', 0));
const frei = args.filter((a) => !a.startsWith('--'));

let auftraege = [];
const listeIdx = args.indexOf('--liste');
if (listeIdx > -1) {
  auftraege = fs.readFileSync(args[listeIdx + 1], 'utf8').split('\n')
    .map((z) => z.trim()).filter((z) => z && !z.startsWith('#'))
    .map((z) => { const [was, ort] = z.split(';').map((x) => x.trim()); return { was, ort }; });
} else if (frei.length >= 2) {
  auftraege = [{ was: frei[0], ort: frei[1] }];
} else {
  console.error('Aufruf: node sammeln.mjs "<Branche>" "<Ort>"   oder   --liste suchen.txt');
  process.exit(1);
}

if (!trocken && !dbAktiv()) { console.error('Supabase nicht konfiguriert — mit --trocken testen.'); process.exit(1); }

let gesamtNeu = 0, gesamtSchon = 0;
for (const { was, ort } of auftraege) {
  process.stdout.write(`\n▶ ${was} in ${ort} … `);
  let treffer;
  try { treffer = await suche({ was, ort }); }
  catch (e) { console.log(`FEHLER: ${e.message}`); continue; }

  const { drin, raus } = filtern(treffer, { minBewertungen: minBew, minSterne });
  console.log(`${treffer.length} gefunden, ${drin.length} brauchbar`);
  if (raus.length) {
    const gruende = raus.reduce((m, [, g]) => ({ ...m, [g]: (m[g] || 0) + 1 }), {});
    console.log(`  aussortiert: ${Object.entries(gruende).map(([g, n]) => `${n}× ${g}`).join(', ')}`);
  }

  for (const t of drin) {
    const zeile = `  ${(t.name || '?').slice(0, 34).padEnd(36)} ${String(t.google_rating ?? '–').padStart(4)}★ ${String(t.google_reviews ?? 0).padStart(4)}  ${t.branche.padEnd(15)}`;
    if (trocken) { console.log(zeile + (t.website || '')); continue; }
    try {
      await upsertUnternehmen({
        name: t.name, website: t.website, branche: t.branche, stadt: t.stadt,
        telefon: t.telefon, email: null,
        google_rating: t.google_rating, google_reviews: t.google_reviews, standorte: t.standorte ?? 1,
        notiz: t.typ_label ? `Google: ${t.typ_label}` : null,
      });
      gesamtNeu++;
      console.log(zeile + '→ gespeichert');
    } catch (e) {
      gesamtSchon++;
      console.log(zeile + `→ ${e.message.slice(0, 50)}`);
    }
  }
}
if (!trocken) console.log(`\n${gesamtNeu} Betriebe angelegt oder aktualisiert${gesamtSchon ? `, ${gesamtSchon} übersprungen` : ''}.`);
console.log(trocken ? '\n(Trockenlauf — nichts gespeichert)\n' : '\nNächster Schritt:  node scan.mjs --list <urls>\n');
