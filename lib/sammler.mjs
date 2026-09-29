/* Sammler: findet Betriebe über die Google Places API (New) und legt sie an.
   Text Search statt Nearby Search, weil sich damit Branche und Ort in einer
   Anfrage beschreiben lassen ("Malerbetrieb in Crailsheim").
   Pro Anfrage liefert Google höchstens 20 Treffer und insgesamt 60 über alle
   Seiten — mehr geht nur über engere Suchbegriffe oder weitere Orte. */

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FELDER = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.websiteUri',
  'places.nationalPhoneNumber', 'places.rating', 'places.userRatingCount',
  'places.primaryType', 'places.primaryTypeDisplayName', 'places.businessStatus',
  'nextPageToken',
].join(',');

/* Google-Typen auf unsere Branchenprofile abbilden. Die Liste deckt ab, was bei
   lokalen Betrieben tatsächlich vorkommt; alles Unbekannte fällt auf
   'dienstleistung' zurück und wird beim Scan aus dem Seiteninhalt bestimmt. */
const TYP_ZU_BRANCHE = [
  [/restaurant|cafe|coffee_shop|bar|pub|bakery|meal_|food|pizza|ice_cream|catering|winery|brewery/i, 'gastro'],
  [/plumber|electrician|roofing|painter|carpenter|locksmith|contractor|hvac|moving|landscap|hardware|car_repair|auto|construction|window|floor|solar/i, 'handwerk'],
  [/doctor|dentist|physio|chiropractor|veterinar|pharmacy|hospital|clinic|health|therapist|psycholog|optometrist/i, 'gesundheit'],
  [/lawyer|accounting|notary|insurance_agency|real_estate|consultant|financial|architect|engineer/i, 'beratung'],
  [/store|shop|market|boutique|jewelry|book|furniture|clothing|florist|supermarket|grocery/i, 'handel'],
];
const brancheAusTyp = (typ = '') => (TYP_ZU_BRANCHE.find(([rx]) => rx.test(typ)) || [, null])[1];

/* Googles primaryType ist bei kleinen Betrieben oft unspezifisch ('point_of_interest',
   'establishment'). Dann hilft der Name: "Gasthof zur Krone" und "Pizza & Kebaphaus"
   landeten sonst bei 'dienstleistung' beziehungsweise 'handel'. */
const NAME_ZU_BRANCHE = [
  [/restaurant|pizzeria|trattoria|ristorante|gasthof|gasthaus|gaststätte|wirtshaus|bistro|café|cafe|\bbar\b|imbiss|kebap|kebab|döner|pizza|sushi|steakhouse|brauerei|bäckerei|metzgerei|eisdiele|kantine|catering|einkehr|hotel|zur krone|zum adler|zum lamm|zum ochsen|zum löwen|speise/i, 'gastro'],
  [/dachdecker|elektro|sanitär|heizung|maler|schreiner|tischler|zimmerei|fliesen|garten.?(und|&).?landschaft|galabau|gartenbau|bauunternehm|baugeschäft|stuckateur|schlosser|metallbau|solar|fensterbau|rollladen|malerbetrieb/i, 'handwerk'],
  [/auto(haus|händler|mobil|park|welt|center|zentrum|galerie|forum|service|werkstatt|handel|export)|fahrzeug(welt|handel|center|haus)|\bkfz\b|karosserie|lackiererei|reifen(dienst|handel|service)|motorrad(haus|händler)|nutzfahrzeug|landmaschinen|autoverwertung|autoteile|\bauto\b|\bopel\b|\bvolvo\b|\bškoda\b|\bskoda\b|\bseat\b|\bcupra\b|\bdacia\b|\brenault\b/i, 'autohaus'],
  [/maschinenbau|anlagenbau|werkzeugbau|zerspanung|kunststofftechnik|metallverarbeitung|automatisierung|spedition|logistik|großhandel|industrie|technik gmbh|gmbh & co\. kg/i, 'industrie'],
  [/praxis|zahnarzt|arzt|ärzt|physio|therapie|apotheke|tierarzt|heilpraktiker|pflege/i, 'gesundheit'],
  [/kanzlei|rechtsanwalt|steuerberat|notar|makler|architekt|ingenieur|beratung|consulting/i, 'beratung'],
  [/laden|boutique|juwelier|optiker|buchhandlung|blumen|florist|markt|shop\b/i, 'handel'],
];
const brancheAusName = (name = '') => (NAME_ZU_BRANCHE.find(([rx]) => rx.test(name)) || [, null])[1];

const stadtAus = (adresse = '') => adresse.match(/\b\d{5}\s+([A-ZÄÖÜ][a-zäöüß.\- ]+?)(,|$)/)?.[1]?.trim() ?? null;

export async function suche({ was, ort, umkreisKm = null, koordinaten = null, maxSeiten = 3, sprache = 'de' }) {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_KEY fehlt in .env');

  const treffer = [];
  let pageToken = null;

  for (let seite = 0; seite < maxSeiten; seite++) {
    const body = {
      textQuery: `${was} in ${ort}`,
      languageCode: sprache,
      regionCode: 'DE',
      pageSize: 20,
      ...(pageToken ? { pageToken } : {}),
    };
    // Umkreis nur wenn Koordinaten bekannt — sonst reicht der Ort im Suchtext
    if (koordinaten && umkreisKm) {
      body.locationBias = { circle: { center: { latitude: koordinaten.lat, longitude: koordinaten.lng }, radius: umkreisKm * 1000 } };
    }

    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FELDER },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Places API ${r.status}: ${txt.slice(0, 200)}`);
    }
    const j = await r.json();
    for (const p of j.places ?? []) {
      treffer.push({
        place_id: p.id,
        name: p.displayName?.text ?? null,
        website: p.websiteUri ?? null,
        telefon: p.nationalPhoneNumber ?? null,
        adresse: p.formattedAddress ?? null,
        stadt: stadtAus(p.formattedAddress),
        google_rating: p.rating ?? null,
        google_reviews: p.userRatingCount ?? null,
        typ: p.primaryType ?? null,
        typ_label: p.primaryTypeDisplayName?.text ?? null,
        // Der Name gewinnt: Googles primaryType stuft "Sultan's Pizza & Kebaphaus"
        // als 'store' ein und "Gasthof zur Krone" als unspezifisch.
        branche: brancheAusName(p.displayName?.text || '') || brancheAusTyp(p.primaryType) || 'dienstleistung',
        status: p.businessStatus ?? null,
      });
    }
    pageToken = j.nextPageToken ?? null;
    if (!pageToken) break;
    // Google braucht einen Moment, bis das Folgetoken gültig ist
    await new Promise((res) => setTimeout(res, 2000));
  }
  return treffer;
}

/* Wer lohnt sich überhaupt? Betriebe ohne Website sind kein Ziel für einen
   Relaunch-Pitch, dauerhaft geschlossene erst recht nicht. */
/* Konzerne und Filialisten: Bei Google steht die Filiale, die Website gehört der
   Zentrale. Da ist nichts zu gewinnen — die betreut eine große Agentur. Erkannt
   an bekannten Ketten und an Gattungsdomains, hinter denen kein Betrieb steht. */
const KONZERN = /\b(rewe|edeka|lidl|aldi|netto|penny|kaufland|dm|rossmann|müller|obi|hornbach|bauhaus|toom|fressnapf|deichmann|douglas|mediamarkt|saturn|ikea|xxxlutz|roller|poco|takko|kik|ernstings|tedi|action|woolworth|vodafone|telekom|o2|congstar|sparkasse|volksbank|commerzbank|deutsche-bank|postbank|ing|dhl|hermes|ups|fedex|dpd|gls|mcdonalds|burgerking|kfc|subway|starbucks|backwerk|kamps|dunkin|shell|aral|esso|jet|total|agip|avia|hyundai|toyota|volkswagen|mercedes-benz|bmw|audi|porsche|ford|opel|fiat|nissan|kia|mazda|honda|suzuki|pg|procter|unilever|nestle|henkel|beiersdorf|bosch|siemens|continental|zf|mahle)\.(de|com|at|net)$|^(www\.)?(de|at)\.[a-z-]+\.com$|\.(rewe|edeka|aldi|lidl)\.|^(auto-werkstatt|autohaus|zahnarzt|restaurant|friseur|maler|elektriker|steuerberater|rechtsanwalt|physiotherapie)\.(de|com)$/i;

export function istKonzern(website = '') {
  try { return KONZERN.test(new URL(/^https?:\/\//i.test(website) ? website : 'https://' + website).hostname.replace(/^www\./, '')); }
  catch { return false; }
}

export function filtern(treffer, { minBewertungen = 0, minSterne = 0, nurMitWebsite = true } = {}) {
  const raus = [];
  const gesehen = new Map();   // Hostname → erster Treffer
  const drin = treffer.filter((t) => {
    if (t.status && t.status !== 'OPERATIONAL') { raus.push([t.name, 'nicht operativ']); return false; }
    if (nurMitWebsite && !t.website) { raus.push([t.name, 'keine Website']); return false; }
    if (t.website && /facebook\.com|instagram\.com|linktr\.ee|google\.com|wixsite|jimdosite/i.test(t.website)) {
      raus.push([t.name, 'nur Social-Profil']); return false;
    }
    /* Verzeichnisportale und Baukasten-Subdomains sind kein eigener Auftritt —
       da gibt es nichts abzulösen. Aufgefallen bei "Die Legende des Döners",
       die auf speisekartenweb.de verlinkt. */
    if (t.website && /speisekartenweb\.de|lieferando\.|pizza\.de|restaurant-guru|tripadvisor|yelp\.|gelbeseiten|dasoertliche|11880\.|golocal\.|metro\.bar|opentable\.|kfzwerkstatt\.io|werkstaetten\.net|sloi\.me|mobile\.de|autoscout24\.|\w+-haendler\.de|dacia-erleben\.de|\w+-erleben\.de|handwerkerportal|wlw\.de|kununu\.|jameda\.|doctolib\.|proven ?expert/i.test(t.website)) {
      raus.push([t.name, 'nur Verzeichnis-Eintrag']); return false;
    }
    if (t.website && istKonzern(t.website)) { raus.push([t.name, 'Konzern- oder Kettenauftritt']); return false; }
    if (minBewertungen && (t.google_reviews ?? 0) < minBewertungen) { raus.push([t.name, `< ${minBewertungen} Bewertungen`]); return false; }
    if (minSterne && (t.google_rating ?? 0) < minSterne) { raus.push([t.name, `< ${minSterne} Sterne`]); return false; }

    /* Eine Website ist ein Lead. Die Koch-Autogruppe steht bei Google fünfmal
       drin — je Marke einmal —, zeigt aber auf dieselbe Seite. Wir bauen die
       einmal nach, nicht fünfmal. Behalten wird der Eintrag mit den meisten
       Bewertungen, weil der die Hauptniederlassung trifft. */
    let host; try { host = new URL(t.website).hostname.replace(/^www\./, ''); } catch { host = t.website; }
    const frueher = gesehen.get(host);
    if (frueher) {
      // Mehrfacheinträge sind selbst ein Signal: Wer fünf Marken oder drei
      // Filialen führt, ist größer — das fließt in die Größenschätzung ein.
      frueher.standorte = (frueher.standorte ?? 1) + 1;
      raus.push([t.name, `gleiche Website wie ${frueher.name}`]);
      return false;
    }
    gesehen.set(host, t);
    return true;
  });
  return { drin, raus };
}
