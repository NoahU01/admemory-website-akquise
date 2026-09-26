import { finding, clamp, pct } from './_util.mjs';

/* Mobil — Punkte werden VERDIENT.
   Grund für die Umstellung: Die alte Acanto-Seite bekam im Abzugsmodell 100/100,
   obwohl über dem Fold nur Adresszeile, zwei Social-Icons und ein Cookie-Banner
   standen, der die Hauptüberschrift zur Hälfte verdeckte. Fehlerfreiheit ist
   nicht dasselbe wie mobil brauchbar. Zwei Blöcke:
   A) Technische Hygiene (max 40)  B) Mobile Komposition (max 60)                */
export function checkMobile({ mobile }) {
  const d = mobile.dom, F = d.fold, f = [];
  let pts = 0;
  const earn = (n) => { pts += n; };

  // ── A) Technische Hygiene ────────────────────────────────────────────
  if (!d.viewportMeta) f.push(finding('high', 'Die Seite hat kein Viewport-Meta-Tag — auf dem Handy wird die Desktop-Ansicht verkleinert dargestellt.', 'meta[name=viewport] fehlt'));
  else {
    earn(10);
    if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(d.viewportMeta)) { pts -= 4; f.push(finding('medium', 'Zoomen ist auf dem Handy gesperrt — ein Barriere-Problem.', `viewport: ${d.viewportMeta}`)); }
  }

  if (d.docWidth <= d.vw + 4) earn(10);
  else f.push(finding('high', `Die Seite läuft mobil seitlich über (${d.docWidth} px Inhalt bei ${d.vw} px Bildschirm) — es entsteht horizontales Scrollen.`, `scrollWidth ${d.docWidth} > ${d.vw}`));
  if (d.overflowCount > 3) f.push(finding('low', `${d.overflowCount} Elemente ragen mobil über den rechten Rand hinaus.`));

  const small = d.targets.filter((t) => t.h < 36 || t.w < 36).length;
  const smallPct = pct(small, d.targets.length);
  if (!d.targets.length || smallPct <= 10) earn(10);
  else if (smallPct <= 25) earn(6);
  else if (smallPct <= 45) { earn(2); f.push(finding('medium', `${smallPct} % der Links und Knöpfe sind mobil kleiner als 36 px.`, `${small} von ${d.targets.length}`)); }
  else f.push(finding('high', `${smallPct} % der Links und Knöpfe sind mobil kleiner als 36 px — schwer zu treffen.`, `${small} von ${d.targets.length}`));
  if (d.tapGapIssues > 6) f.push(finding('medium', `${d.tapGapIssues} Bedienelemente liegen enger als 8 px beieinander — man trifft leicht daneben.`));

  const tiny = d.textSizes.filter((s) => s < 12).length;
  const tinyPct = pct(tiny, d.textSizes.length);
  if (!d.textSizes.length || tinyPct <= 5) earn(10);
  else if (tinyPct <= 15) earn(5);
  else f.push(finding(tinyPct > 25 ? 'high' : 'medium', `${tinyPct} % des Textes ist mobil kleiner als 12 px.`));

  // ── B) Mobile Komposition ────────────────────────────────────────────
  if (F.hero) earn(16);
  else f.push(finding('high', 'Ohne zu scrollen sieht man kein Bild vom Betrieb — der erste Eindruck bleibt leer.'));

  if (F.h1 && !F.h1Blocked) earn(14);
  else if (F.h1Blocked) f.push(finding('high', 'Die Hauptüberschrift wird beim Laden von einem Overlay verdeckt — das Erste, was ein Gast sieht, ist ein Hinweisfenster.'));
  else if (F.heading) { earn(6); f.push(finding('medium', 'Über dem Fold steht keine Hauptüberschrift — man erfährt nicht sofort, worum es geht.')); }
  else f.push(finding('high', 'Ohne zu scrollen steht keine Überschrift auf dem Bildschirm — man erfährt nicht, worum es geht.'));

  if (F.ctas >= 1) earn(12);
  else f.push(finding('high', 'Ohne zu scrollen gibt es keinen Handlungsknopf (reservieren, anrufen, Karte) — auf dem Handy der wichtigste Platz.'));

  if (F.consentCover >= 45) f.push(finding('high', `Der Cookie-Hinweis verdeckt beim Laden ${F.consentCover} % des Bildschirms.`));
  else if (F.consentCover >= 25) { earn(4); f.push(finding('medium', `Der Cookie-Hinweis verdeckt beim Laden ${F.consentCover} % des Bildschirms.`)); }
  else earn(8);

  const nonConsent = F.overlays.filter((o) => !o.isConsent).reduce((m, o) => Math.max(m, o.cover), 0);
  if (nonConsent >= 25) f.push(finding('medium', `Ein eingeblendetes Fenster verdeckt ${nonConsent} % des Bildschirms.`, F.overlays.find((o) => !o.isConsent)?.cls));
  else earn(4);

  if (mobile.loadMs > 8000) { pts -= 8; f.push(finding('medium', `Mobil dauert das Laden ${(mobile.loadMs / 1000).toFixed(1)} Sekunden.`)); }
  const oversized = d.imgs.filter((i) => i.w > 0 && i.dw > 0 && i.w > i.dw * 2.5 && i.w > 1200).length;
  if (oversized >= 3) { pts -= 5; f.push(finding('low', `${oversized} Bilder werden mobil in weit größerer Auflösung geladen als nötig — kostet Datenvolumen.`)); }

  return {
    score: clamp(pts), findings: f,
    data: { viewportMeta: d.viewportMeta, docWidth: d.docWidth, smallTargetsPct: smallPct, tinyTextPct: tinyPct,
            tapGapIssues: d.tapGapIssues, loadMs: mobile.loadMs,
            fold: { hero: F.hero, h1: F.h1, h1Blocked: F.h1Blocked, ctas: F.ctas, consentCover: F.consentCover, overlayCover: F.overlayCover } },
  };
}
