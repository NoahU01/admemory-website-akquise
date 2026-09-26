-- =====================================================================
--  admemory-website-akquise — Datenbankschema
--  Einspielen: Supabase Dashboard > SQL Editor > New query > einfügen > Run
--  Das Skript ist wiederholbar: erneutes Ausführen ändert nichts kaputt.
-- =====================================================================

-- ---------------------------------------------------------------------
--  Status: der Kern des Ablaufs. Als Enum, damit nichts anderes
--  hineingeschrieben werden kann als diese zehn Werte.
--
--    neu             gesammelt, noch nicht bewertet
--    gescannt        Bewerter lief durch, wartet auf Entwurf
--    entwurf_gebaut  Agent hat gebaut  →  wartet auf dich
--    feedback_gegeben du hast Korrekturen notiert  →  wartet auf den Agenten
--    freigegeben     du bist zufrieden, Mail kann vorbereitet werden
--    versendet       Pitch ist raus
--    geantwortet     Antwort da, noch offen wie es ausgeht
--    kunde           gewonnen
--    abgelehnt       kein Interesse
--    pausiert        aus dem Ablauf genommen
-- ---------------------------------------------------------------------
do $$ begin
  create type akquise_status as enum (
    'neu', 'gescannt', 'entwurf_gebaut', 'feedback_gegeben', 'freigegeben',
    'versendet', 'geantwortet', 'kunde', 'abgelehnt', 'pausiert'
  );
exception when duplicate_object then null; end $$;

create table if not exists unternehmen (
  id             uuid primary key default gen_random_uuid(),

  -- Stammdaten
  name           text not null,
  website        text unique,
  branche        text,                    -- gastro | handwerk | gesundheit | beratung | handel | dienstleistung
  stadt          text,
  telefon        text,
  email          text,

  -- Signale für den Lead-Wert (aus der Places API, Phase 2)
  google_rating  numeric(2,1),
  google_reviews integer,

  -- Ablauf
  status         akquise_status not null default 'neu',

  -- Bewertung
  quality_score  smallint,                -- 0-100, wie gut ist die Seite
  lead_score     smallint,                -- 0-100, wie lohnend als Kunde
  befunde        jsonb default '[]'::jsonb,   -- [{severity, text, evidence, category}]
  scan_details   jsonb,                       -- Kategorien, Seiten, Screenshots

  -- Ergebnisse
  entwurf_url      text,
  landingpage_url  text,

  -- Deine Korrekturschleife: Historie, nicht ein einzelnes Feld.
  -- [{runde, datum, text}] — der Agent liest die neueste Runde, sieht aber alle.
  feedback       jsonb default '[]'::jsonb,

  -- Zeitstempel des Ablaufs
  letzter_scan     timestamptz,
  letzter_build    timestamptz,
  mail_gesendet_am timestamptz,
  antwort_am       timestamptz,

  notiz          text,
  erstellt_am    timestamptz not null default now(),
  geaendert_am   timestamptz not null default now()
);

-- geaendert_am automatisch mitführen
create or replace function set_geaendert_am() returns trigger as $$
begin new.geaendert_am = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_unternehmen_geaendert on unternehmen;
create trigger trg_unternehmen_geaendert before update on unternehmen
  for each row execute function set_geaendert_am();

-- Indizes für die Abfragen, die täglich laufen
create index if not exists idx_unternehmen_status     on unternehmen (status);
create index if not exists idx_unternehmen_lead       on unternehmen (lead_score desc nulls last);
create index if not exists idx_unternehmen_branche    on unternehmen (branche);
create index if not exists idx_unternehmen_stadt      on unternehmen (stadt);

-- ---------------------------------------------------------------------
--  Zugriff: nur der service_role-Key (dein Rechner, deine Automaten).
--  RLS an, keine Policies = von außen kommt niemand an die Daten.
-- ---------------------------------------------------------------------
alter table unternehmen enable row level security;

-- ---------------------------------------------------------------------
--  Arbeitsliste: das, was du täglich siehst.
--  Sortiert so, dass oben steht, was jetzt deine Aufmerksamkeit braucht.
-- ---------------------------------------------------------------------
drop view if exists arbeitsliste;
create view arbeitsliste as
select
  id, name, stadt, branche,
  status,
  quality_score  as qualitaet,
  lead_score     as lead,
  jsonb_array_length(coalesce(befunde, '[]'::jsonb))      as befunde,
  (select count(*) from jsonb_array_elements(coalesce(befunde, '[]'::jsonb)) b
    where b->>'severity' = 'high')                       as schwere_befunde,
  website, entwurf_url, landingpage_url,
  jsonb_array_length(coalesce(feedback, '[]'::jsonb))     as feedback_runden,
  case when jsonb_array_length(coalesce(feedback, '[]'::jsonb)) > 0
       then feedback -> (jsonb_array_length(feedback) - 1) ->> 'text'
       end                                                  as letztes_feedback,
  letzter_scan, letzter_build, mail_gesendet_am, antwort_am,
  notiz
from unternehmen
order by
  case status
    when 'entwurf_gebaut'   then 1     -- wartet auf dich
    when 'geantwortet'      then 2     -- jemand hat geantwortet
    when 'freigegeben'      then 3     -- Mail kann raus
    when 'gescannt'         then 4
    when 'feedback_gegeben' then 5     -- wartet auf den Agenten
    when 'neu'              then 6
    else 9
  end,
  lead_score desc nulls last;

comment on table unternehmen is 'Akquise-Pipeline: ein Betrieb, ein Zustand, eine Bewertung.';
comment on column unternehmen.feedback is 'Historie deiner Korrekturen: [{runde, datum, text}]. Der Agent liest die neueste, kennt aber alle.';
comment on column unternehmen.scan_details is 'Vollständiges Scan-Ergebnis: Kategorien mit Scores, geprüfte Seiten, Screenshot-Pfade.';
