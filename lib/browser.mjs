/* Ein Browser-Lauf pro Seite: lädt Desktop und Mobil, sammelt HTML, DOM-Metriken,
   Netzwerkdaten und Screenshots. Die Checks arbeiten danach nur noch auf diesen Daten —
   so bleibt jeder Check testbar, ohne selbst einen Browser zu starten. */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const UA_MOBILE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export async function collectSeite(url, outDir, tag) {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage'],
  });
  try {
    const desktop = await capture(browser, url, { width: 1440, height: 900, dsf: 1 }, outDir, `${tag}-desktop`);
    const mobile  = await capture(browser, url, { width: 375, height: 812, dsf: 2, mobile: true }, outDir, `${tag}-mobile`);
    return { url, finalUrl: desktop.finalUrl, desktop, mobile };
  } finally { await browser.close(); }
}

export async function collect(url, outDir, opt = {}) {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage'],
  });
  try {
    const desktop = await capture(browser, url, { width: 1440, height: 900, dsf: 1 }, outDir, 'desktop', opt);
    const mobile  = await capture(browser, url, { width: 375, height: 812, dsf: 2, mobile: true }, outDir, 'mobile', opt);
    const origin = new URL(desktop.finalUrl).origin;
    // Roh-HTML separat: der Server liefert Browsern teils anderes aus als einem einfachen GET,
    // und Theme-Reste stehen oft nur im Rohtext (bei Acanto: Platzhalter nur dort).
    const [robots, sitemap, raw] = await Promise.all([
      get(origin + '/robots.txt'), get(origin + '/sitemap.xml'), get(desktop.finalUrl, 200000),
    ]);
    const isDraft = /^(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.netlify\.app)$/i.test(new URL(desktop.finalUrl).hostname);
    return { url, finalUrl: desktop.finalUrl, desktop, mobile, robots, sitemap, rawHtml: raw.body, isDraft };
  } finally {
    await browser.close();
  }
}

async function capture(browser, url, vp, outDir, tag, opt = {}) {
  /* Eigener Browser-Kontext je Durchlauf: Sonst setzt der Klick auf
     "Ablehnen" im Desktop-Lauf ein Consent-Cookie, der Mobil-Lauf sieht kein
     Banner mehr — und der Befund "Cookie-Hinweis verdeckt 50 %" verschwindet. */
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const requests = [], consoleErrors = [];
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dsf, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  if (vp.mobile) await page.setUserAgent(UA_MOBILE);
  page.on('response', (r) => {
    try {
      const h = r.headers();
      requests.push({ url: r.url(), status: r.status(), type: r.request().resourceType(),
                      bytes: Number(h['content-length'] || 0), contentType: h['content-type'] || '' });
    } catch { /* abgebrochene Requests ignorieren */ }
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e.message)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  const t0 = Date.now();
  let response;
  try {
    response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) {
    if (!/Navigation timeout/i.test(String(e))) throw e;   // ohne networkidle weitermachen
  }
  const loadMs = Date.now() - t0;
  await page.evaluate(async () => {                         // Lazy-Bilder anstoßen
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1200));

  const html = await page.content();
  // Reihenfolge ist wichtig: erst messen, dann wegklicken. Sonst verschwindet
  // der Befund "Cookie-Hinweis verdeckt 50 % des Bildschirms".
  const dom = await page.evaluate(domMetrics);
  const weggeklickt = await schliesseOverlays(page);
  const shot = path.join(outDir, `${tag}.png`);
  const shotFull = path.join(outDir, `${tag}-full.png`);
  await page.screenshot({ path: shot });
  if (!opt.ohneVollbild) await page.screenshot({ path: shotFull, fullPage: true });
  const finalUrl = page.url();
  const status = response ? response.status() : 0;
  const headers = response ? response.headers() : {};
  await page.close();
  await ctx.close();
  return { tag, status, headers, finalUrl, loadMs, html, dom, requests, consoleErrors, shot, shotFull, weggeklickt };
}

/* Cookie-Dialoge und Werbe-Popups schließen, bevor der Screenshot entsteht.
   Grund: Bei Odyssee verdeckten ein "STEAK WEDNESDAY"-Popup und ein
   Cookie-Dialog fast die gesamte Startseite — das Design-Urteil bewertete
   die Overlays statt der Seite und vergab durchweg Zweien.
   Erst ablehnen versuchen (datensparsam), dann akzeptieren, dann schließen. */
async function schliesseOverlays(page) {
  const geklickt = [];
  const versuche = [
    { was: 'abgelehnt',  rx: /^(alles? ablehnen|ablehnen|nur (technisch )?notwendige|nur essenzielle|reject all|decline)$/i },
    { was: 'akzeptiert', rx: /^(alle[s]? akzeptieren|akzeptieren|zustimmen|einverstanden|verstanden|ich stimme zu|accept all|accept|ok)$/i },
    { was: 'geschlossen', rx: /^(schließen|close|×|✕|✖|x)$/i },
  ];
  for (const { was, rx } of versuche) {
    try {
      const treffer = await page.evaluate((q) => {
        const re = new RegExp(q.source, q.flags);
        const sichtbar = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.1; };
        const dialoge = [...document.querySelectorAll('body *')].filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
          const r = el.getBoundingClientRect();
          return r.width > innerWidth * 0.25 && r.height > 50 && sichtbar(el);
        });
        for (const d of dialoge) {
          for (const el of d.querySelectorAll('button,a[href],[role=button],input[type=button],input[type=submit],[class*=close i],[aria-label]')) {
            const t = (el.innerText || el.value || el.getAttribute('aria-label') || el.className?.toString?.() || '').trim();
            if (t && re.test(t) && sichtbar(el)) { el.click(); return t.slice(0, 30); }
          }
        }
        return null;
      }, { source: rx.source, flags: rx.flags });
      if (treffer) { geklickt.push(`${was}: ${treffer}`); await new Promise((r) => setTimeout(r, 700)); }
    } catch { /* ein misslungener Klick darf den Scan nicht stoppen */ }
  }

  // Escape und ein Klick neben den Dialog.
  try { await page.keyboard.press('Escape'); await new Promise((r) => setTimeout(r, 400)); } catch {}
  try { await page.mouse.click(8, 8); await new Promise((r) => setTimeout(r, 400)); } catch {}

  // Schließen-Symbole sind oft SVGs ohne Text oder Beschriftung. Sie sitzen
  // aber fast immer klein in der oberen rechten Ecke des Dialogs — dort wird
  // gezielt geklickt.
  try {
    const eckeGeklickt = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight;
      const dialoge = [...document.querySelectorAll('body *')].filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false;
        const r = el.getBoundingClientRect();
        return r.width > vw * 0.3 && r.height > vh * 0.25 && !el.closest('nav,header');
      });
      for (const d of dialoge) {
        const dr = d.getBoundingClientRect();
        for (const el of d.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.width < 10 || r.width > 64 || r.height < 10 || r.height > 64) continue;
          const obenRechts = r.top < dr.top + 90 && r.right > dr.right - 90;
          if (!obenRechts) continue;
          const ziel = el.closest('button,a,[role=button]') || el;
          ziel.click();
          return (d.className || d.tagName).toString().slice(0, 30);
        }
      }
      return null;
    });
    if (eckeGeklickt) { geklickt.push(`Schließen-Symbol: ${eckeGeklickt}`); await new Promise((r) => setTimeout(r, 600)); }
  } catch {}

  /* Was dann noch den Blick versperrt, wird für den Screenshot ausgeblendet.
     Streng dieselben Kriterien wie bei der Overlay-Messung: eigener Text, ein
     Bedienelement, liegt wirklich obenauf, und lässt sich schließen oder ist ein
     Consent-Dialog. Ohne diese Bedingungen verschwand bei Sicilia der fixierte
     Parallax-Hero und die Startseite war im Screenshot komplett weiß. */
  try {
    const versteckt = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight, weg = [];
      const flaeche = (r) => Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) *
                             Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
        const r = el.getBoundingClientRect();
        if (flaeche(r) / (vw * vh) < 0.18) continue;
        if (el.closest('nav,header') && r.height < 160) continue;
        if (el.querySelectorAll('*').length > 400) continue;                // nicht der Seitenkörper
        /* Ein Popup nennt sich meist auch so. Der fixierte Parallax-Hero bei
           Sicilia heißt "homeParallax" und fällt dadurch nicht in dieses Raster —
           ohne diese Unterscheidung war seine Startseite im Screenshot weiß. */
        const name = ((el.className || '') + ' ' + (el.id || '')).toString();
        const heisstPopup = /popup|modal|lightbox|dialog|interstitial|newsletter|overlay-?(box|wrap)/i.test(name);
        if (!heisstPopup) {
          if ((el.innerText || '').trim().length < 30) continue;            // Parallax, Backdrop
          if (!el.querySelector('button,a[href],[role=button],input[type=button],input[type=submit]')) continue;
        }

        // liegt es tatsächlich vor dem Inhalt?
        let treffer = 0, proben = 0;
        for (const fx of [0.3, 0.5, 0.7]) for (const fy of [0.3, 0.5, 0.7]) {
          const x = Math.min(vw - 2, Math.max(2, r.left + r.width * fx));
          const y = r.top + r.height * fy;
          if (y < 2 || y > vh - 2) continue;
          proben++;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === el || el.contains(hit))) treffer++;
        }
        if (!proben || treffer / proben < 0.5) continue;

        const txt = (el.className || '') + ' ' + (el.id || '') + ' ' + (el.innerText || '').slice(0, 300);
        const istConsent = /cookie|consent|cmp|gdpr|privacy|datenschutz/i.test(txt);
        const schliessbar = [...el.querySelectorAll('button,a[href],[role=button],[class*=close i],[aria-label]')]
          .some((c) => /^(x|×|✕|✖)$/i.test((c.innerText || '').trim())
            || /schlie|close|akzep|accept|zustimm|verstanden|ablehnen|reject|dismiss|popup/i
                 .test((c.innerText || '') + ' ' + (c.getAttribute('aria-label') || '') + ' ' + (c.className || '')));
        if (!istConsent && !schliessbar && !heisstPopup) continue;   // vermutlich Seiteninhalt

        el.style.setProperty('display', 'none', 'important');
        weg.push((el.className || el.tagName).toString().slice(0, 30));
        if (weg.length >= 3) break;
      }
      return weg;
    });
    if (versteckt.length) geklickt.push(`ausgeblendet: ${versteckt.join(', ')}`);
  } catch {}

  if (geklickt.length) await new Promise((r) => setTimeout(r, 400));
  return geklickt;
}

/* Läuft IM Browser. Sammelt alles, was die Checks über das Layout wissen müssen. */
function domMetrics() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const text = document.body.innerText || '';
  const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || null;

  // Tap-Ziele: Knöpfe und Navigations-Links. Links im Fließtext und in der Fußzeile
  // sind naturgemäß textzeilenhoch und werden nicht als Bedienfehler gewertet.
  const targets = [...document.querySelectorAll('a[href],button,input[type=submit]')].map((el) => {
    const r = el.getBoundingClientRect();
    const inProse = !!el.closest('p, li:not(nav li), footer, .footer, [class*=foot]');
    return { w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0, inProse };
  }).filter((t) => t.visible && !t.inProse);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const sizes = []; let n;
  while ((n = walker.nextNode()) && sizes.length < 3000) {
    if (!n.textContent.trim() || !n.parentElement) continue;
    const cs = getComputedStyle(n.parentElement);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    sizes.push(parseFloat(cs.fontSize));
  }

  // Elemente, die wirklich über den Rand ragen — nicht solche in Slidern oder
  // anderen Containern mit overflow:hidden (dort sind sie geclippt und harmlos)
  const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true; } return false; };
  const overflowCount = [...document.querySelectorAll('body *')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.right > vw + 2 && getComputedStyle(el).position !== 'fixed' && !clipped(el);
  }).length;

  const imgs = [...document.images].map((i) => ({
    src: i.currentSrc || i.src, alt: i.getAttribute('alt'), w: i.naturalWidth, h: i.naturalHeight,
    dw: Math.round(i.getBoundingClientRect().width), lazy: i.loading === 'lazy',
  }));
  // inNav: steht der Link in der Hauptnavigation? Was ein Betrieb dort hinstellt,
  // hält er selbst für wichtig — das rettet die Unterseitenwahl bei Seiten, deren
  // Menüpunkte nach dem Gewerk heißen statt "Leistungen".
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 80),
    inNav: !!a.closest('nav, header, [role=navigation], [class*=nav i]:not([class*=navbar-brand i])'),
    inFooter: !!a.closest('footer, [class*=foot i]'),
  }));
  const headings = { h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.trim()), h2: document.querySelectorAll('h2').length };
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.slice(0, 4000));
  const meta = (name) => document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.getAttribute('content') || null;

  /* ---- Was sieht man, ohne zu scrollen? ----------------------------------
     Der entscheidende Teil: eine Seite kann technisch fehlerfrei sein und oben
     trotzdem nichts zeigen außer Adresszeile und Cookie-Banner. */
  const inFold = (el) => { const r = el.getBoundingClientRect();
    return r.top < vh && r.bottom > 0 && r.width > 0 && r.height > 0; };
  const area = (r) => Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));

  const foldH1 = [...document.querySelectorAll('h1')].some(inFold);
  const foldHeading = [...document.querySelectorAll('h1,h2')].some(inFold);
  const foldImgs = [...document.images].filter((i) => inFold(i) && i.getBoundingClientRect().width > vw * 0.5
                   && i.getBoundingClientRect().height > 120 && !/logo|icon/i.test(i.src));
  const foldHero = foldImgs.length > 0 || [...document.querySelectorAll('section,header,div')].some((el) => {
    if (!inFold(el)) return false;
    const r = el.getBoundingClientRect(); if (r.height < 180 || r.width < vw * 0.8) return false;
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none' && /url\(/.test(bg);
  });
  const foldCta = [...document.querySelectorAll('a[href],button')].filter((el) => inFold(el)
    && /reservier|tisch|bestell|anfrage|termin|buchen|anrufen|kontakt|speisekarte|menü|karte/i.test(el.innerText || ''));

  /* Gesucht sind Dialoge, die beim Laden erscheinen und weggeklickt werden müssen
     (Cookie-Banner, Popups) — nicht jedes bildschirmfüllende fixed-Element.
     Ohne die Forderung nach eigenem Text UND einem Bedienelement landeten hier
     Parallax-Hintergründe, leere popup-Container und durchsichtige Backdrops und
     erzeugten die Falschmeldung „verdeckt 100 % des Bildschirms". */
  const overlays = [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < vw * 0.4 || r.height < 60) return false;
    if (el.closest('nav,header') && r.height < 120) return false;      // normale Kopfleiste
    if (area(r) <= vw * vh * 0.08) return false;
    if ((el.innerText || '').trim().length < 30) return false;         // Backdrop, Parallax, leerer Container
    if (!el.querySelector('button,a[href],input[type=button],input[type=submit],[role=button]')) return false;
    if (el.querySelectorAll('*').length > 400) return false;           // nicht den ganzen Seitenkörper
    return true;
  }).map((el) => {
    const r = el.getBoundingClientRect();
    /* Zählt nur, was den Blick wirklich versperrt. Statt über Alpha und z-index zu
       raten, wird an neun Punkten der Fläche gefragt, wer dort tatsächlich obenauf
       liegt — das beantwortet der Browser selbst. */
    let hits = 0, probes = 0;
    for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) {
      const x = Math.min(vw - 2, Math.max(2, r.left + r.width * fx));
      const y = r.top + r.height * fy;
      if (y < 2 || y > vh - 2) continue;
      probes++;
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === el || el.contains(hit))) hits++;
    }
    const onTop = probes > 0 && hits / probes >= 0.5;
    const txt = ((el.className || '') + ' ' + (el.id || '') + ' ' + (el.innerText || '').slice(0, 300));
    /* Ein Dialog lässt sich schließen — daran erkennt man ihn zuverlässiger als an
       Größe oder Position. Ohne dieses Merkmal wurde ein fixierter Parallax-Hero
       als bildschirmfüllendes Popup gemeldet. */
    const hasClose = [...el.querySelectorAll('button,a[href],[role=button],[class*=close i],[aria-label]')]
      .some((c) => /^(x|×|✕|✖)$/i.test((c.innerText || '').trim())
        || /schlie|close|akzep|accept|zustimm|verstanden|einverstanden|ok\b|got it|alle annehmen|ablehnen|reject/i
             .test((c.innerText || '') + ' ' + (c.getAttribute('aria-label') || '') + ' ' + (c.className || '')));
    return { cls: (el.className || el.tagName).toString().slice(0, 60),
             cover: Math.round((area(r) / (vw * vh)) * 100), onTop, hasClose,
             isConsent: /cookie|consent|cmp|gdpr|privacy|datenschutz/i.test(txt) };
  }).filter((o) => o.onTop && (o.isConsent || o.hasClose));

  const overlayCover = overlays.reduce((m, o) => Math.max(m, o.cover), 0);
  const consentCover = overlays.filter((o) => o.isConsent).reduce((m, o) => Math.max(m, o.cover), 0);

  const h1El = document.querySelector('h1');
  let h1Blocked = false;
  if (h1El && inFold(h1El)) { const r = h1El.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.min(vw - 2, r.left + r.width / 2), Math.max(2, Math.min(vh - 2, r.top + r.height / 2)));
    h1Blocked = !!hit && hit !== h1El && !h1El.contains(hit) && !hit.contains(h1El); }

  // Abstände zwischen Tap-Zielen (Google empfiehlt mind. 8 px)
  const tRects = [...document.querySelectorAll('a[href],button')].map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0 && r.top < vh * 3);
  let tapGapIssues = 0;
  for (let i = 0; i < tRects.length; i++) for (let j = i + 1; j < tRects.length; j++) {
    const a = tRects[i], b = tRects[j];
    const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
    const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
    if (dx < 8 && dy < 8 && !(dx === 0 && dy === 0)) tapGapIssues++;
  }

  return {
    vw, vh, docWidth: document.documentElement.scrollWidth, viewportMeta,
    fold: { h1: foldH1, heading: foldHeading, hero: foldHero, imgs: foldImgs.length, ctas: foldCta.length,
            h1Blocked, overlayCover, consentCover, overlays: overlays.slice(0, 4) },
    tapGapIssues,
    title: document.title, lang: document.documentElement.lang || null,
    description: meta('description'), generator: meta('generator'),
    og: { title: meta('og:title'), image: meta('og:image') },
    canonical: document.querySelector('link[rel=canonical]')?.href || null,
    url: location.href,
    robotsMeta: meta('robots'),
    headings, jsonld, imgs, links, targets,
    textSizes: sizes, overflowCount,
    text: text.slice(0, 60000), wordCount: text.split(/\s+/).filter(Boolean).length,
    /* Ein Seitenaufbau ohne Stylesheet sieht aus wie eine kaputte Seite aus den
       Neunzigern — und genau so beurteilt Claude ihn dann auch. Bei
       praxis-drwetzel.de ergab das 4 von 100 für eine Praxis mit gepflegtem
       Auftritt. Deshalb festhalten, ob verlinkte Stylesheets wirklich ankamen. */
    css: (() => {
      const verlinkt = document.querySelectorAll('link[rel~="stylesheet" i][href]').length;
      let geladen = 0, regeln = 0;
      for (const b of document.styleSheets) {
        try { const r = b.cssRules; if (r) { geladen++; regeln += r.length; } }
        catch { geladen++; }                       // fremde Herkunft: geladen, aber nicht lesbar
      }
      return { verlinkt, geladen, regeln, inline: document.querySelectorAll('style').length };
    })(),
    hasCookieBanner: !!document.querySelector('[id*=cookie i],[class*=cookie i],[id*=consent i],[class*=consent i],[id*=cmp i]'),
    iframes: [...document.querySelectorAll('iframe')].map((f) => f.src).filter(Boolean),
  };
}

async function get(url, maxLen = 4000) {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' } });
    const body = r.ok ? (await r.text()).slice(0, maxLen) : '';
    return { ok: r.ok, status: r.status, body };
  } catch { return { ok: false, status: 0, body: '' }; }
}

export function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
