-- =====================================================================
-- MKTech — tabela pentru comenzile primite de pe site
-- Rulează tot acest fișier în Supabase: SQL Editor → New query → Run.
-- =====================================================================

create table if not exists public.comenzi (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nr_comanda text unique,
  client_nume text,
  client_email text,
  client_telefon text,
  client_adresa text,
  observatii text,
  produse jsonb,
  subtotal numeric,
  transport numeric,
  total numeric,
  status text default 'noua'
);

-- Activăm Row Level Security: fără politici, nimeni nu poate face nimic.
alter table public.comenzi enable row level security;

-- Singura politică: vizitatorii site-ului (rolul „anon”) pot DOAR să adauge comenzi.
-- Nu pot citi, modifica sau șterge nimic — deci nimeni nu poate vedea comenzile altora.
drop policy if exists "site poate adauga comenzi" on public.comenzi;
create policy "site poate adauga comenzi"
  on public.comenzi
  for insert
  to anon
  with check (true);

-- Tu vezi comenzile din Supabase → Table Editor → comenzi
-- (acolo ești autentificat ca proprietar, deci RLS nu te blochează).
