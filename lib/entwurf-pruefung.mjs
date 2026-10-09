/* Torwächter für fertige Entwürfe.

   Der Agent darf frei komponieren — das ist der Sinn der Sache. Verantwortbar
   wird diese Freiheit erst dadurch, dass das Ergebnis gemessen wird, bevor
   Noah es sieht. Wir haben den Prüfer ohnehin: Derselbe Scanner, der fremde
   Seiten bewertet, bewertet auch unsere eigenen.

   Zwei Arten von Prüfungen:

   Pflicht    Ohne die geht der Entwurf nicht raus. Allen voran: Er darf nicht
              in Suchmaschinen auftauchen. Ein unaufgeforderter Nachbau einer
              fremden Firma im Google-Index ist kein Schönheitsfehler, sondern
              ein Problem — fuer den Betrieb wie fuer AdMemory.

   Güte       Der Entwurf muss deutlich besser sein als das Original. Ein
              Nachbau, der nur gleichzieht, ist kein Argument für ein Angebot. */

import { collect } from './browser.mjs';
import { checkMobile } from './checks/mobile.mjs';
import { checkContent } from './checks/content.mjs';
import { checkSeo } from './checks/seo.mjs';
import { checkTech } from './checks/tech.mjs';
import { checkImpression } from './checks/impression.mjs';
import { erkenneBranche, profilVon } from './branchen.mjs';

export const SCHWELLE = {
  gesamt:      Number(process.env.ENTWURF_MINDESTWERT ?? 75),
  vorsprung:   Number(process.env.ENTWURF_VORSPRUNG  ?? 20),   // Punkte über dem Original
  eindruck:    Number(process.env.ENTWURF_MIN_EINDRUCK ?? 65),
  mobil:       Number(process.env.ENTWURF_MIN_MOBIL   ?? 70),
};

const ROBOTS_PFLICHT = /noindex/i;

/* Die drei Ebenen, mit denen der Acanto-Entwurf abgesichert war. Alle drei
   müssen stehen: Das Meta-Tag greift im gerenderten HTML, der HTTP-Header auch
   bei Dateien ohne HTML, und robots.txt muss das Crawlen ERLAUBEN — sonst
   liest die Suchmaschine das noindex nie und nimmt die URL womöglich trotzdem
   auf, nur ohne Inhalt. */
async function pruefeIndexSperre(seite, basisUrl) {
  const probleme = [];
  const meta = seite.dom.robotsMeta ?? '';
  if (!ROBOTS_PFLICHT.test(meta))
    probleme.push('Das Meta-Tag "robots" fehlt oder enthält kein noindex.');

  const kopf = seite.headers?.['x-robots-tag'] ?? '';
  if (!ROBOTS_PFLICHT.test(kopf))
    probleme.push('Der HTTP-Header X-Robots-Tag fehlt oder enthält kein noindex.');

  try {
    const r = await fetch(new URL('/robots.txt', basisUrl), { redirect: 'follow' });
    if (r.ok) {
      const txt = await r.text();
      if (/^\s*Disallow:\s*\/\s*$/im.test(txt))
        probleme.push('robots.txt sperrt das Crawlen — dann wird das noindex nie gelesen.');
    }
  } catch { /* keine robots.txt ist in Ordnung, die beiden anderen Ebenen greifen */ }

  return probleme;
}

/* Ein nicht erreichbarer Entwurf ist ein Betriebsfehler, kein Qualitätsmangel.
   Beim ersten Testlauf hatte ich die Vercel-Adresse geraten; das Tor bewertete
   die 404-Seite und meldete "abgelehnt" mit lauter plausiblen Gründen. Bei
   hundert Entwürfen am Tag sucht man den Fehler dann im Agenten statt im
   Deployment. */
function istUnerreichbar(seite) {
  const d = seite.desktop;
  if (!d.status || d.status >= 400) return `Der Entwurf antwortet mit HTTP ${d.status ?? '—'}.`;
  const t = (d.dom.title || '') + ' ' + (d.dom.text || '').slice(0, 400);
  if (/404|not found|seite nicht gefunden|deployment not found|no such app/i.test(t) &&
      (d.dom.text || '').length < 1200)
    return 'Unter der Adresse liegt eine Fehlerseite, kein Entwurf.';
  if ((d.dom.text || '').replace(/\s+/g, '').length < 200)
    return 'Der Entwurf liefert praktisch keinen Inhalt.';
  return null;
}

export async function pruefeEntwurf(url, outDir, { brancheHinweis = null, altScore = null, log = () => {} } = {}) {
  const seite = await collect(url, outDir);

  const betriebsfehler = istUnerreichbar(seite);
  if (betriebsfehler) {
    log(betriebsfehler);
    return { url: seite.finalUrl, gesamt: null, altScore, branche: null, kategorien: {},
             betriebsfehler, pflicht: [], maengel: [], hinweise: [], bestanden: false,
             screenshots: { desktop: seite.desktop.shot, mobile: seite.mobile.shot } };
  }

  const branche = erkenneBranche(seite.desktop.dom, seite.rawHtml, brancheHinweis);
  log(`${profilVon(branche.key).label}`);

  const pflicht = await pruefeIndexSperre(seite.desktop, seite.finalUrl);

  const kategorien = {
    mobile:  checkMobile(seite),
    content: checkContent({ ...seite, branche }),
    seo:     checkSeo(seite),
    tech:    await checkTech(seite),
  };

  /* Lighthouse schwankt. Dieselbe Seite auf derselben Maschine ergab in zwei
     Läufen 95 und 75 Punkte — ein Tor, das darauf sperrt, schickt den Agenten
     in grundlose Neubauten. Bei schwacher Technik wird deshalb einmal
     nachgemessen und der bessere Wert genommen. Die Messung ist lokal und
     kostet nichts außer Sekunden; ein überflüssiger Neubau kostet Tokens. */
  if ((kategorien.tech?.score ?? 100) < 85) {
    const zweite = await checkTech(seite);
    if ((zweite?.score ?? 0) > (kategorien.tech?.score ?? 0)) {
      log(`Technik nachgemessen: ${kategorien.tech.score} → ${zweite.score}`);
      kategorien.tech = zweite;
    }
  }
  const imp = await checkImpression([{
    label: 'Entwurf', url: seite.finalUrl,
    desktopShot: seite.desktop.shot, mobileShot: seite.mobile.shot,
    css: seite.desktop.dom?.css,
    cssFehler: (seite.desktop.requests || []).filter((q) => q.type === 'stylesheet' && q.status >= 400),
  }]);
  kategorien.impression = imp.gesamt;

  /* Eigene Fehler wiegen schwerer als fremde: Bei einem fremden Betrieb ist ein
     Befund ein Verkaufsargument, beim eigenen Entwurf ein Mangel. Deshalb hier
     keine Gewichtung über acht Kategorien, sondern harte Mindestwerte je
     Dimension — ein hervorragender Text rettet keine unlesbare Schrift. */
  const w = (n) => kategorien[n]?.score ?? null;
  const guete = [];
  if (w('impression') != null && w('impression') < SCHWELLE.eindruck)
    guete.push(`Design-Urteil ${w('impression')} — mindestens ${SCHWELLE.eindruck} nötig.`);
  if (w('mobile') != null && w('mobile') < SCHWELLE.mobil)
    guete.push(`Mobil ${w('mobile')} — mindestens ${SCHWELLE.mobil} nötig.`);

  const werte = Object.values(kategorien).map((c) => c?.score).filter((x) => typeof x === 'number');
  const gesamt = werte.length ? Math.round(werte.reduce((a, b) => a + b, 0) / werte.length) : null;
  if (gesamt != null && gesamt < SCHWELLE.gesamt)
    guete.push(`Gesamtwert ${gesamt} — mindestens ${SCHWELLE.gesamt} nötig.`);
  if (altScore != null && gesamt != null && gesamt - altScore < SCHWELLE.vorsprung)
    guete.push(`Nur ${gesamt - altScore} Punkte besser als das Original (${altScore}) — ` +
               `mindestens ${SCHWELLE.vorsprung} nötig, sonst ist der Nachbau kein Argument.`);

  /* Messbare Mängel halten den Entwurf auf. Das Screenshot-Urteil liefert aber
     auch Geschmacksanmerkungen — und markiert seine erste Schwäche immer als
     "schwer". Beides zu vermischen ließ einen Entwurf mit 92 Punkten an dem
     Satz scheitern, das Hero-Foto sei zu dunkel. Das ist eine Meinung, kein
     Mangel: Sie gehört Noah vorgelegt, nicht als Sperre verwendet. */
  const messbar = ['mobile', 'content', 'seo', 'tech'];
  const maengel = [...guete];
  for (const n of messbar)
    for (const f of (kategorien[n]?.findings ?? []).filter((x) => x.severity === 'high').slice(0, 3))
      maengel.push(f.text);

  const hinweise = (kategorien.impression?.findings ?? []).map((f) => f.text).slice(0, 4);

  return {
    url: seite.finalUrl, gesamt, altScore, branche, betriebsfehler: null,
    kategorien: Object.fromEntries(Object.entries(kategorien).map(([k, v]) => [k, v?.score ?? null])),
    pflicht, maengel, hinweise,
    bestanden: pflicht.length === 0 && maengel.length === 0,
    screenshots: { desktop: seite.desktop.shot, mobile: seite.mobile.shot },
  };
}
