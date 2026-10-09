-- Verbrauch und Umsatz: die Grundlage für die Übersichtsseite.
--
-- Bisher verpuffte beides. Die Tokenzahlen liefert die API bei jeder Anfrage
-- mit, sie wurden gelesen und weggeworfen. Was ein gewonnener Auftrag wert war,
-- stand nirgends — der Preisrahmen ist eine Schätzung aus der Betriebsgröße,
-- kein tatsächlicher Umsatz.

-- ── Was ein Lauf gekostet hat ────────────────────────────────────────
do $$ begin
  create type verbrauch_phase as enum (
    'scan_stufe1',      -- Vorauswahl: kostenlos, nur Zeit
    'scan_stufe2',      -- Design-Urteil über die Screenshots
    'entwurf',          -- Nachbau einer Seite
    'mail'              -- Pitch-Text
  );
exception when duplicate_object then null; end $$;

create table if not exists verbrauch (
  id             uuid primary key default gen_random_uuid(),
  unternehmen_id uuid references unternehmen(id) on delete set null,
  phase          verbrauch_phase not null,
  modell         text,
  tokens_ein     integer not null default 0,
  tokens_aus     integer not null default 0,
  -- Kosten in Cent, zum Zeitpunkt des Laufs gerechnet. Preise ändern sich;
  -- ein später nachgerechneter Betrag wäre eine andere Zahl als die bezahlte.
  cent           numeric(10,3) not null default 0,
  sekunden       numeric(8,1),
  am             timestamptz not null default now()
);

create index if not exists idx_verbrauch_am    on verbrauch (am desc);
create index if not exists idx_verbrauch_phase on verbrauch (phase, am desc);
alter table verbrauch enable row level security;

-- ── Was ein Auftrag wert ist ─────────────────────────────────────────
-- preis_von/preis_bis sind geschätzt. Das hier ist der Betrag, den Noah
-- ansetzt oder tatsächlich abgerechnet hat.
alter table unternehmen add column if not exists auftragswert integer;
comment on column unternehmen.auftragswert is 'Von Hand gesetzter Angebots- oder Auftragswert in Euro — überschreibt die Schätzung aus preis_von/preis_bis';

-- Wann der Entwurf fertig wurde, für den Verlauf in der Übersicht
alter table unternehmen add column if not exists entwurf_am timestamptz;

-- ── Übersicht in einer Abfrage ───────────────────────────────────────
create or replace view uebersicht_verbrauch as
select
  phase,
  count(*)                                  as laeufe,
  sum(tokens_ein)                           as tokens_ein,
  sum(tokens_aus)                           as tokens_aus,
  round(sum(cent) / 100, 2)                 as euro,
  round(avg(sekunden), 1)                   as schnitt_sekunden,
  max(am)                                   as zuletzt
from verbrauch
group by phase;

comment on table verbrauch is 'Tokenverbrauch und Kosten je Lauf, für die Übersichtsseite im Dashboard.';

-- ── Arbeitsliste um die neuen Felder erweitern ───────────────────────
-- Das Dashboard holte bisher alle Zeilen samt vollständiger Befundtexte, nur
-- um sie zu zählen: rund 4 MB für eine Übersicht, die Sekunden zum Laden
-- brauchte. Die Ansicht zählt das in der Datenbank.
drop view if exists arbeitsliste;
create view arbeitsliste as
select
  id, name, stadt, branche, website, status,
  quality_score  as qualitaet,
  lead_score     as lead,
  groesse_stufe, groesse_score, standorte,
  preis_von, preis_bis, auftragswert,
  scan_stufe, scan_unvollstaendig, scan_hinweis,
  score_eindruck, score_mobil, score_inhalt, score_vollstaendigkeit,
  score_technik, score_aktualitaet, score_auffindbarkeit, score_rechtliches,
  seiten_geprueft,
  jsonb_array_length(coalesce(befunde, '[]'::jsonb))      as befunde,
  (select count(*) from jsonb_array_elements(coalesce(befunde, '[]'::jsonb)) b
    where b->>'severity' = 'high')                        as schwere_befunde,
  entwurf_url, landingpage_url, entwurf_am,
  jsonb_array_length(coalesce(feedback, '[]'::jsonb))     as feedback_runden,
  groesse_signale, google_rating, google_reviews,
  letzter_scan, letzter_build, mail_gesendet_am, antwort_am, notiz
from unternehmen
order by
  case status
    when 'entwurf_gebaut'   then 1
    when 'geantwortet'      then 2
    when 'freigegeben'      then 3
    when 'gescannt'         then 4
    when 'feedback_gegeben' then 5
    when 'neu'              then 6
    else 9
  end,
  lead_score desc nulls last;
