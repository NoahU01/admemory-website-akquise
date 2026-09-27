/* Branchenprofile.
   Die Bewertungsdimensionen und ihre Gewichte bleiben für alle Branchen gleich —
   nur wonach gesucht wird, unterscheidet sich. Ohne das verliert ein Handwerker
   rund 24 Punkte für eine fehlende Speisekarte und landet fälschlich als
   heißer Lead ganz oben.

   Jedes Profil beschreibt:
   angebot   — wie die Leistungsübersicht heißt (Speisekarte / Leistungen / Sortiment)
   abschluss — wie der Abschluss heißt (reservieren / Angebot anfordern / Termin)
   vertrauen — was Vertrauen schafft (Gastraumfotos / Referenzen / Team)
   zeiten    — wie Öffnungszeiten heißen (Öffnungszeiten / Sprechzeiten / Bürozeiten)
   buchung   — externe Systeme, die einen Abschluss ermöglichen
   pflicht   — Inhalte, die auf der Seite vorkommen MÜSSEN (für die Vollständigkeit) */

const ZEITEN_BASIS = 'öffnungszeiten|opening hours|geöffnet|\\b(mo|di|mi|do|fr|sa|so)\\.?\\s*[–-]\\s*(mo|di|mi|do|fr|sa|so)\\b|\\d{1,2}[:.]\\d{2}\\s*(–|-|bis)\\s*\\d{1,2}[:.]\\d{2}';

export const PROFILE = {
  gastro: {
    label: 'Gastronomie',
    angebot:   /speisekarte|speisen|gerichte|getränkekarte|weinkarte|tageskarte|mittagstisch|speisen?menü|men[üu]karte|mittagsmen[üu]|unsere karte/i,
    abschluss: /reservier|tisch|bestell|liefer|abhol/i,
    vertrauen: /gastraum|ambiente|küche|team|über uns|geschichte/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|ruhetag|küchenzeiten', 'i'),
    buchung:   /opentable|resmio|quandoo|bookatable|formitable|lieferando|wolt|uber\s?eats/i,
    pflicht:   ['angebot', 'zeiten', 'kontakt'],
  },
  handwerk: {
    label: 'Handwerk & Bau',
    angebot:   /leistungen|leistungsspektrum|gewerke|unser angebot|was wir (tun|machen|bieten)|dienstleistungen|sanierung|montage|reparatur|meisterarbeit|fassade|innenraum|malerarbeit|dacharbeit|elektroinstallation|heizungsbau|badsanierung|trockenbau|bodenbelag|fenstermontage|neubau|altbau/i,
    abschluss: /angebot anfordern|kostenlos(es)? angebot|anfrage|kontaktformular|rückruf|notdienst|beratungstermin|termin vereinbaren/i,
    vertrauen: /referenzen|projekte|galerie|meisterbetrieb|meisterbrief|zertifi|innung|seit \d{4}|erfahrung|bewertung/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|bürozeiten|erreichbarkeit|notdienst', 'i'),
    buchung:   /calendly|terminland|etermin|cal\.com/i,
    pflicht:   ['angebot', 'kontakt', 'vertrauen'],
  },
  gesundheit: {
    label: 'Praxis & Gesundheit',
    angebot:   /leistungen|behandlung|therapie|diagnostik|spezialisier|schwerpunkt/i,
    abschluss: /termin|terminvereinbarung|online.?termin|rückruf|anfrage|sprechstunde/i,
    vertrauen: /team|praxis|ärzt|qualifikation|ausbildung|zertifi|seit \d{4}/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|sprechzeiten|sprechstunde|telefonzeiten', 'i'),
    buchung:   /doctolib|jameda|samedi|dr-flex|terminland|calendly/i,
    pflicht:   ['angebot', 'zeiten', 'kontakt'],
  },
  beratung: {
    label: 'Kanzlei & Beratung',
    angebot:   /leistungen|beratung|fachgebiet|rechtsgebiet|schwerpunkt|mandant|tätigkeitsfeld/i,
    abschluss: /erstgespräch|beratungstermin|termin|anfrage|kontaktformular|rückruf|mandat/i,
    vertrauen: /team|kanzlei|partner|qualifikation|fachanwalt|steuerberater|seit \d{4}|referenz/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|bürozeiten|sprechzeiten|telefonzeiten', 'i'),
    buchung:   /calendly|cal\.com|terminland|etermin/i,
    pflicht:   ['angebot', 'kontakt', 'vertrauen'],
  },
  handel: {
    label: 'Einzelhandel',
    angebot:   /sortiment|produkte|marken|shop|katalog|auswahl|neuheiten/i,
    abschluss: /jetzt kaufen|in den warenkorb|online.?shop|anfrage|vorbestell|reservier/i,
    vertrauen: /über uns|laden|geschäft|team|seit \d{4}|beratung/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|ladenöffnungszeiten', 'i'),
    buchung:   /shopify|woocommerce|shopware|etsy/i,
    pflicht:   ['angebot', 'zeiten', 'kontakt'],
  },
  dienstleistung: {
    label: 'Dienstleistung',
    angebot:   /leistungen|unser angebot|dienstleistungen|was wir (tun|bieten)|pakete|unsere preise/i,
    abschluss: /anfrage|angebot anfordern|termin|beratung|kontaktformular|rückruf|buchen/i,
    vertrauen: /über uns|team|referenzen|kunden|seit \d{4}|bewertung/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|erreichbarkeit|bürozeiten', 'i'),
    buchung:   /calendly|cal\.com|terminland|etermin|acuity/i,
    pflicht:   ['angebot', 'kontakt'],
  },
};

/* Erkennung aus der Seite selbst — läuft vor allen Checks und braucht keine API.
   Die Places API (Phase 2) und Claudes Screenshot-Urteil können das Ergebnis
   später überstimmen; beide liefern die Branche ohnehin mit. */
const SIGNALE = {
  gastro:        /restaurant|gaststätte|gasthaus|pizzeria|trattoria|bistro|café|cafe|bar\b|kneipe|imbiss|speisekarte|gyros|schnitzel|sushi|brauerei|metzgerei|bäckerei|catering|hotel garni/i,
  handwerk:      /dachdecker|elektr|sanitär|heizung|installateur|maler|lackierer|schreiner|tischler|zimmerei|fliesenleger|garten.?(und|&).?landschaft|galabau|bau(unternehmen|firma)|stuckateur|gerüst|schlosser|metallbau|kfz|autohaus|werkstatt|solar|photovoltaik|fenster|rollladen/i,
  gesundheit:    /praxis|arzt|ärzt|zahnarzt|zahnmedizin|physiotherapie|heilpraktiker|osteopath|logopäd|ergotherapie|tierarzt|apotheke|psychotherap|hebamme|pflegedienst|sanitätshaus/i,
  beratung:      /rechtsanwalt|anwaltskanzlei|kanzlei|steuerberat|wirtschaftsprüf|notar|unternehmensberat|consulting|versicherungsmakler|immobilienmakler|architekt|ingenieurbüro/i,
  handel:        /einzelhandel|fachgeschäft|boutique|laden|shop|sortiment|möbelhaus|juwelier|optiker|buchhandlung|blumen|florist|weinhandlung|baumarkt/i,
};

export function erkenneBranche(dom, rawHtml = '', hinweis = null) {
  // Ein expliziter Hinweis (Places API, später) gewinnt immer
  if (hinweis && PROFILE[hinweis]) return { key: hinweis, quelle: 'vorgegeben', sicher: true };

  const jsonld = (dom.jsonld || []).join(' ');
  // schema.org-Typ ist das verlässlichste Signal
  const typ = jsonld.match(/"@type"\s*:\s*"(Restaurant|FoodEstablishment|CafeOrCoffeeShop|Bakery|BarOrPub|Dentist|Physician|MedicalClinic|Attorney|LegalService|AccountingService|HomeAndConstructionBusiness|Plumber|Electrician|RoofingContractor|GeneralContractor|Store|ClothingStore|HardwareStore|Optician|Pharmacy)"/i)?.[1];
  const ausTyp = {
    Restaurant: 'gastro', FoodEstablishment: 'gastro', CafeOrCoffeeShop: 'gastro', Bakery: 'gastro', BarOrPub: 'gastro',
    Dentist: 'gesundheit', Physician: 'gesundheit', MedicalClinic: 'gesundheit', Pharmacy: 'gesundheit',
    Attorney: 'beratung', LegalService: 'beratung', AccountingService: 'beratung',
    HomeAndConstructionBusiness: 'handwerk', Plumber: 'handwerk', Electrician: 'handwerk', RoofingContractor: 'handwerk', GeneralContractor: 'handwerk',
    Store: 'handel', ClothingStore: 'handel', HardwareStore: 'handel', Optician: 'handel',
  }[typ];
  if (ausTyp) return { key: ausTyp, quelle: `schema.org: ${typ}`, sicher: true };

  // Sonst Stichwortzählung über Titel, Beschreibung und Text
  const heu = ((dom.title || '') + ' ' + (dom.description || '') + ' ' + (dom.text || '').slice(0, 8000));
  const treffer = Object.entries(SIGNALE)
    .map(([k, rx]) => [k, (heu.match(new RegExp(rx.source, 'gi')) || []).length])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!treffer.length) return { key: 'dienstleistung', quelle: 'Standard (nichts erkannt)', sicher: false };
  const [key, n] = treffer[0];
  const zweiter = treffer[1]?.[1] ?? 0;
  return { key, quelle: `${n} Treffer im Text`, sicher: n >= 3 && n > zweiter * 1.5 };
}

export const profilVon = (key) => PROFILE[key] || PROFILE.dienstleistung;
