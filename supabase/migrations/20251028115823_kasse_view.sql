create or replace view public.kasse_view as
select
  id,
  datum,
  uhrzeit,
  mitglied_id,
  mitglied_nummer,
  mitglied_name,
  artikel_id,
  artikel_nummer,
  artikel_bezeichnung,
  menge,
  einzelpreis,
  gesamtpreis,
  benutzer_id,
  benutzer_name
from public.kasse;
