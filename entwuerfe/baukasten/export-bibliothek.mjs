/* Schreibt die Bibliothek fürs Dashboard: ein Bild je Baustein und eine
   JSON-Datei mit den Beschreibungen. Quelle sind die Prüfseiten selbst —
   so kann die Bibliothek nicht von den Bausteinen abweichen.

   Aufruf: node entwuerfe/baukasten/export-bibliothek.mjs                 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { GRUPPEN, BAUSTEINE } from './katalog.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WURZEL = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ZIEL = path.join(WURZEL, 'dashboard/assets/bibliothek');
fs.mkdirSync(ZIEL, { recursive: true });

/* Prüfseiten frisch bauen, damit die Bilder zum Stand der Bausteine passen. */
for (const g of GRUPPEN) {
  execFileSync('node', [path.join(WURZEL, 'entwuerfe', g.seite, 'bauen.mjs')], { stdio: 'pipe' });
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--allow-file-access-from-files', '--no-sandbox'] });
const fehlend = [];

for (const g of GRUPPEN) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(WURZEL, 'entwuerfe', g.seite, 'index.html'),
    { waitUntil: 'networkidle0' });
  /* Faule Bilder anstoßen und das Hereinscrollen überspringen — sonst
     stehen halb durchsichtige Logos auf den Bildern. */
  await page.evaluate(async () => {
    for (const i of document.querySelectorAll('img')) { i.loading = 'eager'; i.src = i.src; }
    /* Das Hereinscrollen setzt data-sichtbar. Wer stattdessen an den
       Kindstilen dreht, lässt halb durchsichtige Logos stehen. */
    document.querySelectorAll('[data-erscheinen]').forEach((e) => e.setAttribute('data-sichtbar', ''));
    await new Promise((r) => setTimeout(r, 2500));
  });

  for (const b of BAUSTEINE.filter((x) => x.gruppe === g.id)) {
    const el = await page.$(`[data-bsp="${b.id}"]`);
    if (!el) { fehlend.push(b.id); continue; }
    const roh = path.join(ZIEL, b.id + '.png');
    await el.screenshot({ path: roh });
    /* Als JPEG ablegen: die Ausschnitte haben ohnehin einen eigenen Grund,
       Transparenz braucht hier niemand. Gemessen 77 statt 215 kB. Behalten
       wird nur, was wirklich kleiner ist — beim ersten Verkleinern im
       Baukasten wurden die Dateien größer statt kleiner. */
    const ziel = path.join(ZIEL, b.id + '.jpg');
    const vorher = fs.statSync(roh).size;
    try {
      execFileSync('sips', ['-Z', '900', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85',
        roh, '--out', ziel], { stdio: 'pipe' });
      if (fs.statSync(ziel).size < vorher) { fs.unlinkSync(roh); b.bild = 'assets/bibliothek/' + b.id + '.jpg'; }
      else { fs.unlinkSync(ziel); b.bild = 'assets/bibliothek/' + b.id + '.png'; }
    } catch { b.bild = 'assets/bibliothek/' + b.id + '.png'; }
    const datei = path.join(WURZEL, 'dashboard', b.bild);
    b.bytes = fs.statSync(datei).size;
  }
  await page.close();
}
await browser.close();

if (fehlend.length) {
  throw new Error('Kein Beispiel mit data-bsp gefunden für: ' + fehlend.join(', ')
    + '. Auf der Prüfseite mit bsp(id, …) auszeichnen.');
}

const katalog = {
  stand: new Date().toISOString().slice(0, 10),
  gruppen: GRUPPEN.map((g) => ({ ...g,
    bausteine: BAUSTEINE.filter((b) => b.gruppe === g.id)
      .map(({ gruppe, ...rest }) => ({ ...rest, name: rest.name || rest.id })) })),
};
fs.writeFileSync(path.join(WURZEL, 'dashboard/bibliothek.json'), JSON.stringify(katalog, null, 2));

const summe = BAUSTEINE.reduce((s, b) => s + (b.bytes || 0), 0);
console.log(`${BAUSTEINE.length} Bausteine, ${(summe / 1024 / 1024).toFixed(2)} MB Bilder`);
