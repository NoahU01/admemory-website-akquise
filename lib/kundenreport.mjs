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
  /* Das Muster für 'aufbau' ist eng gefasst, und das mit Absicht. Eine weitere
     Fassung mit /nicht geladen/ hat bei ruehle-maschinenpark.de zugeschlagen,
     wo das Design-Urteil über ein einzelnes Bild sagte, es "wirkt wie eine
     nicht geladene Grafik". Daraus wurde die Überschrift "Die Seite lädt nicht
     vollständig" und die Empfehlung, zuerst zu reparieren. Gegen alle 61
     Stufe-2-Scans geprüft: dieses Muster trifft genau den einen echten Fall. */
  { id: 'aufbau', rang: 1, icon: 'triangle-alert',
    titel: 'Technischer Ausfall',
    rx: /Stylesheet|ohne Gestaltung (ausgeliefert|geladen)|lädt (dadurch )?ohne Gestaltung|lud .*ohne Gestaltung|Mixed Content/i,
    warum: 'Besucher sehen dadurch unformatierten Text statt Ihres Auftritts.',
    loesung: 'In aller Regel fehlt nur eine Datei oder ein Pfad stimmt nicht, das ist meist in ein bis zwei Stunden behoben.' },

  { id: 'recht', rang: 2, icon: 'shield', titel: 'Recht & Sicherheit',
    rx: /Google Fonts|Abmahn|Impressum|Datenschutz|DSGVO|Sicherheitsrisiko|veraltete WordPress|WordPress-Version/i,
    warum: 'Das ist der Punkt, an dem aus einem Website-Thema Post von einem Anwalt werden kann.',
    loesung: 'Die Schriften lokal einzubinden und die Software zu aktualisieren erledigt das Thema.' },

  { id: 'empfang', rang: 3, icon: 'layers', titel: 'Erster Eindruck',
    rx: /Cookie|Overlay|verdeckt|Hinweisfenster/i,
    warum: 'Der erste Bildschirm entscheidet darüber, ob jemand bleibt.',
    loesung: 'Ein schmaler Hinweis am unteren Rand erfüllt denselben Zweck, ohne die Seite zu verdecken.' },

  { id: 'erstereindruck', rang: 4, icon: 'smartphone', titel: 'Mobile Ansicht',
    rx: /Ohne zu scrollen|Über dem Fold|erster Bildschirm/i,
    warum: 'Wer auf dem Handy landet und weder ein Bild noch eine Überschrift sieht, weiß in den ersten Sekunden nicht, wo er gelandet ist.',
    loesung: 'Ein Foto, ein Satz dazu, was Sie anbieten, und ein Knopf zum Anrufen genügen dafür.' },

  { id: 'naechsterschritt', rang: 5, icon: 'pointer', titel: 'User Experience',
    rx: /Handlungsaufforderung|Handlungsknopf|Call.?to.?Action/i,
    warum: 'Wer nicht sofort sieht, wie er bei Ihnen anruft oder bucht, macht meistens gar nichts.',
    loesung: 'Ein gut sichtbarer Knopf gleich im ersten Bildschirm reicht dafür aus.' },

  { id: 'informationen', rang: 6, icon: 'search', titel: 'Inhalt & Information',
    rx: /Öffnungszeiten|Sprechzeiten|Speisekarte|Leistungsübersicht|anbietet|Kontaktmöglichkeit|Preisliste|Telefonnummer ist nicht/i,
    warum: 'Öffnungszeiten, Leistungen und Erreichbarkeit sind das, wonach lokal gesucht wird.',
    loesung: 'Diese Angaben gehören als Text auf die Startseite, nicht in ein PDF und nicht nur in den Fußbereich.' },

  { id: 'tempo', rang: 7, icon: 'gauge', titel: 'Ladezeit',
    rx: /\bMB\b|Sekunden|\bLCP\b|Ladeleistung|Lighthouse|Bilder über \d|Dateien werden|unkomprimiert/i,
    warum: 'Im Mobilfunknetz entscheidet die Ladezeit darüber, ob jemand wartet oder zurück zur Trefferliste geht.',
    loesung: 'Meist liegt es an zu großen Bildern, die sich ohne sichtbaren Verlust verkleinern lassen.' },

  { id: 'bedienung', rang: 8, icon: 'hand', titel: 'Bedienbarkeit',
    rx: /kleiner als \d+ ?px|enger als \d+ ?px|antippbar|Zoomen|seitlich über|rechten Rand|horizontales Scrollen/i,
    warum: 'Knöpfe unter 36 Pixeln trifft man mit dem Daumen nicht zuverlässig.',
    loesung: 'Etwas mehr Abstand und größere Flächen lösen das, ohne dass sich am Aussehen viel ändert.' },

  { id: 'gestaltung', rang: 9, icon: 'palette', titel: 'Design & Wirkung',
    rx: /^$/,   // wird über die Belegstelle erkannt, siehe themaVon()
    warum: 'Für viele ist Ihr Auftritt der erste Eindruck von Ihrem Betrieb, oft bevor überhaupt jemand mit Ihnen gesprochen hat.',
    loesung: 'Am meisten fällt dabei der obere Bereich der Startseite ins Gewicht, dort würden wir anfangen.' },

  { id: 'google', rang: 10, icon: 'globe', titel: 'Sichtbarkeit',
    rx: /Meta-Beschreibung|\(H1\)|Hauptüberschrift|strukturierte Daten|Alternativtext|Seitentitel/i,
    warum: 'Diese Angaben bestimmen, mit welchem Text Sie in der Trefferliste erscheinen.',
    loesung: 'Das sind Einstellungen im Hintergrund, die sich nachtragen lassen, ohne die Gestaltung anzufassen.' },

  { id: 'pflege', rang: 11, icon: 'wrench', titel: 'Pflegezustand',
    rx: /Lorem Ipsum|Platzhalter|nie fertig|veraltet|letzte Änderung|Jahreszahl/i,
    warum: 'Platzhalter und alte Stände lesen Besucher als Hinweis darauf, dass sich gerade niemand kümmert.',
    loesung: 'Das ist reine Fleißarbeit und braucht keine Umbauten.' },

  { id: 'sonstiges', rang: 12, icon: 'info', titel: 'Weiteres',
    rx: /.*/, warum: null, loesung: null },
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


/* ── Sprache ────────────────────────────────────────────────────────
   Der Scanner schreibt für uns, der Report schreibt an den Betrieb. "Die
   Startseite lädt mobil rund 16.2 MB" wird zu "Ihre Startseite lädt mobil rund
   16,2 MB". Umgeschrieben wird nur, was eindeutig ist, also Satzanfänge mit
   bestimmtem Artikel. Mitten im Satz wird nichts angefasst, dort geht zu
   leicht etwas schief.

   Dazu Noahs Vorgaben für den Ton: keine Gedankenstriche, kein Semikolon,
   stattdessen Komma. Und deutsche Dezimalkommas, weil "16.2 MB" in einem
   deutschen Brief wie ein Tippfehler aussieht.                              */
const ANREDEN = [
  [/^Die Seite\b/, 'Ihre Seite'], [/^Die Startseite\b/, 'Ihre Startseite'],
  [/^Die Seiten\b/, 'Ihre Seiten'], [/^Die Hauptnavigation\b/, 'Ihre Hauptnavigation'],
  [/^Die Hauptüberschrift\b/, 'Ihre Hauptüberschrift'], [/^Die Buchungsmaske\b/, 'Ihre Buchungsmaske'],
  [/^Die Speisekarte\b/, 'Ihre Speisekarte'], [/^Die Telefonnummer\b/, 'Ihre Telefonnummer'],
  [/^Die Gestaltung\b/, 'Ihre Gestaltung'], [/^Die Startseite hat\b/, 'Ihre Startseite hat'],
  [/^Das Layout\b/, 'Ihr Layout'], [/^Das Logo\b/, 'Ihr Logo'], [/^Das Hero-Bild\b/, 'Ihr Hero-Bild'],
  [/^Das Design\b/, 'Ihr Design'], [/^Das Formular\b/, 'Ihr Formular'],
  [/^Der Kopfbereich\b/, 'Ihr Kopfbereich'], [/^Der Cookie-Hinweis\b/, 'Ihr Cookie-Hinweis'],
  [/^Im Hero\b/, 'In Ihrem Hero-Bereich'], [/^Im Kopfbereich\b/, 'In Ihrem Kopfbereich'],
  [/^Im Quelltext\b/, 'In Ihrem Quelltext'], [/^Im gesamten Auftritt\b/, 'Auf Ihrer Website'],
  [/^Im Desktop-Header\b/, 'In Ihrem Kopfbereich'], [/^Im Buchungsfeld\b/, 'In Ihrem Buchungsfeld'],
  [/^Auf keiner geprüften Seite\b/, 'Auf keiner Ihrer Seiten'],
  [/^Auf der Kontaktseite\b/, 'Auf Ihrer Kontaktseite'],
  [/^Auf der mobilen Startseite\b/, 'Auf Ihrer mobilen Startseite'],
  [/^Auf dem Handy\b/, 'Auf dem Handy'],
  [/^Keine klare Handlungsaufforderung auf der Startseite/, 'Auf Ihrer Startseite fehlt eine klare Handlungsaufforderung'],
  [/^Keine großformatigen Fotos auf der Startseite/, 'Auf Ihrer Startseite fehlen großformatige Fotos'],
  [/^Keine Meta-Beschreibung\b/, 'Ihrer Seite fehlt eine Meta-Beschreibung'],
  [/^Keine strukturierten Daten\b/, 'Für Ihre Seite sind keine strukturierten Daten hinterlegt'],
  [/^Keine Leistungsübersicht auffindbar/, 'Eine Leistungsübersicht ist auf Ihrer Seite nicht auffindbar'],
  [/^Öffnungszeiten sind auf der Startseite\b/, 'Öffnungszeiten sind auf Ihrer Startseite'],
  [/^Sprechzeiten sind auf der Startseite\b/, 'Sprechzeiten sind auf Ihrer Startseite'],
  [/^Ohne zu scrollen\b/, 'Ohne zu scrollen'],
];

export function ansprache(text) {
  let t = String(text ?? '').trim();
  for (const [rx, neu] of ANREDEN) if (rx.test(t)) { t = t.replace(rx, neu); break; }
  t = t.replace(/\s+auf der Startseite\b/g, ' auf Ihrer Startseite');
  return t
    // 16.2 MB → 16,2 MB, aber eine Versionsnummer wie 5.6.22 bleibt, wie sie ist
    .replace(/(?<!\d\.)(\d)\.(\d)(?!\.\d)/g, '$1,$2')
    .replace(/\s*[—–]\s*/g, ', ')             // keine Gedankenstriche
    .replace(/\s*;\s*/g, ', ')                // kein Semikolon
    .replace(/,\s*,/g, ',').replace(/\s+,/g, ',')
    .replace(/,(?=[^\s\d])/g, ', ')          // Leerzeichen nach Komma, aber 16,2 bleibt 16,2
    .replace(/,\s*$/, '.').replace(/\s{2,}/g, ' ');
}

/* ── Icons ──────────────────────────────────────────────────────────
   Strichzeichnungen im Stil von Lucide, 24×24. Bewusst als Pfade hier und
   nicht als Schriftart oder Bilddatei: Der Report wird gedruckt und als PDF
   verschickt, da muss alles in der Datei stehen und scharf bleiben.         */
const ICONS = {
  'triangle-alert': ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z', 'M12 9v4', 'M12 17h.01'],
  shield: ['M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z'],
  layers: ['M12.8 2.2a2 2 0 0 0-1.7 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.7 0l8.5-3.9a1 1 0 0 0 0-1.8Z', 'm22 17.7-9.2 4.2a2 2 0 0 1-1.6 0L2 17.7', 'm22 12.7-9.2 4.2a2 2 0 0 1-1.6 0L2 12.7'],
  smartphone: ['M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z', 'M12 18h.01'],
  pointer: ['M9 9l5 12 1.8-5.2L21 14Z', 'M7.2 2.2 8 5.1', 'm5.1 8-2.9-.8', 'M14 4.1 12 6', 'm6 12-1.9 2'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.3-4.3'],
  gauge: ['m12 14 4-4', 'M3.3 19a10 10 0 1 1 17.4 0'],
  hand: ['M18 11V6a2 2 0 0 0-4 0', 'M14 10V4a2 2 0 0 0-4 0v2', 'M10 10.5V6a2 2 0 0 0-4 0v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15'],
  palette: ['M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.3a1.8 1.8 0 0 0-1.4 2.8l.3.4a1.8 1.8 0 0 1-1.4 2.8Z', 'M13.5 6.5h.01', 'M17.5 10.5h.01', 'M8.5 7.5h.01', 'M6.5 12.5h.01'],
  globe: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 2a14.5 14.5 0 0 0 0 20', 'M12 2a14.5 14.5 0 0 1 0 20', 'M2 12h20'],
  wrench: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-8 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-8l-3.8 3.8Z'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16v-4', 'M12 8h.01'],
  check: ['M20 6 9 17l-5-5'],
  eye: ['M2.1 12.3a1 1 0 0 1 0-.6 10.8 10.8 0 0 1 19.8 0 1 1 0 0 1 0 .6 10.8 10.8 0 0 1-19.8 0Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
};

/* Ein unbekannter Name hat im Dashboard einmal d="undefined" erzeugt, was
   stumm nichts zeichnet. Lieber laut sein als unsichtbar falsch. */
function ic(name, klasse = '') {
  const pfade = ICONS[name];
  if (!pfade) { console.warn(`kundenreport: Icon "${name}" gibt es nicht.`); return ''; }
  return `<svg class="ic ${klasse}" viewBox="0 0 24 24" fill="none" stroke="currentColor"`
    + ` stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`
    + pfade.map((d) => `<path d="${d}"/>`).join('') + '</svg>';
}

/* ── Die Seite ──────────────────────────────────────────────────────
   Gestaltung nach Noahs eigener Meta-Ads-Analyse ("AdMemory-Report
   erstellen.pdf", Hotel Rose), daraus gemessen statt geraten: Poppins,
   Indigo #4f5fe0 bis Violett #8b57d6, Papier #f6f7f9, Tinte #14161d.
   Die Logo-Geometrie stammt aus admemory-logo-dark.svg aus Noahs Drive und
   ist hier nur eingefärbt. Zwei A4-Seiten.                                  */

const FUELLWORT = /^(home|start|startseite|index|aktuelles|(herzlich )?willkommen\b.*)$/i;

export function nameAus(titel, host) {
  const teile = String(titel || '').split(/\s+[-–—|]\s+|:\s+/)
    .map((t) => t.trim()).filter((t) => t && !FUELLWORT.test(t));
  return teile.find((t) => t.length <= 45) || host;
}

/* Lieber einen Satz weglassen als einen halben zeigen.

   Die erste Fassung schnitt hart bei n Zeichen ab und hängte " …" an. Im
   Report stand dann "… und ergeben ein milchiges." und "Punkte wie
   'Speisekarte Panorama-Restaurant' …". Das liest sich wie ein Fehler, und
   Noahs Urteil dazu war eindeutig: so macht das null Sinn. Also werden nur
   vollständige Sätze übernommen, so viele wie hineinpassen. */
export function ganzeSaetze(text, max) {
  const t = String(text ?? '').trim();
  if (t.length <= max) return t;
  const saetze = t.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (saetze) {
    let aus = '';
    for (const satz of saetze) { if ((aus + satz).trim().length > max) break; aus += satz; }
    if (aus.trim()) return aus.trim();
  }
  return kuerze(t, max);   // ein einziger, zu langer Satz: dann eben gekürzt
}

export function kuerze(text, max = 115) {
  const t = String(text ?? '').trim();
  if (t.length <= max) return t;
  const bis = t.slice(0, max);
  const satz = Math.max(bis.lastIndexOf('. '), bis.lastIndexOf('! '), bis.lastIndexOf('? '));
  if (satz > max * 0.45) return bis.slice(0, satz + 1);
  const teil = bis.lastIndexOf(', ');
  if (teil > max * 0.5) return bis.slice(0, teil) + '.';
  const wort = bis.lastIndexOf(' ');
  return (wort > 0 ? bis.slice(0, wort) : bis).replace(/[,;:–—]$/, '') + ' …';
}

/* Die fünf Bereiche, die Noah benannt hat. Fest, nicht "die fünf schwächsten":
   Wer zwei Reports nebeneinanderlegt, soll dieselbe Tabelle sehen. */
const BEREICHE = [
  { id: 'impression', label: 'Design' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'content', label: 'Inhalt & User Experience' },
  { id: 'tech', label: 'Technik' },
  { id: 'seo', label: 'Sichtbarkeit' },
];

/* Anteil der Seitenaufrufe, die in Deutschland vom Handy kommen.
   Quelle steht im Report, damit die Zahl nachprüfbar bleibt und nicht als
   Agenturbehauptung dasteht. Beim Aktualisieren beides anfassen. */
const MOBIL_ANTEIL = { wert: 'knapp 60 Prozent', quelle: 'StatCounter, September 2026' };

function empfehlungText(scan, gruppen) {
  const k = scan.categories || {};
  const eindruck = k.impression?.score;
  const kaputt = gruppen.find((g) => g.id === 'aufbau');

  if (kaputt) return [
    'Wir würden zuerst dafür sorgen, dass Ihre Seite wieder vollständig ausgeliefert wird. Alles andere kommt danach, denn solange Besucher eine Rohfassung sehen, bringt jede Verbesserung an Inhalt oder Gestaltung wenig.',
    'Ob Sie das selbst angehen, Ihre bisherige Agentur darauf ansprechen oder uns dazuholen, ist ganz Ihre Entscheidung.'];

  if (typeof eindruck === 'number' && eindruck < 40) return [
    'An der Gestaltung lohnt sich Flickwerk aus unserer Sicht nicht. Ihre Seite Stück für Stück nachzubessern kostet über die Zeit meist mehr, als sie einmal neu aufzusetzen, mit Ihren Inhalten, Ihren Bildern und Ihrem Namen.',
    'Wenn das zu weit geht, lässt sich zumindest der technische Teil kurzfristig geradeziehen, also Ladezeit, Bedienbarkeit auf dem Handy und die rechtlichen Punkte. Das ist ein überschaubarer Auftrag und auch ohne uns machbar.'];

  return [
    'Ihre Seite trägt. Wir würden sie nicht ersetzen, sondern die Punkte von vorhin der Reihe nach abarbeiten, also Ladezeit, Bedienbarkeit auf dem Handy, die rechtlichen Themen und die fehlenden Angaben.',
    'Das ist ein klar abgegrenzter Auftrag und kein Projekt, und vieles davon kann auch Ihr bisheriger Dienstleister erledigen.'];
}

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
  const hinweise = (scan.findings || []).filter((f) => f.severity === 'high').length;
  const seitenZahl = scan.seiten?.length || 1;
  const rat = empfehlungText(scan, gruppen);
  const datum = new Date(scan.scannedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  /* Was oben schon in einer Karte steht, kommt in der Tabelle nicht noch
     einmal. Sonst liest man denselben Satz auf einer Seite zweimal. */
  const schonGesagt = new Set(dringend.map((g) => g.kopf.text));

  const zeilen = BEREICHE.map((b) => {
    const c = k[b.id] || {};
    let text = '';
    for (const f of c.findings || []) {
      if (schonGesagt.has(f.text)) continue;
      const satz = ansprache(f.text);
      if ((text + ' ' + satz).trim().length > 180) break;
      text = (text + ' ' + satz).trim();
    }
    return { label: b.label, score: typeof c.score === 'number' ? c.score : null,
             text: text || 'Hier ist uns nichts Dringendes aufgefallen.' };
  });

  const ziel = absender.termin || (absender.telefon ? 'tel:' + absender.telefon.replace(/[^+\d]/g, '') : null)
    || (absender.email ? 'mailto:' + absender.email : null);

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>Website-Analyse ${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap" rel="stylesheet">
<style>
:root{
  --indigo:#4f5fe0; --mitte:#6359dc; --violett:#8b57d6;
  --papier:#f6f7f9; --karte:#fff; --linie:#e5e7ec; --zart:#f0f1fd;
  /* Grautöne gegenüber der Vorlage nachgedunkelt: Deren #9aa1ae liegt bei
     2,4:1 und ist in 9,5-px-Schrift auf einem Blatt Papier zu wenig. */
  --tinte:#14161d; --tinte-2:#5f6676; --tinte-3:#69707f;
  --gruen:#15854c; --rot:#be372f; --gelb:#9a6208;
}
*{box-sizing:border-box}
body{margin:0;background:#e9ebf0;color:var(--tinte);
  font:400 13.5px/1.62 "Poppins",system-ui,-apple-system,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased}
.blatt{width:720px;max-width:100%;margin:0 auto;background:var(--papier);padding:26px 30px 30px}
h1,h2,h3{margin:0;line-height:1.2}
p{margin:0}
.ic{width:20px;height:20px;flex:none}

.leiste{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.marke{display:flex;align-items:center;gap:9px}
.marke svg{display:block;width:25px;height:25px}
.marke span{font-size:18.5px;font-weight:700;letter-spacing:-.02em;color:var(--tinte)}
.leiste .rechts{text-align:right;line-height:1.45}
.leiste .rechts b{display:block;font-size:11.5px;font-weight:600;color:var(--tinte)}
.leiste .rechts span{font-size:10.5px;color:var(--tinte-3)}
.strich{height:2px;border-radius:2px;margin:12px 0 20px;
  background:linear-gradient(90deg,var(--indigo),var(--violett))}

.titelzeile{display:flex;align-items:center;justify-content:space-between;gap:20px}
h1{font-size:30px;font-weight:700;letter-spacing:-.025em}
.kundenlogo{max-height:30px;max-width:152px;width:auto;height:auto;flex:none}
.url{font-size:11px;font-style:italic;color:var(--tinte-3);margin-top:5px}

.brief{margin-top:16px;font-size:11.5px;line-height:1.7;color:var(--tinte-2)}
.brief p{margin-bottom:8px}
.brief p:last-child{margin-bottom:0}
.brief .anrede{color:var(--tinte);font-weight:500}

h2{font-size:12.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--tinte);margin:22px 0 10px}

.drei{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}
.karte{background:var(--karte);border-radius:11px;padding:18px 15px 15px;position:relative;
  box-shadow:0 1px 2px rgba(20,22,29,.05);overflow:hidden}
.karte::after{content:"";position:absolute;top:0;left:0;right:0;height:2.5px}
.karte:nth-child(1)::after{background:var(--indigo)}
.karte:nth-child(2)::after{background:var(--mitte)}
.karte:nth-child(3)::after{background:var(--violett)}
.karte .ic{width:22px;height:22px;margin:4px 0 10px}
.karte:nth-child(1) .ic{color:var(--indigo)}
.karte:nth-child(2) .ic{color:var(--mitte)}
.karte:nth-child(3) .ic{color:var(--violett)}
.karte h3{font-size:12.5px;font-weight:600;margin-bottom:6px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.karte p{font-size:10.5px;line-height:1.56;color:var(--tinte-2)}

/* Eine Zahl, kein Dreierblock. Beide Spalten sind senkrecht mittig, vorher
   klebte der Inhalt oben, weil die Textspalte hoeher war als die Zahl. */
.zahlen{display:grid;grid-template-columns:auto 1fr;align-items:stretch;
  background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  margin-top:10px;overflow:hidden}
.zahl{padding:16px 22px;border-right:1px solid var(--linie);
  display:flex;flex-direction:column;justify-content:center;text-align:center}
.zahl b{display:block;font-size:30px;font-weight:700;letter-spacing:-.025em;line-height:1.05;
  color:var(--indigo)}
.zahl b small{font-size:15px;font-weight:600;color:var(--tinte-3)}
.zahl span{font-size:10.5px;color:var(--tinte-2);line-height:1.3;display:block;margin-top:4px}
.zahlen .satz{padding:16px 20px;font-size:11px;line-height:1.6;color:var(--tinte-2);
  display:flex;flex-direction:column;justify-content:center;gap:6px}

.tafel{background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  padding:2px 18px 6px;margin-top:10px}
table{width:100%;border-collapse:collapse}
th{font-size:9.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--tinte-3);text-align:left;padding:10px 0 7px}
th:first-child{color:var(--mitte)}
td{font-size:10px;line-height:1.5;padding:7px 0;border-top:1px solid var(--linie);vertical-align:top;
  color:var(--tinte-2)}
td.bereich{font-size:11.5px;font-weight:600;color:var(--tinte);width:25%;padding-right:10px}
td.score{width:12%;font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums}
td.score.rot{color:var(--rot)} td.score.gelb{color:var(--gelb)} td.score.gut{color:var(--gruen)}

.seite2{break-before:page;page-break-before:always;padding-top:4px}
.vorwort{display:flex;gap:11px;background:var(--zart);border-radius:10px;padding:12px 14px;
  font-size:11px;line-height:1.6;color:var(--tinte-2);margin-bottom:14px}
.vorwort .ic{width:17px;height:17px;margin-top:1px;color:var(--indigo)}
.schirm{display:grid;grid-template-columns:138px 1fr;gap:18px;align-items:start}
.schirm figure{margin:0}
/* Saubere Geraetekante statt einer harten grauen Linie: runde Ecken, weicher
   Schatten, und das Bild wird vom Rahmen beschnitten statt selbst gerandet. */
.geraet{border-radius:13px;overflow:hidden;background:#fff;
  box-shadow:0 3px 14px rgba(20,22,29,.16)}
.geraet img{display:block;width:100%;height:auto}
.schirm figcaption{font-size:9.5px;font-style:italic;color:var(--tinte-3);margin-top:8px;line-height:1.45}
.kasten{background:var(--karte);border-radius:11px;box-shadow:0 1px 2px rgba(20,22,29,.05);
  padding:15px 17px}
.liste{display:grid;gap:9px}
.liste .p{display:flex;gap:9px;font-size:10.5px;line-height:1.55;color:var(--tinte-2)}
.liste .ic{width:15px;height:15px;margin-top:2px;color:var(--violett)}
.gut{margin-top:14px;padding-top:13px;border-top:1px solid var(--linie)}
.gut h3{font-size:9.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
  color:var(--tinte-3);margin-bottom:7px}
.gut .p{display:flex;gap:9px;font-size:10.5px;line-height:1.55;color:var(--tinte);margin-bottom:5px}
.gut .ic{width:15px;height:15px;margin-top:2px;color:var(--gruen)}

.rat{font-size:11.5px;line-height:1.7;color:var(--tinte-2)}
.rat p{margin-bottom:9px}

.fuss{display:flex;align-items:center;gap:16px;border-radius:12px;padding:16px 20px;margin-top:18px;
  background:linear-gradient(110deg,var(--zart),#f7f2fd)}
.fuss img.portraet{width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none;
  border:2px solid #fff;box-shadow:0 1px 4px rgba(20,22,29,.12)}
.fuss .wer{flex:1;min-width:0}
.fuss .wer b{display:block;font-size:14px;font-weight:600;color:var(--tinte)}
.fuss .wer .rolle{font-size:10.5px;color:var(--mitte);font-weight:500}
.fuss .wer .zeile{font-size:10.5px;color:var(--tinte-2);margin-top:5px}
.knopf{flex:none;background:var(--indigo);color:#fff;text-decoration:none;font-size:12px;
  font-weight:600;padding:11px 20px;border-radius:9px;white-space:nowrap;
  box-shadow:0 2px 8px rgba(79,95,224,.3)}
.mess{font-size:9px;font-style:italic;line-height:1.6;color:var(--tinte-3);margin-top:14px}

/* Nur am Bildschirm. Ohne 'screen' greift das auch im Druck, denn der
   Satzspiegel einer A4-Seite ist nur 703 px breit, und dann klappen Karten und
   Handy-Ansicht untereinander und der Report wird vier Seiten statt zwei. */
@media screen and (max-width:760px){
  .blatt{width:auto;padding:20px 16px 28px}
  .drei{grid-template-columns:1fr}
  .zahlen{grid-template-columns:1fr 1fr}
  .zahl{border-bottom:1px solid var(--linie)}
  .schirm{grid-template-columns:1fr}
  .schirm figure{max-width:180px}
  .titelzeile{flex-direction:column;align-items:flex-start;gap:10px}
  .fuss{flex-wrap:wrap}
  h1{font-size:25px}
}
@media print{
  @page{size:A4;margin:13mm 12mm}
  body{background:#fff}
  .blatt{width:auto;padding:0;background:#fff}
  .karte,.zahlen,.tafel{box-shadow:none;border:1px solid var(--linie)}
  .karte,.drei>*,.schirm,.fuss,.gut{break-inside:avoid}
  tr{break-inside:avoid}
  a{color:inherit}
}
</style>
</head>
<body>
<div class="blatt">

<div class="leiste">
  <div class="marke">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M17 84 L50 16 L83 84" fill="none" stroke="#14161d" stroke-width="11"
        stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M33 58 L67 58" fill="none" stroke="#14161d" stroke-width="11" stroke-linecap="round"/>
    </svg>
    <span>${esc(absender.firma || 'AdMemory')}</span>
  </div>
  <div class="rechts"><b>Website-Analyse</b><span>${esc(datum)}</span></div>
</div>
<div class="strich"></div>

<div class="titelzeile">
  <div>
    <h1>${esc(name)}</h1>
    <p class="url">www.${esc(host)}</p>
  </div>
  ${bilder.kundenlogo ? `<img class="kundenlogo" src="${esc(bilder.kundenlogo)}" alt="${esc(name)}">` : ''}
</div>

<div class="brief">
  <p class="anrede">Sehr geehrtes Team von ${esc(name)},</p>
  <p>wir haben uns Ihre Website einmal in Ruhe angesehen, ganz unverbindlich und ohne dass Sie uns
  darum gebeten haben. Was uns dabei aufgefallen ist, möchten wir Ihnen nicht vorenthalten.</p>
  <p>Auf diesen beiden Seiten steht, was bereits gut funktioniert, was wir als Erstes angehen würden
  und woran wir das festmachen. Alles davon ist an Ihrem Auftritt nachzuvollziehen, geschätzt ist
  nichts. Was Sie mit diesen Hinweisen anfangen, liegt ganz bei Ihnen.</p>
</div>

${dringend.length ? `<div class="drei">
  ${dringend.map((g) => `<article class="karte">
    ${ic(g.icon)}
    <h3>${esc(g.titel)}</h3>
    <p>${esc(ansprache(ganzeSaetze(g.kopf.text, 165)))}${g.warum ? ` ${esc(g.warum)}` : ''}${g.loesung ? ` ${esc(g.loesung)}` : ''}</p>
  </article>`).join('\n  ')}
</div>` : ''}

<h2>Übersicht</h2>
<div class="zahlen">
  <div class="zahl"><b>${scan.total ?? '–'}<small> / 100</small></b><span>Gesamtbild</span></div>
  <div class="satz">
    <p>Dieser Wert ergibt sich aus mehreren Ebenen, auf denen wir Ihre Seite angesehen haben,
    unter anderem Design, Technik, Inhalt und die mobile Ansicht. Für sich genommen sagt er wenig.
    Aufschlussreicher ist die Aufstellung darunter, dort steht, wie die einzelnen Bereiche
    abgeschnitten haben und was uns jeweils aufgefallen ist.</p>
  </div>
</div>

<div class="tafel">
  <table>
    <thead><tr><th>Bereich</th><th>Score</th><th>Was uns aufgefallen ist</th></tr></thead>
    <tbody>${zeilen.map((z) => `
      <tr>
        <td class="bereich">${esc(z.label)}</td>
        <td class="score ${z.score === null ? '' : z.score < 45 ? 'rot' : z.score < 65 ? 'gelb' : 'gut'}">${z.score === null ? '–' : z.score + ' / 100'}</td>
        <td>${esc(z.text)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<div class="seite2">

${bilder.mobil ? `<h2>Ihre Startseite auf dem Handy</h2>
<div class="vorwort">${ic('smartphone')}<span>Inzwischen kommen ${MOBIL_ANTEIL.wert} aller
Seitenaufrufe in Deutschland vom Handy (${MOBIL_ANTEIL.quelle}). Wie Ihre Seite dort aussieht, ist damit
wichtiger als die Ansicht am Rechner. So sah sie bei unserem Besuch aus:</span></div>
<div class="schirm">
  <figure>
    <div class="geraet"><img src="${esc(bilder.mobil)}" alt="Startseite von ${esc(host)} auf einem Mobiltelefon"></div>
    <figcaption>Gemessen mit einer Breite von 375 Pixeln, was einem gängigen Handy entspricht.</figcaption>
  </figure>
  <div class="kasten">
    <div class="liste">${(k.impression?.data?.schwaechen || []).slice(0, 4)
      .map((x) => `<div class="p">${ic('eye')}<span>${esc(ansprache(ganzeSaetze(x, 185)))}</span></div>`).join('')
      || `<div class="p">${ic('eye')}<span>Im sichtbaren Bereich ist uns nichts aufgefallen.</span></div>`}</div>
    ${staerken.length ? `<div class="gut">
      <h3>Was bereits gut ist</h3>
      ${staerken.map((x) => `<div class="p">${ic('check')}<span>${esc(ansprache(ganzeSaetze(x, 150)))}</span></div>`).join('\n      ')}
    </div>` : ''}
  </div>
</div>` : ''}

<h2>Unser Vorschlag</h2>
<div class="rat">
  ${rat.map((t) => `<p>${esc(t)}</p>`).join('\n  ')}
  <p>Sie können diese Hinweise auch einfach liegen lassen, selbst umsetzen oder Ihrem bisherigen
  Dienstleister geben. Wenn Sie mögen, gehen wir sie stattdessen in einem unverbindlichen Gespräch
  gemeinsam durch und sagen Ihnen, wie wir vorgehen würden. Es kostet nichts und verpflichtet zu nichts.</p>
</div>

<div class="fuss">
  ${bilder.portraet ? `<img class="portraet" src="${esc(bilder.portraet)}" alt="${esc(absender.person || '')}">` : ''}
  <div class="wer">
    <b>${esc(absender.person || 'AdMemory')}</b>
    <span class="rolle">${esc(absender.rolle || 'AdMemory')}</span>
    <p class="zeile">${[absender.telefon, absender.email, absender.web].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')}</p>
  </div>
  ${ziel ? `<a class="knopf" href="${esc(ziel)}">Unverbindlich sprechen</a>` : ''}
</div>

<p class="mess">Geprüft am ${esc(datum)}, ${seitenZahl} Seite${seitenZahl > 1 ? 'n' : ''}.
Ladezeit und Technik mit Google Lighthouse, mobil simuliert, Darstellung bei 1440 und 375 Pixeln.
Die Einschätzung zur Gestaltung stammt von einem Sprachmodell, das beide Ansichten gesehen hat, sie ist
ein Urteil und keine Messung. Wir haben nur öffentlich erreichbare Seiten aufgerufen und nichts verändert.
Nicht sehen konnten wir Bereiche hinter einer Anmeldung, Ihre Besucherzahlen und alles, was nach dem
Prüfdatum geändert wurde.</p>

</div>
</div>
</body>
</html>`;
}
