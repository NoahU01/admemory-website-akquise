/* Die Arbeitsliste. Standardmäßig nach Dringlichkeit sortiert, nicht nach
   Lead-Wert: Was auf Noah wartet, steht oben — ein gebauter Entwurf, der
   geprüft werden muss, ist wichtiger als ein guter Lead ohne Entwurf. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

const RANG = { entwurf_gebaut: 1, geantwortet: 2, freigegeben: 3, feedback_gegeben: 4,
               gescannt: 5, versendet: 6, kunde: 7, neu: 8, pausiert: 9, abgelehnt: 10 };

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const p = new URL(req.url, 'http://x').searchParams;
    const db = datenbank();

    let q = db.from('unternehmen').select(
      'id,name,website,branche,stadt,status,quality_score,lead_score,groesse_stufe,groesse_score,' +
      'preis_von,preis_bis,score_eindruck,score_mobil,scan_stufe,scan_unvollstaendig,entwurf_url,' +
      'landingpage_url,letzter_scan,mail_gesendet_am,google_rating,google_reviews,befunde,feedback');

    if (p.get('branche'))  q = q.eq('branche', p.get('branche'));
    if (p.get('status'))   q = q.eq('status', p.get('status'));
    if (p.get('groesse'))  q = q.in('groesse_stufe', p.get('groesse').split(','));
    if (p.get('minLead'))  q = q.gte('lead_score', Number(p.get('minLead')));
    if (p.get('suche'))    q = q.or(`name.ilike.%${p.get('suche')}%,website.ilike.%${p.get('suche')}%`);
    if (p.get('nurBewertet') === '1') q = q.not('quality_score', 'is', null);

    // Supabase gibt höchstens 1000 Zeilen je Abfrage
    const zeilen = [];
    for (let von = 0; ; von += 1000) {
      const { data, error } = await q.range(von, von + 999);
      if (error) throw new Error(error.message);
      zeilen.push(...data);
      if (data.length < 1000 || zeilen.length >= 3000) break;
    }

    // Befundzahlen verdichten, den vollen Text erst in der Detailansicht
    const liste = zeilen.map((r) => {
      const b = Array.isArray(r.befunde) ? r.befunde : [];
      const { befunde, feedback, ...rest } = r;
      return { ...rest,
        befunde_schwer: b.filter((f) => f.severity === 'high').length,
        befunde_gesamt: b.length,
        feedback_runden: Array.isArray(feedback) ? feedback.length : 0 };
    });

    const sortiert = p.get('sortierung') === 'lead'
      ? liste.sort((a, b) => (b.lead_score ?? -1) - (a.lead_score ?? -1))
      : liste.sort((a, b) => (RANG[a.status] ?? 99) - (RANG[b.status] ?? 99)
                          || (b.lead_score ?? -1) - (a.lead_score ?? -1));

    // Die Zähler je Status liefert /api/zaehler — ungefiltert, für die Reiter.

    res.status(200).json({ anzahl: sortiert.length, betriebe: sortiert.slice(0, 500) });
  } catch (e) { fehlerAntwort(res, e); }
}
