#!/usr/bin/env node
/* Das Werkzeug. Läuft auf dem eigenen Rechner, nicht bei Vercel.

     node dashboard/lokal.mjs        dann http://localhost:4000

   Warum lokal: Der Knopf "Report erstellen" braucht Chrome, Lighthouse und
   die Dateien unter results/. Auf einer Serverless-Funktion gibt es nichts
   davon, und ein Scan dauert länger, als sie laufen darf. Dafür braucht es
   hier auch keine Anmeldung — wer am Rechner sitzt, ist drin.              */
import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4000);

/* Die Kopfzeilen aus vercel.json auch lokal setzen. Ohne das testet man gegen
   eine andere Umgebung als die, in der es später läuft: Die
   Sicherheitsrichtlinie verbietet Inline-Skripte, lokal fiel das nie auf, und
   im Betrieb lud das Dashboard dann einfach nicht. Ein Testserver, der
   großzügiger ist als der echte, prüft nichts. */
const KOPFZEILEN = (() => {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(hier, 'vercel.json'), 'utf8'));
    const allgemein = (v.headers ?? []).find((h) => h.source === '/(.*)');
    return Object.fromEntries((allgemein?.headers ?? []).map((h) => [h.key, h.value]));
  } catch { return {}; }
})();
if (Object.keys(KOPFZEILEN).length)
  console.log(`${Object.keys(KOPFZEILEN).length} Kopfzeilen aus vercel.json übernommen`);

if (!process.env.ANTHROPIC_API_KEY)
  console.warn('⚠  ANTHROPIC_API_KEY fehlt — ein Vollscan lässt dann das Design-Urteil aus.');

const server = http.createServer(async (req, res) => {
  const pfad = new URL(req.url, 'http://x').pathname;

  if (pfad.startsWith('/api/')) {
    const name = pfad.slice(5).replace(/[^a-z_]/gi, '');
    const datei = path.join(hier, 'api', name + '.mjs');
    if (!name || name.startsWith('_') || !fs.existsSync(datei))
      return res.writeHead(404, { 'Content-Type': 'application/json' }).end('{"fehler":"unbekannt"}');
    // Hilfsmethoden, die Vercel an die Antwort hängt
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    for (const [k, v] of Object.entries(KOPFZEILEN)) res.setHeader(k, v);
    try {
      const mod = await import(datei + '?t=' + Date.now());   // bei jedem Aufruf neu, für schnelles Entwickeln
      await mod.default(req, res);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) res.status(500).json({ fehler: 'Serverfehler' });
    }
    return;
  }

  /* Fertige Reports liegen außerhalb des Dashboard-Ordners und werden von
     hier mit ausgeliefert, damit man sie aus der Tabelle heraus öffnen kann. */
  let wurzel = hier, rest = pfad;
  if (pfad === '/report' || pfad.startsWith('/report/')) {
    wurzel = path.resolve(hier, '../entwuerfe/report');
    rest = pfad.slice('/report'.length) || '/';
  }
  let datei = path.join(wurzel, rest === '/' ? 'index.html' : rest.replace(/^\/+/, ''));
  if (fs.existsSync(datei) && fs.statSync(datei).isDirectory())
    datei = path.join(datei, 'index.html');
  if (!datei.startsWith(wurzel) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory())
    return res.writeHead(404).end('nicht gefunden');
  /* Fehlt ein Typ, liefert der Server text/plain, und nosniff lässt das Bild
     dann nicht durch — der Test schlüge fehl, obwohl Vercel es richtig macht. */
  const typ = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
                '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg', '.json': 'application/json',
                '.woff2': 'font/woff2', '.webp': 'image/webp' }[path.extname(datei)] || 'text/plain';
  const kopf = { ...KOPFZEILEN };
  if (wurzel !== hier) delete kopf['Content-Security-Policy'];   // Report lädt Poppins
  res.writeHead(200, { ...kopf, 'Content-Type': typ, 'Cache-Control': 'no-store' });
  fs.createReadStream(datei).pipe(res);
});

server.listen(port, () => console.log(`\nDashboard: http://localhost:${port}\n`));
