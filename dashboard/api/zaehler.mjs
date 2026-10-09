/* Nur die Anzahl je Status. Die Oberfläche braucht das, bevor sie weiß, welchen
   Reiter sie öffnen soll — und zwar ungefiltert, sonst stünde jeder Reiter außer
   dem offenen auf null. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

const STATUS = ['entwurf_gebaut', 'geantwortet', 'freigegeben', 'feedback_gegeben',
                'gescannt', 'versendet', 'kunde', 'neu', 'pausiert', 'abgelehnt'];

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const db = datenbank();
    const paare = await Promise.all(STATUS.map(async (st) => {
      const { count } = await db.from('unternehmen')
        .select('*', { count: 'exact', head: true })
        .eq('status', st).not('quality_score', 'is', null);
      return [st, count ?? 0];
    }));
    res.status(200).json({ nachStatus: Object.fromEntries(paare.filter(([, n]) => n > 0)) });
  } catch (e) { fehlerAntwort(res, e); }
}
