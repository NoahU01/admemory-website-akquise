/* Zugriff auf Supabase. Läuft nur serverseitig mit dem service_role-Key —
   der umgeht alle Sicherheitsregeln und darf niemals in eine Website. */
import { createClient } from '@supabase/supabase-js';

let client = null;

export function db() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const dbAktiv = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

/* Ein Unternehmen anlegen oder finden. Die Website ist der Schlüssel —
   derselbe Betrieb soll nicht doppelt in der Liste stehen. */
export async function upsertUnternehmen({ name, website, branche, stadt, telefon, email, google_rating, google_reviews, notiz }) {
  const c = db(); if (!c) throw new Error('Supabase nicht konfiguriert');
  const daten = { name, website, branche, stadt, telefon, email, google_rating, google_reviews, notiz };
  for (const k of Object.keys(daten)) if (daten[k] === undefined) delete daten[k];
  const { data, error } = await c.from('unternehmen')
    .upsert(daten, { onConflict: 'website', ignoreDuplicates: false })
    .select().single();
  if (error) throw new Error(`Anlegen fehlgeschlagen: ${error.message}`);
  return data;
}

/* Scan-Ergebnis speichern. Setzt den Status nur dann auf 'gescannt', wenn der
   Betrieb noch ganz am Anfang steht — ein bereits gebauter Entwurf darf durch
   einen erneuten Scan nicht aus deiner Arbeitsliste fallen. */
export async function speichereScan(result, { name, stadt } = {}) {
  const c = db(); if (!c) throw new Error('Supabase nicht konfiguriert');
  const website = result.finalUrl || result.url;

  const { data: vorhanden } = await c.from('unternehmen').select('id, status').eq('website', website).maybeSingle();

  const felder = {
    website,
    name: name || vorhanden?.name || new URL(website).hostname.replace(/^www\./, ''),
    branche: result.branche?.key ?? null,
    quality_score: result.total ?? null,
    lead_score: result.leadScore ?? null,
    befunde: result.findings ?? [],
    scan_details: {
      kategorien: Object.fromEntries(Object.entries(result.categories || {})
        .map(([k, v]) => [k, { score: v.score, data: v.data, uebersprungen: v.skipped ?? null }])),
      screenshots: result.screenshots ?? null,
      meta: result.meta ?? null,
      branche: result.branche ?? null,
      gescannt_am: result.scannedAt,
    },
    letzter_scan: result.scannedAt,
  };
  if (stadt) felder.stadt = stadt;
  if (!vorhanden || vorhanden.status === 'neu') felder.status = 'gescannt';

  const { data, error } = await c.from('unternehmen')
    .upsert(felder, { onConflict: 'website' }).select('id, name, status').single();
  if (error) throw new Error(`Speichern fehlgeschlagen: ${error.message}`);
  return data;
}

/* Feedback anhängen — als neue Runde, nicht als Überschreiben.
   Nach drei Runden willst du sehen, was in Runde eins schon gesagt wurde. */
export async function feedbackHinzufuegen(id, text) {
  const c = db(); if (!c) throw new Error('Supabase nicht konfiguriert');
  const { data: u, error: e1 } = await c.from('unternehmen').select('feedback').eq('id', id).single();
  if (e1) throw new Error(e1.message);
  const bisher = u.feedback ?? [];
  const neu = [...bisher, { runde: bisher.length + 1, datum: new Date().toISOString(), text }];
  const { error } = await c.from('unternehmen')
    .update({ feedback: neu, status: 'feedback_gegeben' }).eq('id', id);
  if (error) throw new Error(error.message);
  return neu.length;
}

export async function setStatus(id, status) {
  const c = db(); if (!c) throw new Error('Supabase nicht konfiguriert');
  const extra = { versendet: { mail_gesendet_am: new Date().toISOString() },
                  geantwortet: { antwort_am: new Date().toISOString() },
                  entwurf_gebaut: { letzter_build: new Date().toISOString() } }[status] || {};
  const { error } = await c.from('unternehmen').update({ status, ...extra }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function arbeitsliste({ status = null, limit = 50 } = {}) {
  const c = db(); if (!c) throw new Error('Supabase nicht konfiguriert');
  let q = c.from('arbeitsliste').select('*').limit(limit);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}
