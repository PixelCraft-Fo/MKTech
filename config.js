/* =====================================================================
   MKTech — config.js
   AICI pui cheile pentru formularul de comandă (Supabase + EmailJS).
   Instrucțiuni pas cu pas: vezi răspunsul din chat / README.

   ⚠️ Folosește DOAR cheia „anon (public)” de la Supabase.
      Cheia „service_role” NU se pune niciodată într-un site public.

   Supabase și EmailJS se configurează separat:
   - fără datele Supabase, formularul afișează „Formularul de comandă nu este încă
     configurat.” și butonul e dezactivat;
   - cu Supabase completat, dar fără EmailJS, comenzile SE SALVEAZĂ normal în baza
     de date, doar că nu se trimite emailul de confirmare (fără erori în consolă).
   ===================================================================== */
const MKTECH_CONFIG = {
  SUPABASE_URL: 'https://mowhhrenqybszivuonkd.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vd2hocmVucXlic3ppdnVvbmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDYyMjMsImV4cCI6MjEwNzEyMjIyM30.uPHra0bRph8CFpKC6DObfFrwiMUrhDygxMBz5_Vxqgg',
  EMAILJS_PUBLIC_KEY: 'Dttu9Uvx73e2JdACD',
  EMAILJS_SERVICE_ID: 'service_kgti8zf',
  EMAILJS_TEMPLATE_CLIENT: 'template_ey9dykl',
  EMAILJS_TEMPLATE_FIRMA: 'template_9jahm1h',
  EMAIL_FIRMA: 'mktech2026@yahoo.com',
};
