/* Alles für die Übersichtsseite in einer Anfrage: Wo steht die Pipeline, was
   wartet auf wen, was wurde verbraucht, was kam zurück. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

const PHASEN = [
  { key: 'neu',              label: 'Gesammelt',        hinweis: 'noch nicht bewertet' },
  { key: 'gescannt',         label: 'Bewertet',         hinweis: 'warten auf einen Entwurf' },
  { key: 'entwurf_gebaut',   label: 'Entwurf da',       hinweis: 'warten auf dich' },
  { key: 'feedback_gegeben', label: 'Feedback gegeben', hinweis: 'wartet auf den Agenten' },
  { key: 'freigegeben',      label: 'Freigegeben',      hinweis: 'Mail kann raus' },
  { key: 'versendet',        label: 'Versendet',        hinweis: 'Antwort steht aus' },
  { key: 'geantwortet',      label: 'Geantwortet',      hinweis: 'warten auf dich' },
  { key: 'kunde',            label: 'Kunde',            hinweis: 'gewonnen' },
  { key: 'abgelehnt',        label: 'Abgelehnt',        hinweis: '' },
  { key: 'pausiert',         label: 'Zurückgestellt',   hinweis: '' },
];

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const db = datenbank();
    const zaehle = async (bauen) => (await bauen(db.from('unternehmen').select('*', { count: 'exact', head: true }))).count ?? 0;

    const [pipeline, gesamt, bewertet, gross, gesperrt, schnell, voll] = await Promise.all([
      Promise.all(PHASEN.map(async (p) => ({ ...p, anzahl: await zaehle((q) => q.eq('status', p.key)) }))),
      zaehle((q) => q),
      zaehle((q) => q.not('quality_score', 'is', null)),
      zaehle((q) => q.in('groesse_stufe', ['mittelstand', 'etabliert']).not('quality_score', 'is', null)),
      zaehle((q) => q.eq('scan_unvollstaendig', true)),
      zaehle((q) => q.eq('scan_stufe', 1).not('quality_score', 'is', null)),
      zaehle((q) => q.eq('scan_stufe', 2).not('quality_score', 'is', null)),
    ]);

    /* Offenes Potenzial: nur was noch nicht gewonnen oder abgelehnt ist. Die
       Summe über alle Betriebe wäre eine hübsche, aber nutzlose Zahl. */
    let potenzialOffen = 0, umsatz = 0, versendet = 0, geantwortet = 0;
    const verlauf = {};
    /* Die Spalten aus Migration 05 gibt es vielleicht noch nicht. Fehlt eine,
       antwortet Supabase mit einem Fehler und liefert gar nichts — die
       Übersicht stand dann stillschweigend auf null, was schlimmer ist als
       eine ehrliche Lücke. Deshalb erst mit, dann ohne. */
    let neueSpalten = true;
    const spalten = (mit) => 'status,preis_bis,mail_gesendet_am,antwort_am,letzter_scan' +
                             (mit ? ',auftragswert,entwurf_am' : '');
    for (let von = 0; ; von += 1000) {
      let { data, error } = await db.from('unternehmen').select(spalten(neueSpalten)).range(von, von + 999);
      if (error && neueSpalten) {
        neueSpalten = false;
        ({ data, error } = await db.from('unternehmen').select(spalten(false)).range(von, von + 999));
      }
      if (error) throw new Error(error.message);
      if (!data?.length) break;
      for (const r of data) {
        if (!['kunde', 'abgelehnt'].includes(r.status)) potenzialOffen += r.auftragswert ?? r.preis_bis ?? 0;
        if (r.status === 'kunde') umsatz += r.auftragswert ?? r.preis_bis ?? 0;
        if (r.mail_gesendet_am) versendet++;
        if (r.antwort_am) geantwortet++;
        // Verlauf der letzten 30 Tage nach dem jüngsten Ereignis je Betrieb
        const tag = (r.entwurf_am ?? r.mail_gesendet_am ?? r.letzter_scan)?.slice(0, 10);
        if (tag) verlauf[tag] = (verlauf[tag] ?? 0) + 1;
      }
      if (data.length < 1000) break;
    }

    // Verbrauch je Phase — fehlt die Tabelle noch, bleibt der Abschnitt leer
    let verbrauch = [], verbrauchFehlt = false;
    const { data: v, error: vf } = await db.from('uebersicht_verbrauch').select('*');
    if (vf) verbrauchFehlt = /does not exist|schema cache/i.test(vf.message);
    else verbrauch = v ?? [];

    let auftraege = [], auftraegeFehlt = false;
    const { data: a, error: af } = await db.from('auftraege')
      .select('art,status').in('status', ['offen', 'laeuft', 'fehler']);
    if (af) auftraegeFehlt = /does not exist|schema cache/i.test(af.message);
    else auftraege = a ?? [];

    const tage = Object.entries(verlauf).sort().slice(-30).map(([tag, n]) => ({ tag, n }));

    res.status(200).json({
      pipeline, verbrauch, verbrauchFehlt, auftraegeFehlt, neueSpalten,
      kennzahlen: {
        gesamt, bewertet, gross, gesperrt, schnell, voll, potenzialOffen, umsatz, versendet, geantwortet,
        antwortrate: versendet ? Math.round((geantwortet / versendet) * 100) : null,
        offeneAuftraege: auftraege.filter((x) => x.status !== 'fehler').length,
        fehlerAuftraege: auftraege.filter((x) => x.status === 'fehler').length,
      },
      verlauf: tage,
    });
  } catch (e) { fehlerAntwort(res, e); }
}
