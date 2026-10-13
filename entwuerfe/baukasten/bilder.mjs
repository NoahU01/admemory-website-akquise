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

/* breiten: je Bild eine eigene Obergrenze. Ein randloses Hero zeigt das Bild
   über die volle Fensterbreite und braucht deshalb mehr Pixel als ein Bild in
   einer halben Spalte. Mit einer Grenze für alle wurde das Hero hochgerechnet
   und unscharf. */
/* Prüfen, auf welchem Grund ein Logo überhaupt sichtbar ist.

   Logodateien von fremden Seiten sind manchmal weiße Grafik auf Transparenz,
   gedacht für dunkle Flächen. Auf weißem Grund sind sie unsichtbar. Beim
   ersten Durchlauf fiel genau das auf: Das TÜV-Logo von rolltruck.de fehlte in
   der hellen Kartenfassung und erschien nur auf dunklem Grund.

   Der Durchschnitt taugt dafür nicht: Das Vergölst-Logo ist ein gelber Kasten
   mit dunkler Schrift und kam auf 0,68, galt damit als hell und wäre fälschlich
   auf dunklen Grund gewandert. Gemessen wird deshalb der Anteil wirklich
   dunkler und wirklich heller Punkte. Fehlen die dunklen fast vollständig,
   braucht das Logo einen dunklen Grund. */
export async function messeHelligkeit(dateien) {
  let browser;
  try {
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'],
    });
    const seite = await browser.newPage();
    const werte = {};
    for (const [name, datei] of Object.entries(dateien)) {
      try {
        /* Als eingebettete Daten statt über file://: Ein Bild fremder Herkunft
           macht die Zeichenfläche unrein, und das Auslesen der Bildpunkte wird
           dann blockiert. */
        const roh = fs.readFileSync(datei);
        const typ = path.extname(datei).toLowerCase() === '.svg' ? 'image/svg+xml'
                  : path.extname(datei).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        const url = `data:${typ};base64,${roh.toString('base64')}`;
        werte[name] = await seite.evaluate(async (url) => {
          const bild = new Image();
          bild.src = url;
          await bild.decode();
          const c = document.createElement('canvas');
          const b = Math.min(bild.naturalWidth, 160);
          c.width = b; c.height = Math.max(1, Math.round(bild.naturalHeight * b / bild.naturalWidth));
          const g = c.getContext('2d', { willReadFrequently: true });
          g.drawImage(bild, 0, 0, c.width, c.height);
          const d = g.getImageData(0, 0, c.width, c.height).data;
          let dunkel = 0, hell = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;                  // durchsichtig: zählt nicht
            const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
            if (l < 0.45) dunkel++; else if (l > 0.55) hell++;
            n++;
          }
          return n ? { dunkel: +(dunkel / n).toFixed(3), hell: +(hell / n).toFixed(3) } : null;
        }, url);
      } catch { werte[name] = null; }
    }
    return werte;
  } catch { return {}; }
  finally { if (browser) await browser.close(); }
}

export async function holeBilder(ordner, bilder, { maxBreite = MAX_BREITE, breiten = {}, log = () => {} } = {}) {
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

    /* Logos und Grafiken nicht anfassen. sips würde nach JPEG wandeln und
       damit die Transparenz zerstören — ein Markenlogo bekäme einen weißen
       Kasten. SVG ist ohnehin schon klein und verlustfrei. */
    const grafik = endung === '.svg' || endung === '.png' || /logo|siegel|jahre|auszeich/i.test(name);
    if (grafik) {
      pfade[name] = `bilder/${datei}`;
      herkunft[datei] = { quelle: url, geholt: new Date().toISOString().slice(0, 10),
                          bytes: vorher, unveraendert: true };
      log(`  ${name.padEnd(14)} ${(vorher / 1024).toFixed(0)} kB  (Grafik, unverändert)`);
      continue;
    }

    if (sipsDa) {
      let bestes = null, bestGroesse = vorher;
      for (const q of [60, 45, 35]) {
        const probe = voll + `.p${q}`;
        try {
          fs.copyFileSync(voll, probe);
          execFileSync('sips', ['-Z', String(breiten[name] ?? maxBreite), '-s', 'format', 'jpeg',
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

  /* Helligkeit nachmessen und festhalten, welche Logos eine dunkle Fläche
     brauchen. Nur für Grafiken: Bei Fotos sagt der Durchschnitt nichts. */
  const grafiken = Object.fromEntries(Object.entries(herkunft)
    .filter(([, v]) => v.unveraendert)
    .map(([d]) => [d, path.join(ziel, d)]));
  if (Object.keys(grafiken).length) {
    const anteile = await messeHelligkeit(grafiken);
    for (const [datei, a] of Object.entries(anteile)) {
      if (!a) continue;
      herkunft[datei].anteile = a;
      herkunft[datei].brauchtDunkel = a.dunkel < 0.04;
      if (a.dunkel < 0.04)
        log(`  ${datei.padEnd(32)} nur helle Punkte (${Math.round(a.dunkel * 100)} % dunkel), braucht dunklen Grund`);
    }
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
