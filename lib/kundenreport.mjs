/* Kundenreport — die Seite, die beim Betrieb ankommt.

   Nicht zu verwechseln mit lib/report.mjs: das ist die Terminalausgabe für uns.
   Hier entsteht ein Dokument für den Inhaber. Es gelten andere Regeln:

   - Auswählen statt aufzählen. Ein Scan liefert 30 Befunde, ein Report zeigt
     drei dringende und sechs weitere. Wer alles zeigt, zeigt nichts.
   - Jeder dringende Punkt braucht einen Beleg und einen Satz, warum er zählt.
     Ohne den Satz ist es eine Messung, keine Aussage.
   - Keine erfundenen Zahlen. Kein "88 % der Nutzer springen ab". Was wir
     sagen, muss aus dem Scan belegbar sein.
   - Erst, was gut ist. Dann, was fehlt.
   - Druckbar. Noah denkt an Post, also ist A4 kein Nachgedanke.             */

import { WEIGHTS } from './score.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── Themen ───────────────────────────────────────────────────────────
   Ein Scan meldet denselben Sachverhalt mehrfach: "29 % der Knöpfe zu klein"
   für die Startseite, "30 %" für die Kontaktseite, "67 %" für eine dritte.
   Für uns sind das drei Befunde, für den Inhaber ist es ein Thema.

   `rang` ist die Reihenfolge nach Dringlichkeit aus Sicht des Betriebs, nicht
   nach unserer Gewichtung. Recht steht weit oben, weil daraus ein
   Anwaltsschreiben werden kann — das ist für einen Inhaber dringender als ein
   schwaches Hero-Bild, auch wenn Letzteres mehr über die Seite aussagt.      */
const THEMEN = [
  /* Eng gefasst, und das mit Absicht. Ein weiteres /nicht geladen/ hat bei
     ruehle-maschinenpark.de zugeschlagen, wo das Design-Urteil über ein
     einzelnes Bild sagte, es "wirkt wie eine nicht geladene Grafik" — daraus
     wurde die Überschrift "Die Seite lädt nicht vollständig" und die
     Empfehlung, zuerst zu reparieren. Gegen alle 55 Stufe-2-Scans geprüft:
     dieses Muster trifft genau den einen echten Fall und keinen weiteren. */
  { id: 'aufbau', rang: 1, titel: 'Die Seite lädt nicht vollständig',
    rx: /Stylesheet|ohne Gestaltung (ausgeliefert|geladen)|lädt (dadurch )?ohne Gestaltung|lud .*ohne Gestaltung|Mixed Content/i,
    warum: 'Das ist kein Geschmacksthema. Solange eine Datei fehlt, sieht jeder Besucher unformatierten Text statt Ihrer Seite.' },

  { id: 'recht', rang: 2, titel: 'Recht und Sicherheit',
    rx: /Google Fonts|Abmahn|Impressum|Datenschutz|DSGVO|Sicherheitsrisiko|veraltete WordPress|WordPress-Version/i,
    warum: 'Das sind die Punkte, bei denen aus einem Website-Thema ein Schreiben von einem Anwalt werden kann. Sie sind meist in wenigen Stunden erledigt.' },

  { id: 'empfang', rang: 3, titel: 'Das Erste, was ein Besucher sieht',
    rx: /Cookie|Overlay|verdeckt|Hinweisfenster/i,
    warum: 'Der erste Bildschirm entscheidet, ob jemand bleibt. Steht dort ein Fenster, hat Ihre Seite ihn noch nicht erreicht.' },

  { id: 'erstereindruck', rang: 4, titel: 'Der erste Bildschirm auf dem Handy',
    rx: /Ohne zu scrollen|Über dem Fold|erster Bildschirm/i,
    warum: 'Wer auf dem Handy landet und weder ein Bild noch eine Überschrift sieht, weiß in den ersten Sekunden nicht, wo er gelandet ist.' },

  { id: 'naechsterschritt', rang: 5, titel: 'Was ein Besucher als Nächstes tun soll',
    rx: /Handlungsaufforderung|Handlungsknopf|Call.?to.?Action/i,
    warum: 'Ein Besucher, der nicht sofort sieht, wie er anruft, bucht oder anfragt, macht in den meisten Fällen gar nichts.' },

  { id: 'informationen', rang: 6, titel: 'Informationen, nach denen gesucht wird',
    rx: /Öffnungszeiten|Sprechzeiten|Speisekarte|Leistungsübersicht|anbietet|Kontaktmöglichkeit|Preisliste|Telefonnummer ist nicht/i,
    warum: 'Öffnungszeiten, Leistungen und Erreichbarkeit sind das, wonach lokal gesucht wird. Was nicht auf der Seite steht, sucht man woanders.' },

  { id: 'tempo', rang: 7, titel: 'Ladezeit',
    rx: /\bMB\b|Sekunden|\bLCP\b|Ladeleistung|Lighthouse|Bilder über \d|Dateien werden|unkomprimiert/i,
    warum: 'Im Mobilfunknetz ist Ladezeit der Unterschied zwischen einem Besuch und einem Rücksprung zur Trefferliste.' },

  { id: 'bedienung', rang: 8, titel: 'Bedienbarkeit auf dem Handy',
    rx: /kleiner als \d+ ?px|enger als \d+ ?px|antippbar|Zoomen|seitlich über|rechten Rand|horizontales Scrollen/i,
    warum: 'Knöpfe unter 36 Pixel trifft man mit dem Daumen nicht zuverlässig. Jeder Fehlgriff ist ein kleiner Grund, es sein zu lassen.' },

  { id: 'gestaltung', rang: 9, titel: 'Gestaltung und Wirkung',
    rx: /^$/,   // wird über die Belegstelle erkannt, siehe themaVon()
    warum: 'Für viele ist der Auftritt der erste Eindruck vom Betrieb — oft, bevor überhaupt jemand mit Ihnen gesprochen hat.' },

  { id: 'google', rang: 10, titel: 'Auftritt in der Google-Suche',
    rx: /Meta-Beschreibung|\(H1\)|Hauptüberschrift|strukturierte Daten|Alternativtext|Seitentitel/i,
    warum: 'Diese Punkte bestimmen, mit welchem Text und welchen Zusatzangaben Sie in der Trefferliste erscheinen.' },

  { id: 'pflege', rang: 11, titel: 'Pflegezustand',
    rx: /Lorem Ipsum|Platzhalter|nie fertig|veraltet|letzte Änderung|Jahreszahl/i,
    warum: 'Platzhalter und alte Stände lesen Besucher als Schild: Hier kümmert sich gerade niemand.' },

  { id: 'sonstiges', rang: 12, titel: 'Weitere Beobachtungen', rx: /.*/, warum: null },
];

/* Aufbau und Recht gehen der Screenshot-Erkennung vor.

   Gemessen an praxis-drwetzel.de: Dort meldet das Design-Urteil "Die Seite wird
   ohne Gestaltung ausgeliefert" — der wichtigste Befund des ganzen Scans. Weil
   er aus den Screenshots stammt, landete er unter "Gestaltung" und fiel aus den
   drei dringenden Punkten heraus. Eine Seite, die ohne Stylesheet ausgeliefert
   wird, ist aber kein Gestaltungsthema, sondern ein Ausfall. */
const VORRANG = ['aufbau', 'recht'];

function themaVon(f) {
  for (const id of VORRANG) {
    const t = THEMEN.find((x) => x.id === id);
    if (t.rx.test(f.text)) return t;
  }
  // Das Design-Urteil kommt aus den Screenshots und trägt das als Belegstelle.
  // Daran ist es sicherer zu erkennen als am Text, der von allem handeln kann.
  if (/^Screenshot-Urteil/i.test(String(f.evidence || '')) || /^zeitgemäß/i.test(String(f.evidence || '')))
    return THEMEN.find((t) => t.id === 'gestaltung');
  return THEMEN.find((t) => t.id !== 'gestaltung' && t.rx.test(f.text)) ?? THEMEN.at(-1);
}

const RANG = { high: 0, medium: 1, low: 2 };

/* Befunde zu Themen bündeln. Je Thema bleibt ein Befund als Aufhänger stehen:
   der schwerste, bei Gleichstand der mit Belegstelle. */
export function buendele(befunde) {
  const gruppen = new Map();
  for (const f of befunde) {
    const t = themaVon(f);
    if (!gruppen.has(t.id)) gruppen.set(t.id, { ...t, befunde: [] });
    gruppen.get(t.id).befunde.push(f);
  }
  for (const g of gruppen.values()) {
    g.befunde.sort((a, b) => RANG[a.severity] - RANG[b.severity] || (b.evidence ? 1 : 0) - (a.evidence ? 1 : 0));
    g.kopf = g.befunde[0];
    g.schwer = g.befunde.filter((f) => f.severity === 'high').length;
  }
  return [...gruppen.values()].sort((a, b) => a.rang - b.rang);
}

/* ── Textbausteine, die aus Zahlen entstehen ──────────────────────── */

function einleitung(scan, name) {
  const k = scan.categories || {};
  const schwach = Object.entries(WEIGHTS)
    .filter(([id]) => typeof k[id]?.score === 'number' && k[id].score < 45)
    .sort((a, b) => k[a[0]].score - k[b[0]].score).slice(0, 2).map(([, w]) => w.label);
  const anzahl = (scan.findings || []).filter((f) => f.severity === 'high').length;
  const seiten = scan.seiten?.length || 1;

  const satz1 = `Wir haben ${seiten === 1 ? 'die Startseite' : `${seiten} Seiten`} von ${name} am `
    + `${new Date(scan.scannedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} `
    + `automatisiert geprüft — am Rechner und auf dem Handy.`;
  const satz2 = anzahl
    ? `Dabei sind ${anzahl} Punkte aufgefallen, die wir als dringend einstufen${schwach.length ? `; am deutlichsten bei ${schwach.join(' und ')}` : ''}.`
    : `Dringende Mängel haben wir keine gefunden.`;
  const satz3 = 'Auf den nächsten Seiten steht, was gut läuft, was wir zuerst ändern würden und woran wir das festmachen.';
  return [satz1, satz2, satz3];
}

function empfehlung(scan, gruppen = []) {
  const k = scan.categories || {};
  const eindruck = k.impression?.score;

  /* Ist die Seite gerade defekt, ist jede Empfehlung zu Gestaltung oder
     Neubau am Thema vorbei. Dann wird zuerst repariert — und das ist auch
     das Gespräch, das am ehesten zustande kommt. */
  const kaputt = gruppen.find((g) => g.id === 'aufbau');
  if (kaputt) return { hauptweg: 'reparieren',
    titel: 'Unser Vorschlag: zuerst die Seite wieder herstellen',
    text: 'Alles andere kommt danach. Im Moment wird Ihre Seite nicht vollständig ausgeliefert — Besucher sehen eine Rohfassung, nicht Ihren Auftritt. Das ist in der Regel in wenigen Stunden behoben und unabhängig davon, wie es danach weitergeht.',
    zweitweg: 'Wenn die Seite wieder steht, sehen wir uns gemeinsam an, ob sich eine Überarbeitung lohnt oder ob sie so bleiben kann.' };
  const technisch = (typeof k.tech?.score === 'number' && k.tech.score < 60)
    || (typeof k.mobile?.score === 'number' && k.mobile.score < 55);

  if (typeof eindruck === 'number' && eindruck < 40) {
    return { hauptweg: 'neu',
      titel: 'Unser Vorschlag: ein neuer Auftritt',
      text: 'Bei der Gestaltung lohnt sich Flickwerk aus unserer Sicht nicht. Die Seite einzeln nachzubessern kostet über die Zeit mehr, als sie einmal neu aufzusetzen — mit Ihren Inhalten, Ihren Bildern, Ihrem Namen.',
      zweitweg: technisch ? 'Wenn das zu weit geht, lässt sich zumindest der technische Teil kurzfristig geradeziehen: Ladezeit, Bedienbarkeit auf dem Handy und die rechtlichen Punkte. Das ist ein überschaubarer Auftrag.' : null };
  }
  return { hauptweg: 'glattziehen',
    titel: 'Unser Vorschlag: erst einmal glattziehen',
    text: 'Die Seite trägt. Wir würden sie nicht ersetzen, sondern die Punkte oben abarbeiten — Ladezeit, Bedienbarkeit auf dem Handy, die rechtlichen Themen und die fehlenden Angaben. Das ist ein klar abgegrenzter Auftrag und kein Projekt.',
    zweitweg: 'Wenn Sie ohnehin über einen neuen Auftritt nachdenken, sagen Sie es im Gespräch — dann rechnen wir beides gegeneinander.' };
}

/* ── Die Seite ────────────────────────────────────────────────────── */

/* Der Name, der oben auf dem Report steht.

   Der Datenbankeintrag ist oft nur die Domain — dann steht dort
   "parkhotel-ilshofen.com", obwohl das Haus "Flair Park Hotel Ilshofen" heißt.
   Den richtigen Namen trägt fast immer der Seitentitel, nur mit Beiwerk:
   "Startseite - Rühle GmbH Maschinenpark", "VitalWelt Apotheken - Home".
   Getrennt wird nur an " - " mit Leerzeichen, damit Park-Hotel und e-masters
   heil bleiben. */
const FUELLWORT = /^(home|start|startseite|index|aktuelles|(herzlich )?willkommen\b.*)$/i;

export function nameAus(titel, host) {
  const teile = String(titel || '').split(/\s+[-–—|]\s+|:\s+/)
    .map((t) => t.trim()).filter((t) => t && !FUELLWORT.test(t));
  const treffer = teile.find((t) => t.length <= 45);
  return treffer || host;
}

export function kundenreport({ scan, betrieb = {}, bilder = {}, absender = {} }) {
  const host = (() => { try { return new URL(scan.finalUrl || scan.url).hostname.replace(/^www\./, ''); } catch { return scan.url; } })();
  const ausDb = betrieb.name && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(betrieb.name) ? betrieb.name : null;
  const name = ausDb || nameAus(scan.meta?.title, host);
  const k = scan.categories || {};
  const gruppen = buendele(scan.findings || []);

  /* Dringend ist, was ein 'high' trägt — oder zu den beiden Themen gehört, die
     ihrer Natur nach dringend sind. Der kaputte Seitenaufbau bei
     praxis-drwetzel.de steht im Scan als 'medium', weil das Design-Urteil nichts
     Schwereres vergibt. Aus Sicht des Inhabers ist er trotzdem Punkt eins. */
  const dringend = gruppen
    .filter((g) => g.schwer > 0 || (g.rang <= 2 && g.befunde.some((f) => f.severity !== 'low')))
    .slice(0, 3);
  const weitere = gruppen.filter((g) => !dringend.includes(g)).slice(0, 6);
  const staerken = (k.impression?.data?.staerken || []).slice(0, 3);
  const rat = empfehlung(scan, gruppen);
  const saetze = einleitung(scan, name);

  const balken = Object.entries(WEIGHTS).map(([id, w]) => {
    const s = k[id]?.score;
    return { label: w.label, score: typeof s === 'number' ? s : null };
  });

  const punkt = (f) => `<li>${esc(f.text)}${f.evidence
    ? `<span class="beleg">${esc(String(f.evidence).slice(0, 120))}</span>` : ''}</li>`;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>Website-Analyse ${esc(name)}</title>
<style>
:root{
  --akzent:#673AB7; --akzent-weich:#EDE7F6;
  --ink:#121926; --ink-2:#4B5565; --ink-3:#697586;
  --linie:#E3E8EF; --flaeche:#F8FAFC; --papier:#fff;
  --dringend:#C62828; --gut:#00753A;
  --rand:clamp(1.25rem,5vw,3.5rem);
}
*{box-sizing:border-box}
body{margin:0;background:#EEF2F6;color:var(--ink);
  font:400 16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased}
.blatt{max-width:50rem;margin:0 auto;background:var(--papier);
  padding:0 var(--rand) 4rem;box-shadow:0 2px 24px rgba(18,25,38,.07)}
h1,h2,h3{line-height:1.2;letter-spacing:-.02em;margin:0}
h1{font-size:clamp(1.9rem,4.5vw,2.6rem);font-weight:600}
h2{font-size:clamp(1.2rem,2.6vw,1.45rem);font-weight:600}
h3{font-size:1.05rem;font-weight:600}
p{margin:0 0 1rem}
section{padding:2.75rem 0;border-top:1px solid var(--linie)}
section:first-of-type{border-top:0}
.marke{display:flex;align-items:center;justify-content:space-between;gap:1rem;
  padding:1.5rem 0 0;flex-wrap:wrap}
.marke img{height:30px;width:auto}
.marke .wer{font-size:.8rem;color:var(--ink-3);text-align:right;line-height:1.5}
.kopf{padding:2.5rem 0 2.75rem}
.auge{display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:.11em;
  text-transform:uppercase;color:var(--akzent);background:var(--akzent-weich);
  padding:.35rem .7rem;border-radius:999px;margin-bottom:1.25rem}
.kopf .domain{margin:.6rem 0 0;font-size:1.05rem;color:var(--ink-3)}
.vorspann{margin-top:2rem;font-size:1.08rem;color:var(--ink-2);max-width:40rem}
.vorspann p:last-child{margin-bottom:0}

.gut{background:var(--flaeche);border-radius:12px;padding:1.75rem}
.gut h2{margin-bottom:1rem}
.gut ul{margin:0;padding:0;list-style:none;display:grid;gap:.85rem}
.gut li{position:relative;padding-left:1.75rem;color:var(--ink-2)}
.gut li::before{content:"";position:absolute;left:.1rem;top:.55rem;width:.6rem;height:.6rem;
  border-radius:50%;background:var(--gut)}

.sache{break-inside:avoid;page-break-inside:avoid;margin-top:2rem;
  border-left:3px solid var(--dringend);padding-left:1.4rem}
.sache:first-of-type{margin-top:1.75rem}
.sache .nr{font-size:.72rem;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--dringend)}
.sache h3{margin:.35rem 0 .6rem}
.sache .satz{color:var(--ink);margin:0 0 .9rem}
.sache ul{margin:0 0 .9rem;padding-left:1.1rem;color:var(--ink-2);font-size:.95rem}
.sache li{margin-bottom:.4rem}
.beleg{display:block;font-size:.8rem;color:var(--ink-3);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:.15rem;
  word-break:break-word}
.beleg--frei{margin:-.5rem 0 .9rem}
.warum{background:var(--akzent-weich);border-radius:8px;padding:.85rem 1rem;
  font-size:.93rem;color:#3d2270;margin:0}
.warum b{font-weight:600}

.schirm{display:grid;grid-template-columns:minmax(0,210px) 1fr;gap:2rem;align-items:start;margin-top:1.75rem}
.schirm figure{margin:0}
.schirm img{width:100%;height:auto;display:block;border:1px solid var(--linie);border-radius:10px}
.schirm figcaption{font-size:.8rem;color:var(--ink-3);margin-top:.6rem}
.schirm ul{margin:0;padding-left:1.1rem;color:var(--ink-2);font-size:.95rem}
.schirm li{margin-bottom:.55rem}

.rest{margin:1.5rem 0 0;padding:0;list-style:none;display:grid;gap:1.1rem}
.rest li{break-inside:avoid}
.rest h3{font-size:.98rem;margin-bottom:.3rem}
.rest p{margin:0;color:var(--ink-2);font-size:.95rem}
.rest .mehr{color:var(--ink-3);font-size:.85rem}

.werte{margin-top:1.5rem;display:grid;gap:.6rem}
.wert{display:grid;grid-template-columns:11rem 1fr 2.5rem;gap:.9rem;align-items:center;font-size:.9rem}
.wert .name{color:var(--ink-2)}
.wert .bahn{height:7px;background:var(--linie);border-radius:999px;overflow:hidden}
.wert .fuell{display:block;height:100%;background:var(--akzent);border-radius:999px}
.wert .fuell.tief{background:var(--dringend)}
.wert .zahl{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-3)}

.rat{background:var(--ink);color:#fff;border-radius:12px;padding:2rem;margin-top:1.5rem}
.rat h2{color:#fff;margin-bottom:.9rem}
.rat p{color:#CDD5DF}
.rat p:last-child{margin-bottom:0}
.rat .zweit{border-top:1px solid #29314F;margin-top:1.25rem;padding-top:1.25rem;font-size:.95rem}

.schluss{display:flex;gap:2rem;flex-wrap:wrap;align-items:baseline;margin-top:1.5rem}
.schluss a{color:var(--akzent);font-weight:500}
.klein{font-size:.84rem;color:var(--ink-3);line-height:1.65}
.klein h3{font-size:.9rem;color:var(--ink-2);margin-bottom:.5rem}
.klein ul{margin:0;padding-left:1.1rem}
.klein li{margin-bottom:.3rem}

@media (max-width:640px){
  .schirm{grid-template-columns:1fr}
  .schirm figure{max-width:210px}
  .wert{grid-template-columns:7.5rem 1fr 2.2rem;font-size:.82rem}
}
@media print{
  @page{size:A4;margin:16mm 14mm}
  body{background:#fff;font-size:10.5pt}
  .blatt{box-shadow:none;max-width:none;padding:0}
  section{padding:1.5rem 0;break-inside:auto}
  .sache,.gut,.rat,.schirm,.rest li{break-inside:avoid}
  .rat{background:#fff;color:var(--ink);border:1.5px solid var(--ink);padding:1.25rem}
  .rat h2{color:var(--ink)} .rat p{color:var(--ink-2)}
  .seitenwechsel{break-before:page}
}
</style>
</head>
<body>
<div class="blatt">

<div class="marke">
  ${bilder.logo ? `<img src="${esc(bilder.logo)}" alt="${esc(absender.firma || 'AdMemory')}">`
                : `<strong>${esc(absender.firma || 'AdMemory')}</strong>`}
  <div class="wer">${esc(absender.firma || 'AdMemory')}${absender.ort ? ` · ${esc(absender.ort)}` : ''}<br>
    ${esc(absender.person || '')}</div>
</div>

<header class="kopf">
  <span class="auge">Website-Analyse</span>
  <h1>${esc(name)}</h1>
  ${name === host ? '' : `<p class="domain">${esc(host)}</p>`}
  <div class="vorspann">${saetze.map((s) => `<p>${esc(s)}</p>`).join('\n    ')}</div>
</header>

${staerken.length ? `<section>
  <div class="gut">
    <h2>Was gut funktioniert</h2>
    <ul>${staerken.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  </div>
</section>` : ''}

${dringend.length ? `<section>
  <h2>Was wir zuerst ändern würden</h2>
  ${dringend.map((g, i) => `<article class="sache">
    <span class="nr">Punkt ${i + 1}</span>
    <h3>${esc(g.titel)}</h3>
    <p class="satz">${esc(g.kopf.text)}</p>
    ${g.befunde.length > 1 ? `<ul>${g.befunde.slice(1, 4).map(punkt).join('')}</ul>`
      : g.kopf.evidence ? `<p class="beleg beleg--frei">${esc(String(g.kopf.evidence).slice(0, 120))}</p>` : ''}
    ${g.warum ? `<p class="warum"><b>Warum das zählt:</b> ${esc(g.warum)}</p>` : ''}
  </article>`).join('\n  ')}
</section>` : ''}

${bilder.mobil ? `<section>
  <h2>Ihre Startseite auf dem Handy</h2>
  <div class="schirm">
    <figure>
      <img src="${esc(bilder.mobil)}" alt="Startseite von ${esc(host)} auf einem Mobiltelefon">
      <figcaption>Aufgenommen mit 375 Pixel Breite — der Größe eines gängigen Mobiltelefons.</figcaption>
    </figure>
    <ul>${(k.impression?.data?.schwaechen || []).slice(0, 4).map((s) => `<li>${esc(s)}</li>`).join('')
      || '<li>Keine auffälligen Punkte im sichtbaren Bereich.</li>'}</ul>
  </div>
</section>` : ''}

${weitere.length ? `<section>
  <h2>Weitere Punkte</h2>
  <ul class="rest">${weitere.map((g) => `<li>
    <h3>${esc(g.titel)}</h3>
    <p>${esc(g.kopf.text)}</p>
    ${g.befunde.length > 1 ? `<p class="mehr">${g.befunde.length - 1} weitere${g.befunde.length === 2 ? 'r Punkt' : ' Punkte'} zu diesem Thema.</p>` : ''}
  </li>`).join('\n  ')}</ul>
</section>` : ''}

<section>
  <h2>Wo die Seite steht</h2>
  <div class="werte">
    ${balken.map((b) => `<div class="wert">
      <span class="name">${esc(b.label)}</span>
      <span class="bahn">${b.score === null ? '' : `<span class="fuell${b.score < 45 ? ' tief' : ''}" style="width:${b.score}%"></span>`}</span>
      <span class="zahl">${b.score === null ? '–' : b.score}</span>
    </div>`).join('\n    ')}
  </div>
</section>

<section>
  <div class="rat">
    <h2>${esc(rat.titel)}</h2>
    <p>${esc(rat.text)}</p>
    ${rat.zweitweg ? `<p class="zweit">${esc(rat.zweitweg)}</p>` : ''}
  </div>
  <div class="schluss">
    ${absender.telefon ? `<span>Telefon <a href="tel:${esc(absender.telefon.replace(/[^+\d]/g, ''))}">${esc(absender.telefon)}</a></span>` : ''}
    ${absender.email ? `<span>E-Mail <a href="mailto:${esc(absender.email)}">${esc(absender.email)}</a></span>` : ''}
    ${absender.web ? `<span><a href="https://${esc(absender.web)}">${esc(absender.web)}</a></span>` : ''}
  </div>
</section>

<section class="klein">
  <h3>Wie wir das gemessen haben</h3>
  <ul>
    <li>Geprüft am ${esc(new Date(scan.scannedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }))}${scan.seiten?.length ? `, ${scan.seiten.length} Seite${scan.seiten.length > 1 ? 'n' : ''}: ${esc(scan.seiten.map((s) => s.label).join(', '))}` : ''}.</li>
    <li>Ladezeit und Technik mit Google Lighthouse, mobil simuliert. Darstellung bei 1440 Pixel (Rechner) und 375 Pixel (Handy).</li>
    <li>Die Einschätzung zur Gestaltung stammt von einem Sprachmodell, das beide Ansichten gesehen hat. Sie ist ein Urteil, keine Messung.</li>
    <li>Wir haben nur öffentlich erreichbare Seiten aufgerufen und nichts verändert.</li>
    <li>Was wir nicht sehen konnten: Bereiche hinter einer Anmeldung, Ihre Besucherzahlen und alles, was nach dem Prüfdatum geändert wurde.</li>
  </ul>
</section>

</div>
</body>
</html>`;
}
