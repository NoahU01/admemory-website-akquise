/* Bilder aus dem bestehenden Auftritt in den Entwurf holen.

   Warum kopieren statt verlinken: Ein verlinktes Bild wird bei jedem Aufruf
   vom Server des Betriebs geladen. Das taucht dort im Protokoll auf — der
   Betrieb kann also sehen, dass jemand seine Bilder einbindet, bevor die Mail
   überhaupt ankommt. Dazu kostet es Ladezeit: Beim ersten Entwurf erschien der
   Hauptinhalt mobil erst nach 4,3 Sekunden, allein wegen eines 194 kB großen
   Banners von fremder Herkunft.

   Verkleinert wird mit sips, das bei macOS dabei ist. Fehlt es, werden die
   Bilder unverändert übernommen — lieber ein großes lokales Bild als ein
   verlinktes.

   Rechtliches: Die Bilder gehören dem Betrieb. Für einen nicht indexierten
   Entwurf, der diesem Betrieb gezeigt wird, ist das etwas anderes als eine
   Veröffentlichung — aber es ist Noahs Entscheidung, nicht meine. Die Herkunft
   steht deshalb in bilder/herkunft.json, damit jederzeit nachvollziehbar ist,
   was woher stammt. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/* Die Bilder stehen höchstens halb so breit wie der Inhaltsbereich (1180 px),
   also rund 570 CSS-Pixel. 1200 deckt auch Bildschirme mit doppelter Dichte. */
const MAX_BREITE = 1200;
const sipsDa = (() => {
  try { execFileSync('sips', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; }
})();

export async function holeBilder(ordner, bilder, { maxBreite = MAX_BREITE, log = () => {} } = {}) {
  const ziel = path.join(ordner, 'bilder');
  fs.mkdirSync(ziel, { recursive: true });
  const herkunft = {};
  const pfade = {};

  for (const [name, url] of Object.entries(bilder)) {
    const endung = (path.extname(new URL(url).pathname) || '.jpg').toLowerCase();
    const datei = `${name}${endung}`;
    const voll = path.join(ziel, datei);

    if (!fs.existsSync(voll)) {
      const a = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/131.0' } });
      if (!a.ok) { log(`  ${name}: HTTP ${a.status} — übersprungen`); continue; }
      fs.writeFileSync(voll, Buffer.from(await a.arrayBuffer()));
    }

    /* Verkleinern kann größer machen. Beim ersten Versuch wuchsen die Bilder
       von 189 auf 206 kB bei 30 % weniger Pixeln — sips komprimiert schlechter
       als der Encoder der Quelle. Deshalb wird in eine Kopie gerechnet, mehrere
       Qualitätsstufen probiert und nur übernommen, was wirklich kleiner ist. */
    const vorher = fs.statSync(voll).size;
    if (sipsDa) {
      let bestes = null, bestGroesse = vorher;
      for (const q of [60, 45, 35]) {
        const probe = voll + `.p${q}`;
        try {
          fs.copyFileSync(voll, probe);
          execFileSync('sips', ['-Z', String(maxBreite), '-s', 'format', 'jpeg',
                                '-s', 'formatOptions', String(q), probe], { stdio: 'ignore' });
          const g = fs.statSync(probe).size;
          if (g < bestGroesse) { if (bestes) fs.unlinkSync(bestes); bestes = probe; bestGroesse = g; }
          else fs.unlinkSync(probe);
        } catch { try { fs.unlinkSync(probe); } catch {} }
      }
      if (bestes) fs.renameSync(bestes, voll);
    }
    const nachher = fs.statSync(voll).size;
    const masse = sipsDa ? mass(voll) : null;

    pfade[name] = `bilder/${datei}`;
    herkunft[datei] = { quelle: url, geholt: new Date().toISOString().slice(0, 10),
                        bytes: nachher, ...(masse ?? {}) };
    const spar = vorher > nachher ? ` (−${Math.round((1 - nachher / vorher) * 100)} %)` : ' (unverändert)';
    log(`  ${name.padEnd(12)} ${(vorher / 1024).toFixed(0)} kB → ${(nachher / 1024).toFixed(0)} kB${spar}` +
        (masse ? `  ${masse.breite}×${masse.hoehe}` : ''));
  }

  fs.writeFileSync(path.join(ziel, 'herkunft.json'), JSON.stringify(herkunft, null, 1));
  return { pfade, herkunft };
}

/* Maße auslesen, damit die Bausteine das richtige Seitenverhältnis setzen
   können. Beim ersten Entwurf waren alle Quellbilder 1920×500 und wurden in
   ein 16:9-Fenster gezwängt — sichtbar war dann ein schmaler Streifen. */
export function mass(datei) {
  if (!sipsDa) return null;
  try {
    const a = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', datei], { encoding: 'utf8' });
    const b = +(/pixelWidth:\s*(\d+)/.exec(a)?.[1] ?? 0);
    const h = +(/pixelHeight:\s*(\d+)/.exec(a)?.[1] ?? 0);
    return b && h ? { breite: b, hoehe: h, verhaeltnis: `${b}/${h}` } : null;
  } catch { return null; }
}
