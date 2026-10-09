/* Ein Betrieb mit allem, was zur Beurteilung nötig ist: Einzelscores, Befunde
   nach Schwere, Größensignale, bisheriges Feedback und offene Aufträge. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const id = new URL(req.url, 'http://x').searchParams.get('id');
    if (!id) return res.status(400).json({ fehler: 'id fehlt' });
    const db = datenbank();

    const { data: u, error } = await db.from('unternehmen').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ fehler: 'Betrieb nicht gefunden' });

    const { data: auftraege } = await db.from('auftraege')
      .select('id,art,status,anweisung,ergebnis,fehler,angelegt_am,erledigt_am')
      .eq('unternehmen_id', id).order('angelegt_am', { ascending: false }).limit(20);

    const befunde = Array.isArray(u.befunde) ? u.befunde : [];
    const ordnung = { high: 0, medium: 1, low: 2 };

    // scan_details trägt Screenshots und Rohwerte — für die Übersicht zu groß
    const { scan_details, befunde: _, ...rest } = u;

    res.status(200).json({
      ...rest,
      befunde: befunde.sort((a, b) => (ordnung[a.severity] ?? 9) - (ordnung[b.severity] ?? 9)),
      kategorien: scan_details?.kategorien
        ? Object.fromEntries(Object.entries(scan_details.kategorien).map(([k, v]) => [k, v.score]))
        : null,
      seiten_geprueft: u.seiten_geprueft,
      auftraege: auftraege ?? [],
    });
  } catch (e) { fehlerAntwort(res, e); }
}
