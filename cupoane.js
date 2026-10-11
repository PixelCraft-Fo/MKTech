/* =====================================================================
   MKTech — cupoane.js
   SURSA UNICĂ a cupoanelor. De aici citesc:
     - jocurile de pe joc.html (ce premiu se câștigă),
     - coșul (cos.html) și formularul de comandă (contact.html),
     - comanda-core.js (totalul trimis în Supabase și în emailuri).
   Nicăieri altundeva nu sunt scrise coduri de cupon.

   Se încarcă după config.js și înainte de comanda-core.js.
   Totul este expus pe window.MKCupoane.

   Cupoanele nu expiră. Se aplică un singur cupon pe comandă.
   ===================================================================== */
'use strict';

// Tipuri de premii. weight = șansa (din 100) la fiecare încercare.
const CUPON_TIPURI = {
  P5:   { eticheta: '−5%',               tip: 'procent',   valoare: 5,   minim: 0,   weight: 13 },
  LIVR: { eticheta: 'Transport gratuit', tip: 'transport', valoare: 0,   minim: 0,   weight: 9 },
  P10:  { eticheta: '−10%',              tip: 'procent',   valoare: 10,  minim: 200, weight: 6 },
  L25:  { eticheta: '−25 lei',           tip: 'fix',       valoare: 25,  minim: 150, weight: 3 },
  L50:  { eticheta: '−50 lei',           tip: 'fix',       valoare: 50,  minim: 300, weight: 4 },
  P15:  { eticheta: '−15%',              tip: 'procent',   valoare: 15,  minim: 500, weight: 3 },
  L100: { eticheta: '−100 lei',          tip: 'fix',       valoare: 100, minim: 700, weight: 2 },
};
const SANSA_NECASTIGATOR = 60; // restul până la 100

const CUPOANE = {
  P5:   ['MK5-HWGQ', 'MK5-496R', 'MK5-AFHU', 'MK5-G6A9', 'MK5-WP3S', 'MK5-YY2E', 'MK5-XFUU', 'MK5-7KVB'],
  LIVR: ['LIVR-ZZ75', 'LIVR-F39H', 'LIVR-593S', 'LIVR-48BQ', 'LIVR-JDG5', 'LIVR-8K8Q'],
  P10:  ['MK10-H78S', 'MK10-3V83', 'MK10-5NUT', 'MK10-ACK7', 'MK10-9ZNS', 'MK10-9795'],
  L25:  ['MK25L-CUW7', 'MK25L-G6S6', 'MK25L-M58E', 'MK25L-T9ZG'],
  P15:  ['MK15-N4K6', 'MK15-AFA6'],
  L50:  ['MK50L-FNRH', 'MK50L-CTYK', 'MK50L-AW9J'],
  L100: ['MK100L-Q8JU'],
};

(function () {
  const CHEIE_ACTIV = 'mktech_cupon_activ';
  const CHEIE_CASTIGATE = 'mktech_cupoane_castigate';

  const lei = (valoare) =>
    `${Number(valoare).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;
  const rotunjit = (valoare) => Math.round(valoare * 100) / 100;
  const normalizat = (cod) => String(cod || '').toUpperCase().replace(/\s+/g, '');

  /* ---------- tragerea unui premiu (folosită de toate jocurile) ---------- */
  function trage() {
    let tinta = Math.random() * 100;
    for (const tipKey of Object.keys(CUPON_TIPURI)) {
      tinta -= CUPON_TIPURI[tipKey].weight;
      if (tinta < 0) {
        const coduri = CUPOANE[tipKey];
        const cod = coduri[Math.floor(Math.random() * coduri.length)];
        return { castig: true, cod, tipKey, eticheta: CUPON_TIPURI[tipKey].eticheta };
      }
    }
    return { castig: false }; // restul de SANSA_NECASTIGATOR la sută
  }

  /* ---------- căutarea unui cod (fără să conteze literele mari/mici sau spațiile) ---------- */
  function gaseste(cod) {
    const cautat = normalizat(cod);
    if (!cautat) return null;
    for (const tipKey of Object.keys(CUPOANE)) {
      if (CUPOANE[tipKey].includes(cautat)) return { tipKey, cod: cautat, ...CUPON_TIPURI[tipKey] };
    }
    return null;
  }

  /* textul condiției: „la comenzi de minim 200 lei” */
  const conditie = (tip) => (tip.minim > 0 ? `la comenzi de minim ${tip.minim} lei` : 'fără valoare minimă a comenzii');

  /* ---------- calculul reducerii ----------
     subtotal        = valoarea produselor (înainte de cupon)
     transportNormal = transportul calculat de comanda-core.js pe acest subtotal
                       (pragul de 300 lei se aplică la subtotalul dinainte de cupon)
     Întoarce { valid, motiv, reducere, transport, total, eticheta } (+ cod, tip). */
  function calculeaza(cod, subtotal, transportNormal) {
    const faraCupon = {
      valid: false,
      motiv: '',
      reducere: 0,
      transport: transportNormal,
      total: rotunjit(subtotal + transportNormal),
      eticheta: '',
      cod: normalizat(cod),
      tip: '',
    };

    const cupon = gaseste(cod);
    if (!cupon) return { ...faraCupon, motiv: 'Cod invalid.' };

    const rezultat = { ...faraCupon, eticheta: cupon.eticheta, cod: cupon.cod, tip: cupon.tip, minim: cupon.minim };

    if (subtotal < cupon.minim) {
      return {
        ...rezultat,
        motiv: `Cuponul se aplică la comenzi de minim ${cupon.minim} lei. Mai adaugă ${lei(cupon.minim - subtotal)}.`,
      };
    }

    let reducere = 0;
    let transport = transportNormal;
    if (cupon.tip === 'procent') reducere = rotunjit((subtotal * cupon.valoare) / 100);
    if (cupon.tip === 'fix') reducere = Math.min(cupon.valoare, subtotal);
    if (cupon.tip === 'transport') transport = 0;

    return { ...rezultat, valid: true, reducere, transport, total: rotunjit(subtotal - reducere + transport) };
  }

  /* ---------- cuponul activ (ales în joc sau introdus în coș) ---------- */
  const activ = () => {
    try {
      return normalizat(localStorage.getItem(CHEIE_ACTIV));
    } catch (e) {
      return '';
    }
  };
  const seteazaActiv = (cod) => {
    try {
      localStorage.setItem(CHEIE_ACTIV, normalizat(cod));
    } catch (e) {}
  };
  const stergeActiv = () => {
    try {
      localStorage.removeItem(CHEIE_ACTIV);
    } catch (e) {}
  };

  /* ---------- cupoanele câștigate pe acest dispozitiv ---------- */
  const castigate = () => {
    try {
      const lista = JSON.parse(localStorage.getItem(CHEIE_CASTIGATE) || '[]');
      return Array.isArray(lista) ? lista.filter((c) => c && gaseste(c.cod)) : [];
    } catch (e) {
      return [];
    }
  };
  const adaugaCastigat = (cod) => {
    const lista = castigate();
    lista.unshift({ cod: normalizat(cod), data: new Date().toISOString() });
    try {
      localStorage.setItem(CHEIE_CASTIGATE, JSON.stringify(lista));
    } catch (e) {}
  };

  window.MKCupoane = {
    trage,
    gaseste,
    calculeaza,
    conditie,
    lei,
    activ,
    seteazaActiv,
    stergeActiv,
    castigate,
    adaugaCastigat,
  };
})();
