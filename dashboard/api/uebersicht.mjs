/* Alles für die Übersichtsseite in einer Anfrage: Wo steht die Pipeline, was
   wartet auf wen, was wurde verbraucht, was kam zurück. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

/* Der Funnel ist kumulativ: Jede Stufe enthält alle, die weiter sind. Vorher
   waren es sich ausschließende Status — "Gesammelt 113" neben "Bewertet 990"
   las sich wie zwei getrennte Töpfe, obwohl die 990 ja auch gescraped wurden. */
const STUFEN = [
  { key: 'scraped',   label: 'Scraped',     hinweis: 'von Google geholt' },
  { key: 'bewertet',  label: 'Bewertet',    hinweis: 'Website geprüft, Score vorhanden' },
  { key: 'phase2',    label: 'Phase 2',     hinweis: 'vollbewertet — belastbar für einen Pitch' },
  { key: 'entwurf',   label: 'Entwurf',     hinweis: 'Seite nachgebaut' },
  { key: 'versendet', label: 'Versendet',   hinweis: 'Mail ist raus' },
  { key: 'antwort',   label: 'Geantwortet', hinweis: 'Rückmeldung erhalten' },
  { key: 'kunde',     label: 'Kunde',       hinweis: 'gewonnen' },
];

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const db = datenbank();
    const zaehle = async (bauen) => (await bauen(db.from('unternehmen').select('*', { count: 'exact', head: true }))).count ?? 0;

    const NACH_ENTWURF = ['entwurf_gebaut', 'feedback_gegeben', 'freigegeben',
                          'versendet', 'geantwortet', 'kunde'];
    const [gesamt, bewertet, gross, gesperrt, schnell, voll,
           mitEntwurf, mitMail, mitAntwort, kunden, wartend] = await Promise.all([
      zaehle((q) => q),
      zaehle((q) => q.not('quality_score', 'is', null)),
      zaehle((q) => q.in('groesse_stufe', ['mittelstand', 'etabliert']).not('quality_score', 'is', null)),
      zaehle((q) => q.eq('scan_unvollstaendig', true)),
      zaehle((q) => q.eq('scan_stufe', 1).not('quality_score', 'is', null)),
      zaehle((q) => q.eq('scan_stufe', 2).not('quality_score', 'is', null)),
      zaehle((q) => q.in('status', NACH_ENTWURF)),
      zaehle((q) => q.not('mail_gesendet_am', 'is', null)),
      zaehle((q) => q.not('antwort_am', 'is', null)),
      zaehle((q) => q.eq('status', 'kunde')),
      zaehle((q) => q.in('status', ['entwurf_gebaut', 'geantwortet'])),
    ]);

    const funnel = [
      { ...STUFEN[0], anzahl: gesamt },
      { ...STUFEN[1], anzahl: bewertet },
      { ...STUFEN[2], anzahl: voll },
      { ...STUFEN[3], anzahl: mitEntwurf },
      { ...STUFEN[4], anzahl: mitMail },
      { ...STUFEN[5], anzahl: mitAntwort },
      { ...STUFEN[6], anzahl: kunden },
    ];

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
      funnel, verbrauch, verbrauchFehlt, auftraegeFehlt, neueSpalten,
      kennzahlen: {
        gesamt, bewertet, gross, gesperrt, schnell, voll, wartend,
        potenzialOffen, umsatz, versendet, geantwortet,
        antwortrate: versendet ? Math.round((geantwortet / versendet) * 100) : null,
        offeneAuftraege: auftraege.filter((x) => x.status !== 'fehler').length,
        fehlerAuftraege: auftraege.filter((x) => x.status === 'fehler').length,
      },
      verlauf: tage,
    });
  } catch (e) { fehlerAntwort(res, e); }
}
