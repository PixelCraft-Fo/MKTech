/* =====================================================================
   MKTech — comanda-core.js
   Logica folosită ÎN COMUN de:
     - formularul de comandă de pe contact.html (comanda.js)
     - finalizarea comenzii din coș (cos.html)
   Aici stau: numărul de comandă, formatarea prețurilor, transportul,
   validarea datelor clientului, salvarea în Supabase, trimiterea celor
   2 emailuri prin EmailJS și pauza de 30 de secunde între comenzi.

   Se încarcă DUPĂ config.js și cupoane.js. Totul este expus pe window.MKComanda.
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

  /* ---------- totalurile comenzii — calculate ÎNTR-UN SINGUR LOC ----------
     Aceeași funcție e folosită pentru afișare (coș + formular), pentru
     Supabase și pentru emailuri, deci suma nu poate diferi între ele.
     Cuponul se calculează cu MKCupoane.calculeaza() din cupoane.js.
     Întoarce: { subtotal, reducere, transport, total, cupon, cuponValid, motiv, eticheta, tip } */
  function calculeazaTotaluri(subtotal, codCupon) {
    const transportNormal = transportPentru(subtotal);
    const faraCupon = {
      subtotal,
      reducere: 0,
      transport: transportNormal,
      total: subtotal + transportNormal,
      cupon: '',
      cuponValid: false,
      motiv: '',
      eticheta: '',
      tip: '',
    };
    const cod = String(codCupon || '').trim();
    if (!cod || !window.MKCupoane) return faraCupon;

    const r = window.MKCupoane.calculeaza(cod, subtotal, transportNormal);
    return {
      subtotal,
      reducere: r.reducere,
      transport: r.transport,
      total: r.total,
      cupon: r.cod,
      cuponValid: r.valid,
      motiv: r.motiv,
      eticheta: r.eticheta,
      tip: r.tip,
    };
  }

  /* cum apare reducerea în email și în observații: „−45,90 lei”, „Transport gratuit” sau „-” */
  function reducereText(totaluri) {
    if (!totaluri.cuponValid) return '-';
    return totaluri.tip === 'transport' ? 'Transport gratuit' : `−${lei(totaluri.reducere)}`;
  }

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

  /* ---------- Supabase ----------
     Dacă s-a aplicat un cupon, se salvează și coloanele `cupon` și `reducere`
     (vezi supabase-cupoane.sql). Dacă SQL-ul nu a fost încă rulat și coloanele
     lipsesc, comanda NU se pierde: se retrimite fără ele, iar cuponul este
     trecut în observații. */
  async function salveazaInSupabase(comanda) {
    const client = window.supabase.createClient(MKTECH_CONFIG.SUPABASE_URL, MKTECH_CONFIG.SUPABASE_ANON_KEY);
    const rand = {
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
    };

    if (!comanda.cupon) {
      const { error } = await client.from('comenzi').insert(rand);
      if (error) throw error;
      return;
    }

    const { error } = await client.from('comenzi').insert({ ...rand, cupon: comanda.cupon, reducere: comanda.reducere });
    if (!error) return;

    // coloanele noi lipsesc din tabelă → retrimitem fără ele, cu cuponul în observații
    if (/cupon|reducere/i.test(`${error.message || ''} ${error.details || ''} ${error.hint || ''}`)) {
      const nota = `Cupon: ${comanda.cupon} (${comanda.reducere_text})`;
      const reincercare = await client
        .from('comenzi')
        .insert({ ...rand, observatii: [comanda.observatii, nota].filter(Boolean).join(' ').trim() });
      if (reincercare.error) throw reincercare.error;
      return;
    }
    throw error;
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
      cupon: comanda.cupon || '-',
      reducere: comanda.reducere_text || '-',
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
  async function plaseazaComanda({ produse, client, sursa, cupon }) {
    if (!configurat()) return { status: 'neconfigurat' };
    if (preaDevreme()) return { status: 'prea-devreme' };

    const subtotal = produse.reduce((s, r) => s + r.valoare, 0);
    const totaluri = calculeazaTotaluri(subtotal, cupon); // singurul loc unde se calculează suma
    const observatii = [client.observatii, sursa].filter(Boolean).join(' ').trim();

    const comanda = {
      nr_comanda: numarComanda(),
      client_nume: client.nume.trim(),
      client_email: client.email.trim(),
      client_telefon: client.telefon.trim(),
      client_adresa: client.adresa.trim(),
      observatii,
      produse,
      subtotal: totaluri.subtotal,
      cupon: totaluri.cuponValid ? totaluri.cupon : '',
      reducere: totaluri.reducere,
      reducere_text: reducereText(totaluri),
      transport: totaluri.transport,
      total: totaluri.total,
    };

    try {
      await salveazaInSupabase(comanda);
    } catch (err) {
      return { status: 'eroare-salvare' };
    }

    marcheazaComandaTrimisa();
    if (window.MKCupoane) window.MKCupoane.stergeActiv(); // cuponul a fost folosit

    const reusit = { status: 'ok', nr_comanda: comanda.nr_comanda, total: comanda.total, cupon: comanda.cupon };
    if (!emailConfigurat()) return { ...reusit, emailTrimis: false };

    try {
      await trimiteEmailuri(comanda);
      return { ...reusit, emailTrimis: true };
    } catch (err) {
      return { ...reusit, emailTrimis: false };
    }
  }

  window.MKComanda = {
    TRANSPORT,
    TRANSPORT_GRATUIT_PESTE,
    lei,
    transportPentru,
    calculeazaTotaluri,
    reducereText,
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
