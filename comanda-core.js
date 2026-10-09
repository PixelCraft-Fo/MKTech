/* =====================================================================
   MKTech — comanda-core.js
   Logica folosită ÎN COMUN de:
     - formularul de comandă de pe contact.html (comanda.js)
     - finalizarea comenzii din coș (cos.html)
   Aici stau: numărul de comandă, formatarea prețurilor, transportul,
   validarea datelor clientului, salvarea în Supabase, trimiterea celor
   2 emailuri prin EmailJS și pauza de 30 de secunde între comenzi.

   Se încarcă DUPĂ config.js. Totul este expus pe window.MKComanda.
   ===================================================================== */
'use strict';

(function () {
  const TRANSPORT = 15; // lei
  const TRANSPORT_GRATUIT_PESTE = 300; // lei
  const PAUZA_INTRE_COMENZI = 30000; // 30 de secunde
  const CHEIE_ULTIMA_COMANDA = 'mktech_ultima_comanda';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TELEFON_RO = /^(?:\+?4)?0(?:[237]\d{8}|[89]\d{8})$/;

  /* ---------- bani ---------- */
  const lei = (valoare) =>
    `${Number(valoare).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;

  const transportPentru = (subtotal) => (subtotal === 0 || subtotal > TRANSPORT_GRATUIT_PESTE ? 0 : TRANSPORT);

  /* ---------- configurare (config.js) ---------- */
  const areCheile = (chei) =>
    typeof MKTECH_CONFIG === 'object' &&
    chei.every((cheie) => MKTECH_CONFIG[cheie] && !String(MKTECH_CONFIG[cheie]).startsWith('PUNE_AICI'));

  const configurat = () => areCheile(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
  const emailConfigurat = () =>
    areCheile(['EMAILJS_PUBLIC_KEY', 'EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_CLIENT', 'EMAILJS_TEMPLATE_FIRMA']);

  /* ---------- numărul comenzii: MK-AAAALLZZ-XXXX ---------- */
  function numarComanda() {
    const d = new Date();
    const zi = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const litere = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let cod = '';
    for (let i = 0; i < 4; i++) cod += litere[Math.floor(Math.random() * litere.length)];
    return `MK-${zi}-${cod}`;
  }

  /* ---------- pauza între comenzi (anti-spam) ---------- */
  const preaDevreme = () => Date.now() - Number(localStorage.getItem(CHEIE_ULTIMA_COMANDA) || 0) < PAUZA_INTRE_COMENZI;
  const marcheazaComandaTrimisa = () => localStorage.setItem(CHEIE_ULTIMA_COMANDA, String(Date.now()));

  /* ---------- validarea datelor clientului ----------
     Primește valorile și întoarce un obiect cu mesajele de eroare
     (gol = totul e în regulă). Fiecare pagină le afișează cum vrea. */
  function valideazaClient({ nume, email, telefon, adresa, acord }) {
    const erori = {};
    if (!nume || nume.trim().length < 2) erori.nume = 'Completează numele sau denumirea firmei.';
    if (!email || !email.trim()) erori.email = 'Completează adresa de email.';
    else if (!EMAIL_RE.test(email.trim())) erori.email = 'Adresa de email nu este validă.';

    const tel = (telefon || '').replace(/[\s.()-]/g, '');
    if (!tel) erori.telefon = 'Completează numărul de telefon.';
    else if (!TELEFON_RO.test(tel)) erori.telefon = 'Numărul de telefon nu este valid (ex. 0712 345 678).';

    if (!adresa || adresa.trim().length < 5) erori.adresa = 'Completează adresa de livrare.';
    if (!acord) erori.acord = 'Bifează acordul pentru prelucrarea datelor.';
    return erori;
  }

  /* ---------- produsele, ca text pentru email ---------- */
  const produseText = (produse) =>
    produse
      .map((r, i) => `${i + 1}. ${r.denumire} (${r.cod}) — ${r.cantitate} ${r.um} x ${lei(r.pret)} = ${lei(r.valoare)}`)
      .join('\n');

  /* ---------- Supabase ---------- */
  async function salveazaInSupabase(comanda) {
    const client = window.supabase.createClient(MKTECH_CONFIG.SUPABASE_URL, MKTECH_CONFIG.SUPABASE_ANON_KEY);
    const { error } = await client.from('comenzi').insert({
      nr_comanda: comanda.nr_comanda,
      client_nume: comanda.client_nume,
      client_email: comanda.client_email,
      client_telefon: comanda.client_telefon,
      client_adresa: comanda.client_adresa,
      observatii: comanda.observatii,
      produse: comanda.produse,
      subtotal: comanda.subtotal,
      transport: comanda.transport,
      total: comanda.total,
    });
    if (error) throw error;
  }

  /* ---------- EmailJS: email către client + email către firmă ---------- */
  async function trimiteEmailuri(comanda) {
    const parametri = {
      nr_comanda: comanda.nr_comanda,
      data_comanda: new Date().toLocaleString('ro-RO'),
      client_nume: comanda.client_nume,
      client_email: comanda.client_email,
      client_telefon: comanda.client_telefon,
      client_adresa: comanda.client_adresa,
      observatii: comanda.observatii || '-',
      produse_text: produseText(comanda.produse),
      subtotal: lei(comanda.subtotal),
      transport: comanda.transport === 0 ? 'Gratuit' : lei(comanda.transport),
      total: lei(comanda.total),
      email_firma: MKTECH_CONFIG.EMAIL_FIRMA,
    };

    window.emailjs.init({ publicKey: MKTECH_CONFIG.EMAILJS_PUBLIC_KEY });
    await window.emailjs.send(MKTECH_CONFIG.EMAILJS_SERVICE_ID, MKTECH_CONFIG.EMAILJS_TEMPLATE_CLIENT, parametri);
    await window.emailjs.send(MKTECH_CONFIG.EMAILJS_SERVICE_ID, MKTECH_CONFIG.EMAILJS_TEMPLATE_FIRMA, parametri);
  }

  /* ---------- trimiterea completă a unei comenzi ----------
     produse: [{ id, cod, denumire, um, cantitate, pret, valoare }]
     client:  { nume, email, telefon, adresa, observatii }
     Întoarce: { status, nr_comanda, emailTrimis }
       status = 'ok' | 'neconfigurat' | 'prea-devreme' | 'eroare-salvare'  */
  async function plaseazaComanda({ produse, client, sursa }) {
    if (!configurat()) return { status: 'neconfigurat' };
    if (preaDevreme()) return { status: 'prea-devreme' };

    const subtotal = produse.reduce((s, r) => s + r.valoare, 0);
    const transport = transportPentru(subtotal);
    const observatii = [client.observatii, sursa].filter(Boolean).join(' ').trim();

    const comanda = {
      nr_comanda: numarComanda(),
      client_nume: client.nume.trim(),
      client_email: client.email.trim(),
      client_telefon: client.telefon.trim(),
      client_adresa: client.adresa.trim(),
      observatii,
      produse,
      subtotal,
      transport,
      total: subtotal + transport,
    };

    try {
      await salveazaInSupabase(comanda);
    } catch (err) {
      return { status: 'eroare-salvare' };
    }

    marcheazaComandaTrimisa();

    if (!emailConfigurat()) return { status: 'ok', nr_comanda: comanda.nr_comanda, emailTrimis: false };

    try {
      await trimiteEmailuri(comanda);
      return { status: 'ok', nr_comanda: comanda.nr_comanda, emailTrimis: true };
    } catch (err) {
      return { status: 'ok', nr_comanda: comanda.nr_comanda, emailTrimis: false };
    }
  }

  window.MKComanda = {
    TRANSPORT,
    TRANSPORT_GRATUIT_PESTE,
    lei,
    transportPentru,
    configurat,
    emailConfigurat,
    numarComanda,
    preaDevreme,
    valideazaClient,
    produseText,
    salveazaInSupabase,
    trimiteEmailuri,
    plaseazaComanda,
  };
})();
