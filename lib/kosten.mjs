/* Was ein Lauf gekostet hat.

   Die Tokenzahlen liefert die API bei jeder Antwort mit — die wurden bisher
   gelesen und weggeworfen. Der Preis je Token steht nicht in der Antwort und
   ändert sich über die Zeit, deshalb liegt er hier als Konstante und lässt sich
   über die .env überschreiben, ohne den Code anzufassen.

   WICHTIG: Diese Sätze sind nicht aus der Abrechnung gelesen, sondern gesetzt.
   Bevor du die Zahlen im Dashboard für bare Münze nimmst, gleiche sie einmal
   mit der Console ab (console.anthropic.com → Usage) und trage die
   tatsächlichen Sätze in die .env ein. Die gespeicherten Tokenzahlen bleiben
   richtig, auch wenn der Preis daneben liegt. */

const SATZ = {
  // Dollar je einer Million Tokens
  'claude-opus-5':        { ein: Number(process.env.PREIS_OPUS_EIN   ?? 5),    aus: Number(process.env.PREIS_OPUS_AUS   ?? 25) },
  'claude-sonnet-5':      { ein: Number(process.env.PREIS_SONNET_EIN ?? 3),    aus: Number(process.env.PREIS_SONNET_AUS ?? 15) },
  'claude-haiku-4-5-20251001': { ein: Number(process.env.PREIS_HAIKU_EIN ?? 1), aus: Number(process.env.PREIS_HAIKU_AUS ?? 5) },
};
const STANDARD = SATZ['claude-opus-5'];
const DOLLAR_ZU_EURO = Number(process.env.KURS_USD_EUR ?? 0.92);

export function centFuer({ modell = 'claude-opus-5', ein = 0, aus = 0 }) {
  const s = SATZ[modell] ?? STANDARD;
  const dollar = (ein / 1_000_000) * s.ein + (aus / 1_000_000) * s.aus;
  return +(dollar * DOLLAR_ZU_EURO * 100).toFixed(3);
}

/* Für die Anzeige: 0,8 ct statt 0.008 €, und ab einem Euro in Euro. */
export function alsText(cent) {
  if (cent == null) return '–';
  if (cent < 100) return cent.toFixed(1).replace('.', ',') + ' ct';
  return (cent / 100).toFixed(2).replace('.', ',') + ' €';
}
