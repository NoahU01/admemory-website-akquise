/* Holt das Logo eines Betriebs von dessen eigener Website.

   Noah will den Report mit dem Logo des Empfängers versehen. Das ist nicht
   schwer, aber es ist auch nicht eindeutig: Auf einer Seite stehen oft ein
   Dutzend Bilder im Kopfbereich, darunter Partnerlogos, Siegel und Icons.
   Deshalb wird nicht geraten, sondern gewichtet, und wer nichts Brauchbares
   findet, liefert null zurück statt irgendetwas. Der Report kommt ohne Logo
   aus — mit einem falschen Logo käme er nicht aus.                          */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* Im Seitenkopf nach dem Bild suchen, das am ehesten das Logo ist.
   Punkte gibt es für: steht im <header> oder in der Verlinkung auf die
   Startseite, heißt "logo", hat ein breites Seitenverhältnis, ist nicht winzig.
   Abzüge für alles, was nach Partner, Siegel, Zahlungsart oder Icon aussieht. */
const SUCHE = `(() => {
  const schlecht = /partner|siegel|award|badge|zahl|payment|icon|sprite|flag|avatar|social|facebook|instagram|tripadvisor|booking|trustpilot|sterne|stars?[-_]/i;
  const gut = /logo|wortmarke|brand|marke/i;
  const kandidaten = [];
  for (const i of document.querySelectorAll('img')) {
    const r = i.getBoundingClientRect();
    const src = i.currentSrc || i.src || '';
    if (!src || src.startsWith('data:')) continue;
    if (r.width < 40 || r.height < 12) continue;
    if (r.top > 400) continue;                       // nur der Kopfbereich
    const text = (src + ' ' + (i.alt || '') + ' ' + (i.className || '')).toLowerCase();
    let p = 0;
    if (gut.test(text)) p += 50;
    if (schlecht.test(text)) p -= 60;
    if (i.closest('header,nav')) p += 25;
    if (i.closest('a[href="/"]') || i.closest('a[href="' + location.origin + '/"]')) p += 20;
    const v = r.width / r.height;
    if (v > 1.3 && v < 9) p += 15;                   // Wortmarken sind breit
    if (r.width > 90) p += 10;
    p -= Math.round(r.top / 40);                     // weiter oben ist besser
    kandidaten.push({ src, p, b: Math.round(r.width), h: Math.round(r.height),
                      alt: (i.alt || '').slice(0, 40) });
  }
  kandidaten.sort((a, b) => b.p - a.p);
  return kandidaten.slice(0, 5);
})()`;

export async function kundenlogo(seiteUrl, zielDatei, puppeteer) {
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
    const p = await browser.newPage();
    await p.setViewport({ width: 1440, height: 900 });
    /* 'networkidle2' lief bei jeder getesteten Seite in den Timeout: Auf einer
       Betriebswebsite laufen Tracker, Karten und Chat-Widgets, da wird das Netz
       nie still. Für ein Logo im Kopfbereich genügt der geladene Baum. */
    /* Ein Zeitablauf ist hier kein Fehler, sondern der Normalfall bei genau den
       Seiten, über die wir schreiben: parkhotel-ilshofen.com laedt 16 MB und
       braucht 9 Sekunden. Wenn der Baum steht, genuegt uns das — also wird der
       Abbruch geschluckt und danach geprueft, ob etwas da ist. */
    try { await p.goto(seiteUrl, { waitUntil: 'domcontentloaded', timeout: 25000 }); }
    catch (e) { if (!/timeout/i.test(String(e.message))) throw e; }
    await new Promise((r) => setTimeout(r, 3000));   // Bilder nachladen lassen
    const bilderDa = await p.evaluate(() => document.images.length).catch(() => 0);
    if (!bilderDa) return { pfad: null, grund: 'Seite nicht geladen' };
    const treffer = await p.evaluate(SUCHE);
    if (!treffer.length || treffer[0].p < 40) return { pfad: null, grund: 'kein eindeutiges Logo gefunden', treffer };

    const best = treffer[0];
    /* Die Datei wird geholt, nicht angesteuert. Ein p.goto() auf die Bild-URL
       verlaesst die Seite und lief bei parkhotel-ilshofen.com in den Timeout —
       dabei war das Logo da, nur der Abruf stolperte. */
    let roh;
    try {
      const r = await fetch(best.src, { headers: { referer: seiteUrl }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) return { pfad: null, grund: `Logo-Abruf HTTP ${r.status}`, treffer };
      roh = Buffer.from(await r.arrayBuffer());
    } catch (e) { return { pfad: null, grund: 'Logo-Abruf: ' + String(e.message).slice(0, 60), treffer }; }
    if (roh.length < 200) return { pfad: null, grund: 'Logo-Datei leer', treffer };

    fs.mkdirSync(path.dirname(zielDatei), { recursive: true });
    const istSvg = /\.svg(\?|$)/i.test(best.src) || /^\s*<(\?xml|svg)/i.test(roh.slice(0, 80).toString());
    if (istSvg) {
      const svgZiel = zielDatei.replace(/\.[a-z]+$/i, '.svg');
      fs.writeFileSync(svgZiel, roh);
      return { pfad: svgZiel, quelle: best.src, mass: `${best.b}×${best.h}`, treffer };
    }
    /* Als PNG ablegen und auf Druckgröße bringen. Die Transparenz bleibt
       erhalten, deshalb PNG und nicht JPEG: Ein Logo mit weißem Kasten
       darunter sieht auf farbigem Grund falsch aus. */
    const tmp = zielDatei + '.roh';
    fs.writeFileSync(tmp, roh);
    execFileSync('sips', ['-Z', '600', '-s', 'format', 'png', tmp, '--out', zielDatei], { stdio: 'ignore' });
    fs.unlinkSync(tmp);
    return { pfad: zielDatei, quelle: best.src, mass: `${best.b}×${best.h}`, treffer };
  } catch (e) {
    return { pfad: null, grund: String(e.message || e).slice(0, 90) };
  } finally { try { await browser?.close(); } catch {} }
}
