#!/usr/bin/env node
/* Holt freie Beispielbilder für die Bibliothek über Openverse und legt sie
   mit Herkunft und Lizenz ab.

     node entwuerfe/baukasten/bilder-holen.mjs            zeigt nur, was käme
     node entwuerfe/baukasten/bilder-holen.mjs --anwenden lädt herunter

   Nur CC0: Das Repo ist öffentlich, und bei CC-BY müsste auf jeder Seite
   eine Namensnennung stehen, die in einem Entwurf nichts zu suchen hat.
   Die Herkunft wird trotzdem notiert — nicht weil die Lizenz es verlangt,
   sondern damit später nachvollziehbar ist, woher ein Bild kam.           */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ZIEL = path.join(path.dirname(new URL(import.meta.url).pathname), 'beispiel-bilder');
const anwenden = process.argv.includes('--anwenden');

/* Was die Bibliothek braucht, in der Sprache der Suche. Die Namen links
   sind die Dateinamen, unter denen die Bausteine sie ansprechen. */
const GESUCHT = [
  ['werkstatt', 'mechanic workshop garage'],
  ['handwerk', 'electrician'],
  ['team', 'team meeting office people'],
  ['bau', 'construction worker'],
  ['lkw', 'truck transportation highway'],
  ['buero', 'modern office interior desk'],
  ['werkzeug', 'tools workbench workshop'],
  ['beratung', 'work business'],
];

/* Erst Querformat suchen, weil fast jeder Baustein Breitbild braucht. Wenn
   es dafür nichts gibt, lieber ein Hochformat als gar kein Bild — zuschneiden
   können wir, erfinden nicht. */
const einmal = async (q, breit) => {
  const u = 'https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q)
    + '&source=stocksnap&license=cc0&size=large&page_size=8&mature=false'
    + (breit ? '&aspect_ratio=wide' : '');
  const r = await fetch(u, { headers: { 'User-Agent': 'AdMemory-Baukasten/1.0' } });
  if (!r.ok) throw new Error(`Openverse ${r.status}`);
  return (await r.json()).results ?? [];
};
const hole = async (q) => {
  const breit = await einmal(q, true);
  return breit.length ? breit : einmal(q, false);
};

const herkunftDatei = path.join(ZIEL, 'herkunft.json');
const herkunft = fs.existsSync(herkunftDatei)
  ? JSON.parse(fs.readFileSync(herkunftDatei, 'utf8')) : {};

for (const [name, frage] of GESUCHT) {
  let treffer;
  try { treffer = await hole(frage); } catch (e) { console.log(`${name}: ${e.message}`); continue; }
  const t = treffer.find((x) => x.url && (x.width ?? 0) >= 1600);
  if (!t) { console.log(`${name.padEnd(10)} kein Treffer für "${frage}"`); continue; }
  console.log(`${name.padEnd(10)} ${t.license} ${String(t.width)}x${t.height}  ${(t.title || '').slice(0, 38)}`);
  if (!anwenden) continue;

  const roh = path.join(ZIEL, name + '.roh');
  const ziel = path.join(ZIEL, name + '.jpg');
  const antwort = await fetch(t.url, { headers: { 'User-Agent': 'AdMemory-Baukasten/1.0' } });
  if (!antwort.ok) { console.log(`   Laden fehlgeschlagen: ${antwort.status}`); continue; }
  fs.writeFileSync(roh, Buffer.from(await antwort.arrayBuffer()));
  /* Auf Bildschirmbreite rechnen. Ein 6000er Original in einem Entwurf ist
     Verschwendung, und das Repo ist öffentlich. */
  execFileSync('sips', ['-Z', '1600', '-s', 'format', 'jpeg', '-s', 'formatOptions', '78',
    roh, '--out', ziel], { stdio: 'pipe' });
  fs.unlinkSync(roh);
  herkunft[name + '.jpg'] = {
    quelle: t.foreign_landing_url ?? t.url,
    anbieter: t.source,
    urheber: t.creator ?? null,
    lizenz: t.license + ' ' + (t.license_version ?? ''),
    titel: t.title ?? null,
    geholt: new Date().toISOString().slice(0, 10),
    bytes: fs.statSync(ziel).size,
  };
  console.log(`   → ${name}.jpg (${(fs.statSync(ziel).size / 1024).toFixed(0)} kB)`);
}

if (anwenden) {
  fs.writeFileSync(herkunftDatei, JSON.stringify(herkunft, null, 2));
  console.log('\nHerkunft notiert in beispiel-bilder/herkunft.json');
} else {
  console.log('\nNur angezeigt. Zum Laden:  node entwuerfe/baukasten/bilder-holen.mjs --anwenden');
}
