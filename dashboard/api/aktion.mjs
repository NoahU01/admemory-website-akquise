/* Alles, was Noah auslöst: Status setzen, Feedback schreiben, Auftrag anlegen.
   Statusänderungen und Aufträge bleiben getrennt — ein Status beschreibt, wo
   der Betrieb steht, ein Auftrag ist Arbeit für den Agenten. */
import { datenbank, angemeldet, koerper, fehlerAntwort } from './_lib.mjs';

const STATUS = ['neu', 'gescannt', 'entwurf_gebaut', 'feedback_gegeben', 'freigegeben',
                'versendet', 'geantwortet', 'kunde', 'abgelehnt', 'pausiert'];
const ARTEN = ['entwurf_bauen', 'entwurf_neu_bauen', 'scan_stufe2', 'mail_vorbereiten'];

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  try {
    const { id, was, wert, anweisung } = await koerper(req);
    if (!id) return res.status(400).json({ fehler: 'id fehlt' });
    const db = datenbank();

    if (was === 'status') {
      if (!STATUS.includes(wert)) return res.status(400).json({ fehler: 'unbekannter Status' });
      const felder = { status: wert };
      if (wert === 'versendet') felder.mail_gesendet_am = new Date().toISOString();
      if (wert === 'geantwortet') felder.antwort_am = new Date().toISOString();
      const { error } = await db.from('unternehmen').update(felder).eq('id', id);
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true, status: wert });
    }

    if (was === 'feedback') {
      const text = String(anweisung ?? '').trim();
      if (!text) return res.status(400).json({ fehler: 'Text fehlt' });
      /* Feedback wird angehängt, nie überschrieben: Der Agent soll sehen, was
         in welcher Runde gewünscht war, und Noah soll nachlesen können, was er
         schon gesagt hat. */
      const { data: vorher } = await db.from('unternehmen').select('feedback').eq('id', id).single();
      const liste = Array.isArray(vorher?.feedback) ? vorher.feedback : [];
      liste.push({ text, am: new Date().toISOString(), runde: liste.length + 1 });
      const { error } = await db.from('unternehmen')
        .update({ feedback: liste, status: 'feedback_gegeben' }).eq('id', id);
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true, runden: liste.length });
    }

    if (was === 'wert') {
      /* Der Preisrahmen ist aus der Betriebsgröße geschätzt. Sobald Noah eine
         Zahl im Kopf hat oder ein Angebot geschrieben ist, gilt seine. */
      const betrag = wert === null || wert === '' ? null : Number(wert);
      if (betrag !== null && (!Number.isFinite(betrag) || betrag < 0 || betrag > 1_000_000))
        return res.status(400).json({ fehler: 'Betrag nicht plausibel' });
      const { error } = await db.from('unternehmen')
        .update({ auftragswert: betrag === null ? null : Math.round(betrag) }).eq('id', id);
      if (error && /column .*auftragswert/i.test(error.message))
        return res.status(400).json({ fehler: 'Spalte fehlt — Migration 05 einspielen' });
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true, auftragswert: betrag });
    }

    if (was === 'auftrag') {
      if (!ARTEN.includes(wert)) return res.status(400).json({ fehler: 'unbekannte Auftragsart' });
      const { data, error } = await db.from('auftraege')
        .insert({ unternehmen_id: id, art: wert, anweisung: anweisung || null })
        .select('id,art,status').single();
      // Ein zweiter Klick auf 'bauen' soll nicht doppelt bauen lassen
      if (error && /duplicate key|unique/i.test(error.message))
        return res.status(200).json({ ok: true, hinweis: 'Auftrag lag schon offen vor' });
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true, auftrag: data });
    }

    res.status(400).json({ fehler: 'unbekannte Aktion' });
  } catch (e) { fehlerAntwort(res, e); }
}
