/* =====================================================================
   MKTech — joc.js
   Pagina „Joacă și câștigă” (joc.html): 3 mini-jocuri.
     1. Roata norocului   2. Răzuiește și câștigă   3. Mingea norocoasă

   IMPORTANT: jocurile NU decid singure cine câștigă. Rezultatul este tras
   întâi cu MKCupoane.trage() (din cupoane.js), iar animația doar îl arată.

   În localStorage:
     mktech_joc_incercari           → câte încercări mai are vizitatorul
     mktech_joc_ultima_reincarcare  → ziua ultimei verificări (AAAA-LL-ZZ)
     mktech_cupoane_castigate       → cupoanele câștigate pe acest dispozitiv
     mktech_cupon_activ             → cuponul ales cu „Folosește în coș”
   ===================================================================== */
'use strict';

(function () {
  const root = document.getElementById('game-root');
  if (!root || !window.MKCupoane) return;
  const C = window.MKCupoane;

  const CHEIE_INCERCARI = 'mktech_joc_incercari';
  const CHEIE_REINCARCARE = 'mktech_joc_ultima_reincarcare';
  const INCERCARI_START = 2;

  /* ---------- utilitare ---------- */
  const faraAnimatii = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const asteapta = (ms) => new Promise((gata) => setTimeout(gata, faraAnimatii() ? Math.min(ms, 60) : ms));
  const tradus = (text) => (typeof translateString === 'function' && translateString(text)) || text;
  const ic = (nume) => (typeof icon === 'function' ? icon(nume) : '');
  const esc = (t) => (typeof escapeHTML === 'function' ? escapeHTML(t) : String(t));
  const q = (sel, baza = root) => baza.querySelector(sel);
  const doua = (n) => String(n).padStart(2, '0');

  const citeste = (cheie) => {
    try {
      return localStorage.getItem(cheie);
    } catch (e) {
      return null;
    }
  };
  const scrie = (cheie, valoare) => {
    try {
      localStorage.setItem(cheie, String(valoare));
    } catch (e) {}
  };

  /* ---------- încercări + reîncărcarea zilnică ----------
     Pornește de la 2. În fiecare zi nouă (după ora 00:00, ora locală), dacă
     vizitatorul a rămas cu 0, primește 1 încercare. Încercările NU se adună. */
  const azi = () => {
    const d = new Date();
    return `${d.getFullYear()}-${doua(d.getMonth() + 1)}-${doua(d.getDate())}`;
  };

  function incercariRamase() {
    let ramase = parseInt(citeste(CHEIE_INCERCARI), 10);
    const ultima = citeste(CHEIE_REINCARCARE);

    if (Number.isNaN(ramase) || !ultima) {
      ramase = INCERCARI_START; // prima vizită
      scrie(CHEIE_INCERCARI, ramase);
      scrie(CHEIE_REINCARCARE, azi());
    } else if (ultima !== azi()) {
      if (ramase <= 0) ramase = 1; // zi nouă: o singură încercare, oricâte zile au trecut
      scrie(CHEIE_INCERCARI, ramase);
      scrie(CHEIE_REINCARCARE, azi());
    }
    return Math.max(0, ramase);
  }

  /* trage premiul, consumă o încercare și salvează cuponul câștigat */
  function joaca() {
    const rezultat = C.trage();
    scrie(CHEIE_INCERCARI, Math.max(0, incercariRamase() - 1));
    if (rezultat.castig) C.adaugaCastigat(rezultat.cod);
    actualizeazaStare();
    return rezultat;
  }

  /* =====================================================================
     DESENE (SVG) — fără imagini externe
     ===================================================================== */
  const FELII = [true, false, true, false, true, false, false]; // true = felie „CUPON”
  const SEG = 360 / FELII.length;
  const RAZA = 100;
  const punct = (unghi, raza = RAZA) => {
    const rad = (unghi * Math.PI) / 180;
    return `${(raza * Math.sin(rad)).toFixed(2)},${(-raza * Math.cos(rad)).toFixed(2)}`;
  };

  const cadouSVG = (marime = 16) => {
    const m = marime / 2;
    return `<g class="wheel__gift" transform="translate(${-m},${-m})">
      <rect x="0" y="${marime * 0.36}" width="${marime}" height="${marime * 0.64}" rx="1.5"/>
      <rect x="${-marime * 0.06}" y="${marime * 0.2}" width="${marime * 1.12}" height="${marime * 0.22}" rx="1.2"/>
      <rect class="wheel__ribbon" x="${marime * 0.43}" y="${marime * 0.2}" width="${marime * 0.14}" height="${marime * 0.8}"/>
      <path class="wheel__bow" d="M${m},${marime * 0.2} c-${marime * 0.3},-${marime * 0.34} -${marime * 0.52},-${marime * 0.06} -${marime * 0.2},0 M${m},${marime * 0.2} c${marime * 0.3},-${marime * 0.34} ${marime * 0.52},-${marime * 0.06} ${marime * 0.2},0"/>
    </g>`;
  };

  function roataSVG(cuEtichete) {
    const felii = FELII.map((cupon, i) => {
      const mijloc = (i + 0.5) * SEG;
      const eticheta = !cuEtichete
        ? ''
        : cupon
        ? `<g transform="rotate(${mijloc})">
             <text class="wheel__text wheel__text--win" y="-76">CUPON</text>
             <g transform="translate(0,-52)">${cadouSVG(18)}</g>
           </g>`
        : `<g transform="rotate(${mijloc})">
             <text class="wheel__text" y="-76">Mai</text>
             <text class="wheel__text" y="-63">încearcă</text>
           </g>`;
      return `<g class="wheel__slice${cupon ? ' wheel__slice--win' : i % 2 ? ' wheel__slice--alt' : ''}">
        <path d="M0,0 L${punct(i * SEG)} A${RAZA},${RAZA} 0 0,1 ${punct((i + 1) * SEG)} Z"/>
        ${eticheta}
      </g>`;
    }).join('');

    return `<svg class="wheel__svg" viewBox="-108 -108 216 216" aria-hidden="true">
      <circle class="wheel__rim" r="105"/>
      ${felii}
      <circle class="wheel__hub" r="15"/>
      <circle class="wheel__hub-dot" r="5"/>
    </svg>`;
  }

  const cosSVG = () => `
    <svg class="basket__svg" viewBox="0 0 100 86" aria-hidden="true">
      <path class="basket__body" d="M10,24 L90,24 L78,80 Q77,84 72,84 L28,84 Q23,84 22,80 Z"/>
      <path class="basket__weave" d="M16,40 H84 M19,54 H81 M22,68 H78 M32,26 L36,83 M50,26 V83 M68,26 L64,83"/>
      <ellipse class="basket__rim" cx="50" cy="24" rx="44" ry="9"/>
      <ellipse class="basket__hole" cx="50" cy="24" rx="37" ry="6"/>
    </svg>`;

  const ILUSTRATII = {
    roata: () => `<span class="art-wheel">${roataSVG(false)}<span class="art-wheel__pin"></span></span>`,
    razuire: () => `
      <svg class="art-scratch" viewBox="0 0 160 110" aria-hidden="true">
        <rect class="art-scratch__card" x="8" y="10" width="144" height="90" rx="12"/>
        <rect class="art-scratch__silver" x="22" y="26" width="116" height="58" rx="8"/>
        <path class="art-scratch__mark" d="M32,74 q14,-34 30,-12 t30,-20 t34,6 v26 h-94 Z"/>
        <text class="art-scratch__txt" x="80" y="67">−10%</text>
        <g class="art-scratch__coin"><circle cx="126" cy="80" r="15"/><text x="126" y="85">$</text></g>
      </svg>`,
    minge: () => `
      <svg class="art-ball" viewBox="0 0 170 110" aria-hidden="true">
        <circle class="art-ball__ball" cx="85" cy="22" r="12"/>
        ${[18, 67, 116]
          .map(
            (x) => `<g transform="translate(${x},52) scale(0.4)">
              <path class="basket__body" d="M10,24 L90,24 L78,80 Q77,84 72,84 L28,84 Q23,84 22,80 Z"/>
              <path class="basket__weave" d="M16,40 H84 M19,54 H81 M22,68 H78 M32,26 L36,83 M50,26 V83 M68,26 L64,83"/>
              <ellipse class="basket__rim" cx="50" cy="24" rx="44" ry="9"/>
            </g>`
          )
          .join('')}
      </svg>`,
  };

  const JOCURI = {
    roata: { titlu: 'Roata norocului', text: 'Învârte roata și vezi unde se oprește.', porneste: pornesteRoata },
    razuire: { titlu: 'Răzuiește și câștigă', text: 'Răzuiește cardul argintiu și descoperă premiul.', porneste: pornesteRazuire },
    minge: { titlu: 'Mingea norocoasă', text: 'Alege coșul în care aterizează mingea.', porneste: pornesteMinge },
  };

  /* =====================================================================
     STRUCTURA PAGINII
     ===================================================================== */
  root.innerHTML = `
    <section class="game-status" aria-live="polite">
      <p class="game-status__count"><span>Încercări rămase:</span> <strong data-tries>0</strong></p>
      <p class="game-status__timer" data-timer hidden><span>Următoarea încercare peste</span> <strong data-countdown>00:00:00</strong></p>
      <p class="game-status__msg" data-nomore hidden>Ai folosit încercările de azi. Revino mâine pentru o încercare nouă! Cupoanele câștigate le găsești mai jos.</p>
    </section>

    <section class="game-cards" data-cards aria-label="Alege un joc">
      ${Object.keys(JOCURI)
        .map(
          (cheie) => `
        <button class="game-card" type="button" data-game="${cheie}">
          <span class="game-card__art">${ILUSTRATII[cheie]()}</span>
          <span class="game-card__title">${JOCURI[cheie].titlu}</span>
          <span class="game-card__text">${JOCURI[cheie].text}</span>
          <span class="game-card__cta"><span>Joacă</span> ${ic('arrowRight')}</span>
        </button>`
        )
        .join('')}
    </section>

    <section class="game-stage" data-stage hidden>
      <button class="link-btn game-stage__back" type="button" data-back>← Înapoi la jocuri</button>
      <h2 class="game-stage__title" data-stage-title></h2>
      <div class="game-stage__area" data-area></div>
      <div class="game-result" data-result hidden></div>
    </section>

    <section class="my-coupons" aria-labelledby="my-coupons-title">
      <h2 class="section-title" id="my-coupons-title">Cupoanele mele</h2>
      <div data-coupons></div>
    </section>`;

  const stage = q('[data-stage]');
  const area = q('[data-area]');
  const zonaRezultat = q('[data-result]');
  const carduri = q('[data-cards]');
  let ocupat = false; // adevărat cât timp rulează o animație (blochează dublul click)
  let jocCurent = null;

  /* ---------- contor, numărătoare inversă, carduri estompate ---------- */
  function actualizeazaStare() {
    const ramase = incercariRamase();
    q('[data-tries]').textContent = ramase;
    q('.game-status').classList.toggle('is-empty', ramase === 0);
    q('[data-timer]').hidden = ramase > 0;
    q('[data-nomore]').hidden = ramase > 0;
    carduri.classList.toggle('is-locked', ramase === 0);
    carduri.querySelectorAll('.game-card').forEach((card) => (card.disabled = ramase === 0));
    if (ramase === 0) actualizeazaNumaratoarea();
    return ramase;
  }

  function actualizeazaNumaratoarea() {
    const acum = new Date();
    const miezulNoptii = new Date(acum.getFullYear(), acum.getMonth(), acum.getDate() + 1);
    const secunde = Math.max(0, Math.ceil((miezulNoptii - acum) / 1000));
    q('[data-countdown]').textContent = `${doua(Math.floor(secunde / 3600))}:${doua(Math.floor((secunde % 3600) / 60))}:${doua(secunde % 60)}`;
  }

  setInterval(() => {
    if (citeste(CHEIE_REINCARCARE) !== azi()) actualizeazaStare(); // a trecut miezul nopții
    else if (!q('[data-timer]').hidden) actualizeazaNumaratoarea();
  }, 1000);

  /* ---------- lista „Cupoanele mele” ---------- */
  function deseneazaCupoane() {
    const zona = q('[data-coupons]');
    const vazute = new Set();
    const lista = C.castigate().filter((c) => !vazute.has(c.cod) && vazute.add(c.cod));

    if (!lista.length) {
      zona.innerHTML = `<p class="my-coupons__empty">Încă nu ai câștigat niciun cupon. Alege un joc de mai sus!</p>`;
      return;
    }

    zona.innerHTML = `<ul class="won-list">
      ${lista
        .map(({ cod }) => {
          const tip = C.gaseste(cod);
          return `<li class="won-coupon">
            <div class="won-coupon__info">
              <span class="won-coupon__label">${esc(tip.eticheta)}</span>
              <code class="won-coupon__code">${esc(cod)}</code>
              <span class="won-coupon__cond">${esc(C.conditie(tip))}</span>
            </div>
            <div class="won-coupon__actions">
              <button class="btn btn--outline btn--sm" type="button" data-copy="${esc(cod)}"><span class="btn__label">Copiază</span></button>
              <button class="btn btn--primary btn--sm" type="button" data-use="${esc(cod)}">Folosește în coș</button>
            </div>
          </li>`;
        })
        .join('')}
    </ul>`;
  }

  /* ---------- deschiderea / închiderea unui joc ---------- */
  function deschideJoc(cheie) {
    if (ocupat || incercariRamase() <= 0) return;
    jocCurent = cheie;
    carduri.hidden = true;
    stage.hidden = false;
    zonaRezultat.hidden = true;
    zonaRezultat.innerHTML = '';
    q('[data-stage-title]').textContent = JOCURI[cheie].titlu;
    JOCURI[cheie].porneste();
    stage.scrollIntoView({ behavior: faraAnimatii() ? 'auto' : 'smooth', block: 'start' });
  }

  function inapoiLaJocuri() {
    if (ocupat) return;
    jocCurent = null;
    stage.hidden = true;
    carduri.hidden = false;
    area.innerHTML = '';
    actualizeazaStare();
    deseneazaCupoane();
  }

  /* ---------- ecranul de rezultat (comun celor 3 jocuri) ---------- */
  function arataRezultat(rezultat) {
    ocupat = false;
    const ramase = actualizeazaStare();
    deseneazaCupoane();

    if (rezultat.castig) {
      const tip = C.gaseste(rezultat.cod);
      zonaRezultat.innerHTML = `
        <div class="result result--win">
          <p class="result__kicker">Felicitări, ai câștigat!</p>
          <div class="coupon-card">
            <span class="coupon-card__label">${esc(tip.eticheta)}</span>
            <code class="coupon-card__code">${esc(rezultat.cod)}</code>
            <span class="coupon-card__cond">${esc(C.conditie(tip))}</span>
          </div>
          <div class="result__actions">
            <button class="btn btn--outline btn--lg" type="button" data-copy="${esc(rezultat.cod)}"><span class="btn__label">Copiază codul</span></button>
            <button class="btn btn--primary btn--lg" type="button" data-use="${esc(rezultat.cod)}">Folosește în coș</button>
          </div>
          ${ramase > 0 ? `<button class="link-btn" type="button" data-again>Mai încearcă</button>` : ''}
        </div>`;
      confetti();
    } else {
      zonaRezultat.innerHTML = `
        <div class="result result--lose">
          <p class="result__kicker">Data viitoare ai mai mult noroc!</p>
          ${
            ramase > 0
              ? `<button class="btn btn--primary btn--lg" type="button" data-again>Mai încearcă</button>`
              : `<p class="result__note">Revino mâine pentru o încercare nouă.</p>`
          }
        </div>`;
    }
    zonaRezultat.hidden = false;
    zonaRezultat.scrollIntoView({ behavior: faraAnimatii() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function confetti() {
    if (faraAnimatii()) return;
    const culori = ['#a32034', '#bf2a40', '#1c4a8c', '#2a60ad', '#f2b632', '#3fb6c8', '#ffffff'];
    const strat = document.createElement('div');
    strat.className = 'confetti';
    strat.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 70; i++) {
      const bucata = document.createElement('span');
      bucata.style.left = `${Math.random() * 100}%`;
      bucata.style.background = culori[i % culori.length];
      bucata.style.animationDelay = `${Math.random() * 0.5}s`;
      bucata.style.animationDuration = `${1.6 + Math.random() * 1.3}s`;
      bucata.style.setProperty('--deriva', `${(Math.random() * 2 - 1) * 120}px`);
      strat.appendChild(bucata);
    }
    document.body.appendChild(strat);
    setTimeout(() => strat.remove(), 3400);
  }

  async function copiaza(cod, buton) {
    try {
      await navigator.clipboard.writeText(cod);
    } catch (e) {
      const camp = document.createElement('textarea'); // variantă pentru browserele fără clipboard API
      camp.value = cod;
      camp.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(camp);
      camp.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      camp.remove();
    }
    const eticheta = buton.querySelector('.btn__label');
    if (!eticheta || buton.dataset.initial) return;
    buton.dataset.initial = eticheta.textContent;
    eticheta.textContent = 'Copiat!';
    setTimeout(() => {
      eticheta.textContent = buton.dataset.initial;
      delete buton.dataset.initial;
    }, 1600);
  }

  /* =====================================================================
     1. ROATA NOROCULUI
     ===================================================================== */
  function pornesteRoata() {
    area.innerHTML = `
      <div class="wheel">
        <span class="wheel__pointer" aria-hidden="true"></span>
        <div class="wheel__disc" data-wheel>${roataSVG(true)}</div>
      </div>
      <button class="btn btn--primary btn--lg game-action" type="button" data-spin>Învârte</button>`;

    const disc = q('[data-wheel]', area);
    const buton = q('[data-spin]', area);
    let rotatie = 0;

    buton.addEventListener('click', async () => {
      if (ocupat) return;
      ocupat = true;
      buton.disabled = true;

      const rezultat = joaca(); // rezultatul e decis ÎNAINTE de animație
      const posibile = FELII.map((cupon, i) => (cupon === rezultat.castig ? i : -1)).filter((i) => i >= 0);
      const tinta = posibile[Math.floor(Math.random() * posibile.length)];
      // un punct aleatoriu din interiorul feliei (nu chiar pe margine)
      const centru = (tinta + 0.5) * SEG + (Math.random() * 2 - 1) * (SEG / 2 - 7);
      rotatie += 360 * 5 + ((((-centru - rotatie) % 360) + 360) % 360);

      disc.style.transition = faraAnimatii() ? 'none' : 'transform 4.6s cubic-bezier(0.12, 0.62, 0.1, 1)';
      disc.style.transform = `rotate(${rotatie}deg)`;
      await asteapta(4800);
      arataRezultat(rezultat);
    });
  }

  /* =====================================================================
     2. RĂZUIEȘTE ȘI CÂȘTIGĂ
     ===================================================================== */
  function pornesteRazuire() {
    area.innerHTML = `
      <div class="scratch">
        <div class="scratch__prize" data-prize><span class="scratch__q">?</span></div>
        <canvas class="scratch__canvas" data-canvas></canvas>
      </div>
      <p class="game-hint">Răzuiește cardul cu degetul sau cu mouse-ul.</p>
      <button class="btn btn--outline game-action" type="button" data-reveal>Dezvăluie premiul</button>`;

    const canvas = q('[data-canvas]', area);
    const premiu = q('[data-prize]', area);
    const butonDezvaluie = q('[data-reveal]', area);
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // citim des pixelii (procentul răzuit)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rezultat = null;
    let gata = false;
    let apasat = false;
    let ultim = null;
    let ultimaVerificare = 0;

    // stratul argintiu
    const cadru = canvas.getBoundingClientRect();
    canvas.width = Math.round((cadru.width || 320) * dpr);
    canvas.height = Math.round((cadru.height || 180) * dpr);
    const { width, height } = canvas;
    const argint = ctx.createLinearGradient(0, 0, width, height);
    argint.addColorStop(0, '#c9cfd8');
    argint.addColorStop(0.35, '#eef1f5');
    argint.addColorStop(0.6, '#b3bbc7');
    argint.addColorStop(1, '#dfe3e9');
    ctx.fillStyle = argint;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2 * dpr;
    for (let x = -height; x < width; x += 14 * dpr) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(15, 42, 85, 0.6)';
    ctx.font = `800 ${Math.round(20 * dpr)}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tradus('RĂZUIEȘTE AICI').toUpperCase(), width / 2, height / 2);

    const incepe = () => {
      if (rezultat) return;
      rezultat = joaca(); // premiul se decide la prima atingere
      premiu.innerHTML = rezultat.castig
        ? `<span class="scratch__small">Ai câștigat</span><span class="scratch__win">${esc(rezultat.eticheta)}</span>`
        : `<span class="scratch__lose">Mai încearcă!</span>`;
    };

    const dezvaluie = async () => {
      if (gata) return;
      gata = true;
      ocupat = true;
      butonDezvaluie.disabled = true;
      canvas.classList.add('is-cleared');
      await asteapta(600);
      arataRezultat(rezultat);
    };

    const pozitie = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
    };

    const razuieste = (a, b) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 44 * dpr;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x, b.y, 22 * dpr, 0, Math.PI * 2);
      ctx.fill();
    };

    // cât la sută din strat a fost răzuit (verificăm un punct din 8, e suficient)
    const verifica = (fortat) => {
      const acum = Date.now();
      if (gata || (!fortat && acum - ultimaVerificare < 140)) return;
      ultimaVerificare = acum;
      const pixeli = ctx.getImageData(0, 0, width, height).data;
      const pas = Math.max(4, Math.round(8 * dpr));
      let total = 0;
      let curatat = 0;
      for (let y = 0; y < height; y += pas) {
        for (let x = 0; x < width; x += pas) {
          total++;
          if (pixeli[(y * width + x) * 4 + 3] < 40) curatat++;
        }
      }
      if (curatat / total >= 0.5) dezvaluie();
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (gata) return;
      e.preventDefault();
      incepe();
      apasat = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
      ultim = pozitie(e);
      razuieste(ultim, ultim);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!apasat || gata) return;
      e.preventDefault();
      const p = pozitie(e);
      razuieste(ultim, p);
      ultim = p;
      verifica(false);
    });
    const ridica = () => {
      if (!apasat) return;
      apasat = false;
      verifica(true);
    };
    canvas.addEventListener('pointerup', ridica);
    canvas.addEventListener('pointercancel', ridica);
    canvas.addEventListener('pointerleave', ridica);

    butonDezvaluie.addEventListener('click', () => {
      incepe();
      dezvaluie();
    });
  }

  /* =====================================================================
     3. MINGEA NOROCOASĂ
     ===================================================================== */
  function pornesteMinge() {
    area.innerHTML = `
      <div class="ball-game">
        <span class="ball-game__ball" data-ball aria-hidden="true"></span>
        <div class="ball-game__baskets">
          ${[0, 1, 2]
            .map(
              (i) => `
            <button class="basket" type="button" data-basket="${i}" aria-label="Coșul ${i + 1}">
              <span class="basket__prize" data-basket-prize></span>
              ${cosSVG()}
              <span class="basket__nr">${i + 1}</span>
            </button>`
            )
            .join('')}
        </div>
      </div>
      <p class="game-hint" data-ball-hint>Alege un coș!</p>`;

    const minge = q('[data-ball]', area);
    const cosuri = [...area.querySelectorAll('.basket')];

    cosuri.forEach((cos, ales) =>
      cos.addEventListener('click', async () => {
        if (ocupat) return;
        ocupat = true;
        cosuri.forEach((c) => (c.disabled = true));
        cos.classList.add('is-chosen');

        const rezultat = joaca(); // rezultatul e decis ÎNAINTE de animație

        // zborul mingii, în arc, până în coșul ales
        const m = minge.getBoundingClientRect();
        const c = cos.getBoundingClientRect();
        const dx = c.left + c.width / 2 - (m.left + m.width / 2);
        const dy = c.top + c.height * 0.3 - (m.top + m.height / 2);
        const cadre = [];
        for (let k = 0; k <= 12; k++) {
          const t = k / 12;
          cadre.push({ transform: `translate(${dx * t}px, ${dy * t - Math.sin(Math.PI * t) * 90}px) scale(${1 - 0.25 * t})` });
        }
        if (minge.animate) {
          minge.animate(cadre, { duration: faraAnimatii() ? 1 : 900, easing: 'ease-in', fill: 'forwards' });
        } else {
          minge.style.transform = cadre[cadre.length - 1].transform;
        }
        await asteapta(950);
        minge.classList.add('is-in');

        if (rezultat.castig) {
          q('[data-basket-prize]', cos).innerHTML = `<span class="basket__ticket">${esc(rezultat.eticheta)}</span>`;
          cos.classList.add('is-win');
          q('[data-ball-hint]', area).textContent = 'Ai nimerit coșul cu premiu!';
        } else {
          // coșul ales e gol; arătăm că premiul era în alt coș
          const altul = cosuri.filter((x) => x !== cos)[Math.floor(Math.random() * 2)];
          q('[data-basket-prize]', cos).innerHTML = `<span class="basket__empty">Gol</span>`;
          q('[data-basket-prize]', altul).innerHTML = `<span class="basket__ticket basket__ticket--other">${ic('gift')}</span>`;
          cos.classList.add('is-empty');
          altul.classList.add('is-other');
          q('[data-ball-hint]', area).textContent = 'Premiul era în alt coș!';
        }
        await asteapta(1400);
        arataRezultat(rezultat);
      })
    );
  }

  /* =====================================================================
     EVENIMENTE
     ===================================================================== */
  root.addEventListener('click', (e) => {
    const card = e.target.closest('[data-game]');
    if (card) {
      deschideJoc(card.dataset.game);
      return;
    }
    if (e.target.closest('[data-back]')) {
      inapoiLaJocuri();
      return;
    }
    if (e.target.closest('[data-again]')) {
      if (ocupat || !jocCurent) return;
      if (incercariRamase() <= 0) {
        inapoiLaJocuri();
        return;
      }
      zonaRezultat.hidden = true;
      zonaRezultat.innerHTML = '';
      JOCURI[jocCurent].porneste();
      stage.scrollIntoView({ behavior: faraAnimatii() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const copie = e.target.closest('[data-copy]');
    if (copie) {
      copiaza(copie.dataset.copy, copie);
      return;
    }
    const foloseste = e.target.closest('[data-use]');
    if (foloseste) {
      C.seteazaActiv(foloseste.dataset.use); // coșul îl aplică automat
      window.location.href = 'cos.html';
    }
  });

  actualizeazaStare();
  deseneazaCupoane();
})();
