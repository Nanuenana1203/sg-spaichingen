-- Spalte "benutzer" von integer -> text konvertieren (bestehende Werte mit ::text übernehmen)
alter table public.kasse
  alter column benutzer type text using benutzer::text;
