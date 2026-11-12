/* Die Zahlen für die Startseite. */
import { betriebe, mitReport } from './_daten.mjs';

export default async function handler(req, res) {
  const b = betriebe();
  const reports = mitReport();
  const mit = (f) => b.filter(f).length;

  res.status(200).json({
    kennzahlen: {
      gesamt:     b.length,
      gescannt:   mit((x) => x.stufe >= 1),
      voll:       mit((x) => x.stufe === 2),
      reports:    b.filter((x) => reports.has(x.host)).length,
      telefon:    mit((x) => x.telefon),
      lohnend:    mit((x) => x.lead >= 38),
      schwach:    mit((x) => x.qualitaet !== null && x.qualitaet < 55),
    },
    /* Was als Nächstes dran wäre: lohnende Betriebe mit Vollscan, aber noch
       ohne Report. Genau die kosten einen Klick und keine 11 Cent. */
    bereit: b.filter((x) => x.stufe === 2 && x.lead >= 38 && !reports.has(x.host)).length,
    stand: new Date().toISOString(),
  });
}
