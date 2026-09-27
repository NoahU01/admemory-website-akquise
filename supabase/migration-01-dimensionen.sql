-- =====================================================================
--  Migration 01 — Die acht Bewertungsdimensionen als eigene Spalten
--
--  Vorher steckten sie in scan_details (jsonb) und waren im Table Editor
--  praktisch unsichtbar. Als echte Spalten lassen sie sich sortieren,
--  filtern und auf einen Blick vergleichen.
--
--  Einspielen: SQL Editor > New query > einfügen > Run. Wiederholbar.
-- =====================================================================

alter table unternehmen
  add column if not exists score_eindruck        smallint,   -- Design, Gewicht 22
  add column if not exists score_mobil           smallint,   -- Gewicht 20
  add column if not exists score_inhalt          smallint,   -- Gewicht 16
  add column if not exists score_vollstaendigkeit smallint,  -- Gewicht 12
  add column if not exists score_technik         smallint,   -- Gewicht 12
  add column if not exists score_aktualitaet     smallint,   -- Gewicht 9
  add column if not exists score_auffindbarkeit  smallint,   -- Gewicht 6
  add column if not exists score_rechtliches     smallint,   -- Gewicht 3
  add column if not exists seiten_geprueft       smallint,
  -- Wenn eine schwer gewichtete Kategorie ausfällt (etwa weil kein Guthaben
  -- da ist), ist der Gesamtscore nicht belastbar. Das muss sichtbar sein.
  add column if not exists scan_unvollstaendig   boolean default false,
  add column if not exists scan_hinweis          text;

-- Bestehende Zeilen aus dem JSON nachfüllen
update unternehmen set
  score_eindruck         = coalesce(score_eindruck,         (scan_details->'kategorien'->'impression'->>'score')::smallint),
  score_mobil            = coalesce(score_mobil,            (scan_details->'kategorien'->'mobile'->>'score')::smallint),
  score_inhalt           = coalesce(score_inhalt,           (scan_details->'kategorien'->'content'->>'score')::smallint),
  score_vollstaendigkeit = coalesce(score_vollstaendigkeit, (scan_details->'kategorien'->'completeness'->>'score')::smallint),
  score_technik          = coalesce(score_technik,          (scan_details->'kategorien'->'tech'->>'score')::smallint),
  score_aktualitaet      = coalesce(score_aktualitaet,      (scan_details->'kategorien'->'freshness'->>'score')::smallint),
  score_auffindbarkeit   = coalesce(score_auffindbarkeit,   (scan_details->'kategorien'->'seo'->>'score')::smallint),
  score_rechtliches      = coalesce(score_rechtliches,      (scan_details->'kategorien'->'legal'->>'score')::smallint),
  seiten_geprueft        = coalesce(seiten_geprueft,        jsonb_array_length(coalesce(scan_details->'seiten', '[]'::jsonb)))
where scan_details is not null;

-- Arbeitsliste um die Dimensionen erweitern
drop view if exists arbeitsliste;
create view arbeitsliste as
select
  id, name, stadt, branche,
  status,
  quality_score  as qualitaet,
  lead_score     as lead,
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

comment on column unternehmen.scan_unvollstaendig is 'true, wenn eine schwer gewichtete Kategorie ausgefallen ist — der Gesamtscore ist dann nicht belastbar.';
