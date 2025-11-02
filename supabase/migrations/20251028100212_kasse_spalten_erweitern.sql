-- Bestehende Spalten umbenennen
alter table public.kasse rename column benutzer to benutzer_id;
alter table public.kasse rename column mitglied to mitglied_id;

-- Neue Textspalten hinzufügen
alter table public.kasse
  add column benutzer text,
  add column mitglied text;
