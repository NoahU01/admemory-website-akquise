#!/usr/bin/env node
/* Arbeitet die Aufträge aus dem Dashboard ab.

     node agent.mjs              läuft weiter und schaut alle 30 s nach
     node agent.mjs --einmal     arbeitet ab, was offen ist, und beendet sich
     node agent.mjs --zeige      zeigt nur die Warteschlange

   Das Dashboard läuft im Netz und kann nichts bauen — Nachbau und Scan brauchen
   einen Browser und das Dateisystem. Es schreibt deshalb Aufträge in die
   Tabelle, und dieser Agent holt sie hier ab.

   Noch nicht gebaut: 'entwurf_bauen', 'entwurf_neu_bauen' (Phase 3) und
   'mail_vorbereiten' (Phase 5). Solche Aufträge werden mit einem klaren Hinweis
   abgelehnt, statt stillschweigend liegen zu bleiben.                        */
import 'dotenv/config';
import path from 'node:path';
import { db, dbAktiv, speichereScan } from './lib/db.mjs';
import { stufe2 } from './lib/stufen.mjs';

const args = process.argv.slice(2);
const einmal = args.includes('--einmal');
const nurZeigen = args.includes('--zeige');
const PAUSE = 30_000;

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }

const jetzt = () => new Date().toISOString();
const uhr = () => new Date().toLocaleTimeString('de-DE');

async function warteschlange() {
  const { data, error } = await db().from('auftragsliste')
    .select('id,art,status,anweisung,name,website,unternehmen_id,angelegt_am,fehler')
    .in('status', ['offen', 'laeuft', 'fehler']).limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

if (nurZeigen) {
  const w = await warteschlange();
  if (!w.length) console.log('\nNichts in der Warteschlange.\n');
  else {
    console.log(`\n${w.length} Aufträge\n`);
    for (const a of w)
      console.log(`  ${a.status.padEnd(7)} ${a.art.padEnd(18)} ${(a.name ?? '').slice(0, 28).padEnd(30)}` +
                  (a.fehler ? ' · ' + a.fehler.slice(0, 50) : ''));
    console.log();
  }
  process.exit(0);
}

/* Einen Auftrag greifen. Der Statuswechsel auf 'laeuft' läuft über eine
   Bedingung auf 'offen' — so greift bei zwei gleichzeitig laufenden Agenten
   nicht einer den Auftrag des anderen. */
async function greife() {
  const { data: offen } = await db().from('auftraege')
    .select('id').eq('status', 'offen').order('angelegt_am').limit(1);
  if (!offen?.length) return null;
  const { data, error } = await db().from('auftraege')
    .update({ status: 'laeuft', begonnen_am: jetzt() })
    .eq('id', offen[0].id).eq('status', 'offen')
    .select('id,art,anweisung,unternehmen_id').maybeSingle();
  if (error || !data) return null;
  const { data: u } = await db().from('unternehmen')
    .select('id,name,website,branche,google_rating,google_reviews,standorte').eq('id', data.unternehmen_id).single();
  return { ...data, betrieb: u };
}

async function fertig(id, ergebnis) {
  await db().from('auftraege').update({ status: 'fertig', erledigt_am: jetzt(), ergebnis }).eq('id', id);
}
async function gescheitert(id, text) {
  const { data } = await db().from('auftraege').select('versuche').eq('id', id).single();
  await db().from('auftraege').update({
    status: 'fehler', erledigt_am: jetzt(),
    fehler: String(text).slice(0, 500), versuche: (data?.versuche ?? 0) + 1 }).eq('id', id);
}

const NICHT_GEBAUT = {
  entwurf_bauen:     'Nachbau ist noch nicht gebaut (Phase 3).',
  entwurf_neu_bauen: 'Nachbau ist noch nicht gebaut (Phase 3).',
  mail_vorbereiten:  'Mail-Entwurf ist noch nicht gebaut (Phase 5).',
};

async function arbeite(a) {
  const host = (a.betrieb?.website ?? '').replace(/^https?:\/\//, '');
  console.log(`[${uhr()}] ${a.art} · ${host}`);

  if (NICHT_GEBAUT[a.art]) {
    await gescheitert(a.id, NICHT_GEBAUT[a.art]);
    console.log(`         abgelehnt: ${NICHT_GEBAUT[a.art]}`);
    return;
  }

  if (a.art === 'scan_stufe2') {
    const url = a.betrieb.website;
    const ergebnis = await stufe2(url, path.join('results', host), a.betrieb.branche ?? null,
      (s) => console.log(`         ${s}`),
      { rating: a.betrieb.google_rating, reviews: a.betrieb.google_reviews, standorte: a.betrieb.standorte });
    await speichereScan(ergebnis, { name: a.betrieb.name });
    await fertig(a.id, { qualitaet: ergebnis.total, lead: ergebnis.leadScore,
                         befunde: ergebnis.findings.length, stufe: ergebnis.stufe });
    console.log(`         fertig · Qual ${ergebnis.total} · Lead ${ergebnis.leadScore}`);
    return;
  }

  await gescheitert(a.id, `Unbekannte Auftragsart: ${a.art}`);
}

console.log(`\nAgent läuft${einmal ? ' (einmalig)' : `, schaut alle ${PAUSE / 1000} s nach`}. Abbrechen mit Strg+C.\n`);

let leer = 0;
for (;;) {
  let auftrag;
  try { auftrag = await greife(); }
  catch (e) {
    // Fehlende Tabelle ist der häufigste Fall: Migration noch nicht eingespielt
    console.error(/does not exist|schema cache/i.test(e.message)
      ? 'Tabelle "auftraege" fehlt — supabase/migration-04-auftraege.sql einspielen.'
      : e.message);
    if (einmal) process.exit(1);
    await new Promise((r) => setTimeout(r, PAUSE));
    continue;
  }

  if (!auftrag) {
    if (einmal) { console.log(leer ? `\n${leer} Aufträge abgearbeitet.\n` : '\nNichts zu tun.\n'); process.exit(0); }
    await new Promise((r) => setTimeout(r, PAUSE));
    continue;
  }

  leer++;
  try { await arbeite(auftrag); }
  catch (e) { await gescheitert(auftrag.id, e.message); console.error(`         FEHLER: ${e.message}`); }
}
