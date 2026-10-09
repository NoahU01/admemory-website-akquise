import 'dotenv/config';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args:['--no-sandbox'] });
const sichten = [['handy',390,844,2],['mac',1280,900,1]];
for (const [tag,w,h,dsf] of sichten) {
  const p = await b.newPage();
  await p.setViewport({ width:w, height:h, deviceScaleFactor:dsf });
  await p.goto('http://localhost:4000/', { waitUntil:'networkidle2' });
  await p.screenshot({ path: 'results/_dash-'+tag+'-tor.png' });
  const torDa = await p.evaluate(() => !document.getElementById('tor').hidden);
  if (torDa) { await p.type('#passwort', 'yiIcJPS34Wb4');
  await p.click('.knopf'); }
  await new Promise(r=>setTimeout(r,2800));
  await p.screenshot({ path: 'results/_dash-'+tag+'-liste.png' });
  const karte = await p.$('.karte');
  if (karte) { await karte.click(); await new Promise(r=>setTimeout(r,2000));
    await p.screenshot({ path: 'results/_dash-'+tag+'-detail.png' }); }
  // Messen: Überlauf und Trefferflächen
  const mass = await p.evaluate(() => ({
    ueberlauf: document.documentElement.scrollWidth - window.innerWidth,
    zuKlein: [...document.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect();
      return r.width>0 && (r.height<36||r.width<36);}).length,
    knoepfe: document.querySelectorAll('button,a').length,
  }));
  console.log(tag.padEnd(6), 'Überlauf:', mass.ueberlauf+'px', '| zu kleine Ziele:', mass.zuKlein+'/'+mass.knoepfe);
  await p.close();
}
await b.close();
