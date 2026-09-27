-- Migration 02 — Scan-Stufe festhalten
--
-- Stufe 1 ist eine Vorauswahl ohne Design-Urteil und ohne Lighthouse; ihr
-- Gesamtwert ist nicht mit dem einer Vollbewertung vergleichbar. Ohne dieses
-- Feld stünden beide unterschiedslos nebeneinander in der Liste.
--
-- Einspielen: SQL Editor > New query > einfügen > Run. Wiederholbar.

alter table unternehmen
  add column if not exists scan_stufe smallint;

update unternehmen set scan_stufe = 2 where scan_stufe is null and scan_details is not null;

comment on column unternehmen.scan_stufe is '1 = Vorauswahl (nur Regelchecks, Startseite), 2 = Vollbewertung mit Design-Urteil und Lighthouse';
