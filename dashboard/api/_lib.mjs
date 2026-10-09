/* Gemeinsame Teile aller API-Funktionen.

   Der Supabase service_role-Key umgeht jede Datenbanksicherung. Er steht
   deshalb ausschließlich in den Umgebungsvariablen bei Vercel und wird nie an
   den Browser gegeben. Die Oberfläche kennt die Datenbank nicht — sie fragt
   immer über diese Funktionen. */
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export const KEKS = 'admemory_lead';
const TAGE = 30;

export function datenbank() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL oder SUPABASE_SERVICE_KEY fehlt');
  return createClient(url, key, { auth: { persistSession: false } });
}

function geheimnis() {
  const s = process.env.DASHBOARD_SECRET;
  if (!s || s.length < 24) throw new Error('DASHBOARD_SECRET fehlt oder ist zu kurz');
  return s;
}

/* Der Keks enthält nur ein Ablaufdatum und eine Signatur darüber. Ohne das
   Geheimnis lässt er sich nicht fälschen, und ein abgelaufener wird abgelehnt. */
export function keksBauen() {
  const ablauf = Date.now() + TAGE * 86400_000;
  const sig = crypto.createHmac('sha256', geheimnis()).update(String(ablauf)).digest('base64url');
  return `${ablauf}.${sig}`;
}

export function keksGueltig(wert) {
  if (typeof wert !== 'string' || !wert.includes('.')) return false;
  const [ablauf, sig] = wert.split('.');
  if (!/^\d+$/.test(ablauf) || Number(ablauf) < Date.now()) return false;
  const soll = crypto.createHmac('sha256', geheimnis()).update(ablauf).digest('base64url');
  return sig.length === soll.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(soll));
}

export function kekseLesen(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';')
    .map((t) => t.trim().split('='))
    .filter(([k]) => k)
    .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
}

/* Jede Funktion mit Daten ruft das als Erstes auf. Ohne gültigen Keks gibt es
   401 und keinerlei Auskunft darüber, was dahinter liegt. */
export function angemeldet(req, res) {
  if (keksGueltig(kekseLesen(req)[KEKS])) return true;
  res.status(401).json({ fehler: 'nicht angemeldet' });
  return false;
}

/* Unterscheidet "falsch eingegeben" von "nie eingerichtet". Vorher meldete der
   Server auch dann "Passwort falsch", wenn gar keines hinterlegt war — man
   sucht den Fehler dann bei sich statt in den Umgebungsvariablen. Das
   preiszugeben ist unbedenklich: Ohne gesetztes Passwort kommt ohnehin niemand
   hinein, und wer es erfährt, kann damit nichts anfangen. */
export function passwortEingerichtet() {
  return typeof process.env.DASHBOARD_PASSWORT === 'string' &&
         process.env.DASHBOARD_PASSWORT.length > 0;
}

export function passwortStimmt(eingabe) {
  const soll = process.env.DASHBOARD_PASSWORT;
  if (!soll || typeof eingabe !== 'string') return false;
  // Gleich lange Puffer, damit die Vergleichsdauer nichts über das Passwort sagt
  const a = crypto.createHash('sha256').update(eingabe).digest();
  const b = crypto.createHash('sha256').update(soll).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function koerper(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let roh = '';
  for await (const stueck of req) roh += stueck;
  try { return JSON.parse(roh || '{}'); } catch { return {}; }
}

export function fehlerAntwort(res, e) {
  // Nach außen nur eine knappe Meldung — Verbindungsdaten gehören nicht in den Browser
  console.error(e);
  res.status(500).json({ fehler: 'Serverfehler' });
}
