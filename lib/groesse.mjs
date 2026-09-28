/* Wie zahlungskräftig ist der Betrieb?
   Die Bewertungszahl misst Bekanntheit, nicht Budget: Ein Imbiss mit 1.337
   Rezensionen zahlt weniger für eine Website als ein Autohaus mit 80. Diese
   Einschätzung kommt deshalb aus Signalen der Seite selbst — kostenlos, ohne
   zusätzliche Anfrage, im Stufe-1-Scan.

   Sie ist bewusst grob: Sie soll die Liste sortieren und den Preisrahmen
   vorschlagen, nicht eine Bilanz ersetzen. */

const BRANCHEN_FAKTOR = {          // typisches Website-Budget der Branche
  industrie:      1.35,            // Maschinenbau, Zulieferer, Speditionen
  autohaus:       1.30,            // hoher Warenwert, laufendes Marketingbudget
  beratung:       1.25,            // Kanzleien, Steuerberater, Makler
  gesundheit:     1.15,            // Praxen
  handwerk:       1.05,            // Handwerksbetriebe, oft mehrere Mitarbeiter
  handel:         1.00,
  dienstleistung: 1.00,
  gastro:         0.85,            // knappe Margen, kleines Budget
};

export function schaetzeGroesse({ dom, rawHtml = '', branche = 'dienstleistung', googleReviews = null, standorteExtern = null }) {
  const text = (dom.text || '') + '\n' + (rawHtml || '');
  const links = dom.links || [];
  const treffer = [];
  let punkte = 0;
  const zaehlt = (bedingung, wert, name) => { if (bedingung) { punkte += wert; treffer.push(name); } };

  // Rechtsform — das deutlichste Signal aus dem Impressum
  const gmbh  = /\b(GmbH|mbH|AG\b|KGaA|GmbH & Co\.? ?KG|UG \(haftungsbeschränkt\))/.test(text);
  const ek    = /\be\.? ?K\.?\b|\bKG\b|\bOHG\b|\bGbR\b/.test(text);
  zaehlt(gmbh, 22, 'Kapitalgesellschaft');
  zaehlt(!gmbh && ek, 8, 'Personengesellschaft');

  // Handelsregister und Umsatzsteuer
  zaehlt(/HRB\s*\d|HRA\s*\d|Handelsregister/i.test(text), 10, 'im Handelsregister');
  zaehlt(/USt[- ]?Id|Umsatzsteuer[- ]?Ident|DE\s?\d{9}/i.test(text), 6, 'Umsatzsteuer-ID');

  // Geschäftsführung deutet auf eine Firma mit Angestellten
  zaehlt(/Geschäftsführ(er|ung)|Vorstand|Prokurist/i.test(text), 8, 'Geschäftsführung');

  // Wer Stellen ausschreibt, hat Mitarbeiter
  const karriere = links.some((l) => /karriere|jobs?|stellenangebot|wir stellen ein|bewirb/i.test(l.text + ' ' + l.href));
  zaehlt(karriere, 14, 'sucht Personal');

  // Team-Seite mit mehreren Personen
  const team = links.some((l) => /\bteam\b|mitarbeiter|unser team|über uns/i.test(l.text + ' ' + l.href));
  zaehlt(team, 6, 'Team-Seite');

  // Mehrere Standorte oder Filialen
  const standorte = (text.match(/\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß-]+/g) || [])
    .map((s) => s.trim()).filter((s, i, a) => a.indexOf(s) === i).length;
  zaehlt(standorte >= 3, 16, `${standorte} Standorte`);
  zaehlt(standorte === 2, 8, '2 Standorte');
  zaehlt(/filiale|niederlassung|standorte|zweigstelle/i.test(text), 8, 'Filialen erwähnt');

  // Mehrere Google-Einträge auf einer Domain: Filialen oder Markenbetriebe
  zaehlt(standorteExtern >= 3, 12, `${standorteExtern} Google-Einträge`);
  zaehlt(standorteExtern === 2, 6, '2 Google-Einträge');

  // Zertifizierungen und Mitgliedschaften kosten Geld
  zaehlt(/ISO ?9001|TÜV|zertifizier|innung|handwerkskammer|IHK\b|meisterbetrieb/i.test(text), 6, 'zertifiziert');

  // Eine eigene Domain statt Baukasten-Subdomain
  const baukasten = /\.(eatbu|wixsite|jimdosite|webnode|weebly|business\.site|metro\.bar)\./i.test(dom.canonical || '');
  zaehlt(!baukasten, 4, 'eigene Domain');

  // Bekanntheit fließt schwach mit ein
  if (googleReviews != null) {
    zaehlt(googleReviews >= 500, 8, 'sehr bekannt');
    zaehlt(googleReviews >= 150 && googleReviews < 500, 4, 'bekannt');
  }

  const roh = Math.min(100, punkte);
  const score = Math.max(0, Math.min(100, Math.round(roh * (BRANCHEN_FAKTOR[branche] ?? 1))));
  return { score, signale: treffer, stufe: stufeVon(score) };
}

export function stufeVon(score) {
  if (score >= 70) return 'mittelstand';      // GmbH, mehrere Standorte, sucht Personal
  if (score >= 45) return 'etabliert';        // eingetragene Firma mit Struktur
  if (score >= 25) return 'klein';            // Einzelbetrieb mit Substanz
  return 'kleinst';                           // Einzelunternehmer
}

/* Preisrahmen als Vorschlag — je nach Umfang der nachgebauten Seite und
   Zahlungsfähigkeit. Die Spannen sind bewusst weit; die letzte Entscheidung
   trifft Noah. */
export function preisrahmen(groesseScore, seitenAnzahl = 3, qualitaetScore = 50) {
  const basis = { kleinst: [900, 1500], klein: [1500, 2500], etabliert: [2500, 4500], mittelstand: [4500, 9000] }[stufeVon(groesseScore)];
  const umfang = 1 + Math.max(0, seitenAnzahl - 3) * 0.12;          // mehr Seiten, mehr Aufwand
  const bedarf = qualitaetScore < 45 ? 1.0 : 0.92;                  // bei sehr schwachen Seiten weniger Verhandlungsspielraum
  return basis.map((v) => Math.round(v * umfang * bedarf / 50) * 50);
}
