
'use strict';


  // ORDER STATE
const order = [];


   //HERO CAROUSEL
  
let heroIdx = 0, heroTimer = null;

function initHero() {
  const track = document.getElementById('hero-track');
  const dotsWrap = document.getElementById('hero-dots');
  if (!track) return;

  track.innerHTML = HERO_SLIDES.map(s => `
    <div class="hero-slide flex-shrink-0 w-full"><div class="px-6 md:px-16 mx-auto" style="padding-top:90px;padding-bottom:70px;max-width:1280px">
      <p class="eyebrow mb-2">${s.eyebrow}</p>
      <h1 class="font-display font-light leading-tight text-3xl sm:text-5xl md:text-6xl max-w-2xl mb-4">${s.title}</h1>
      <p class="text-ink/65 leading-relaxed max-w-md mb-6 text-sm md:text-base">${s.subtitle}</p>
      <a href="#menu-main" class="btn-primary">View the Menu</a>
    </div></div>
  `).join('');

  dotsWrap.innerHTML = HERO_SLIDES.map((_, i) =>
    `<button class="hero-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');

  const go = idx => {
    heroIdx = (idx + HERO_SLIDES.length) % HERO_SLIDES.length;
    track.style.transform = `translateX(-${heroIdx * 100}%)`;
    document.querySelectorAll('.hero-dot').forEach((d, i) =>
      d.classList.toggle('active', i === heroIdx));
  };

  document.getElementById('hero-prev')?.addEventListener('click', () => { go(heroIdx - 1); resetTimer(); });
  document.getElementById('hero-next')?.addEventListener('click', () => { go(heroIdx + 1); resetTimer(); });
  dotsWrap.addEventListener('click', e => {
    const btn = e.target.closest('.hero-dot');
    if (btn) { go(Number(btn.dataset.i)); resetTimer(); }
  });

  const resetTimer = () => {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => go(heroIdx + 1), 6000);
  };
  go(0);
  resetTimer();
}


   // PICKUP DROPDOWN
   
function initPickup() {
  const btn     = document.getElementById('pickup-toggle');
  const panel   = document.getElementById('pickup-panel');
  const current = document.getElementById('pickup-current');
  if (!btn) return;

  current.textContent = PICKUP_LOCATIONS[0];
  panel.innerHTML = PICKUP_LOCATIONS.map(loc =>
    `<button class="pickup-option" data-loc="${loc}">${loc}</button>`
  ).join('');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  panel.addEventListener('click', e => {
    const opt = e.target.closest('.pickup-option');
    if (!opt) return;
    current.textContent = opt.dataset.loc;
    panel.classList.remove('open');
  });
  document.addEventListener('click', () => panel.classList.remove('open'));
}


   // CATEGORY NAV  (sticky pills + scroll-spy)
   
function initCategoryNav() {
  const nav = document.getElementById('cat-nav');
  if (!nav) return;

  nav.innerHTML = CATEGORIES.map(cat =>
    `<a href="#${cat.id}" class="cat-pill" data-cat="${cat.id}">${cat.label}</a>`
  ).join('');

  document.getElementById('cat-prev')?.addEventListener('click', () =>
    nav.scrollBy({ left: -220, behavior: 'smooth' }));
  document.getElementById('cat-next')?.addEventListener('click', () =>
    nav.scrollBy({ left: 220, behavior: 'smooth' }));

  nav.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById(pill.dataset.cat)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('.cat-section');
  const pills    = document.querySelectorAll('.cat-pill');
  if (!sections.length) return;

  const setActive = id => {
    pills.forEach(p => p.classList.toggle('active', p.dataset.cat === id));
    document.querySelector(`.cat-pill[data-cat="${id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
    { rootMargin: '-130px 0px -65% 0px', threshold: 0 }
  );
  sections.forEach(s => io.observe(s));
}


   // MENU RENDERING
   
function renderCard(item) {
  const disc = discountPct(item.price, item.salePrice);
  const needsModal = item.type === 'pizza' || item.type === 'deal';

  const priceLabel = item.type === 'pizza'
    ? `from ${formatPKR(item.salePrice)}`
    : formatPKR(item.salePrice);

  return `
    <article class="menu-card" data-id="${item.id}"
             data-name="${item.name.toLowerCase()}"
             data-desc="${item.desc.toLowerCase()}">

      <!-- Image -->
      <div class="card-img-wrap">
        <img src="${item.img}"
             alt="${item.name}"
             loading="lazy"
             onerror="this.style.display='none'" />
        ${disc ? `<span class="card-badge">-${disc}%</span>` : ''}
        ${item.badge ? `<span class="card-flag">${item.badge}</span>` : ''}
        <button class="wishlist-btn" aria-label="Save to wishlist" data-id="${item.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 20s-7-4.6-9.5-8.7C.7 8 2 4 6 4c2 0 3.5 1.2 4 2.2C10.5 5.2 12 4 14 4c4 0 5.3 4 3.5 7.3C19 15.4 12 20 12 20Z"
                  stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="card-body">
        <h3 class="card-name">${item.name}</h3>
        <p class="card-desc">${item.desc}</p>

        <div class="card-footer">
          <div class="card-prices">
            <span class="price-sale">${priceLabel}</span>
            ${disc ? `<span class="price-orig">${formatPKR(item.price)}</span>` : ''}
          </div>
          <button class="add-btn"
                  data-id="${item.id}"
                  data-modal="${needsModal}"
                  aria-label="Add ${item.name} to order">
            Add To Cart
          </button>
        </div>
      </div>
    </article>`;
}

function renderCategory(cat) {
  return `
    <section id="${cat.id}" class="cat-section">
      <div class="cat-banner">
        <p class="eyebrow">${cat.items.length} ${cat.items.length === 1 ? 'item' : 'items'}</p>
        <h2 class="font-display text-2xl md:text-3xl font-light">${cat.label}</h2>
      </div>
      <div class="menu-grid">
        ${cat.items.map(renderCard).join('')}
      </div>
    </section>`;
}

function renderMenu() {
  const main = document.getElementById('menu-main');
  if (main) main.innerHTML = CATEGORIES.map(renderCategory).join('');
}


   // LIVE SEARCH

function initSearch() {
  const input = document.getElementById('menu-search');
  const empty = document.getElementById('search-empty');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let any = false;

    document.querySelectorAll('.cat-section').forEach(sec => {
      let hit = false;
      sec.querySelectorAll('.menu-card').forEach(card => {
        const match = !q || card.dataset.name.includes(q) || card.dataset.desc.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) hit = true;
      });
      sec.style.display = hit ? '' : 'none';
      if (hit) any = true;
    });

    empty.classList.toggle('hidden', any || !q);
  });
}


  // CART DRAWER
  
function openCart()  {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

function syncCart() {
  const totalQty  = order.reduce((s, l) => s + l.qty, 0);
  const totalAmt  = order.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  document.getElementById('cart-count').textContent = totalQty;
  document.getElementById('cart-total').textContent  = formatPKR(totalAmt);

  const list  = document.getElementById('cart-list');
  const empty = document.getElementById('cart-empty');

  if (order.length === 0) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = order.map((line, idx) => `
    <li class="cart-item">
      <img src="${line.img}" alt="${line.name}" class="cart-item-img"
           onerror="this.style.visibility='hidden'" />
      <div style="flex:1;min-width:0">
        <p class="cart-item-name">${line.name}</p>
        <p class="cart-item-price">${formatPKR(line.unitPrice * line.qty)}${line.qty > 1 ? ` (×${line.qty})` : ''}</p>
      </div>
      <button class="cart-remove-btn" data-idx="${idx}" aria-label="Remove">✕</button>
    </li>`).join('');
}

function addToOrder(line) {
  order.push(line);
  syncCart();
  openCart();
}

function initCart() {
  document.getElementById('cart-toggle')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  document.getElementById('cart-list')?.addEventListener('click', e => {
    const btn = e.target.closest('.cart-remove-btn');
    if (!btn) return;
    order.splice(Number(btn.dataset.idx), 1);
    syncCart();
  });

  syncCart();
}

   // SIGN IN / REGISTER
   
const accounts = {};       // email -> password, this-session only
let currentUser = null;    // email of the signed-in user, or null
let authMode = 'signin';   // 'signin' | 'register'

const openSigninModal = () => {
  document.getElementById('signin-overlay')?.classList.add('open');
  document.getElementById('signin-modal')?.classList.add('open');
};
const closeSigninModal = () => {
  document.getElementById('signin-overlay')?.classList.remove('open');
  document.getElementById('signin-modal')?.classList.remove('open');
};

function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('tab-signin')?.classList.toggle('is-active', mode === 'signin');
  document.getElementById('tab-register')?.classList.toggle('is-active', mode === 'register');
  document.getElementById('auth-submit').textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
  document.getElementById('auth-error')?.classList.add('hidden');
  document.getElementById('signin-form')?.reset();
}

function showAuthError(message) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

function renderSigninButton() {
  const btn = document.getElementById('signin-toggle');
  if (!btn) return;
  btn.textContent = currentUser ? currentUser.split('@')[0] : 'Sign In';
}

function renderAccountPanel() {
  const panel = document.getElementById('account-panel');
  if (!panel) return;
  panel.innerHTML = `
    <p class="account-email">Signed in as<br>${currentUser}</p>
    <button class="account-signout" id="signout-btn">Sign Out</button>
  `;
}

function initSignin() {
  const toggleBtn = document.getElementById('signin-toggle');
  const panel = document.getElementById('account-panel');

  toggleBtn?.addEventListener('click', () => {
    if (currentUser) {
      renderAccountPanel();
      panel?.classList.toggle('open');
    } else {
      setAuthMode('signin');
      openSigninModal();
    }
  });

  document.addEventListener('click', (e) => {
    if (!panel || !toggleBtn) return;
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      panel.classList.remove('open');
    }
    const signoutBtn = e.target.closest('#signout-btn');
    if (signoutBtn) {
      currentUser = null;
      renderSigninButton();
      panel.classList.remove('open');
      panel.innerHTML = '';
    }
  });

  document.getElementById('signin-close')?.addEventListener('click', closeSigninModal);
  document.getElementById('signin-overlay')?.addEventListener('click', closeSigninModal);

  document.getElementById('tab-signin')?.addEventListener('click', () => setAuthMode('signin'));
  document.getElementById('tab-register')?.addEventListener('click', () => setAuthMode('register'));

  document.getElementById('signin-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      showAuthError('Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      showAuthError('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'register') {
      if (accounts[email]) {
        showAuthError('An account with this email already exists — try signing in instead.');
        return;
      }
      accounts[email] = password;
      currentUser = email;
    } else {
      if (!accounts[email] || accounts[email] !== password) {
        showAuthError('Incorrect email or password.');
        return;
      }
      currentUser = email;
    }

    renderSigninButton();
    closeSigninModal();
  });
}

   // VARIATION MODAL
    // Pizzas   → size picker
   // Deals    → size picker  +  flavour picker
   // Simple   → direct add (no modal)
   
let vs = { item: null, sizeIdx: 0, flavor: '', addons: [], qty: 1 };

/* -- helpers -- */
const openModal  = () => {
  document.getElementById('var-overlay')?.classList.add('open');
  document.getElementById('var-modal')?.classList.add('open');
};
const closeModal = () => {
  document.getElementById('var-overlay')?.classList.remove('open');
  document.getElementById('var-modal')?.classList.remove('open');
};

function calcUnit() {
  if (!vs.item) return 0;
  const base = vs.item.type === 'pizza'
    ? vs.item.sizes[vs.sizeIdx].salePrice
    : vs.item.type === 'deal'
      ? vs.item.sizes ? vs.item.sizes[vs.sizeIdx].salePrice : vs.item.salePrice
      : vs.item.salePrice;
  const addonTotal = vs.addons.reduce((s, i) => s + ADDONS[i].price, 0);
  return base + addonTotal;
}

function refreshTotal() {
  const totalEl = document.getElementById('var-total');
  if (totalEl) totalEl.textContent = formatPKR(calcUnit() * vs.qty);

  const addBtn = document.getElementById('var-add');
  const dealNeedsFlavor = vs.item?.type === 'deal';
  const ready = !dealNeedsFlavor || Boolean(vs.flavor);
  if (addBtn) {
    addBtn.disabled = !ready;
    addBtn.style.opacity = ready ? '' : '0.4';
  }
}

// size options HTML 
function sizesHTML(sizes) {
  return `
    <div class="opt-group">
      <div class="opt-group-head">
        <span>Choose Size</span>
        <span class="opt-required">Required</span>
      </div>
      ${sizes.map((sz, i) => `
        <label class="opt-row" style="cursor:pointer">
          <div>
            <span class="opt-row-label">${sz.label}</span>
            <span class="opt-row-old">${formatPKR(sz.price)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="opt-row-price">${formatPKR(sz.salePrice)}</span>
            <input type="radio" name="size-opt" value="${i}" ${i === 0 ? 'checked' : ''} />
          </div>
        </label>`).join('')}
    </div>`;
}

/* -- flavour select HTML -- */
function flavorHTML() {
  return `
    <div class="opt-group" style="margin-top:4px">
      <div class="opt-group-head">
        <span>Pizza Flavour</span>
        <span class="opt-required">Required</span>
      </div>
      <select id="flavor-sel" class="flavor-select">
        <option value="" disabled selected>Choose a flavour…</option>
        ${PIZZA_FLAVORS.map(f => `<option value="${f}">${f}</option>`).join('')}
      </select>
    </div>`;
}

/* -- addons HTML -- */
function addonsHTML() {
  return ADDONS.map((a, i) => `
    <div class="addon-row">
      <span>${a.label}</span>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:0.8rem;color:rgba(43,33,29,0.45)">+ ${formatPKR(a.price)}</span>
        <input type="checkbox" data-addon="${i}" />
      </div>
    </div>`).join('');
}

/* -- open modal -- */
function openVariation(itemId) {
  const item = ALL_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  // For deals that include pizza, attach sizes to the item temporarily
  // so users can pick a size for the pizza in their deal
  if (item.type === 'deal' && !item.sizes) {
    item.sizes = PIZZA_SIZES.map(s => ({
      label:     s.label,
      price:     Math.round((item.price * s.multiplier) / 10) * 10,
      salePrice: Math.round((item.salePrice * s.multiplier) / 10) * 10,
    }));
  }

  vs = { item, sizeIdx: 0, flavor: '', addons: [], qty: 1 };

  /* thumb */
  const thumbImg = document.getElementById('var-thumb-img');
  if (thumbImg) { thumbImg.src = item.img; thumbImg.alt = item.name; }

  document.getElementById('var-name').textContent = item.name;
  document.getElementById('var-desc').textContent  = item.desc;

  /* build options */
  const optEl = document.getElementById('var-options');
  if (item.type === 'pizza') {
    optEl.innerHTML = sizesHTML(item.sizes);
  } else if (item.type === 'deal') {
    // Deal: size picker for pizza in the deal, THEN flavour picker
    optEl.innerHTML = sizesHTML(item.sizes) + flavorHTML();
  }

  /* addons */
  document.getElementById('addons-list').innerHTML = addonsHTML();
  document.getElementById('addons-list').classList.add('hidden');
  document.getElementById('addons-chevron').style.transform = '';
  document.getElementById('var-instructions').value = '';
  document.getElementById('qty-val').textContent = '1';

  refreshTotal();
  openModal();
}

function initVariationModal() {
  document.getElementById('var-close')?.addEventListener('click', closeModal);
  document.getElementById('var-overlay')?.addEventListener('click', closeModal);

  /* size radio change */
  document.getElementById('var-options')?.addEventListener('change', e => {
    if (e.target.name === 'size-opt') {
      vs.sizeIdx = Number(e.target.value);
      refreshTotal();
    }
    if (e.target.id === 'flavor-sel') {
      vs.flavor = e.target.value;
      refreshTotal();
    }
  });

  /* addons toggle */
  document.getElementById('addons-toggle')?.addEventListener('click', () => {
    const list    = document.getElementById('addons-list');
    const chevron = document.getElementById('addons-chevron');
    list.classList.toggle('hidden');
    chevron.style.transform = list.classList.contains('hidden') ? '' : 'rotate(180deg)';
  });

  /* addon checkboxes */
  document.getElementById('addons-list')?.addEventListener('change', e => {
    const idx = Number(e.target.dataset.addon);
    if (isNaN(idx)) return;
    vs.addons = e.target.checked
      ? [...vs.addons, idx]
      : vs.addons.filter(i => i !== idx);
    refreshTotal();
  });

  /* qty */
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    vs.qty = Math.max(1, vs.qty - 1);
    document.getElementById('qty-val').textContent = vs.qty;
    refreshTotal();
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    vs.qty += 1;
    document.getElementById('qty-val').textContent = vs.qty;
    refreshTotal();
  });

  /* add to cart */
  document.getElementById('var-add')?.addEventListener('click', () => {
    const { item, sizeIdx, flavor, addons, qty } = vs;
    if (!item) return;
    if (item.type === 'deal' && !flavor) return;

    let name = item.name;
    const addonLabels = addons.map(i => ADDONS[i].label);

    if (item.type === 'pizza') {
      name += ` (${item.sizes[sizeIdx].label})`;
    } else if (item.type === 'deal') {
      name += ` — ${item.sizes[sizeIdx].label} · ${flavor}`;
    }
    if (addonLabels.length) name += ` + ${addonLabels.join(', ')}`;

    addToOrder({ id: item.id, name, unitPrice: calcUnit(), qty, img: item.img });
    closeModal();
  });
}


   // DELEGATED CLICK — add-btn & wishlist-btn
  
function initMenuClicks() {
  document.addEventListener('click', e => {
    /* wishlist */
    const wBtn = e.target.closest('.wishlist-btn');
    if (wBtn) { wBtn.classList.toggle('active'); return; }

    /* add to cart / open modal */
    const aBtn = e.target.closest('.add-btn');
    if (!aBtn) return;

    const item = ALL_ITEMS.find(i => i.id === aBtn.dataset.id);
    if (!item) return;

    if (aBtn.dataset.modal === 'true') {
      openVariation(item.id);
    } else {
      addToOrder({ id: item.id, name: item.name, unitPrice: item.salePrice, qty: 1, img: item.img });
    }
  });
}


  //  HEADER SHADOW  on scroll
   
function initHeaderShadow() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
}


   // SCROLL REVEAL
 
function initReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════════
  //  NEWSLETTER
   ═══════════════════════════════════════════════════════ */
function initNewsletter() {
  document.getElementById('newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const fb = document.getElementById('nl-feedback');
    if (fb) { fb.textContent = "You're on the list. See you at the oven."; fb.classList.remove('hidden'); }
    e.target.reset();
  });
}


  // CHECKOUT BUTTON  (close cart, scroll to contact)
function isRestaurantOpen() {
  const hour = new Date().getHours();
  // Open 11:00 AM – 2:00 AM, which wraps past midnight, so it's open
  // whenever it's 11am-or-later OR still before 2am.
  return hour >= 11 || hour < 2;
}

function showOrderStatusModal(isOpen) {
  const icon = document.getElementById('confirm-icon');
  const heading = document.getElementById('confirm-heading');
  const msg1 = document.getElementById('confirm-msg1');
  const msg2 = document.getElementById('confirm-msg2');

  icon.classList.toggle('is-closed', !isOpen);

  if (isOpen) {
    icon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    heading.textContent = 'Congratulations!';
    msg1.textContent = 'Your order has been placed.';
    msg2.textContent = 'You only have to pay once the rider approaches you.';
  } else {
    icon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    heading.textContent = "Sorry, We're Closed";
    msg1.textContent = 'The restaurant is currently closed.';
    msg2.textContent = 'Our timings are 11:00 AM – 2:00 AM, daily.';
  }

  document.getElementById('confirm-overlay')?.classList.add('open');
  document.getElementById('confirm-modal')?.classList.add('open');
}

function initCheckout() {
  document.getElementById('checkout-btn')?.addEventListener('click', e => {
    e.preventDefault();
    if (order.length === 0) return;

    closeCart();

    const isOpen = isRestaurantOpen();
    if (isOpen) {
      order.length = 0;   // only clear the cart if the order can actually be placed
      syncCart();
    }

    setTimeout(() => showOrderStatusModal(isOpen), 350);
  });

  const closeConfirm = () => {
    document.getElementById('confirm-overlay')?.classList.remove('open');
    document.getElementById('confirm-modal')?.classList.remove('open');
  };
  document.getElementById('confirm-close-btn')?.addEventListener('click', closeConfirm);
  document.getElementById('confirm-overlay')?.addEventListener('click', closeConfirm);
}

// FLOATING BUTTONS — Search jump & Back-to-top
 
function initFAB() {
  const fabTop    = document.getElementById('fab-top');
  const fabSearch = document.getElementById('fab-search');

  /* Show / hide back-to-top based on scroll position */
  window.addEventListener('scroll', () => {
    fabTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* Back-to-top click */
  fabTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Search button — focus the search input and scroll to it */
  fabSearch?.addEventListener('click', () => {
    const searchInput = document.getElementById('menu-search');
    if (!searchInput) return;
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => searchInput.focus(), 400);
  });
}


  //  BOOT
   
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();          // render all categories first
  initHero();
  initPickup();
  initCategoryNav();
  initScrollSpy();
  initSearch();
  initCart();
  initVariationModal();
  initSignin();
  initMenuClicks();
  initHeaderShadow();
  initReveal();
  initNewsletter();
  initCheckout();
  initFAB();
  
});
