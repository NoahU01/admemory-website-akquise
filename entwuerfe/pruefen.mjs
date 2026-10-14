/* Prüft eine gebaute Seite auf das, was man beim Hinsehen übersieht:
   Querüberlauf, zu schwachen Kontrast, nicht geladene Bilder, zu klein
   geratene Logos, von einer Maske verschluckte Logos und Klassennamen,
   für die es gar keine Regel gibt. Letzteres fällt sonst nie auf.

   Aufruf: node entwuerfe/pruefen.mjs entwuerfe/_vertrauen/index.html     */
import puppeteer from 'puppeteer-core';
import path from 'node:path';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const datei = path.resolve(process.argv[2]);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--allow-file-access-from-files', '--no-sandbox'] });

for (const breite of [1400, 390]) {
  const page = await browser.newPage();
  await page.setViewport({ width: breite, height: 900, deviceScaleFactor: 1 });
  await page.goto('file://' + datei, { waitUntil: 'networkidle0' });
  /* Faule Bilder anstoßen: loading umstellen reicht nicht, erst die
     Zuweisung von src löst die Anfrage aus. */
  await page.evaluate(async () => {
    for (const i of document.querySelectorAll('img')) { i.loading = 'eager'; i.src = i.src; }
    await new Promise((r) => setTimeout(r, 2500));
    window.scrollTo(0, 0);
  });

  const m = await page.evaluate(() => {
    /* Farben kommen als rgb(0..255) oder color(srgb 0..1), mit oder ohne
       Alpha. Und ein Grund ist oft durchsichtig: .stimme auf dunklem
       Abschnitt ist 6 % Weiß über Dunkel. Wer die Schicht für sich nimmt,
       hält sie für fast Weiß und meldet hellen Text als unlesbar. Deshalb
       werden alle Schichten bis zur ersten deckenden übereinandergerechnet. */
    const alsRgba = (c) => {
      if (!c || c === 'transparent') return [0, 0, 0, 0];
      const srgb = /^color\(\s*srgb/i.test(c);
      const t = (c.match(/[\d.]+/g) || []).map(Number);
      let [r, g, b] = t.slice(0, 3);
      const a = t.length > 3 ? t[3] : 1;
      if (srgb) { r *= 255; g *= 255; b *= 255; }
      return [r, g, b, a];
    };
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
    };
    /* Verläufe und Bildüberlagerungen kann diese Rechnung nicht bewerten.
       Die werden gemeldet, nicht stillschweigend für bestanden erklärt. */
    const grund = (el) => {
      const lagen = [];
      let bild = false;
      for (let e = el; e; e = e.parentElement) {
        const st = getComputedStyle(e);
        if (st.backgroundImage && st.backgroundImage !== 'none') bild = true;
        const lage = alsRgba(st.backgroundColor);
        if (lage[3] > 0) { lagen.push(lage); if (lage[3] >= .999) break; }
      }
      let [R, G, B] = [255, 255, 255];
      for (let i = lagen.length - 1; i >= 0; i--) {
        const [r, g, b, a] = lagen[i];
        R = r * a + R * (1 - a); G = g * a + G * (1 - a); B = b * a + B * (1 - a);
      }
      return { rgb: [R, G, B], bild };
    };

    const schlecht = [], unmessbar = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.childNodes.length) continue;
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (!txt) continue;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < .1) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const g = grund(el);
      const a = lum(alsRgba(s.color)), b = lum(g.rgb);
      const k = (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
      const gross = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
      if (k >= (gross ? 3 : 4.5)) continue;
      const fund = { txt: txt.slice(0,45), k: +k.toFixed(2), px: s.fontSize, farbe: s.color,
        grund: 'rgb(' + g.rgb.map(Math.round).join(',') + ')' };
      if (g.bild) unmessbar.push(fund); else schlecht.push(fund);
    }

    const bilderLeer = [...document.images].filter((i) => !i.complete || !i.naturalWidth)
      .map((i) => i.getAttribute('src'));

    /* Winzige Logos in Kacheln aufspüren */
    const klein = [...document.querySelectorAll('.vertrauen__kachel img,.streu__feld img')]
      .map((i) => ({ src: i.getAttribute('src').split('/').pop(), b: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) }))
      .filter((o) => o.b < 18 || o.h < 10);

    /* Von der Maske ausgeblendete Logos. Die Stops aus dem wirklich
       gesetzten mask-image lesen, nicht raten. Felder ohne Maske
       überspringen. */
    const verdeckt = [];
    for (const feld of document.querySelectorAll('.streu,.vertrauen__kacheln')) {
      const mi = getComputedStyle(feld).maskImage || getComputedStyle(feld).webkitMaskImage;
      if (!mi || mi === 'none') continue;
      const stops = [...mi.matchAll(/([\d.]+)%/g)].map((m) => +m[1] / 100);
      if (stops.length < 2) continue;
      const [s1, s2] = [stops[0], stops[stops.length - 1]];
      const fr = feld.getBoundingClientRect();
      const mx = fr.left + fr.width / 2, my = fr.top + fr.height / 2;
      for (const img of feld.querySelectorAll('img')) {
        const r = img.getBoundingClientRect();
        const rad = Math.hypot((r.left + r.width / 2 - mx) / (fr.width / 2),
                               (r.top + r.height / 2 - my) / (fr.height / 2));
        const alpha = rad <= s1 ? 1 : rad >= s2 ? 0 : 1 - (rad - s1) / (s2 - s1);
        if (alpha < .5) verdeckt.push({ src: img.getAttribute('src').split('/').pop(),
          alpha: +alpha.toFixed(2), feld: feld.className.split(' ')[0] });
      }
    }

    /* Sterne: Breite der gefüllten Überlagerung gegen die Note prüfen */
    const sterne = [...document.querySelectorAll('.sterne')].map((s) => ({
      label: s.getAttribute('aria-label'),
      voll: Math.round(s.querySelector('.sterne__voll').getBoundingClientRect().width),
      ganz: Math.round(s.getBoundingClientRect().width),
    }));

    /* Klassen, die im Stil gar nicht vorkommen: stiller Totalausfall. */
    const bekannt = new Set();
    for (const bl of document.styleSheets) {
      try { for (const r of bl.cssRules) for (const m of (r.cssText || '').matchAll(/\.([A-Za-z][\w-]*)/g)) bekannt.add(m[1]); }
      catch { /* fremdes Blatt */ }
    }
    const unbekannt = [...new Set([...document.querySelectorAll('[class]')]
      .flatMap((e) => [...e.classList]).filter((c) => !bekannt.has(c)))];

    const ue = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    const breiter = [...document.querySelectorAll('body *')]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0,5).map((e) => `${e.tagName.toLowerCase()}.${e.className}`.slice(0,60));

    return { unbekannt, unmessbar, ueberlauf: ue, breiter, schlecht, bilderLeer, klein, verdeckt, sterne,
      hoehe: document.body.scrollHeight };
  });

  console.log(`\n══ ${breite} px ══ Seitenhöhe ${m.hoehe}`);
  console.log('Querüberlauf:', m.ueberlauf, m.ueberlauf ? m.breiter : '');
  console.log('Kontrast unter Schwelle:', m.schlecht.length, m.schlecht.slice(0,6));
  console.log('Nicht messbar (Verlauf/Bild dahinter):', m.unmessbar.length, m.unmessbar.slice(0,4));
  console.log('Leere Bilder:', m.bilderLeer.length, m.bilderLeer);
  console.log('Zu kleine Logos:', m.klein.length, m.klein.slice(0,5));
  console.log('Von Maske verdeckt:', m.verdeckt.length, m.verdeckt.slice(0,8));
  console.log('Unbekannte Klassen:', m.unbekannt);
  console.log('Sterne:', m.sterne);
  await page.close();
}
await browser.close();

process.exit(0);
