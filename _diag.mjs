import 'dotenv/config';
import fs from 'node:fs';
import { collect } from './lib/browser.mjs';
import { erkenneBranche } from './lib/branchen.mjs';
fs.mkdirSync('results/_diag', { recursive: true });
const urls = ['https://malerbetrieb-brunner.de/','https://gasthof-neuhaus.de/','https://spicy-pizza-cr.de/',
              'https://trockenbauercrailsheim.com/','https://physiotherapie-hoefer.de/','https://cafe-hall.de/',
              'https://haustechnikschneider.de/','https://lohnsteuerhilfeabakus.de/'];
for (const u of urls) {
  try {
    const r = await collect(u, 'results/_diag', { ohneVollbild: true });
    const d = r.desktop.dom;
    const b = erkenneBranche(d, r.rawHtml);
    console.log(new URL(u).hostname.replace(/^www\./,'').padEnd(30), '→', b.key.padEnd(13), '|', b.quelle,
                '| Titel:', JSON.stringify((d.title||'').slice(0,45)), '| Text:', (d.text||'').length);
  } catch (e) { console.log(new URL(u).hostname.padEnd(30), 'FEHLER', e.message.slice(0, 70)); }
}
process.exit(0);
