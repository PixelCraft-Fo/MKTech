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

  /* logica de comandă (prețuri, transport, validare, Supabase, EmailJS)
     este în comanda-core.js și e folosită și de coșul din cos.html */
  const core = window.MKComanda;
  const { lei, configurat, emailConfigurat, transportPentru } = core;

  /* ---------- utilitare ---------- */
  const esc = (t) => (typeof escapeHTML === 'function' ? escapeHTML(t) : String(t));

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
    const transport = transportPentru(subtotal);
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

  /* ---------- validare (regulile sunt în comanda-core.js) ---------- */
  function eroare(id, mesaj) {
    const camp = document.getElementById(id).closest('.field');
    camp.classList.toggle('has-error', !!mesaj);
    camp.querySelector('.field__error').textContent = mesaj || '';
    return !mesaj;
  }

  function valideaza() {
    const { produse } = comandaCurenta();
    const erori = core.valideazaClient({
      nume: document.getElementById('order-nume').value,
      email: document.getElementById('order-email').value,
      telefon: document.getElementById('order-telefon').value,
      adresa: document.getElementById('order-adresa').value,
      acord: document.getElementById('order-gdpr').checked,
    });

    const eroareProduse = document.getElementById('order-products-error');
    eroareProduse.textContent = produse.length ? '' : 'Alege cel puțin un produs.';

    let ok = produse.length > 0;
    ok = eroare('order-nume', erori.nume) && ok;
    ok = eroare('order-email', erori.email) && ok;
    ok = eroare('order-telefon', erori.telefon) && ok;
    ok = eroare('order-adresa', erori.adresa) && ok;
    ok = eroare('order-gdpr', erori.acord) && ok;
    return ok;
  }

  /* ---------- trimitere (Supabase + EmailJS sunt în comanda-core.js) ---------- */
  function arataSucces(nr, emailTrimis, avertisment) {
    root.innerHTML = `
      <div class="order-form order-form--done">
        <span class="order-form__decor" aria-hidden="true"></span>
        <span class="order-done__icon">${typeof icon === 'function' ? icon('check') : '✓'}</span>
        <h2 class="order-form__title">Comanda ${esc(nr)} a fost înregistrată.</h2>
        <p class="order-done__text">${emailTrimis ? 'Ți-am trimis confirmarea pe email.' : 'Comanda a ajuns la noi.'}</p>
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

    if (!valideaza()) {
      status.textContent = 'Verifică datele completate mai sus.';
      status.classList.add('is-error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    const rezultat = await core.plaseazaComanda({
      produse: comandaCurenta().produse,
      client: {
        nume: document.getElementById('order-nume').value,
        email: document.getElementById('order-email').value,
        telefon: document.getElementById('order-telefon').value,
        adresa: document.getElementById('order-adresa').value,
        observatii: obs.value.trim(),
      },
    });

    if (rezultat.status === 'prea-devreme') {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      status.textContent = 'Ai trimis deja o comandă. Mai așteaptă 30 de secunde înainte de următoarea.';
      status.classList.add('is-error');
      return;
    }

    if (rezultat.status !== 'ok') {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      status.textContent = 'Comanda nu a putut fi trimisă. Verifică conexiunea la internet și încearcă din nou.';
      status.classList.add('is-error');
      return;
    }

    arataSucces(
      rezultat.nr_comanda,
      rezultat.emailTrimis,
      rezultat.emailTrimis ? '' : 'Emailul de confirmare nu a putut fi trimis.'
    );
  });
})();
