/* Die Tabelle: Betrieb, Bewertung, und ob ein Report vorliegt. */
import { betriebe, mitReport } from './_daten.mjs';

export default async function handler(req, res) {
  const p = new URL(req.url, 'http://x').searchParams;
  const suche = (p.get('suche') || '').trim().toLowerCase();
  const nur = p.get('nur') || 'alle';
  const reports = mitReport();

  let zeilen = betriebe().map((b) => ({ ...b, report: reports.has(b.host) }));

  if (suche) zeilen = zeilen.filter((b) =>
    (b.name + ' ' + b.host + ' ' + b.stadt + ' ' + b.branche).toLowerCase().includes(suche));
  if (nur === 'report')  zeilen = zeilen.filter((b) => b.report);
  if (nur === 'lohnend') zeilen = zeilen.filter((b) => b.lead >= 38);
  if (nur === 'voll')    zeilen = zeilen.filter((b) => b.stufe === 2);

  zeilen.sort((a, b) => (b.lead ?? -1) - (a.lead ?? -1) || a.name.localeCompare(b.name));
  res.status(200).json({ gesamt: zeilen.length, zeilen: zeilen.slice(0, 400) });
}
