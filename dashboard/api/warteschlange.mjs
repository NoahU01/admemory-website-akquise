/* Was der Agent noch abzuarbeiten hat — im Dashboard als Fußzeile sichtbar,
   damit Noah weiß, ob sein Klick angekommen ist und noch wartet. */
import { datenbank, angemeldet, fehlerAntwort } from './_lib.mjs';

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  try {
    const { data, error } = await datenbank().from('auftragsliste')
      .select('id,art,status,name,website,anweisung,fehler,angelegt_am,erledigt_am')
      .in('status', ['offen', 'laeuft', 'fehler']).limit(100);
    /* Solange die Migration für 'auftraege' nicht eingespielt ist, soll das
       Dashboard trotzdem benutzbar sein — dann gibt es eben keine Warteschlange. */
    if (error && /does not exist|schema cache/i.test(error.message))
      return res.status(200).json({ auftraege: [], hinweis: 'Auftragstabelle fehlt noch' });
    if (error) throw new Error(error.message);
    res.status(200).json({ auftraege: data ?? [] });
  } catch (e) { fehlerAntwort(res, e); }
}
