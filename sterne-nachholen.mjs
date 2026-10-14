#!/usr/bin/env node
/* Fehlende Google-Noten nachholen.
     node sterne-nachholen.mjs              nur anzeigen, nichts ändern
     node sterne-nachholen.mjs --anwenden   wirklich holen und speichern
     node sterne-nachholen.mjs --anwenden --max 50   erst einmal 50 Stück

   Hintergrund: aufraeumen.mjs hat beim Zusammenführen der Dubletten die
   Bewertungszahl mitgeführt, die Note aber nicht. Wo die Gewinnerzeile keine
   Note hatte, ist sie mit den Dubletten gelöscht worden — 737 Betriebe hatten
   danach eine Zahl, aber keine Note. Das ist dort behoben; hier wird der
   Schaden repariert.

   Jeder Treffer wird über den Hostnamen der Website geprüft. Eine Textsuche
   nach "Hofmann Haus GmbH" findet sonst irgendeine gleichnamige Firma, und
   wir schrieben eine fremde Note in die Tabelle.                            */
import 'dotenv/config';
import { db, dbAktiv, normalisiereUrl } from './lib/db.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const key = process.env.GOOGLE_PLACES_KEY;
if (!key) { console.error('GOOGLE_PLACES_KEY fehlt in .env'); process.exit(1); }

const anwenden = process.argv.includes('--anwenden');
const maxArg = process.argv.indexOf('--max');
const MAX = maxArg > -1 ? Number(process.argv[maxArg + 1]) : Infinity;

const FELDER = 'places.displayName,places.rating,places.userRatingCount,places.websiteUri';
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };

const offen = [];
for (let von = 0; ; von += 1000) {
  const { data, error } = await db().from('unternehmen')
    .select('id,name,website,stadt,google_rating,google_reviews').order('id').range(von, von + 999);
  if (error) { console.error(error.message); process.exit(1); }
  offen.push(...data.filter((r) => r.google_rating == null && r.website));
  if (data.length < 1000) break;
}

console.log(`\n${offen.length} Betriebe ohne Note.`);
console.log(`Das sind ${Math.min(offen.length, MAX)} Anfragen an die Places API — die kosten Geld.`);
console.log('Was die Textsuche kostet, steht in der Google-Cloud-Abrechnung; hier wird nichts geschätzt.\n');
if (!anwenden) {
  console.log('Beispiele:');
  for (const r of offen.slice(0, 6)) console.log(`  ${(r.name || '?').slice(0, 34).padEnd(36)} ${host(r.website)}`);
  console.log('\nNur angezeigt. Zum Ausführen:  node sterne-nachholen.mjs --anwenden\n');
  process.exit(0);
}

let gesetzt = 0, verfehlt = 0, ohne = 0, fehler = 0;
for (const [i, r] of offen.slice(0, MAX).entries()) {
  const suche = [r.name, r.stadt].filter(Boolean).join(', ');
  try {
    const antwort = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FELDER },
      body: JSON.stringify({ textQuery: suche, languageCode: 'de' }),
      signal: AbortSignal.timeout(20000),
    });
    if (!antwort.ok) throw new Error(`${antwort.status} ${(await antwort.text()).slice(0, 80)}`);
    const j = await antwort.json();
    const unser = host(r.website);
    /* Nur ein Treffer mit demselben Hostnamen zählt. Lieber keine Note als
       die Note eines fremden Betriebs. */
    const treffer = (j.places ?? []).find((p) => p.websiteUri && host(p.websiteUri) === unser);
    if (!treffer) { verfehlt++; continue; }
    if (treffer.rating == null) { ohne++; continue; }

    const felder = { google_rating: treffer.rating };
    if (treffer.userRatingCount != null) felder.google_reviews = treffer.userRatingCount;
    const { error } = await db().from('unternehmen').update(felder).eq('id', r.id);
    if (error) { fehler++; console.error('  ', r.name, error.message); continue; }
    gesetzt++;
    if (gesetzt <= 8 || gesetzt % 50 === 0)
      console.log(`  ${(r.name || '?').slice(0, 34).padEnd(36)} ${treffer.rating}★ aus ${treffer.userRatingCount ?? '?'}`);
  } catch (e) { fehler++; console.error('  ', r.name, String(e.message).slice(0, 70)); }
  if ((i + 1) % 100 === 0) console.log(`  … ${i + 1} von ${Math.min(offen.length, MAX)}`);
}

console.log(`\n${gesetzt} Noten gesetzt.`);
console.log(`${verfehlt} ohne passenden Treffer (anderer Hostname — bewusst nicht übernommen)`);
console.log(`${ohne} bei Google ohne Note, ${fehler} Fehler.\n`);
process.exit(0);
