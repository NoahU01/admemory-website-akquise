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

/* ── Die Seite ──────────────────────────────────────────────────────
   Gestaltung nach Noahs eigener Meta-Ads-Analyse ("AdMemory-Report
   erstellen.pdf", Hotel Rose). Aus der Vorlage gemessen statt geraten:

     Schrift      Poppins (einstöckiges a, geometrisches g — dieselbe
                  Schrift wie auf sofortsichtbar.de)
     Indigo       #4f5fe0   Knopf, Logo, Ziffer 01
     Mitte        #6359dc   Ziffer 02
     Violett      #8b57d6   Ziffer 03, rechtes Ende des Verlaufs
     Papier       #f6f7f9   Karten #ffffff
     Tinte        #14161d   Fließtext #6b7180
     Grün         #1a9d5a   Haken

   Aufbau ebenso aus der Vorlage: Kopfleiste mit Verlaufslinie, Augenbraue,
   Name, Kernbefund als ein Absatz, drei nummerierte Karten, Kennzahlenreihe,
   Tabelle, Haken-Reihe, Fußkarte mit Porträt und Knopf. Zwei A4-Seiten.     */

const FUELLWORT = /^(home|start|startseite|index|aktuelles|(herzlich )?willkommen\b.*)$/i;

export function nameAus(titel, host) {
  const teile = String(titel || '').split(/\s+[-–—|]\s+|:\s+/)
    .map((t) => t.trim()).filter((t) => t && !FUELLWORT.test(t));
  const treffer = teile.find((t) => t.length <= 45);
  return treffer || host;
}

/* Kürzen an einer Satz- oder Teilsatzgrenze, nicht mitten im Wort.
   Die Vorlage hält ihre Kartentexte bei rund 100 Zeichen; unsere Befunde sind
   oft länger, weil sie die Belegstelle gleich mitführen. */
export function kuerze(text, max = 115) {
  const t = String(text ?? '').trim();
  if (t.length <= max) return t;
  const bis = t.slice(0, max);
  const satz = Math.max(bis.lastIndexOf('. '), bis.lastIndexOf('! '), bis.lastIndexOf('? '));
  if (satz > max * 0.45) return bis.slice(0, satz + 1);
  const teil = Math.max(bis.lastIndexOf(' — '), bis.lastIndexOf(' – '), bis.lastIndexOf(', '));
  if (teil > max * 0.45) return bis.slice(0, teil).replace(/[,;:]$/, '') + ' …';
  const wort = bis.lastIndexOf(' ');
  return (wort > 0 ? bis.slice(0, wort) : bis).replace(/[,;:–—]$/, '') + ' …';
}

const STAND = (s) => s === null ? { wort: 'nicht messbar', klasse: 'leer' }
  : s < 45 ? { wort: 'kritisch', klasse: 'rot' }
  : s < 65 ? { wort: 'ausbaufähig', klasse: 'gelb' }
  : { wort: 'solide', klasse: 'gut' };

export function kundenreport({ scan, betrieb = {}, bilder = {}, absender = {} }) {
  const host = (() => { try { return new URL(scan.finalUrl || scan.url).hostname.replace(/^www\./, ''); } catch { return scan.url; } })();
  const ausDb = betrieb.name && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(betrieb.name) ? betrieb.name : null;
  const name = ausDb || nameAus(scan.meta?.title, host);
  const k = scan.categories || {};
  const gruppen = buendele(scan.findings || []);

  const dringend = gruppen
    .filter((g) => g.schwer > 0 || (g.rang <= 2 && g.befunde.some((f) => f.severity !== 'low')))
    .slice(0, 3);
  const staerken = (k.impression?.data?.staerken || []).slice(0, 3);
  const rat = empfehlung(scan, gruppen);
  const schwer = (scan.findings || []).filter((f) => f.severity === 'high').length;
  const seitenZahl = scan.seiten?.length || 1;

  /* Fünf Zeilen, nicht acht: Die Vorlage hält ihre Tabelle bei vier. Gezeigt
     werden die schwächsten Bereiche — die starken stehen in der Hakenreihe. */
  const zeilen = Object.entries(WEIGHTS)
    .map(([id, w]) => ({ id, label: w.label, score: k[id]?.score ?? null,
                         erst: (k[id]?.findings || [])[0]?.text || null }))
    .filter((z) => z.score !== null)
    .sort((a, b) => a.score - b.score).slice(0, 5);

  const datum = new Date(scan.scannedAt).toLocaleDateString('de-DE',
    { day: '2-digit', month: '2-digit', year: 'numeric' });

  const kern = schwer
    ? `Wir haben ${seitenZahl === 1 ? 'die Startseite' : `${seitenZahl} Seiten`} von ${name} `
      + `am Rechner und auf dem Handy geprüft. ${schwer} Punkte stufen wir als dringend ein; `
      + `die drei wichtigsten stehen unten. ${staerken.length ? 'Was gut funktioniert, steht auf Seite 2.' : ''} `
      + `Alles, was hier steht, ist am Auftritt nachzuvollziehen — nichts davon ist geraten.`
    : `Wir haben ${seitenZahl === 1 ? 'die Startseite' : `${seitenZahl} Seiten`} von ${name} `
      + `am Rechner und auf dem Handy geprüft und keine dringenden Mängel gefunden. `
      + `Was sich trotzdem lohnt, steht unten.`;

  /* Der Knopf braucht ein Ziel. Ohne Terminlink, Telefonnummer oder Adresse
     wird aus ihm eine Attrappe — dann lieber nur die Kontaktzeile. */
  const ziel = absender.termin ? esc(absender.termin)
    : absender.telefon ? 'tel:' + esc(absender.telefon.replace(/[^+\d]/g, ''))
    : absender.email ? 'mailto:' + esc(absender.email) : null;

  const ziffer = ['01', '02', '03'];

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>Website-Analyse ${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --indigo:#4f5fe0; --mitte:#6359dc; --violett:#8b57d6;
  --papier:#f6f7f9; --karte:#fff; --linie:#e8eaee;
  /* Die Vorlage setzt ihr kleinstes Grau auf #9aa1ae. Gemessen sind das 2,4:1
     auf Weiß — unter der Schwelle, und das in 9,5-px-Beschriftungen auf einem
     Blatt, das gedruckt und von jemandem gelesen wird, der nicht zwanzig ist.
     Beide Grautöne und das Rot sind deshalb so weit nachgedunkelt, dass sie
     4,5:1 erreichen, und nicht weiter. */
  --tinte:#14161d; --tinte-2:#5f6676; --tinte-3:#69707f;
  --gruen:#15854c; --rot:#be372f; --gelb:#9a6208;
}
*{box-sizing:border-box}
body{margin:0;background:#e9ebf0;color:var(--tinte);
  font:400 13.5px/1.6 "Poppins",system-ui,-apple-system,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased}
.blatt{width:720px;max-width:100%;margin:0 auto;background:var(--papier);padding:26px 30px 30px}
h1,h2,h3{margin:0;line-height:1.18}
p{margin:0}

/* Kopfleiste */
.leiste{display:flex;align-items:center;justify-content:space-between;gap:16px}
.wortmarke{display:flex;align-items:center;gap:10px}
.wortmarke svg{display:block;width:26px;height:26px}
.wortmarke span{font-size:19px;font-weight:700;letter-spacing:-.02em}
.leiste .rechts{text-align:right;font-size:11px;line-height:1.5;color:var(--tinte-2)}
.leiste .rechts b{display:block;font-weight:600;color:var(--tinte-2)}
.leiste .rechts span{color:var(--tinte-3)}
.strich{height:2px;border-radius:2px;margin:12px 0 22px;
  background:linear-gradient(90deg,var(--indigo),var(--violett))}

.auge{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--mitte)}
h1{font-size:33px;font-weight:700;letter-spacing:-.025em;margin:5px 0 6px}
.unterzeile{font-size:13px;color:var(--tinte-2)}

h2{font-size:10.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  color:var(--tinte);margin:18px 0 8px}
.kern{font-size:12.5px;line-height:1.6;color:var(--tinte-2);max-width:66ch}

/* Drei nummerierte Karten */
.drei{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:12px}
.karte{background:var(--karte);border-radius:11px;padding:14px 15px 15px;position:relative;
  box-shadow:0 1px 2px rgba(20,22,29,.05);overflow:hidden}
.karte::after{content:"";position:absolute;top:14px;right:0;width:2px;height:26px;border-radius:2px}
.karte:nth-child(1)::after{background:var(--indigo)}
.karte:nth-child(2)::after{background:var(--mitte)}
.karte:nth-child(3)::after{background:var(--violett)}
.karte .nr{font-size:25px;font-weight:700;letter-spacing:-.02em;line-height:1}
.karte:nth-child(1) .nr{color:var(--indigo)}
.karte:nth-child(2) .nr{color:var(--mitte)}
.karte:nth-child(3) .nr{color:var(--violett)}
.karte h3{font-size:12.5px;font-weight:600;margin:9px 0 6px}
.karte p{font-size:11.5px;line-height:1.55;color:var(--tinte-2)}

/* Kennzahlen */
.zahlen{display:grid;grid-template-columns:auto auto auto 1fr;gap:0;
  background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  margin-top:12px;overflow:hidden}
.zahl{padding:12px 18px;border-right:1px solid var(--linie)}
.zahl b{display:block;font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1.1}
.zahl span{font-size:10px;color:var(--tinte-2);line-height:1.3;display:block;margin-top:2px}
.zahlen .satz{padding:15px 20px;font-size:11.5px;line-height:1.55;color:var(--tinte-2);
  display:flex;align-items:center}

/* Tabelle */
.tafel{background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  padding:2px 18px 6px;margin-top:10px}
table{width:100%;border-collapse:collapse}
th{font-size:9.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--tinte-3);text-align:left;padding:10px 0 7px}
th:first-child{color:var(--mitte)}
td{font-size:11.5px;padding:7px 0;border-top:1px solid var(--linie);vertical-align:top;
  color:var(--tinte-2)}
td:first-child{font-weight:600;color:var(--tinte);width:26%}
td.stand{width:24%;white-space:nowrap}
.punkt{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;
  vertical-align:1px;border:1px solid var(--tinte-3)}
.rot .punkt{background:var(--rot);border-color:var(--rot)}
.rot{color:var(--rot);font-weight:500}
.gelb .punkt{background:var(--gelb);border-color:var(--gelb)}
.gut .punkt{background:none}

/* Seite 2 */
.seite2{break-before:page;page-break-before:always;padding-top:4px}
.schirm{display:grid;grid-template-columns:132px 1fr;gap:18px;align-items:start;margin-top:12px}
.schirm figure{margin:0}
.schirm img{display:block;width:100%;height:auto;border-radius:9px;border:1px solid var(--linie)}
.schirm figcaption{font-size:9.5px;color:var(--tinte-3);margin-top:6px;line-height:1.4}
.schirm ul{margin:0;padding:0;list-style:none;display:grid;gap:11px}
.schirm li{font-size:11.5px;line-height:1.55;color:var(--tinte-2);
  padding-left:15px;position:relative}
.schirm li::before{content:"";position:absolute;left:0;top:6px;width:5px;height:5px;
  border-radius:50%;background:var(--violett)}

.neben{display:flex;flex-direction:column;gap:14px}
.haken{background:var(--karte);border-radius:10px;padding:12px 14px;
  box-shadow:0 1px 2px rgba(20,22,29,.05)}
.haken h3{font-size:9.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--tinte-3);margin-bottom:8px}
.haken p{font-size:11px;line-height:1.5;color:var(--tinte);margin-bottom:5px;
  padding-left:16px;text-indent:-16px}
.haken p:last-child{margin-bottom:0}
.haken b{color:var(--gruen);font-weight:700;margin-right:7px}
.haken--breit{columns:2;column-gap:18px}

.rat{background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  padding:15px 18px;margin-top:8px;border-left:3px solid var(--indigo)}
.rat h3{font-size:14px;font-weight:600;margin-bottom:8px}
.rat p{font-size:11.5px;line-height:1.6;color:var(--tinte-2)}
.rat .zweit{margin-top:9px;padding-top:9px;border-top:1px solid var(--linie)}

.fuss{display:flex;align-items:center;gap:14px;background:var(--karte);border-radius:11px;
  padding:14px 18px;margin-top:16px;box-shadow:0 1px 2px rgba(20,22,29,.05)}
.fuss img{width:54px;height:54px;border-radius:50%;object-fit:cover;flex:none;
  border:1px solid var(--linie)}
.fuss .wer{flex:1;min-width:0}
.fuss .wer b{display:block;font-size:14px;font-weight:600}
.fuss .wer .rolle{font-size:11px;color:var(--tinte-3)}
.fuss .wer em{display:block;font-size:11px;line-height:1.5;color:var(--tinte-2);margin-top:5px}
.knopf{flex:none;background:var(--indigo);color:#fff;text-decoration:none;font-size:12px;
  font-weight:600;padding:11px 20px;border-radius:8px;white-space:nowrap}
.kontakt{flex:none;font-size:11.5px;line-height:1.6;text-align:right;color:var(--tinte-2)}
.kontakt a{color:var(--indigo);text-decoration:none;font-weight:500}

.mess{font-size:9.5px;line-height:1.55;color:var(--tinte-3);margin-top:12px}

/* Nur am Bildschirm. Ohne 'screen' greift diese Regel auch im Druck, denn der
   Satzspiegel einer A4-Seite ist nur 703 px breit — dann klappen Karten,
   Hakenreihe und Handy-Ansicht untereinander und der Report wird vier Seiten
   statt zwei. */
@media screen and (max-width:760px){
  .blatt{width:auto;padding:20px 16px 28px}
  .drei{grid-template-columns:1fr}
  .haken--breit{columns:1}
  .zahlen{grid-template-columns:1fr 1fr}
  .zahl{border-bottom:1px solid var(--linie)}
  .schirm{grid-template-columns:1fr}
  .schirm figure{max-width:180px}
  .fuss{flex-wrap:wrap}
  h1{font-size:27px}
}
@media print{
  @page{size:A4;margin:13mm 12mm}
  body{background:#fff}
  .blatt{width:auto;padding:0;background:#fff}
  .karte,.zahlen,.tafel,.rat,.fuss,.haken div{box-shadow:none;border:1px solid var(--linie)}
  .karte,.drei>*,.haken>*,.rat,.fuss,.schirm{break-inside:avoid}
  tr{break-inside:avoid}
  a{color:inherit}
}
</style>
</head>
<body>
<div class="blatt">

<div class="leiste">
  <div class="wortmarke">
    <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 82 L50 20 L82 82" fill="none"
      stroke="#4f5fe0" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span>${esc(absender.firma || 'AdMemory')}</span>
  </div>
  <div class="rechts"><b>Website &middot; Analyse</b><span>${esc(datum)}</span></div>
</div>
<div class="strich"></div>

<span class="auge">Website-Analyse</span>
<h1>${esc(name)}</h1>
<p class="unterzeile">${esc(host)}${betrieb.stadt ? ' &middot; ' + esc(betrieb.stadt) : ''}</p>

<h2>Kernbefund</h2>
<p class="kern">${esc(kern)}</p>

${dringend.length ? `<div class="drei">
  ${dringend.map((g, i) => `<article class="karte">
    <span class="nr">${ziffer[i]}</span>
    <h3>${esc(g.titel)}</h3>
    <p>${esc(kuerze(g.kopf.text, 136))}</p>
  </article>`).join('\n  ')}
</div>` : ''}

<h2>Die Seite im Überblick</h2>
<div class="zahlen">
  <div class="zahl"><b>${scan.total ?? '–'}</b><span>von 100<br>Qualität</span></div>
  <div class="zahl"><b>${schwer}</b><span>dringende<br>Punkte</span></div>
  <div class="zahl"><b>${seitenZahl}</b><span>Seiten<br>geprüft</span></div>
  <p class="satz">${esc(dringend[0]?.warum || kuerze(zeilen[0]?.erst || '', 140))}</p>
</div>

<div class="tafel">
  <table>
    <thead><tr><th>Bereich</th><th>Stand</th><th>Was auffällt</th></tr></thead>
    <tbody>${zeilen.map((z) => { const st = STAND(z.score); return `
      <tr>
        <td>${esc(z.label)}</td>
        <td class="stand ${st.klasse}"><span class="punkt"></span>${esc(st.wort)} ${z.score}</td>
        <td>${esc(kuerze(z.erst || '—', 70))}</td>
      </tr>`; }).join('')}
    </tbody>
  </table>
</div>

<div class="seite2">

${bilder.mobil ? `<h2>Ihre Startseite auf dem Handy</h2>
<div class="schirm">
  <figure>
    <img src="${esc(bilder.mobil)}" alt="Startseite von ${esc(host)} auf einem Mobiltelefon">
    <figcaption>375&nbsp;Pixel Breite — die Größe eines gängigen Mobiltelefons.</figcaption>
  </figure>
  <div class="neben">
    <ul>${(k.impression?.data?.schwaechen || []).slice(0, 4)
      .map((x) => `<li>${esc(kuerze(x, 150))}</li>`).join('')
      || '<li>Im sichtbaren Bereich nichts Auffälliges.</li>'}</ul>
    ${staerken.length ? `<div class="haken">
      <h3>Was bereits gut ist</h3>
      ${staerken.map((x) => `<p><b>&#10003;</b>${esc(kuerze(x, 110))}</p>`).join('\n      ')}
    </div>` : ''}
  </div>
</div>` : staerken.length ? `<h2>Was bereits gut ist</h2>
<div class="haken haken--breit">${staerken.map((x) => `<p><b>&#10003;</b>${esc(kuerze(x, 110))}</p>`).join('')}</div>` : ''}

<h2>Unser Vorschlag</h2>
<div class="rat">
  <h3>${esc(rat.titel.replace(/^Unser Vorschlag:\s*/i, '').replace(/^./, (c) => c.toUpperCase()))}</h3>
  <p>${esc(rat.text)}</p>
  ${rat.zweitweg ? `<p class="zweit">${esc(rat.zweitweg)}</p>` : ''}
</div>

<div class="fuss">
  ${bilder.portraet ? `<img src="${esc(bilder.portraet)}" alt="${esc(absender.person || '')}">` : ''}
  <div class="wer">
    <b>${esc(absender.person || 'AdMemory')}</b>
    <span class="rolle">${esc(absender.rolle || 'AdMemory')}${absender.ort ? ' &middot; ' + esc(absender.ort) : ''}</span>
    <em>Wenn Sie mögen, gehen wir die Punkte gemeinsam durch — unverbindlich und ohne Vorbereitung Ihrerseits.</em>
  </div>
  ${ziel ? `<a class="knopf" href="${ziel}">Gespräch vereinbaren</a>`
    : `<div class="kontakt">${absender.web ? esc(absender.web) : ''}</div>`}
</div>

<p class="mess">Geprüft am ${esc(datum)}${scan.seiten?.length ? `, ${seitenZahl} Seite${seitenZahl > 1 ? 'n' : ''}` : ''}.
Ladezeit und Technik mit Google Lighthouse, mobil simuliert; Darstellung bei 1440&nbsp;Pixel und 375&nbsp;Pixel.
Die Einschätzung zur Gestaltung stammt von einem Sprachmodell, das beide Ansichten gesehen hat — ein Urteil, keine Messung.
Wir haben nur öffentlich erreichbare Seiten aufgerufen und nichts verändert. Nicht sehen konnten wir Bereiche hinter einer
Anmeldung, Ihre Besucherzahlen und alles, was nach dem Prüfdatum geändert wurde.</p>

</div>
</div>
</body>
</html>`;
}
