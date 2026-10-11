-- =====================================================================
-- MKTech — coloane noi pentru cupoane în tabela „comenzi”
-- Rulează acest fișier o singură dată în Supabase: SQL Editor → New query → Run.
-- (Poate fi rulat de mai multe ori fără probleme.)
-- =====================================================================

alter table comenzi add column if not exists cupon text;
alter table comenzi add column if not exists reducere numeric default 0;

-- Până rulezi acest fișier, comenzile cu cupon se salvează oricum:
-- site-ul le retrimite fără aceste coloane și scrie cuponul în „observatii”.
