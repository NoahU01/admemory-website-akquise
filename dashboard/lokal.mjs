#!/usr/bin/env node
/* Testserver. Bildet nach, was Vercel mit dem Ordner macht: index.html
   ausliefern und /api/<name> auf api/<name>.mjs leiten. Nur zum Prüfen vor dem
   Deployen — im Betrieb läuft das bei Vercel.

     node dashboard/lokal.mjs        dann http://localhost:4000              */
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

for (const n of ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DASHBOARD_PASSWORT', 'DASHBOARD_SECRET'])
  if (!process.env[n]) console.warn(`⚠  ${n} fehlt — in .env ergänzen`);

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

  const datei = path.join(hier, pfad === '/' ? 'index.html' : pfad.replace(/^\/+/, ''));
  if (!datei.startsWith(hier) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory())
    return res.writeHead(404).end('nicht gefunden');
  const typ = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
                '.svg': 'image/svg+xml', '.png': 'image/png' }[path.extname(datei)] || 'text/plain';
  res.writeHead(200, { ...KOPFZEILEN, 'Content-Type': typ, 'Cache-Control': 'no-store' });
  fs.createReadStream(datei).pipe(res);
});

server.listen(port, () => console.log(`\nDashboard: http://localhost:${port}\n`));
