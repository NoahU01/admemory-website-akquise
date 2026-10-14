#!/usr/bin/env node
/* Fotografiert Vorbildseiten ab, damit wir Muster daraus ableiten können.

     node werkstatt/vorbilder-holen.mjs            alle aus der Liste
     node werkstatt/vorbilder-holen.mjs linear.app nur passende

   Abgelegt wird nach <ziel>/<name>/: ganz.jpg (die ganze Seite), nav.jpg
   (der Kopf), und knoepfe.json (jede Schaltfläche mit Maßen, Radius,
   Farben, Schrift). Nichts davon kommt ins Repo — es ist Material zum
   Hinsehen, keine Vorlage zum Kopieren.                                   */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ZIEL = process.env.VORBILDER_ZIEL
  || path.join(process.env.TMPDIR || '/tmp', 'vorbilder');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const SEITEN = [
  ['personio',        'https://www.personio.de/'],
  ['senger',          'https://www.senger-mobility.de/'],
  ['porsche-consult', 'https://www.porsche-consulting.com/international/en/homepage'],
  ['webflow',         'https://webflow.com/'],
  ['linear',          'https://linear.app/'],
  ['ramp',            'https://ramp.com/'],
  ['almato',          'https://www.almato.com/de/'],
  ['stego',           'https://www.stego.de/'],
  ['maasprofile',     'https://www.maasprofile.de/'],
  ['michael-milz',    'https://michael-milz.vercel.app/'],
  ['typeform',        'https://www.typeform.com/'],
  ['apple',           'https://www.apple.com/'],
  ['sofortsichtbar',  'https://sofortsichtbar.de/'],
  ['conideo',         'https://www.conideo.com/'],
  ['admemory',        'https://admemory.de/'],
];

const argumente = process.argv.slice(2);
/* Eine Adresse auf der Befehlszeile wird direkt genommen — sonst müsste die
   Liste für jeden einzelnen Blick wachsen. */
const frei = argumente.filter((a) => /^https?:\/\//.test(a))
  .map((u) => [new URL(u).hostname.replace(/^www\./, '').split('.')[0], u]);
const filter = argumente.filter((a) => !/^https?:\/\//.test(a));
const liste = frei.length ? frei
  : filter.length ? SEITEN.filter(([n, u]) => filter.some((f) => n.includes(f) || u.includes(f)))
  : SEITEN;

/* Zustimmungsbanner verdecken genau den Teil, den wir sehen wollen. Erst
   die üblichen Knöpfe versuchen, dann aufgeben — nicht jede Seite lässt
   sich wegklicken, und das ist kein Grund, sie auszulassen. */
const WEGKLICKEN = [
  'button#onetrust-accept-btn-handler',
  'button[id*="accept" i]', 'button[class*="accept" i]',
  '[data-testid*="accept" i]', '[aria-label*="akzeptieren" i]',
  '[aria-label*="accept" i]',
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'] });

for (const [name, url] of liste) {
  const ordner = path.join(ZIEL, name);
  fs.mkdirSync(ordner, { recursive: true });
  const seite = await browser.newPage();
  await seite.setUserAgent(UA);
  await seite.setViewport({ width: 1440, height: 950 });
  try {
    await seite.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.log(`${name.padEnd(16)} nicht erreichbar: ${String(e.message).slice(0, 60)}`);
    await seite.close(); continue;
  }
  await new Promise((r) => setTimeout(r, 2500));

  /* Kopf zuerst — vor dem Scrollen, weil viele Navigationen dabei
     schrumpfen oder sich verstecken. */
  await seite.screenshot({ path: path.join(ordner, 'nav.png'),
    clip: { x: 0, y: 0, width: 1440, height: 120 } }).catch(() => {});

  for (const wahl of WEGKLICKEN) {
    const k = await seite.$(wahl).catch(() => null);
    if (k) { await k.click().catch(() => {}); await new Promise((r) => setTimeout(r, 900)); break; }
  }

  /* Durchscrollen, damit nachgeladene Abschnitte erscheinen. */
  await seite.evaluate(() => new Promise((fertig) => {
    let y = 0;
    const t = setInterval(() => {
      window.scrollTo(0, y); y += 700;
      if (y > document.body.scrollHeight + 1400) { clearInterval(t); window.scrollTo(0, 0); setTimeout(fertig, 1500); }
    }, 170);
  }));

  /* Schaltflächen vermessen: Was macht einen Knopf auf diesen Seiten aus? */
  const knoepfe = await seite.evaluate(() => {
    const raus = [];
    const alle = document.querySelectorAll('a,button');
    for (const el of alle) {
      const t = (el.innerText || '').trim();
      if (!t || t.length > 40) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 70 || r.height < 28 || r.height > 90) continue;
      const s = getComputedStyle(el);
      if (s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderTopWidth === '0px') continue;
      raus.push({ text: t.slice(0, 40), b: Math.round(r.width), h: Math.round(r.height),
        radius: s.borderRadius, grund: s.backgroundColor, schrift: s.color,
        rand: s.borderTopWidth === '0px' ? null : `${s.borderTopWidth} ${s.borderTopColor}`,
        groesse: s.fontSize, gewicht: s.fontWeight, polsterung: s.padding });
    }
    /* Doppelte zusammenfassen: dieselbe Form zählt einmal. */
    const gesehen = new Map();
    for (const k of raus) {
      const schluessel = [k.h, k.radius, k.grund, k.rand, k.gewicht].join('|');
      if (!gesehen.has(schluessel)) gesehen.set(schluessel, k);
    }
    return [...gesehen.values()].slice(0, 12);
  });
  fs.writeFileSync(path.join(ordner, 'knoepfe.json'), JSON.stringify(knoepfe, null, 2));

  const ganz = path.join(ordner, 'ganz.png');
  await seite.screenshot({ path: ganz, fullPage: true }).catch(() => {});
  /* Auf lesbare Breite rechnen, sonst sind es zwanzig Megabyte je Seite. */
  for (const [datei, breite] of [[ganz, 760], [path.join(ordner, 'nav.png'), 1100]]) {
    if (!fs.existsSync(datei)) continue;
    const jpg = datei.replace(/\.png$/, '.jpg');
    try {
      execFileSync('sips', ['-Z', String(breite), '-s', 'format', 'jpeg',
        '-s', 'formatOptions', '72', datei, '--out', jpg], { stdio: 'pipe' });
      fs.unlinkSync(datei);
    } catch { /* zu groß für sips — dann bleibt das PNG liegen */ }
  }
  const groesse = fs.existsSync(path.join(ordner, 'ganz.jpg'))
    ? (fs.statSync(path.join(ordner, 'ganz.jpg')).size / 1024).toFixed(0) + ' kB' : 'kein Bild';
  console.log(`${name.padEnd(16)} ${String(knoepfe.length).padStart(2)} Knopfformen, ${groesse}`);
  await seite.close();
}
await browser.close();
console.log(`\nAbgelegt unter ${ZIEL}`);
