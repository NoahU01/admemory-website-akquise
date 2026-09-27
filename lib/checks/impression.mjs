/* Eindruck: das, was sich nicht messen lässt — wirkt der Auftritt zeitgemäß,
   wertig, verständlich? Claude bekommt Desktop- und Mobil-Screenshot jeder
   geprüften Seite und bewertet sie einzeln in einem festen Schema (Skalen 1–5).
   Ein Aufruf für alle Seiten: das hält das Urteil untereinander konsistent und
   ist billiger als mehrere Anfragen.
   Ohne ANTHROPIC_API_KEY wird die Kategorie übersprungen und nicht gewertet. */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod/v4';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import fs from 'node:fs';
import { finding, clamp } from './_util.mjs';

const SeitenUrteil = z.object({
  seite:         z.string().describe('Die Bezeichnung der Seite, genau wie im Prompt angegeben'),
  zeitgemaess:   z.number().int().min(1).max(5).describe('1 = wirkt wie 2010, 5 = aktuell und modern'),
  bildqualitaet: z.number().int().min(1).max(5).describe('1 = unscharfe Handyfotos oder Stock-Klischees, 5 = professionell und passend'),
  hierarchie:    z.number().int().min(1).max(5).describe('1 = überladen oder leer, 5 = klare Ordnung'),
  verstaendlich: z.number().int().min(1).max(5).describe('1 = unklar, was geboten wird, 5 = in 3 Sekunden klar'),
  wertigkeit:    z.number().int().min(1).max(5).describe('1 = wirkt billig oder unseriös, 5 = hochwertig und vertrauenswürdig'),
  mobil_nutzbar: z.number().int().min(1).max(5).describe('Nur nach dem Mobil-Screenshot: 1 = kaum bedienbar, 5 = sauber'),
  schwaechen:    z.array(z.string()).max(4).describe('Konkrete, sichtbare Schwächen dieser Seite. Je ein Satz, so formuliert, dass man ihn dem Inhaber sagen könnte.'),
});

const Verdict = SeitenUrteil.extend({
  staerken:         z.array(z.string()).max(3).describe('Was diese Seite gut macht'),
  branche_vermutet: z.string().describe('Was für ein Betrieb ist das, nach den Bildern?'),
});

const SYSTEM = `Du bewertest Websites kleiner lokaler Unternehmen (Gastronomie, Handwerk, Praxen, Kanzleien, Einzelhandel) aus Sicht eines erfahrenen Webdesigners, der dem Inhaber ehrlich, aber respektvoll sagt, wo die Seite steht.

Du bekommst zwei Screenshots einer Seite: Desktop und Mobil. Bewerte nur, was du siehst — rate nicht, was woanders sein könnte.

Maßstab: 3 ist eine durchschnittliche Seite eines kleinen Betriebs aus den letzten fünf Jahren. 5 vergibst du selten. 1 ist deutlich unter dem, was man heute erwartet.

Die Noten müssen mit denen anderer Unternehmen vergleichbar sein.

Schwächen müssen konkret und am Screenshot festzumachen sein — nicht "das Design könnte moderner sein", sondern "Das Hero-Bild ist unscharf und der Text darauf kaum lesbar". Keine Floskeln, keine Empfehlungen, nur Befunde. Wenn eine Seite keine nennenswerte Schwäche hat, gib eine leere Liste zurück.`;

const bild = (p) => ({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: fs.readFileSync(p).toString('base64') } });

/* Jede Seite bekommt einen eigenen Aufruf.
   Gemessen: Werden mehrere Seiten in einem Aufruf bewertet, verschiebt der
   Kontext das Urteil — dieselbe Startseite bekam allein 25, neben zwei
   Unterseiten 43 (reproduzierbar). Damit wären Scores zwischen Unternehmen
   nicht mehr vergleichbar. Einzelaufrufe kosten praktisch dasselbe, weil die
   Bilder den Preis bestimmen, nicht der Prompt. */
async function bewerteSeite(client, s) {
  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5', max_tokens: 3000, system: SYSTEM,
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'Desktop-Ansicht (1440 px breit, oberer Bereich):' },
        bild(s.desktopShot),
        { type: 'text', text: 'Mobil-Ansicht (375 px breit, oberer Bereich):' },
        bild(s.mobileShot),
        { type: 'text', text: `Bewerte diese Seite ("${s.label}") nach dem Schema.` },
      ] }],
      output_config: { format: zodOutputFormat(Verdict) },
    });
    const u = response.parsed_output;
    if (!u) return { label: s.label, score: null, findings: [], data: null, fehler: 'nicht auswertbar' };
    const keys = ['zeitgemaess', 'bildqualitaet', 'hierarchie', 'verstaendlich', 'wertigkeit', 'mobil_nutzbar', 'mobil_nutzbar'];
    const score = clamp(((keys.reduce((a, k) => a + u[k], 0) / keys.length - 1) / 4) * 100);
    const schwaechen = (u.schwaechen || []).map((x) => String(x).trim()).filter((x) => x.length >= 15);
    return { label: s.label, score, data: u,
             findings: schwaechen.map((t) => finding('medium', t, `Screenshot-Urteil: ${s.label}`)),
             usage: { in: response.usage.input_tokens, out: response.usage.output_tokens } };
  } catch (e) {
    return { label: s.label, score: null, findings: [], data: null, fehler: String(e.message || e).slice(0, 120) };
  }
}

export async function checkImpression(seiten) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { proSeite: [], gesamt: { score: null, skipped: 'ANTHROPIC_API_KEY fehlt', findings: [], data: null } };
  }
  // maxRetries höher als der Standard (2): Bei parallelen Anfragen über viele
  // Unternehmen hinweg gab es vereinzelt Aussetzer, die als fehlende Bewertung
  // durchschlugen. Eine Lücke in der Hauptkategorie ist teurer als ein paar
  // Sekunden Wartezeit.
  const client = new Anthropic({
    maxRetries: 5,
    ...(process.env.ANTHROPIC_WORKSPACE_ID
      ? { defaultHeaders: { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID } } : {}),
  });

  const proSeite = await Promise.all(seiten.map((s) => bewerteSeite(client, s)));
  const start = proSeite[0];
  if (start.score === null) {
    return { proSeite, gesamt: { score: null, skipped: start.fehler || 'keine Bewertung', findings: [], data: null } };
  }

  const f = [...(start.findings || [])];
  if (f[0]) f[0] = { ...f[0], severity: 'high' };
  if (start.data?.zeitgemaess <= 2) f.unshift(finding('high', 'Das Design wirkt veraltet.', `zeitgemäß ${start.data.zeitgemaess}/5`));

  // Einheitlichkeit aus den Einzelnoten ableiten statt danach zu fragen —
  // objektiver und ohne zusätzlichen Aufruf.
  const werte = proSeite.map((p) => p.score).filter((x) => typeof x === 'number');
  if (werte.length > 1 && Math.max(...werte) - Math.min(...werte) >= 25) {
    f.push(finding('medium', 'Die Seiten sind unterschiedlich gut gemacht — der Auftritt wirkt nicht wie aus einem Guss.',
      proSeite.filter((p) => p.score !== null).map((p) => `${p.label} ${p.score}`).join(' · ')));
  }

  return { proSeite,
    gesamt: { score: start.score, findings: f,
      data: { ...start.data, spanne: werte.length > 1 ? Math.max(...werte) - Math.min(...werte) : 0,
              usage: proSeite.reduce((a, p) => ({ in: a.in + (p.usage?.in || 0), out: a.out + (p.usage?.out || 0) }), { in: 0, out: 0 }) } } };
}
