#!/usr/bin/env node
/* Entwürfe lokal ansehen:  node entwuerfe/zeigen.mjs
   Setzt dieselben Kopfzeilen wie Vercel, damit lokal nichts anders aussieht
   als später im Betrieb. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4200);
const kopf = JSON.parse(fs.readFileSync(path.join(wurzel, 'vercel.json'), 'utf8'))
  .headers.find((h) => h.source === '/(.*)').headers;
const typ = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
              '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
              '.webp': 'image/webp', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(wurzel, p);
  if (!f.startsWith(wurzel) || !fs.existsSync(f) || fs.statSync(f).isDirectory())
    return res.writeHead(404).end('nicht gefunden');
  const h = Object.fromEntries(kopf.map((k) => [k.key, k.value]));
  res.writeHead(200, { ...h, 'Content-Type': typ[path.extname(f)] ?? 'text/plain' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => {
  const ordner = fs.readdirSync(wurzel, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'baukasten').map((d) => d.name);
  console.log(`\nEntwürfe laufen auf http://localhost:${port}\n`);
  for (const o of ordner) console.log(`  http://localhost:${port}/${o}/`);
  console.log();
});
