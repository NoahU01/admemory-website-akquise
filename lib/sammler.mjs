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
const brancheAusTyp = (typ = '') => (TYP_ZU_BRANCHE.find(([rx]) => rx.test(typ)) || [, 'dienstleistung'])[1];

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
        branche: brancheAusTyp(p.primaryType),
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
export function filtern(treffer, { minBewertungen = 0, minSterne = 0, nurMitWebsite = true } = {}) {
  const raus = [];
  const drin = treffer.filter((t) => {
    if (t.status && t.status !== 'OPERATIONAL') { raus.push([t.name, 'nicht operativ']); return false; }
    if (nurMitWebsite && !t.website) { raus.push([t.name, 'keine Website']); return false; }
    if (t.website && /facebook\.com|instagram\.com|linktr\.ee|google\.com|wixsite|jimdosite/i.test(t.website)) {
      raus.push([t.name, 'nur Social-Profil']); return false;
    }
    if (minBewertungen && (t.google_reviews ?? 0) < minBewertungen) { raus.push([t.name, `< ${minBewertungen} Bewertungen`]); return false; }
    if (minSterne && (t.google_rating ?? 0) < minSterne) { raus.push([t.name, `< ${minSterne} Sterne`]); return false; }
    return true;
  });
  return { drin, raus };
}
