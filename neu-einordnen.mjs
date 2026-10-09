#!/usr/bin/env node
/* Branchen nachziehen, ohne neu zu scannen.
     node neu-einordnen.mjs              nur anzeigen
     node neu-einordnen.mjs --anwenden   schreiben

   Die Branche steckt im gespeicherten Scan und stammt bei vielen Betrieben noch
   aus der Zeit vor den ergänzten Stichwortlisten — "Autohaus Cunzemann GmbH -
   Toyota" stand als Dienstleistung in der Liste. Name und Domain reichen aus,
   um das zu korrigieren; ein neuer Seitenabruf ist dafür nicht nötig.

   Geändert wird nur, was im Auffang-Topf 'dienstleistung' liegt: Eine bestehende
   Einordnung aus dem Seiteninhalt ist belastbarer als ein Namenstreffer.      */
import 'dotenv/config';
import { db, dbAktiv } from './lib/db.mjs';
import { PROFILE } from './lib/branchen.mjs';

if (!dbAktiv()) { console.error('Supabase nicht konfiguriert'); process.exit(1); }
const anwenden = process.argv.includes('--anwenden');

/* Dieselben Muster wie in der Erkennung, aber nur auf Name und Hostnamen
   angewandt. Reihenfolge entscheidet bei Mehrdeutigkeit. */
const MUSTER = [
  ['autohaus',   /auto(haus|händler|mobil|park|welt|center|zentrum|service|werkstatt|handel)|fahrzeug(welt|handel|center|haus)|\bkfz\b|karosserie|lackiererei|reifen(dienst|handel|service)|motorrad(haus|händler)|nutzfahrzeug|landmaschinen|\b(toyota|audi|vw|volkswagen|bmw|mercedes|opel|ford|fiat|nissan|kia|mazda|honda|hyundai|suzuki|mitsubishi|peugeot|citroen|skoda|škoda|seat|cupra|dacia|renault|volvo|jeep|subaru|porsche)\b/i],
  ['industrie',  /maschinenbau|anlagenbau|werkzeugbau|zerspanung|cnc|kunststofftechnik|metallverarbeitung|oberflächentechnik|automatisierung|spedition|logistik|großhandel|industrie|sondermaschinen|verpackungsmaschinen|stanz|umformtechnik|spritzguss/i],
  ['gesundheit', /praxis|zahnarzt|zahnärzt|ärzt|\barzt\b|physio|therapie|apotheke|tierarzt|heilpraktiker|pflege|sanitätshaus|orthopäd|optik|hörakustik|kieferorthopäd/i],
  ['beratung',   /kanzlei|rechtsanwalt|steuerberat|lohnsteuerhilfe|notar|makler|architekt|ingenieur|beratung|consulting|versicherung|immobilien|sachverständ|gutachter/i],
  ['gastro',     /restaurant|pizzeria|trattoria|gasthof|gasthaus|gaststätte|wirtshaus|bistro|café|cafe|konditorei|imbiss|döner|kebap|pizza|sushi|steakhouse|brauerei|bäckerei|metzgerei|eisdiele|catering|partyservice|hotel|pension|landgasthof|besen/i],
  ['handwerk',   /dachdecker|bedachung|flachdach|spengler|elektro|sanitär|heizung|haustechnik|installateur|maler|lackierer|schreiner|tischler|zimmerei|holzbau|fliesen|trockenbau|innenausbau|estrich|gipser|stuckateur|bodenleger|parkett|garten.?(und|&).?landschaft|galabau|bau(unternehmen|firma|geschäft)|gerüst|schlosser|metallbau|solar|photovoltaik|fensterbau|rollladen|treppenbau|küchenstudio|montage/i],
  ['handel',     /fachgeschäft|fachhandel|boutique|juwelier|optiker|buchhandlung|blumen|florist|weinhandlung|baumarkt|möbelhaus|markt\b/i],
];

const einordnen = (name, website) => {
  const heu = (name || '') + ' ' + (website || '').replace(/^https?:\/\//, '').replace(/[-_.]/g, ' ');
  for (const [key, rx] of MUSTER) if (rx.test(heu)) return key;
  return null;
};

const alle = [];
for (let von = 0; ; von += 1000) {
  const { data, error } = await db().from('unternehmen')
    .select('id,name,website,branche,quality_score').order('id').range(von, von + 999);
  if (error) { console.error(error.message); process.exit(1); }
  alle.push(...data);
  if (data.length < 1000) break;
}

const aenderungen = alle
  .filter((r) => r.branche === 'dienstleistung' || r.branche === null)
  .map((r) => ({ ...r, neu: einordnen(r.name, r.website) }))
  .filter((r) => r.neu && r.neu !== r.branche);

const nachBranche = {};
for (const a of aenderungen) nachBranche[a.neu] = (nachBranche[a.neu] ?? 0) + 1;

console.log(`\n${alle.length} Betriebe, davon ${alle.filter((r) => r.branche === 'dienstleistung').length} im Auffang-Topf`);
console.log(`neu einzuordnen: ${aenderungen.length}\n`);
for (const [k, n] of Object.entries(nachBranche).sort((a, b) => b[1] - a[1]))
  console.log(`  ${(PROFILE[k]?.label ?? k).padEnd(24)} ${n}`);
console.log();
for (const a of aenderungen.slice(0, 10))
  console.log(`  ${(a.name ?? '').slice(0, 38).padEnd(40)} → ${PROFILE[a.neu]?.label ?? a.neu}`);
if (aenderungen.length > 10) console.log(`  … und ${aenderungen.length - 10} weitere`);

if (!anwenden) { console.log('\nNur angezeigt. Zum Schreiben:  node neu-einordnen.mjs --anwenden\n'); process.exit(0); }

console.log('\nSchreibe …');
let n = 0;
for (const a of aenderungen) {
  const { error } = await db().from('unternehmen').update({ branche: a.neu }).eq('id', a.id);
  if (error) console.error('  ', a.name, error.message); else n++;
}
console.log(`\n${n} Betriebe neu eingeordnet.\n`);
process.exit(0);
