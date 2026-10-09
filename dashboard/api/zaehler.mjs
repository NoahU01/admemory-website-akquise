/* Zähler für die Navigation und die Kennzahlen im Kopf.
   Bewusst ungefiltert — sonst stünde jeder Eintrag außer dem offenen auf null. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

const STATUS = ['entwurf_gebaut', 'geantwortet', 'freigegeben', 'feedback_gegeben',
                'gescannt', 'versendet', 'kunde', 'neu', 'pausiert', 'abgelehnt'];

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const db = datenbank();
    const zaehle = async (bauen) => (await bauen(db.from('unternehmen').select('*', { count: 'exact', head: true }))).count ?? 0;

    const [paare, gesamt, bewertet, gross, gesperrt] = await Promise.all([
      Promise.all(STATUS.map(async (st) => [st, await zaehle((q) => q.eq('status', st).not('quality_score', 'is', null))])),
      zaehle((q) => q),
      zaehle((q) => q.not('quality_score', 'is', null)),
      zaehle((q) => q.in('groesse_stufe', ['mittelstand', 'etabliert']).not('quality_score', 'is', null)),
      zaehle((q) => q.eq('scan_unvollstaendig', true)),
    ]);

    /* Das Potenzial ist die Summe der oberen Preisgrenzen aller bewerteten
       Betriebe — eine Obergrenze, kein Umsatzversprechen. */
    let potenzial = 0;
    for (let von = 0; ; von += 1000) {
      const { data } = await db.from('unternehmen').select('preis_bis')
        .not('preis_bis', 'is', null).range(von, von + 999);
      if (!data?.length) break;
      potenzial += data.reduce((s, r) => s + (r.preis_bis ?? 0), 0);
      if (data.length < 1000) break;
    }

    res.status(200).json({
      nachStatus: Object.fromEntries(paare.filter(([, n]) => n > 0)),
      kennzahlen: { gesamt, bewertet, gross, gesperrt, potenzial },
    });
  } catch (e) { fehlerAntwort(res, e); }
}
