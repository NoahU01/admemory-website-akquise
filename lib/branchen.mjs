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
  autohaus: {
    label: 'Autohaus & Kfz',
    angebot:   /fahrzeuge|fahrzeugsuche|gebrauchtwagen|neuwagen|jahreswagen|vorführwagen|bestand|angebote|modelle|leasing|finanzierung|werkstatt|service|inspektion|reifen|unfallinstandsetzung/i,
    abschluss: /probefahrt|anfrage|servicetermin|werkstatttermin|termin vereinbaren|fahrzeug anfragen|beratungstermin|inzahlungnahme|angebot anfordern/i,
    vertrauen: /team|über uns|seit \d{4}|vertragshändler|autorisiert|meisterbetrieb|zertifi|auszeichnung|partner/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|servicezeiten|werkstattzeiten|verkaufszeiten', 'i'),
    buchung:   /mobile\.de|autoscout24|carwow|terminland|calendly|werkstattplaner/i,
    pflicht:   ['angebot', 'zeiten', 'kontakt'],
  },
  industrie: {
    label: 'Industrie & Produktion',
    angebot:   /produkte|produktion|fertigung|leistungen|lösungen|maschinen|anlagen|komponenten|sortiment|technologie|verfahren|werkstoffe|branchen|anwendungen/i,
    abschluss: /anfrage|angebot anfordern|kontaktformular|ansprechpartner|beratung|katalog|datenblatt|muster/i,
    vertrauen: /referenzen|zertifi|ISO ?900|qualität|historie|seit \d{4}|standorte|unternehmen|karriere|mitarbeiter/i,
    zeiten:    new RegExp(ZEITEN_BASIS + '|bürozeiten|erreichbarkeit', 'i'),
    buchung:   /calendly|cal\.com|hubspot|pardot/i,
    pflicht:   ['angebot', 'kontakt', 'vertrauen'],
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
  gastro:        /restaurant|gaststätte|gasthaus|gasthof|wirtshaus|pizzeria|\bpizza\b|trattoria|ristorante|bistro|café|cafe|kaffeehaus|konditorei|\bbar\b|pilsbar|kneipe|biergarten|imbiss|speisekarte|speiserei|mittagstisch|gyros|schnitzel|sushi|döner|kebap|kebab|burger|steakhouse|brauerei|weinstube|besenwirtschaft|metzgerei|bäckerei|eisdiele|eiscafé|catering|partyservice|hotel|pension|gästehaus|mexikanisch|italienisch essen|griechisch essen|à la carte|tagesgericht/i,
  handwerk:      /dachdecker|bedachung|flachdach|steildach|dachtechnik|dachsanierung|spengler|klempnerei|abdichtung|elektr|sanitär|heizung|haustechnik|installateur|maler|lackierer|schreiner|tischler|zimmerei|holzbau|fliesenleger|trockenbau|innenausbau|estrich|gipser|stuckateur|putz(arbeit|er)|bodenleger|parkett|raumausstatt|garten.?(und|&).?landschaft|galabau|bau(unternehmen|firma|geschäft)|gerüst|schlosser|metallbau|solar|photovoltaik|fensterbau|rollladen|treppenbau|küchenstudio|schornsteinfeger|garagentor|meisterbetrieb/i,
  gesundheit:    /praxis|arzt|ärzt|zahnarzt|zahnmedizin|kieferorthopäd|physiotherapie|\bphysio\b|krankengymnastik|heilpraktiker|osteopath|logopäd|ergotherapie|podolog|tierarzt|apotheke|psychotherap|psycholog|hebamme|pflegedienst|pflegeheim|seniorenheim|sanitätshaus|orthopädie|augenoptik|hörakustik|medizin|therapie(werk|zentrum|praxis)|reha\b/i,
  beratung:      /rechtsanwalt|anwaltskanzlei|kanzlei|steuerberat|lohnsteuerhilfe|buchhaltung|wirtschaftsprüf|notar|unternehmensberat|consulting|versicherungsmakler|immobilienmakler|immobilien\b|architekt|ingenieurbüro|sachverständige|gutachter|finanzberat|vermögensberat/i,
  handel:        /einzelhandel|fachgeschäft|fachhandel|boutique|laden|shop|sortiment|möbelhaus|juwelier|optiker|buchhandlung|blumen|florist|weinhandlung|baumarkt|raumausstattung|schmuck|spielwaren|sportgeschäft|elektrofachmarkt/i,
  autohaus:      /autohaus|autohändler|automobile|automobil|fahrzeughandel|fahrzeugwelt|autopark|autowelt|autocenter|\bkfz\b|kfz-(betrieb|werkstatt|meister|service)|autoservice|autowerkstatt|karosserie|lackiererei|reifendienst|reifenhandel|gebrauchtwagen|neuwagen|vertragshändler|probefahrt|motorradhaus|nutzfahrzeug|landmaschinen|autoverwertung|autoteile/i,
  industrie:     /maschinenbau|anlagenbau|zerspanung|\bcnc\b|werkzeugbau|kunststofftechnik|metallverarbeitung|oberflächentechnik|automatisierung|zulieferer|produktionstechnik|fertigungstechnik|lohnfertigung|spedition|logistik|großhandel|industrieunternehmen|serienfertigung|sondermaschinen/i,
};

export function erkenneBranche(dom, rawHtml = '', hinweis = null) {
  // Ein expliziter Hinweis (Places API, später) gewinnt immer
  if (hinweis && PROFILE[hinweis]) return { key: hinweis, quelle: 'vorgegeben', sicher: true };

  const jsonld = (dom.jsonld || []).join(' ');
  // schema.org-Typ ist das verlässlichste Signal
  const typ = jsonld.match(/"@type"\s*:\s*"(Restaurant|FoodEstablishment|CafeOrCoffeeShop|Bakery|BarOrPub|Dentist|Physician|MedicalClinic|Attorney|LegalService|AccountingService|HomeAndConstructionBusiness|Plumber|Electrician|RoofingContractor|GeneralContractor|Store|ClothingStore|HardwareStore|Optician|Pharmacy|AutoDealer|AutoRepair|AutoBodyShop|AutomotiveBusiness|TireShop|Manufacturer)"/i)?.[1];
  const ausTyp = {
    Restaurant: 'gastro', FoodEstablishment: 'gastro', CafeOrCoffeeShop: 'gastro', Bakery: 'gastro', BarOrPub: 'gastro',
    Dentist: 'gesundheit', Physician: 'gesundheit', MedicalClinic: 'gesundheit', Pharmacy: 'gesundheit',
    Attorney: 'beratung', LegalService: 'beratung', AccountingService: 'beratung',
    HomeAndConstructionBusiness: 'handwerk', Plumber: 'handwerk', Electrician: 'handwerk', RoofingContractor: 'handwerk', GeneralContractor: 'handwerk',
    AutoDealer: 'autohaus', AutoRepair: 'autohaus', AutoBodyShop: 'autohaus', AutomotiveBusiness: 'autohaus', TireShop: 'autohaus',
    Manufacturer: 'industrie',
    Store: 'handel', ClothingStore: 'handel', HardwareStore: 'handel', Optician: 'handel',
  }[typ];
  if (ausTyp) return { key: ausTyp, quelle: `schema.org: ${typ}`, sicher: true };

  /* Sonst Stichwortzählung. Titel und Beschreibung zählen dreifach: dort steht,
     was der Betrieb tut. Im Fließtext stehen auch Referenzen — ein Dachdecker,
     der „Restaurant Sonne" als Projekt nennt, ist keine Gastronomie. */
  /* Der Domainname zählt zum Kopf: 'malerbetrieb-brunner.de' und
     'physiotherapie-hoefer.de' sagen, was der Betrieb ist. Bisher wurde er nie
     gelesen — beide landeten im Auffang-Topf 'Dienstleistung'. */
  const ausDomain = (dom.url || dom.canonical || '')
    .replace(/^https?:\/\/(www\.)?/, '').split('/')[0].replace(/\.[a-z.]{2,8}$/i, '')
    .replace(/[-_.]/g, ' ');
  const kopf = (dom.title || '') + ' ' + (dom.description || '') + ' ' + ausDomain;
  const rumpf = (dom.text || '').slice(0, 8000);
  const zaehle = (rx, txt) => (txt.match(new RegExp(rx.source, 'gi')) || []).length;
  const treffer = Object.entries(SIGNALE)
    .map(([k, rx]) => [k, 3 * zaehle(rx, kopf) + zaehle(rx, rumpf), zaehle(rx, kopf)])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!treffer.length) return { key: 'dienstleistung', quelle: 'Standard (nichts erkannt)', sicher: false };
  const [key, n, imKopf] = treffer[0];
  const zweiter = treffer[1]?.[1] ?? 0;
  /* Ein einzelner Treffer irgendwo im Fließtext entscheidet nichts. „verfügbar"
     enthielt „bar" und machte MAM Bedachungen zur Gastronomie. */
  if (n <= 2 && !imKopf) return { key: 'dienstleistung', quelle: `nur ${n} schwaches Signal (${key})`, sicher: false };
  return { key, quelle: `${n} gewichtete Treffer${imKopf ? ', davon im Titel' : ''}`, sicher: n >= 4 && n > zweiter * 1.5 };
}

export const profilVon = (key) => PROFILE[key] || PROFILE.dienstleistung;
