import { finding, clamp } from './_util.mjs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/* Lighthouse lokal (mobil-Preset) — ohne Google-Tageslimit, reproduzierbar. */
async function localLighthouse(url) {
  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
    const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'silent', onlyCategories: ['performance'] });
    const a = lhr.audits;
    return { ok: true, source: 'Google Lighthouse, mobil', perf: Math.round((lhr.categories.performance.score || 0) * 100),
      lcp: a['largest-contentful-paint']?.numericValue, cls: a['cumulative-layout-shift']?.numericValue,
      tbt: a['total-blocking-time']?.numericValue, fcp: a['first-contentful-paint']?.numericValue };
  } catch (e) { return { ok: false, reason: String(e.message || e).slice(0, 160) }; }
  finally { if (chrome) await chrome.kill(); }
}

/* PageSpeed Insights als Fallback, falls Lighthouse lokal scheitert. */
async function pagespeed(url) {
  const key = process.env.PSI_API_KEY ? `&key=${process.env.PSI_API_KEY}` : '';
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${key}`;
  try {
    const r = await fetch(api, { signal: AbortSignal.timeout(90000) });
    if (!r.ok) return { ok: false, reason: `HTTP ${r.status}` };
    const j = await r.json(); const lh = j.lighthouseResult, a = lh.audits;
    return { ok: true, source: 'PageSpeed Insights, mobil', perf: Math.round((lh.categories.performance.score || 0) * 100),
      lcp: a['largest-contentful-paint']?.numericValue, cls: a['cumulative-layout-shift']?.numericValue };
  } catch (e) { return { ok: false, reason: String(e.message || e) }; }
}

export async function checkTech({ finalUrl, desktop, mobile, isDraft }) {
  const f = []; let score = 100;
  let psi = await localLighthouse(finalUrl);
  if (!psi.ok) { const alt = await pagespeed(finalUrl); if (alt.ok) psi = alt; }

  if (!isDraft && !/^https:/i.test(finalUrl)) { score -= 25; f.push(finding('high', 'Die Seite läuft ohne HTTPS — Browser zeigen „Nicht sicher" an.', finalUrl)); }

  if (psi.ok) {
    if (psi.perf < 50) { score -= 38; f.push(finding('high', `Die mobile Ladeleistung liegt bei ${psi.perf} von 100 Punkten (Google Lighthouse).`, psi.source)); }
    else if (psi.perf < 60) { score -= 28; f.push(finding('high', `Die mobile Ladeleistung liegt bei ${psi.perf} von 100 Punkten (Google Lighthouse).`, psi.source)); }
    else if (psi.perf < 75) { score -= 15; f.push(finding('medium', `Die mobile Ladeleistung liegt bei ${psi.perf} von 100 Punkten (Google Lighthouse).`, psi.source)); }
    if (psi.lcp > 4000) { score -= 10; f.push(finding('high', `Der größte sichtbare Inhalt erscheint mobil erst nach ${(psi.lcp / 1000).toFixed(1)} s (Google-Grenzwert: 2,5 s).`, 'LCP')); }
    else if (psi.lcp > 2500) { score -= 5; f.push(finding('medium', `Der größte sichtbare Inhalt erscheint mobil nach ${(psi.lcp / 1000).toFixed(1)} s (Google-Grenzwert: 2,5 s).`, 'LCP')); }
    if (psi.cls > 0.25) { score -= 8; f.push(finding('medium', 'Die Seite springt beim Laden sichtbar (Layout-Verschiebungen).', `CLS ${psi.cls.toFixed(2)}`)); }
  } else {
    const s = mobile.loadMs;
    if (s > 10000) { score -= 20; f.push(finding('high', `Mobil dauert das vollständige Laden ${(s / 1000).toFixed(1)} s.`, 'eigene Messung — Lighthouse nicht verfügbar')); }
    else if (s > 5000) { score -= 10; f.push(finding('medium', `Mobil dauert das vollständige Laden ${(s / 1000).toFixed(1)} s.`, 'eigene Messung')); }
  }

  const bytes = mobile.requests.reduce((n, r) => n + (r.bytes || 0), 0);
  const mb = bytes / 1048576;
  if (mb > 5) { score -= 12; f.push(finding('high', `Die Startseite lädt mobil rund ${mb.toFixed(1)} MB — bei mobilem Netz spürbar langsam.`)); }
  else if (mb > 2.5) { score -= 6; f.push(finding('medium', `Die Startseite lädt mobil rund ${mb.toFixed(1)} MB.`)); }

  const heavy = mobile.requests.filter((r) => r.type === 'image' && r.bytes > 500000);
  if (heavy.length) { score -= Math.min(10, heavy.length * 3); f.push(finding('medium', `${heavy.length} Bild${heavy.length > 1 ? 'er' : ''} über 500 KB unkomprimiert eingebunden.`, heavy.map((i) => `${(i.bytes / 1024).toFixed(0)} KB`).join(', '))); }

  if (mobile.requests.length > 120) { score -= 6; f.push(finding('low', `${mobile.requests.length} einzelne Dateien werden für die Startseite geladen.`)); }
  if (desktop.consoleErrors.length >= 3) { score -= 5; f.push(finding('low', `${desktop.consoleErrors.length} JavaScript-Fehler in der Browserkonsole.`, desktop.consoleErrors[0].slice(0, 120))); }

  return { score: clamp(score), findings: f, data: { psi, bytesMB: +mb.toFixed(2), requests: mobile.requests.length, https: /^https:/i.test(finalUrl) } };
}
