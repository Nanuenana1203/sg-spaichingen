alter table public.kasse
  alter column benutzer type text using benutzer::text,
  alter column mitglied type text using mitglied::text;
