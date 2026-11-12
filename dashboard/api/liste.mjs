/* Die Tabelle: Betrieb, Bewertung, und ob ein Report vorliegt.

   Gefiltert wird hier und nicht im Browser, damit die Trefferzahl stimmt:
   Der Browser bekommt nur die ersten 400 Zeilen, und "1108 Treffer" bei
   400 gezeigten Zeilen wäre sonst eine Lüge.                               */
import { betriebe, mitReport } from './_daten.mjs';

/* searchParams.get() liefert null, wenn der Parameter fehlt — und Number(null)
   ist 0, nicht NaN. Ohne die Leerprüfung wurde aus jedem nicht gesetzten
   Filter ein "höchstens 0", und die Liste war immer leer. */
const zahl = (v) => {
  const t = String(v ?? '').trim();
  if (!t) return null;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export default async function handler(req, res) {
  const p = new URL(req.url, 'http://x').searchParams;
  const suche = (p.get('suche') || '').trim().toLowerCase();
  const qmin = zahl(p.get('qmin')), qmax = zahl(p.get('qmax'));
  const lmin = zahl(p.get('lmin')), lmax = zahl(p.get('lmax'));
  const groesse = p.get('groesse') || '';
  const scan = p.get('scan') || '';
  const report = p.get('report') || '';
  const reports = mitReport();

  let zeilen = betriebe().map((b) => ({ ...b, report: reports.has(b.host) }));

  if (suche) zeilen = zeilen.filter((b) =>
    (b.name + ' ' + b.host + ' ' + b.stadt + ' ' + b.branche).toLowerCase().includes(suche));

  /* Ein Betrieb ohne Wert fällt aus einem Bereichsfilter heraus, statt als
     Null durchzurutschen — sonst stünden bei "Qualität bis 40" alle
     ungescannten Betriebe mit drin. */
  if (qmin !== null) zeilen = zeilen.filter((b) => b.qualitaet !== null && b.qualitaet >= qmin);
  if (qmax !== null) zeilen = zeilen.filter((b) => b.qualitaet !== null && b.qualitaet <= qmax);
  if (lmin !== null) zeilen = zeilen.filter((b) => b.lead !== null && b.lead >= lmin);
  if (lmax !== null) zeilen = zeilen.filter((b) => b.lead !== null && b.lead <= lmax);

  if (groesse) zeilen = zeilen.filter((b) => b.groesse === groesse);
  if (scan === 'nein') zeilen = zeilen.filter((b) => !b.stufe);
  if (scan === '1')    zeilen = zeilen.filter((b) => b.stufe === 1);
  if (scan === '2')    zeilen = zeilen.filter((b) => b.stufe === 2);
  if (report === 'ja') zeilen = zeilen.filter((b) => b.report);
  if (report === 'nein') zeilen = zeilen.filter((b) => !b.report);

  const nach = p.get('sortiere') || 'lead';
  const feld = { lead: 'lead', qualitaet: 'qualitaet', name: 'name', groesse: 'groesse' }[nach] || 'lead';
  zeilen.sort((a, b) => feld === 'name' || feld === 'groesse'
    ? String(a[feld]).localeCompare(String(b[feld]))
    : (b[feld] ?? -1) - (a[feld] ?? -1) || a.name.localeCompare(b.name));

  res.status(200).json({ gesamt: zeilen.length, zeilen: zeilen.slice(0, 400) });
}
