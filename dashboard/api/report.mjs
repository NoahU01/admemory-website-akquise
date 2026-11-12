/* Report bauen — der Knopf aus der Tabelle.

   Das geht nur lokal, und zwar aus einem handfesten Grund: Ein Report
   braucht Chrome für die Screenshots, Lighthouse für die Technik und die
   Dateien unter results/. Auf einer Serverless-Funktion gibt es nichts
   davon, und ein Scan dauert länger, als eine solche Funktion laufen darf.

   Zwei Wege:
     Stufe-2-Scan liegt vor  → nur der Report, rund 17 Sekunden
     liegt nicht vor         → erst scannen (~50 s, ~11 ct), dann Report     */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { WURZEL, REPORTS, koerper } from './_daten.mjs';

const laufe = promisify(execFile);
const HEIM = process.env.HOME || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Nur POST' });
  const { host, pdf = false, neuScannen = false } = await koerper(req);
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host))
    return res.status(400).json({ fehler: 'Kein gültiger Host' });

  const schritte = [];
  try {
    const scanDatei = path.join(WURZEL, 'results', host, 'scan.json');
    if (neuScannen || !fs.existsSync(scanDatei)) {
      schritte.push('Vollscan läuft');
      await laufe(process.execPath, ['scan.mjs', host],
        { cwd: WURZEL, timeout: 240000, maxBuffer: 10 << 20 });
    }
    if (!fs.existsSync(scanDatei))
      return res.status(502).json({ fehler: 'Der Scan hat kein Ergebnis geliefert.', schritte });

    schritte.push('Report wird gebaut');
    await laufe(process.execPath, ['kundenreport.mjs', host],
      { cwd: WURZEL, timeout: 180000, maxBuffer: 10 << 20 });

    const seite = path.join(REPORTS, host, 'index.html');
    if (!fs.existsSync(seite))
      return res.status(502).json({ fehler: 'Der Report wurde nicht geschrieben.', schritte });

    let pdfPfad = null;
    if (pdf) {
      schritte.push('PDF wird gesetzt');
      pdfPfad = await bauePdf(seite, host);
    }
    res.status(200).json({ ok: true, host, schritte,
      ansehen: `/report/${host}/`, pdf: pdfPfad ? pdfPfad.replace(HEIM, '~') : null });
  } catch (e) {
    const text = String(e.stderr || e.message || e).slice(0, 300);
    res.status(500).json({ fehler: text, schritte });
  }
}

/* Das PDF landet im Download-Ordner, weil Noah es von dort verschickt.
   Die Seite bringt ihre Seitenränder selbst mit, deshalb keine bei Chrome. */
async function bauePdf(seite, host) {
  const { default: puppeteer } = await import('puppeteer-core');
  const chrome = process.env.CHROME_PATH
    || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  try {
    const p = await browser.newPage();
    await p.goto('file://' + seite, { waitUntil: 'networkidle0', timeout: 60000 });
    await p.evaluate(() => document.fonts.ready);
    const ziel = path.join(HEIM, 'Downloads', `AdMemory-Website-Analyse ${host}.pdf`);
    await p.pdf({ path: ziel, format: 'A4', printBackground: true });
    return ziel;
  } finally { await browser.close(); }
}
