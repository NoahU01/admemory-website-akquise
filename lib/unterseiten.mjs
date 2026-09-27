/* Wählt aus den Links der Startseite die zwei Unterseiten, die für die
   Bewertung am meisten hergeben. Nicht die meistverlinkten, sondern die, die
   ein Interessent tatsächlich ansteuert:
     1. das Angebot (Speisekarte / Leistungen / Sortiment — je nach Branche)
     2. Kontakt oder Über uns
   Rechtstexte (Impressum, Datenschutz) werden bewusst übersprungen: Sie sagen
   nichts über Design oder Inhalt und werden ohnehin global geprüft. */
import { profilVon } from './branchen.mjs';

const AUSSCHLUSS = /impressum|datenschutz|privacy|agb|cookie|sitemap|login|anmeld|warenkorb|cart|checkout|jobs?|karriere|stellenangebot|presse|newsletter|blog\/|\/feed|\.pdf$|\.jpe?g$|\.png$|\.zip$|^mailto:|^tel:/i;
const KONTAKT = /kontakt|anfahrt|standort|so finden sie uns|über uns|ueber-uns|about|team|wir über uns|praxis|unternehmen/i;

export function waehleUnterseiten(dom, finalUrl, brancheKey, max = 2) {
  const P = profilVon(brancheKey);
  let host;
  try { host = new URL(finalUrl).hostname.replace(/^www\./, ''); } catch { return []; }

  const kandidaten = new Map();          // URL → bester Treffer
  for (const l of dom.links || []) {
    let u;
    try { u = new URL(l.href); } catch { continue; }
    if (u.hostname.replace(/^www\./, '') !== host) continue;       // nur eigene Domain
    if (AUSSCHLUSS.test(u.pathname + ' ' + l.text)) continue;
    const pfad = u.pathname.replace(/\/+$/, '');
    if (!pfad || pfad === '/index.html' || pfad === '/index.php') continue;   // Startseite
    if (u.hash && pfad === new URL(finalUrl).pathname.replace(/\/+$/, '')) continue; // Anker auf sich selbst

    const text = l.text || '';
    let rang = 0, grund = '';
    if (P.angebot.test(text) || P.angebot.test(pfad)) { rang = 3; grund = 'Angebot'; }
    else if (KONTAKT.test(text) || KONTAKT.test(pfad)) { rang = 2; grund = 'Kontakt / Über uns'; }
    else if (P.abschluss.test(text)) { rang = 1; grund = 'Abschluss'; }
    // Fallback: Hauptnavigation. Viele Betriebe benennen ihre Leistungsseiten nach
    // dem Gewerk ("Fassaden", "Innenraumgestaltung") statt "Leistungen" — ohne das
    // fände der Scanner bei ihnen gar keine Unterseite.
    else if (l.inNav && !l.inFooter && text.length >= 3) { rang = 0.5; grund = 'aus der Navigation'; }
    if (!rang) continue;

    const key = u.origin + pfad;
    const bisher = kandidaten.get(key);
    if (!bisher || rang > bisher.rang) kandidaten.set(key, { url: key, rang, grund, text: text.slice(0, 50) });
  }

  const sortiert = [...kandidaten.values()].sort((a, b) => b.rang - a.rang);

  // Erst je Grund die beste Seite — so wird nicht zweimal dasselbe gescannt.
  const gewaehlt = [];
  const gruende = new Set();
  for (const k of sortiert) {
    if (gewaehlt.length >= max) break;
    if (gruende.has(k.grund)) continue;
    gruende.add(k.grund); gewaehlt.push(k);
  }
  // Bleibt Platz (etwa bei Betrieben, die nur Leistungsseiten haben), mit den
  // nächstbesten auffüllen statt eine Seite ungenutzt zu lassen.
  for (const k of sortiert) {
    if (gewaehlt.length >= max) break;
    if (!gewaehlt.includes(k)) gewaehlt.push(k);
  }
  return gewaehlt;
}
