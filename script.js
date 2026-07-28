/* ============================================================
   MALLWI BRAND — النواة المشتركة للسكربت
   ============================================================ */

/* ---------- الوضع الليلي / النهاري ---------- */
function initTheme(){
  const saved = localStorage.getItem('mallwi_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mallwi_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(mode){
  const icon = document.getElementById('theme-icon');
  if(icon) icon.className = mode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
initTheme();

/* ---------- القائمة: تفتح بالزر وتقفل بالضغط بره ---------- */
function toggleMobileNav(e){
  e.stopPropagation();
  document.querySelector('nav.main-nav').classList.toggle('open');
}
document.addEventListener('click', function(e){
  const nav = document.querySelector('nav.main-nav');
  if(!nav) return;
  const toggler = document.querySelector('.hamburger');
  if(nav.classList.contains('open') && !nav.contains(e.target) && (!toggler || !toggler.contains(e.target))){
    nav.classList.remove('open');
  }
});
document.addEventListener('touchstart', function(e){
  const nav = document.querySelector('nav.main-nav');
  if(!nav) return;
  const toggler = document.querySelector('.hamburger');
  if(nav.classList.contains('open') && !nav.contains(e.target) && (!toggler || !toggler.contains(e.target))){
    nav.classList.remove('open');
  }
}, {passive:true});

/* ---------- ظهور العناصر عند التمرير ---------- */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); } });
  }, {threshold:.15});
  els.forEach(el=>obs.observe(el));
}

/* ---------- صورة المنتج: تجرب صورتك الحقيقية الأول، ولو مش موجودة تحط صورة مؤقتة ---------- */
function productImageUrl(id){
  return `imgs/products/${id}.jpg`;
}
function placeholderImageUrl(id){
  return `https://picsum.photos/seed/mallwi${id}/500/650`;
}
function imgFallback(imgEl, id){
  imgEl.src = placeholderImageUrl(id || 0);
  const media = imgEl.closest('.p-media, .qv-media, .ci-img');
  if(media) media.classList.add('is-placeholder');
}

/* ---------- خصم شكلي عشوائي (ثابت لكل منتج) مع الحفاظ على السعر الحقيقي ---------- */
function fakeDiscount(id, price){
  const seed = (id * 9301 + 49297) % 233280;
  const rnd = seed / 233280;
  const pct = 12 + Math.round(rnd * 26); // بين 12% و 38%
  let old = Math.round((price / (1 - pct/100)) / 5) * 5;
  if(old <= price) old = price + 20;
  return { pct, old };
}

/* ---------- Toast ---------- */
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* =================== نظام السلة =================== */
const CART_KEY = 'mallwi_cart';
const COUPONS = { 'MALLWI10': 10, 'ROYAL20': 20 };
const SHIPPING = 30;

function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCartBadge(); }

function renderCartBadge(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-badge').forEach(b=> b.textContent = count);
}
renderCartBadge();

/* السعر المعروض هو السعر الحقيقي دايمًا — الخصم شكلي بصري فقط */
function itemFinalPrice(item){ return item.price; }

function addToCart(product, size, color, qty){
  const cart = getCart();
  const key = product.id + '_' + size + '_' + color;
  const existing = cart.find(i=> i.key === key);
  if(existing){ existing.qty += qty; }
  else {
    cart.push({ key, id:product.id, name:product.name, price:product.price,
      image:productImageUrl(product.id), size, color, qty, category:product.category });
  }
  saveCart(cart);
  showToast('✓ تمت الإضافة إلى السلة');
  renderCartDrawer();
}

function removeFromCart(key){
  let cart = getCart().filter(i=> i.key !== key);
  saveCart(cart);
  renderCartDrawer();
}

function changeQty(key, delta){
  const cart = getCart();
  const item = cart.find(i=> i.key === key);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ return removeFromCart(key); }
  saveCart(cart);
  renderCartDrawer();
}

let appliedCoupon = localStorage.getItem('mallwi_coupon') || null;

function renderCartDrawer(){
  const cart = getCart();
  const wrap = document.getElementById('cart-items');
  const foot = document.getElementById('cart-foot');
  const minWarn = document.getElementById('min-warn');
  if(!wrap) return;

  if(cart.length === 0){
    wrap.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-bag-shopping" style="font-size:1.8rem;color:var(--brass);margin-bottom:12px;display:block;"></i>السلة فارغة حاليًا</div>';
    foot.style.display = 'none';
    return;
  }
  foot.style.display = 'block';
  wrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-img"><img src="${item.image}" onerror="imgFallback(this, ${item.id})" alt="${item.name}"></div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">المقاس: ${item.size} · اللون: ${item.color}</div>
        <div class="ci-qty">
          <button onclick="changeQty('${item.key}',-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.key}',1)">+</button>
          <span style="margin-inline-start:auto;color:var(--brass);font-weight:700;">${Math.round(itemFinalPrice(item)*item.qty)} ج.م</span>
        </div>
        <div class="ci-remove" onclick="removeFromCart('${item.key}')">حذف</div>
      </div>
    </div>
  `).join('');

  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  const subtotal = cart.reduce((s,i)=> s + itemFinalPrice(i)*i.qty, 0);
  let discountPct = 0;
  if(appliedCoupon && COUPONS[appliedCoupon]) discountPct = COUPONS[appliedCoupon];
  const afterCoupon = subtotal - (subtotal*discountPct/100);
  const total = afterCoupon + SHIPPING;

  document.getElementById('sum-subtotal').textContent = Math.round(subtotal) + ' ج.م';
  document.getElementById('sum-shipping').textContent = SHIPPING + ' ج.م';
  document.getElementById('sum-total').textContent = Math.round(total) + ' ج.م';
  const couponMsg = document.getElementById('coupon-msg');
  if(appliedCoupon && COUPONS[appliedCoupon]){
    couponMsg.textContent = `✓ تم تفعيل كود "${appliedCoupon}" — خصم ${discountPct}%`;
    couponMsg.style.color = '#3fb37f';
  } else { couponMsg.textContent=''; }

  minWarn.classList.toggle('show', totalQty < 2);
  document.getElementById('checkout-btn').disabled = false;
}

function applyCoupon(){
  const input = document.getElementById('coupon-input');
  const code = input.value.trim().toUpperCase();
  const msg = document.getElementById('coupon-msg');
  if(COUPONS[code]){
    appliedCoupon = code;
    localStorage.setItem('mallwi_coupon', code);
    renderCartDrawer();
  } else {
    msg.textContent = 'الكود غير صحيح ✕';
    msg.style.color = '#c76357';
  }
}

function openCart(){
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  renderCartDrawer();
}
function closeCart(){
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

function tryCheckout(){
  const cart = getCart();
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  if(totalQty < 2){
    showToast('⚠️ الحد الأدنى للطلب قطعتان');
    document.getElementById('min-warn').classList.add('show');
    return;
  }
  window.location.href = 'order.html';
}

/* ملحوظة: منطق بناء رسالة الواتساب وإتمام الطلب أصبح داخل order.js
   الخاص بصفحة order.html الكاملة، بدل النافذة الصغيرة القديمة. */

/* =================== تثبيت التطبيق (PWA) =================== */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('install-btn');
  if(btn) btn.style.display = 'flex';
});

function installApp(){
  const btn = document.getElementById('install-btn');
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(()=>{
      deferredInstallPrompt = null;
      if(btn) btn.style.display = 'none';
    });
  } else {
    showToast('📲 من قائمة المتصفح اختر "إضافة إلى الشاشة الرئيسية"');
  }
}

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function initInstallHint(){
  const btn = document.getElementById('install-btn');
  if(!btn) return;
  if(isStandalone()){ btn.style.display = 'none'; return; }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if(isIOS) btn.style.display = 'flex';
}

/* ---------- تهيئة عامة عند تحميل كل صفحة ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initReveal();
  renderCartBadge();
  initInstallHint();
});
