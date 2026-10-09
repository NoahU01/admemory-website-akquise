/* Bot-Schutz erkennen.

   bierschneider.de stand mit Lead 60 an der Spitze der ganzen Tabelle — der
   Scanner hatte eine Cloudflare-Seite "Sorry, you have been blocked" bewertet.
   Eine Sperrseite bekommt naturgemäß null Punkte für Gestaltung und Inhalt, und
   je schlechter die Bewertung, desto höher der Lead-Wert. Der Algorithmus
   belohnte damit ausgerechnet die Seiten, die uns nicht hereinlassen.

   Eine gesperrte Seite ist kein Befund über den Betrieb. Sie wird als solche
   gekennzeichnet, nicht bewertet. */

const TITEL = /^(attention required|just a moment|please wait|checking your browser|access denied|sorry, you have been blocked|403 forbidden|security check|verify you are human|bot verification|einen moment|nur einen moment|zugriff verweigert)/i;

const TEXT = /you have been blocked|cloudflare ray id|enable cookies and reload|checking if the site connection is secure|verify you are human|ddos protection by|performance & security by cloudflare|this website is using a security service to protect itself|request blocked|access to this page has been denied|zugriff auf diese seite wurde verweigert|bitte aktivieren sie javascript und cookies/i;

export function erkenneSperre({ dom = {}, status = 200 } = {}) {
  const titel = String(dom.title || '').trim();
  const text  = String(dom.text  || '');

  if (status === 403 || status === 429) return `HTTP ${status} — Zugriff gesperrt`;
  if (TITEL.test(titel)) return `Bot-Schutz: „${titel.slice(0, 60)}"`;

  /* Im Text nur dann, wenn die Seite auch kurz ist: Ein Impressum darf
     "Cloudflare" erwähnen, ohne dass die Seite gesperrt wäre. */
  if (TEXT.test(text) && text.length < 3000) return 'Bot-Schutz: Sperrseite statt Inhalt';

  // Praktisch leere Seite trotz erfolgreicher Antwort
  if (status < 400 && text.replace(/\s+/g, '').length < 60 && !(dom.imgs?.length))
    return 'Seite lieferte keinen Inhalt';

  return null;
}
