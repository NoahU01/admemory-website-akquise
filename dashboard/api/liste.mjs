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

    /* Aus der Ansicht statt aus der Tabelle: Sie zählt Befunde und
       Feedback-Runden in der Datenbank. Vorher kamen 1103 Zeilen samt aller
       Befundtexte über die Leitung — rund 4 MB, nur um Zahlen anzuzeigen. */
    /* scan_stufe und auftragswert kommen erst mit Migration 05 in die Ansicht.
       Fehlen sie, fällt die Abfrage auf den älteren Satz zurück, statt die
       ganze Seite auf "Serverfehler" laufen zu lassen. */
    let neueFelder = true;
    const bauen = () => {
      let q = db.from('arbeitsliste').select(
        'id,name,website,branche,stadt,status,qualitaet,lead,groesse_stufe,groesse_score,' +
        'preis_von,preis_bis,score_eindruck,score_mobil,' +
        'scan_unvollstaendig,entwurf_url,letzter_scan,mail_gesendet_am,' +
        'google_rating,google_reviews,befunde,schwere_befunde,feedback_runden' +
        (neueFelder ? ',auftragswert,scan_stufe' : ''));
      if (p.get('branche'))  q = q.eq('branche', p.get('branche'));
      if (p.get('status'))   q = q.eq('status', p.get('status'));
      if (p.get('groesse'))  q = q.in('groesse_stufe', p.get('groesse').split(','));
      if (p.get('minLead'))  q = q.gte('lead', Number(p.get('minLead')));
      if (p.get('suche'))    q = q.or(`name.ilike.%${p.get('suche')}%,website.ilike.%${p.get('suche')}%`);
      if (p.get('nurBewertet') === '1') q = q.not('qualitaet', 'is', null);
      return q;
    };

    const zeilen = [];
    for (let von = 0; ; von += 1000) {
      let { data, error } = await bauen().range(von, von + 999);
      if (error && neueFelder) { neueFelder = false; ({ data, error } = await bauen().range(von, von + 999)); }
      if (error) throw new Error(error.message);
      zeilen.push(...data);
      if (data.length < 1000 || zeilen.length >= 3000) break;
    }

    // Die Ansicht nennt die Felder anders — die Oberfläche soll das nicht wissen
    const liste = zeilen.map((r) => ({
      ...r,
      quality_score: r.qualitaet, lead_score: r.lead,
      befunde_schwer: r.schwere_befunde ?? 0, befunde_gesamt: r.befunde ?? 0,
    }));

    const sortiert = p.get('sortierung') === 'lead'
      ? liste.sort((a, b) => (b.lead_score ?? -1) - (a.lead_score ?? -1))
      : liste.sort((a, b) => (RANG[a.status] ?? 99) - (RANG[b.status] ?? 99)
                          || (b.lead_score ?? -1) - (a.lead_score ?? -1));

    // Die Zähler je Status liefert /api/zaehler — ungefiltert, für die Reiter.

    res.status(200).json({ anzahl: sortiert.length, betriebe: sortiert.slice(0, 300) });
  } catch (e) { fehlerAntwort(res, e); }
}
