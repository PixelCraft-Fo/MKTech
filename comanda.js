/* =====================================================================
   MKTech — comanda.js
   Formularul de comandă de pe contact.html.
   - produsele vin din catalogul PRODUCTS (script.js), deci nu sunt scrise de două ori;
   - comanda se salvează în Supabase (tabela „comenzi”);
   - se trimit 2 emailuri prin EmailJS: unul clientului, unul firmei.
   Cheile se pun în config.js (nu aici).
   ===================================================================== */
'use strict';

(function () {
  const root = document.getElementById('order-form-root');
  if (!root) return;

  const RANDURI_INITIALE = 5;
  const RANDURI_MAX = 15;
  const CANTITATE_MAX = 99;
  const TRANSPORT = 15; // lei
  const TRANSPORT_GRATUIT_PESTE = 300; // lei
  const PAUZA_INTRE_COMENZI = 30000; // 30 de secunde
  const CHEIE_ULTIMA_COMANDA = 'mktech_ultima_comanda';

  /* ---------- utilitare ---------- */
  const esc = (t) => (typeof escapeHTML === 'function' ? escapeHTML(t) : String(t));
  const lei = (valoare) =>
    `${Number(valoare).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;

  /* Supabase și EmailJS se verifică separat: comanda se poate salva în baza de date
     chiar dacă emailurile nu sunt încă configurate. */
  const areCheile = (chei) =>
    typeof MKTECH_CONFIG === 'object' &&
    chei.every((cheie) => MKTECH_CONFIG[cheie] && !String(MKTECH_CONFIG[cheie]).startsWith('PUNE_AICI'));

  const configurat = () => areCheile(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
  const emailConfigurat = () =>
    areCheile(['EMAILJS_PUBLIC_KEY', 'EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_CLIENT', 'EMAILJS_TEMPLATE_FIRMA']);

  const numarComanda = () => {
    const d = new Date();
    const zi = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const litere = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let cod = '';
    for (let i = 0; i < 4; i++) cod += litere[Math.floor(Math.random() * litere.length)];
    return `MK-${zi}-${cod}`;
  };

  /* lista de produse pentru <select>, grupată pe categorii */
  const optiuniProduse = () =>
    CATEGORIES.map(
      (c) => `<optgroup label="${esc(categoryName(c))}">
        ${PRODUCTS.filter((p) => p.category === c.id)
          .map((p) => `<option value="${p.id}">${esc(productName(p))}</option>`)
          .join('')}
      </optgroup>`
    ).join('');

  const randMarkup = (nr) => `
    <tr class="order-row">
      <td class="order-table__nr" data-cell="nr">${nr}</td>
      <td class="order-table__name">
        <select class="order-select" aria-label="Denumire produs">
          <option value="">— alege produsul —</option>
          ${optiuniProduse()}
        </select>
      </td>
      <td data-cell="cod">—</td>
      <td data-cell="um">—</td>
      <td><input class="order-qty" type="number" min="1" max="${CANTITATE_MAX}" value="1" aria-label="Cantitate"></td>
      <td data-cell="pret">—</td>
      <td class="order-table__tools">
        <button class="order-del" type="button" aria-label="Șterge rândul" hidden>×</button>
      </td>
    </tr>`;

  const campText = (id, eticheta, tip = 'text', optional = false, extra = '') => `
    <div class="field order-field">
      <label class="field__label" for="${id}">${eticheta}${optional ? '' : ' *'}</label>
      <input class="input" id="${id}" type="${tip}" ${optional ? '' : 'required'} ${extra}>
      <p class="field__error" aria-live="polite"></p>
    </div>`;

  /* ---------- formularul ---------- */
  root.innerHTML = `
    <form class="order-form" id="order-form" novalidate>
      <span class="order-form__decor" aria-hidden="true"></span>
      <h2 class="order-form__title">Formular de comandă</h2>

      ${
        !configurat()
          ? `<p class="order-form__notice" data-order-notice>Formularul de comandă nu este încă configurat.
              Comenzile vor putea fi trimise după completarea datelor din config.js.</p>`
          : !emailConfigurat()
          ? `<p class="order-form__notice" data-order-notice>Comanda se înregistrează normal, dar emailul de confirmare
              nu este încă activ (se configurează EmailJS în config.js).</p>`
          : ''
      }

      <div class="order-table-wrap">
        <table class="order-table">
          <thead>
            <tr>
              <th scope="col">Nr crt</th>
              <th scope="col">Denumire produs</th>
              <th scope="col">Cod produs</th>
              <th scope="col">U.M.</th>
              <th scope="col">Cantitate</th>
              <th scope="col">Preț produs</th>
              <th scope="col"><span class="visually-hidden">Șterge</span></th>
            </tr>
          </thead>
          <tbody id="order-rows"></tbody>
        </table>
      </div>

      <div class="order-form__row">
        <button class="order-add" type="button" id="order-add">+ Adaugă produs</button>
        <p class="field__error order-error" id="order-products-error" aria-live="polite"></p>
      </div>

      <dl class="order-totals">
        <div><dt>Subtotal</dt><dd data-total="subtotal">0,00 lei</dd></div>
        <div><dt>Transport</dt><dd data-total="transport">0,00 lei</dd></div>
        <div class="order-totals__total"><dt>Total</dt><dd data-total="total">0,00 lei</dd></div>
      </dl>
      <p class="order-form__small">Transport 15 lei, gratuit pentru comenzi peste 300 lei.</p>

      <div class="order-client">
        ${campText('order-nume', 'Nume și prenume / Denumire firmă')}
        ${campText('order-email', 'Email', 'email')}
        ${campText('order-telefon', 'Telefon', 'tel')}
        ${campText('order-adresa', 'Adresă de livrare')}
        <div class="field order-field order-field--wide">
          <label class="field__label" for="order-obs">Observații (opțional)</label>
          <textarea class="input" id="order-obs" maxlength="500" rows="3"></textarea>
          <p class="field__hint"><span id="order-obs-count">0 / 500</span></p>
        </div>
      </div>

      <div class="field order-check">
        <label class="order-check__label">
          <input type="checkbox" id="order-gdpr">
          <span>Sunt de acord cu prelucrarea datelor pentru procesarea comenzii.</span>
        </label>
        <p class="field__error" aria-live="polite"></p>
      </div>

      <!-- câmp anti-spam: oamenii nu îl văd, roboții îl completează -->
      <input class="honeypot" type="text" id="order-website" tabindex="-1" autocomplete="off" aria-hidden="true">

      <p class="order-form__small">Termen de livrare: 2–5 zile lucrătoare. Plata: ramburs la livrare sau ordin de plată.</p>

      <button class="btn btn--lg btn--block order-submit" type="submit" id="order-submit" ${configurat() ? '' : 'disabled'}>
        <span class="order-submit__label">Trimite comanda</span>
      </button>

      <p class="order-form__status" id="order-status" role="status"></p>
    </form>`;

  const form = document.getElementById('order-form');
  const tbody = document.getElementById('order-rows');
  const status = document.getElementById('order-status');
  const submitBtn = document.getElementById('order-submit');

  /* ---------- rânduri ---------- */
  const randuri = () => [...tbody.querySelectorAll('.order-row')];

  function renumeroteaza() {
    randuri().forEach((tr, i) => {
      tr.querySelector('[data-cell="nr"]').textContent = i + 1;
      const sters = tr.querySelector('.order-del');
      sters.hidden = randuri().length <= 1;
    });
    document.getElementById('order-add').disabled = randuri().length >= RANDURI_MAX;
  }

  function adaugaRand() {
    if (randuri().length >= RANDURI_MAX) return;
    tbody.insertAdjacentHTML('beforeend', randMarkup(randuri().length + 1));
    renumeroteaza();
  }

  function produsulDinRand(tr) {
    const id = tr.querySelector('.order-select').value;
    return id ? PRODUCTS.find((p) => p.id === id) : null;
  }

  function actualizeazaRand(tr) {
    const p = produsulDinRand(tr);
    const cant = Math.max(1, Math.min(CANTITATE_MAX, parseInt(tr.querySelector('.order-qty').value, 10) || 1));
    tr.querySelector('.order-qty').value = cant;
    tr.querySelector('[data-cell="cod"]').textContent = p ? p.cod : '—';
    tr.querySelector('[data-cell="um"]').textContent = p ? 'buc.' : '—';
    tr.querySelector('[data-cell="pret"]').textContent = p ? lei(p.price) : '—';
  }

  function comandaCurenta() {
    const produse = randuri()
      .map((tr) => {
        const p = produsulDinRand(tr);
        if (!p) return null;
        const cantitate = Math.max(1, Math.min(CANTITATE_MAX, parseInt(tr.querySelector('.order-qty').value, 10) || 1));
        return { id: p.id, cod: p.cod, denumire: productName(p), um: 'buc.', cantitate, pret: p.price, valoare: p.price * cantitate };
      })
      .filter(Boolean);

    const subtotal = produse.reduce((s, r) => s + r.valoare, 0);
    const transport = subtotal === 0 || subtotal > TRANSPORT_GRATUIT_PESTE ? 0 : TRANSPORT;
    return { produse, subtotal, transport, total: subtotal + transport };
  }

  function actualizeazaTotaluri() {
    const { subtotal, transport, total } = comandaCurenta();
    form.querySelector('[data-total="subtotal"]').textContent = lei(subtotal);
    form.querySelector('[data-total="transport"]').textContent = transport === 0 && subtotal > 0 ? 'Gratuit' : lei(transport);
    form.querySelector('[data-total="total"]').textContent = lei(total);
  }

  tbody.addEventListener('change', (e) => {
    const tr = e.target.closest('.order-row');
    if (!tr) return;
    actualizeazaRand(tr);
    actualizeazaTotaluri();
    document.getElementById('order-products-error').textContent = '';
  });
  tbody.addEventListener('input', (e) => {
    if (!e.target.classList.contains('order-qty')) return;
    actualizeazaTotaluri();
  });
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.order-del');
    if (!btn) return;
    if (randuri().length <= 1) return;
    btn.closest('.order-row').remove();
    renumeroteaza();
    actualizeazaTotaluri();
  });
  document.getElementById('order-add').addEventListener('click', adaugaRand);

  for (let i = 0; i < RANDURI_INITIALE; i++) adaugaRand();
  actualizeazaTotaluri();

  const obs = document.getElementById('order-obs');
  const obsCount = document.getElementById('order-obs-count');
  obs.addEventListener('input', () => (obsCount.textContent = `${obs.value.length} / 500`));

  /* ---------- validare ---------- */
  const TELEFON_RO = /^(?:\+?4)?0(?:[237]\d{8}|[89]\d{8})$/;

  function eroare(id, mesaj) {
    const camp = document.getElementById(id).closest('.field');
    camp.classList.toggle('has-error', !!mesaj);
    camp.querySelector('.field__error').textContent = mesaj || '';
    return !mesaj;
  }

  function valideaza() {
    const { produse } = comandaCurenta();
    let ok = true;

    const eroareProduse = document.getElementById('order-products-error');
    eroareProduse.textContent = produse.length ? '' : 'Alege cel puțin un produs.';
    if (!produse.length) ok = false;

    const nume = document.getElementById('order-nume').value.trim();
    ok = eroare('order-nume', nume.length < 2 ? 'Completează numele sau denumirea firmei.' : '') && ok;

    const email = document.getElementById('order-email').value.trim();
    ok = eroare('order-email', !email ? 'Completează adresa de email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Adresa de email nu este validă.' : '') && ok;

    const telefon = document.getElementById('order-telefon').value.replace(/[\s.()-]/g, '');
    ok = eroare('order-telefon', !telefon ? 'Completează numărul de telefon.' : !TELEFON_RO.test(telefon) ? 'Numărul de telefon nu este valid (ex. 0712 345 678).' : '') && ok;

    const adresa = document.getElementById('order-adresa').value.trim();
    ok = eroare('order-adresa', adresa.length < 5 ? 'Completează adresa de livrare.' : '') && ok;

    ok = eroare('order-gdpr', document.getElementById('order-gdpr').checked ? '' : 'Bifează acordul pentru prelucrarea datelor.') && ok;

    return ok;
  }

  /* ---------- trimitere ---------- */
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

  async function trimiteEmailuri(comanda) {
    const produseText = comanda.produse
      .map((r, i) => `${i + 1}. ${r.denumire} (${r.cod}) — ${r.cantitate} ${r.um} x ${lei(r.pret)} = ${lei(r.valoare)}`)
      .join('\n');

    const parametri = {
      nr_comanda: comanda.nr_comanda,
      data_comanda: new Date().toLocaleString('ro-RO'),
      client_nume: comanda.client_nume,
      client_email: comanda.client_email,
      client_telefon: comanda.client_telefon,
      client_adresa: comanda.client_adresa,
      observatii: comanda.observatii || '-',
      produse_text: produseText,
      subtotal: lei(comanda.subtotal),
      transport: comanda.transport === 0 ? 'Gratuit' : lei(comanda.transport),
      total: lei(comanda.total),
      email_firma: MKTECH_CONFIG.EMAIL_FIRMA,
    };

    window.emailjs.init({ publicKey: MKTECH_CONFIG.EMAILJS_PUBLIC_KEY });
    await window.emailjs.send(MKTECH_CONFIG.EMAILJS_SERVICE_ID, MKTECH_CONFIG.EMAILJS_TEMPLATE_CLIENT, parametri);
    await window.emailjs.send(MKTECH_CONFIG.EMAILJS_SERVICE_ID, MKTECH_CONFIG.EMAILJS_TEMPLATE_FIRMA, parametri);
  }

  function arataSucces(nr, avertisment) {
    root.innerHTML = `
      <div class="order-form order-form--done">
        <span class="order-form__decor" aria-hidden="true"></span>
        <span class="order-done__icon">${typeof icon === 'function' ? icon('check') : '✓'}</span>
        <h2 class="order-form__title">Comanda ${esc(nr)} a fost înregistrată.</h2>
        <p class="order-done__text">${emailConfigurat() ? 'Ți-am trimis confirmarea pe email.' : 'Comanda a ajuns la noi.'}</p>
        ${avertisment ? `<p class="order-form__notice">${esc(avertisment)}</p>` : ''}
        <button class="btn btn--lg order-submit" type="button" onclick="window.location.reload()">Comandă nouă</button>
      </div>`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    if (document.getElementById('order-website').value) return; // robot
    if (!configurat()) {
      status.textContent = 'Formularul de comandă nu este încă configurat.';
      status.classList.add('is-error');
      return;
    }

    const ultima = Number(localStorage.getItem(CHEIE_ULTIMA_COMANDA) || 0);
    if (Date.now() - ultima < PAUZA_INTRE_COMENZI) {
      status.textContent = 'Ai trimis deja o comandă. Mai așteaptă 30 de secunde înainte de următoarea.';
      status.classList.add('is-error');
      return;
    }

    if (!valideaza()) {
      status.textContent = 'Verifică datele completate mai sus.';
      status.classList.add('is-error');
      return;
    }

    const date = comandaCurenta();
    const comanda = {
      nr_comanda: numarComanda(),
      client_nume: document.getElementById('order-nume').value.trim(),
      client_email: document.getElementById('order-email').value.trim(),
      client_telefon: document.getElementById('order-telefon').value.trim(),
      client_adresa: document.getElementById('order-adresa').value.trim(),
      observatii: obs.value.trim(),
      ...date,
    };

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      await salveazaInSupabase(comanda);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      status.textContent = 'Comanda nu a putut fi trimisă. Verifică conexiunea la internet și încearcă din nou.';
      status.classList.add('is-error');
      return;
    }

    localStorage.setItem(CHEIE_ULTIMA_COMANDA, String(Date.now()));

    /* dacă EmailJS nu e configurat încă, comanda rămâne salvată și spunem asta clar */
    if (!emailConfigurat()) {
      arataSucces(comanda.nr_comanda, 'Emailul de confirmare nu este încă activ, dar comanda a fost salvată.');
      return;
    }

    try {
      await trimiteEmailuri(comanda);
      arataSucces(comanda.nr_comanda, '');
    } catch (err) {
      arataSucces(comanda.nr_comanda, 'Comanda a fost înregistrată, dar emailul de confirmare nu a putut fi trimis.');
    }
  });
})();
