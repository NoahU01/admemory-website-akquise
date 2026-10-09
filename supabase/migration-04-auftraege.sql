-- Aufträge: das Scharnier zwischen Dashboard und Agent.
--
-- Das Dashboard läuft im Netz und kann nichts bauen — Nachbau und Scan brauchen
-- einen Browser und das Dateisystem. Also schreibt die Oberfläche einen Auftrag
-- in diese Tabelle, und der Agent auf dem Mac holt ihn ab, wenn er läuft.
-- Beide warten nie aufeinander: Noah drückt vom Handy 'bauen', der Rechner
-- arbeitet es ab.

do $$ begin
  create type auftrag_art as enum (
    'entwurf_bauen',      -- Erstentwurf: Startseite + 2 Unterseiten
    'entwurf_neu_bauen',  -- nach Feedback noch einmal
    'scan_stufe2',        -- Vollbewertung nachholen oder wiederholen
    'mail_vorbereiten'    -- Pitch-Text und Gmail-Entwurf
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type auftrag_status as enum ('offen', 'laeuft', 'fertig', 'fehler', 'abgebrochen');
exception when duplicate_object then null; end $$;

create table if not exists auftraege (
  id             uuid primary key default gen_random_uuid(),
  unternehmen_id uuid not null references unternehmen(id) on delete cascade,
  art            auftrag_art    not null,
  status         auftrag_status not null default 'offen',

  -- Was Noah dem Agenten mitgibt: Korrekturwünsche, gewünschte Unterseiten,
  -- Tonfall der Mail. Freiform, weil sich das noch verschiebt.
  anweisung      text,
  parameter      jsonb,

  -- Wer den Auftrag ausgelöst hat, und was dabei herauskam
  quelle         text default 'dashboard',
  ergebnis       jsonb,
  fehler         text,
  versuche       smallint not null default 0,

  angelegt_am    timestamptz not null default now(),
  begonnen_am    timestamptz,
  erledigt_am    timestamptz
);

-- Der Agent fragt immer nach dem ältesten offenen Auftrag
create index if not exists idx_auftraege_offen
  on auftraege (status, angelegt_am) where status = 'offen';
create index if not exists idx_auftraege_unternehmen
  on auftraege (unternehmen_id, angelegt_am desc);

/* Ein Betrieb braucht nicht zweimal denselben offenen Auftrag. Ohne das legt
   ein zweiter Klick auf 'bauen' einen zweiten an, und der Agent baut doppelt. */
create unique index if not exists idx_auftraege_keine_doppelten
  on auftraege (unternehmen_id, art) where status in ('offen', 'laeuft');

alter table auftraege enable row level security;
-- Keine Policies: nur der service_role-Key kommt heran, und der liegt
-- ausschließlich serverseitig. Das Dashboard im Browser sieht die Tabelle nie
-- direkt, sondern immer über eine eigene API-Funktion.

-- Arbeitsvorrat auf einen Blick, für Dashboard und Agent
create or replace view auftragsliste as
select
  a.id, a.art, a.status, a.anweisung, a.parameter, a.ergebnis, a.fehler, a.versuche,
  a.angelegt_am, a.begonnen_am, a.erledigt_am,
  u.id as unternehmen_id, u.name, u.website, u.branche, u.stadt,
  u.status as betrieb_status, u.quality_score, u.lead_score,
  u.groesse_stufe, u.preis_von, u.preis_bis, u.entwurf_url
from auftraege a
join unternehmen u on u.id = a.unternehmen_id
order by
  case a.status when 'offen' then 1 when 'laeuft' then 2 when 'fehler' then 3 else 4 end,
  a.angelegt_am;

comment on table auftraege is 'Kommandos aus dem Dashboard, die der lokale Agent abarbeitet.';
