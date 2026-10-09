/* Anmeldung mit einem Passwort. Ein Nutzer, ein Passwort — eine Benutzerverwaltung
   wäre hier Beiwerk. Bei Fehlversuchen wird bewusst nicht gesagt, was falsch war. */
import { passwortStimmt, keksBauen, KEKS, koerper, fehlerAntwort } from './_lib.mjs';

export default async function handler(req, res) {
  try {
    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', `${KEKS}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return res.status(200).json({ ok: true });
    }
    if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });

    const { passwort } = await koerper(req);
    if (!passwortStimmt(passwort)) {
      await new Promise((r) => setTimeout(r, 600));   // Raten unattraktiv machen
      return res.status(401).json({ fehler: 'Passwort falsch' });
    }
    res.setHeader('Set-Cookie',
      `${KEKS}=${keksBauen()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 86400}`);
    res.status(200).json({ ok: true });
  } catch (e) { fehlerAntwort(res, e); }
}
