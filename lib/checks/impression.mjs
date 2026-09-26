/* Eindruck: das, was sich nicht messen lässt — wirkt die Seite zeitgemäß, wertig,
   verständlich? Claude bekommt Desktop- und Mobil-Screenshot und antwortet in einem
   festen Schema (Skala 1–5 je Frage), damit Seiten vergleichbar bleiben.
   Ohne ANTHROPIC_API_KEY wird die Kategorie übersprungen und nicht gewertet. */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import fs from 'node:fs';
import { finding, clamp } from './_util.mjs';

const Verdict = z.object({
  zeitgemaess:   z.number().int().min(1).max(5).describe('1 = wirkt wie 2010, 5 = aktuell und modern'),
  bildqualitaet: z.number().int().min(1).max(5).describe('1 = unscharfe Handyfotos oder Stock-Klischees, 5 = professionell und passend'),
  hierarchie:    z.number().int().min(1).max(5).describe('1 = überladen oder leer, 5 = klare Ordnung, man weiß sofort, wo man hinschaut'),
  verstaendlich: z.number().int().min(1).max(5).describe('1 = unklar, was der Betrieb anbietet, 5 = in 3 Sekunden klar'),
  wertigkeit:    z.number().int().min(1).max(5).describe('1 = wirkt billig oder unseriös, 5 = wirkt hochwertig und vertrauenswürdig'),
  mobil_nutzbar: z.number().int().min(1).max(5).describe('Nur nach dem Mobil-Screenshot: 1 = kaum bedienbar, 5 = sauber'),
  staerken: z.array(z.string()).max(2).describe('Was die Seite gut macht — leer lassen, wenn nichts auffällt'),
  schwaechen: z.array(z.string()).min(1).max(4).describe('Konkrete, sichtbare Schwächen. Jede in einem Satz, so formuliert, dass man sie dem Inhaber sagen könnte.'),
  branche_vermutet: z.string().describe('Was für ein Betrieb ist das, nach dem Screenshot?'),
});

const SYSTEM = `Du bewertest Websites kleiner lokaler Unternehmen (Gastronomie, Handwerk, Praxen, Einzelhandel) aus Sicht eines erfahrenen Webdesigners, der dem Inhaber ehrlich, aber respektvoll sagt, wo die Seite steht.

Du bekommst zwei Screenshots derselben Startseite: Desktop (oben) und Mobil (unten). Bewerte nur, was du siehst. Rate nicht, was auf Unterseiten sein könnte.

Maßstab für die Skalen: 3 ist eine durchschnittliche Seite eines kleinen Betriebs aus den letzten fünf Jahren. 5 vergibst du selten. 1 ist deutlich unter dem, was man heute erwartet.

Schwächen müssen konkret und am Screenshot festzumachen sein — nicht „das Design könnte moderner sein", sondern „Das Hero-Bild ist unscharf und der Text darauf kaum lesbar". Keine Floskeln, keine Empfehlungen, nur Befunde.`;

function img(path) {
  return { type: 'image', source: { type: 'base64', media_type: 'image/png', data: fs.readFileSync(path).toString('base64') } };
}

export async function checkImpression({ desktop, mobile }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { score: null, skipped: 'ANTHROPIC_API_KEY fehlt', findings: [], data: null };
  }
  const client = new Anthropic();
  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Desktop-Ansicht (1440 px breit, oberer Bereich):' },
        img(desktop.shot),
        { type: 'text', text: 'Mobil-Ansicht (375 px breit, oberer Bereich):' },
        img(mobile.shot),
        { type: 'text', text: 'Bewerte diese Startseite nach dem Schema.' },
      ],
    }],
    output_config: { format: zodOutputFormat(Verdict) },
  });
  const v = response.parsed_output;
  if (!v) return { score: null, skipped: 'Antwort nicht auswertbar', findings: [], data: null };

  // Skalen 1–5 → 0–100, mobil_nutzbar zählt doppelt (dort tut es am meisten weh)
  const keys = ['zeitgemaess', 'bildqualitaet', 'hierarchie', 'verstaendlich', 'wertigkeit', 'mobil_nutzbar', 'mobil_nutzbar'];
  const avg = keys.reduce((s, k) => s + v[k], 0) / keys.length;
  const score = clamp(((avg - 1) / 4) * 100);

  const f = v.schwaechen.map((s, i) => finding(i === 0 ? 'high' : 'medium', s, 'Screenshot-Urteil'));
  if (v.zeitgemaess <= 2) f.unshift(finding('high', 'Das Design wirkt veraltet.', `zeitgemäß ${v.zeitgemaess}/5`));

  return { score, findings: f, data: { ...v, usage: { in: response.usage.input_tokens, out: response.usage.output_tokens } } };
}
