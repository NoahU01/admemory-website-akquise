-- Betriebsgröße und Preisrahmen.
-- Die Bewertungszahl misst Bekanntheit, nicht Zahlungsfähigkeit: Ein Imbiss mit
-- 1.337 Rezensionen zahlt weniger für eine Website als ein Autohaus mit 80.
-- Diese Spalten kommen aus Signalen der Seite selbst (Rechtsform, Handelsregister,
-- Karriereseite, Standorte) und steuern Reihenfolge und Preisvorschlag.

alter table unternehmen add column if not exists groesse_score   integer;
alter table unternehmen add column if not exists groesse_stufe   text;
alter table unternehmen add column if not exists groesse_signale jsonb;
alter table unternehmen add column if not exists preis_von       integer;
alter table unternehmen add column if not exists preis_bis       integer;
-- Wie oft dieselbe Website bei Google gelistet ist: je Marke oder Filiale ein
-- Eintrag. Fünf Einträge auf einer Domain heißt Händlergruppe, nicht Einzelbetrieb.
alter table unternehmen add column if not exists standorte       integer;

alter table unternehmen drop constraint if exists unternehmen_groesse_stufe_check;
alter table unternehmen add constraint unternehmen_groesse_stufe_check
  check (groesse_stufe is null or groesse_stufe in ('kleinst','klein','etabliert','mittelstand'));

comment on column unternehmen.groesse_score is 'Geschätzte Zahlungsfähigkeit 0–100 aus Impressum und Seitenstruktur';
comment on column unternehmen.preis_von    is 'Vorgeschlagener Preisrahmen für Homepage + 2 Unterseiten, untere Grenze';

create index if not exists unternehmen_groesse_idx on unternehmen (groesse_score desc nulls last);

-- Die Arbeitsliste zeigt Größe und Preisrahmen mit an
drop view if exists arbeitsliste;
create view arbeitsliste as
select
  id, name, stadt, branche,
  status,
  quality_score  as qualitaet,
  lead_score     as lead,
  groesse_stufe, groesse_score, standorte,
  preis_von, preis_bis,
  scan_unvollstaendig,
  score_eindruck, score_mobil, score_inhalt, score_vollstaendigkeit,
  score_technik, score_aktualitaet, score_auffindbarkeit, score_rechtliches,
  seiten_geprueft,
  jsonb_array_length(coalesce(befunde, '[]'::jsonb))      as befunde,
  (select count(*) from jsonb_array_elements(coalesce(befunde, '[]'::jsonb)) b
    where b->>'severity' = 'high')                        as schwere_befunde,
  website, entwurf_url, landingpage_url,
  jsonb_array_length(coalesce(feedback, '[]'::jsonb))     as feedback_runden,
  case when jsonb_array_length(coalesce(feedback, '[]'::jsonb)) > 0
       then feedback -> (jsonb_array_length(feedback) - 1) ->> 'text'
       end                                                as letztes_feedback,
  groesse_signale,
  google_rating, google_reviews,
  letzter_scan, letzter_build, mail_gesendet_am, antwort_am,
  scan_hinweis, notiz
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
