/* Prüft beim Seitenaufruf nur, ob die Anmeldung noch gilt. Bewusst ohne
   Datenbankzugriff, damit die Oberfläche auch dann startet, wenn eine Migration
   noch nicht eingespielt ist. */
import { angemeldet } from './_lib.mjs';

export default async function handler(req, res) {
  if (!angemeldet(req, res)) return;
  res.status(200).json({ ok: true });
}
