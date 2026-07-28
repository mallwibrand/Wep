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
  closeCart();
  if(document.getElementById('order-view')){
    showOrderView();
  } else {
    window.location.href = 'index.html#order';
  }
}

/* =================== واجهة إتمام الطلب (مدمجة داخل index.html) ===================
   بديل صفحة order.html القديمة: نفس المنطق بقى هنا وبيتفعّل جوه index.html
   عن طريق التبديل بين home-view و order-view بدل الانتقال لصفحة تانية. */

function showOrderView(){
  const home = document.getElementById('home-view');
  const order = document.getElementById('order-view');
  if(!order) return;
  if(home) home.style.display = 'none';
  order.style.display = 'block';
  window.scrollTo(0,0);
  goStep(1);
  renderOrderPage();
  if(history.replaceState) history.replaceState(null, '', '#order');
}

function showHomeView(){
  const home = document.getElementById('home-view');
  const order = document.getElementById('order-view');
  if(order) order.style.display = 'none';
  if(home) home.style.display = 'block';
  window.scrollTo(0,0);
  if(history.replaceState) history.replaceState(null, '', window.location.pathname);
}

let selectedPayment = 'cod'; // الدفع عند الاستلام هو الافتراضي حاليًا

function orderTotals(){
  const cart = getCart();
  const subtotal = cart.reduce((s,i)=> s + itemFinalPrice(i)*i.qty, 0);
  let discountPct = (appliedCoupon && COUPONS[appliedCoupon]) ? COUPONS[appliedCoupon] : 0;
  const afterCoupon = subtotal - (subtotal*discountPct/100);
  const total = afterCoupon + SHIPPING;
  return { subtotal, discountPct, afterCoupon, total };
}

function renderOrderPage(){
  const cart = getCart();
  const body = document.getElementById('order-body');
  if(!body) return;

  if(cart.length === 0){
    body.innerHTML = `
      <div class="order-empty reveal in">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>لسه مفيش حاجة في سلتك، اختار اللي يعجبك الأول</p>
        <a href="#" onclick="showHomeView();return false;" class="btn btn-gold">الرجوع للتسوق</a>
      </div>`;
    const steps = document.getElementById('order-steps');
    if(steps) steps.style.display = 'none';
    return;
  }
  const steps = document.getElementById('order-steps');
  if(steps) steps.style.display = 'flex';

  const t = orderTotals();

  body.innerHTML = `
    <div class="order-card reveal in">
      <h3><i class="fa-solid fa-bag-shopping"></i> ملخص طلبك (${cart.reduce((s,i)=>s+i.qty,0)} قطعة)</h3>
      <div id="order-items-list">
        ${cart.map(item => `
          <div class="o-item">
            <div class="o-item-img"><img src="${item.image}" onerror="imgFallback(this, ${item.id})" alt="${item.name}"></div>
            <div class="o-item-info">
              <div class="o-item-name">${item.name}</div>
              <div class="o-item-meta">المقاس: ${item.size} · اللون: ${item.color}</div>
              <div class="o-item-qty">
                <button type="button" onclick="orderChangeQty('${item.key}',-1)">−</button>
                <span>${item.qty}</span>
                <button type="button" onclick="orderChangeQty('${item.key}',1)">+</button>
              </div>
            </div>
            <div class="o-item-price">${Math.round(itemFinalPrice(item)*item.qty)} ج.م</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="order-card reveal in">
      <h3><i class="fa-solid fa-ticket"></i> كود الخصم</h3>
      <div class="coupon-row">
        <input type="text" id="order-coupon-input" placeholder="اكتب الكود هنا">
        <button type="button" onclick="orderApplyCoupon()">تفعيل</button>
      </div>
      <div class="coupon-msg" id="order-coupon-msg"></div>
    </div>

    <div class="order-card reveal in">
      <h3><i class="fa-solid fa-user"></i> بيانات التوصيل</h3>
      <form id="order-form" onsubmit="submitFullOrder(event)">
        <div class="o-field">
          <label>الاسم بالكامل</label>
          <input type="text" id="order-name" required placeholder="اكتب اسمك">
        </div>
        <div class="o-field">
          <label>المحافظة</label>
          <input type="text" id="order-city" required placeholder="مثال: القاهرة، الجيزة، أسيوط...">
        </div>
        <div class="o-field">
          <label>العنوان بالتفصيل</label>
          <textarea id="order-address" rows="3" required placeholder="الحي، الشارع، رقم المبنى..."></textarea>
        </div>
        <div class="o-field">
          <label>رقم الهاتف</label>
          <input type="tel" id="order-phone" required placeholder="01xxxxxxxxx">
          <div class="o-hint">هنتواصل معاك على نفس الرقم لتأكيد الطلب</div>
        </div>
        <div class="o-field">
          <label>ملاحظات إضافية (اختياري)</label>
          <textarea id="order-notes" rows="2" placeholder="أي تفاصيل تحب تضيفها..."></textarea>
        </div>

        <label style="display:block; font-size:.78rem; font-weight:700; margin-bottom:9px;">طريقة الدفع</label>
        <div class="pay-options">
          <div class="pay-opt active" id="pay-cod" onclick="selectPayment('cod')">
            <i class="fa-solid fa-hand-holding-dollar"></i>
            <div class="pay-opt-info"><b>الدفع عند الاستلام</b><span>ادفع كاش لما الطلب يوصلك</span></div>
            <div class="check-circle"><i class="fa-solid fa-check"></i></div>
          </div>
          <div class="pay-opt" id="pay-wallet" onclick="selectPayment('wallet')">
            <i class="fa-solid fa-mobile-screen-button"></i>
            <div class="pay-opt-info"><b>محفظة إلكترونية</b><span>هنبعتلك رقم التحويل على واتساب</span></div>
            <div class="check-circle"><i class="fa-solid fa-check"></i></div>
          </div>
        </div>
      </form>
    </div>

    <div class="order-card reveal in">
      <h3><i class="fa-solid fa-receipt"></i> الفاتورة</h3>
      <div class="o-sum-row"><span>الإجمالي الفرعي</span><span id="order-sum-subtotal">${Math.round(t.subtotal)} ج.م</span></div>
      <div class="o-sum-row"><span>مصاريف الشحن</span><span>${SHIPPING} ج.م</span></div>
      <div class="o-sum-row" id="order-discount-row" style="${t.discountPct>0?'':'display:none;'}"><span>خصم الكوبون</span><span id="order-discount-val">-${t.discountPct}%</span></div>
      <div class="o-sum-total"><span>الإجمالي النهائي</span><span id="order-sum-total">${Math.round(t.total)} ج.م</span></div>
    </div>

    <button type="submit" form="order-form" class="btn btn-gold btn-full"><i class="fa-brands fa-whatsapp"></i> تأكيد الطلب عبر واتساب</button>
  `;
}

function orderChangeQty(key, delta){
  changeQty(key, delta);
  renderOrderPage();
}

function orderApplyCoupon(){
  const input = document.getElementById('order-coupon-input');
  const code = input.value.trim().toUpperCase();
  const msg = document.getElementById('order-coupon-msg');
  if(COUPONS[code]){
    appliedCoupon = code;
    localStorage.setItem('mallwi_coupon', code);
    msg.textContent = `✓ تم تفعيل كود "${code}"`;
    msg.style.color = '#3fb37f';
    updateOrderTotalsUI();
  } else {
    msg.textContent = 'الكود غير صحيح ✕';
    msg.style.color = '#c76357';
  }
}

function updateOrderTotalsUI(){
  const t = orderTotals();
  const subtotalEl = document.getElementById('order-sum-subtotal');
  const totalEl = document.getElementById('order-sum-total');
  const discountRow = document.getElementById('order-discount-row');
  const discountVal = document.getElementById('order-discount-val');
  if(subtotalEl) subtotalEl.textContent = Math.round(t.subtotal) + ' ج.م';
  if(totalEl) totalEl.textContent = Math.round(t.total) + ' ج.م';
  if(discountRow){
    if(t.discountPct > 0){
      discountRow.style.display = '';
      discountVal.textContent = '-' + t.discountPct + '%';
    } else {
      discountRow.style.display = 'none';
    }
  }
}

function selectPayment(type){
  selectedPayment = type;
  document.getElementById('pay-cod').classList.toggle('active', type==='cod');
  document.getElementById('pay-wallet').classList.toggle('active', type==='wallet');
}

function goStep(n){
  document.querySelectorAll('.o-step').forEach(s=>{
    const step = parseInt(s.dataset.step);
    s.classList.toggle('active', step===n);
    s.classList.toggle('done', step<n);
  });
}

/* ---------- إرسال الطلب على واتساب برسالة منسقة وأنيقة ---------- */
function submitFullOrder(e){
  e.preventDefault();
  const name = document.getElementById('order-name').value.trim();
  const city = document.getElementById('order-city').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const notes = document.getElementById('order-notes').value.trim();
  if(!name || !city || !address || !phone){ showToast('من فضلك أكمل بيانات الطلب'); return; }

  const cart = getCart();
  const t = orderTotals();

  const itemLines = cart.map((item,idx)=>
    `${idx+1}. ${item.name}\n   _المقاس: ${item.size} • اللون: ${item.color}_\n   ${item.qty} × ${Math.round(itemFinalPrice(item))} ج.م`
  ).join('\n\n');

  const payLabel = selectedPayment === 'cod' ? 'الدفع عند الاستلام' : 'محفظة إلكترونية';

  let msg = `🛍️ *طلب جديد من MALLWI BRAND*\n`;
  msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄\n\n`;
  msg += `👤 *الاسم:* ${name}\n`;
  msg += `🏙️ *المحافظة:* ${city}\n`;
  msg += `📍 *العنوان:* ${address}\n`;
  msg += `📱 *الهاتف:* ${phone}\n`;
  msg += `💳 *طريقة الدفع:* ${payLabel}\n`;
  if(notes) msg += `📝 *ملاحظات:* ${notes}\n`;
  msg += `\n┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
  msg += `🧾 *تفاصيل الطلب*\n\n`;
  msg += itemLines + '\n\n';
  msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
  if(t.discountPct>0) msg += `🏷️ *خصم الكوبون:* ${t.discountPct}%\n`;
  msg += `💰 *الإجمالي:* ${Math.round(t.afterCoupon)} ج.م\n`;
  msg += `🚚 *الشحن:* ${SHIPPING} ج.م\n`;
  msg += `✅ *الإجمالي النهائي:* ${Math.round(t.total)} ج.م\n\n`;
  msg += `شكرًا لتسوقكم مع *MALLWI BRAND* 🤍`;

  const url = 'https://wa.me/201202226786?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
  showOrderSuccess();
}

function showOrderSuccess(){
  goStep(3);
  const body = document.getElementById('order-body');
  body.innerHTML = `
    <div class="order-success reveal in">
      <i class="fa-solid fa-circle-check"></i>
      <h2 class="disp">تم فتح واتساب لتأكيد الطلب!</h2>
      <p>وصلتنا تفاصيل طلبك، أكّده من واتساب وهنبدأ نجهزه فورًا ونبعتلك عنوانك بأسرع وقت.</p>
      <a href="#" onclick="showHomeView();return false;" class="btn btn-gold">الرجوع للرئيسية</a>
    </div>`;
  saveCart([]);
  localStorage.removeItem('mallwi_coupon');
}

/* =================== مشاركة المنتج — شيت مشاركة أنيق وذكي =================== *
 * كل حاجة هنا بتتقرا لحظيًا من products.js، مفيش ولا ملف واحد بيتعمل لكل
 * منتج: رابط المشاركة بيوديك مباشرة لصفحته (men.html?id=.. أو women.html?id=..)
 * وبيفتحله المعاينة السريعة تلقائيًا. ضيف منتج جديد في products.js وهيبقى
 * جاهز للمشاركة فورًا من غير أي خطوة إضافية. */
const SITE_URL = 'https://mallwibrand.github.io/Wep';

/* خط تحته يعدي بيه كل حرف بشكل بصري حتى في نص عادي (واتساب/فيسبوك) */
function strikeThrough(str){
  return String(str).split('').map(ch => ch + '\u0336').join('');
}

function productShareUrl(product){
  const page = product.category === 'women' ? 'women.html' : 'men.html';
  return `${SITE_URL}/${page}?id=${product.id}`;
}

/* جمل تسويقية متنوعة بتتغيّر حسب المنتج عشان النص يبقى حي ومش مكرر */
const SHARE_HOOKS = [
  'قطعة هتخطف الأنظار من أول لبسة 😍',
  'من أكتر القطع المطلوبة عندنا دلوقتي 🔥',
  'ستايل يليق بيك، وسعر يريح جيبك ✨',
  'اختيار العارفين… متترددش وجرّبها 👑',
  'تصميم مميز وخامة تستاهل تتلبس كل يوم 💫',
  'العرض ده من اللي مابيتكررش كتير، سارع 🎯'
];

function buildShareCaption(product){
  const d = fakeDiscount(product.id, product.price);
  const oldPriceStruck = strikeThrough(d.old + ' ج.م');
  const link = productShareUrl(product);
  const hook = SHARE_HOOKS[product.id % SHARE_HOOKS.length];
  const desc = product.description ? `\n${product.description}\n` : '\n';
  return (
`✨ 𝗠𝗔𝗟𝗟𝗪𝗜 𝗕𝗥𝗔𝗡𝗗 ✨
${hook}

🛍️ ${product.name}${desc}
💰 كان بـ: ${oldPriceStruck}
🏷️ خصم ${d.pct}% لفترة محدودة بس
✅ دلوقتي بـ: ${product.price} ج.م فقط

🚚 شحن لكل محافظات مصر
💵 الدفع عند الاستلام
🔁 استبدال سهل لو مش مناسب

اطلبها دلوقتي قبل ما الكمية تخلص 👇
🔗 ${link}

MALLWI BRAND 🤍 — تصميم وتطوير YOUSSEF SOBHY`
  );
}

let _shareProduct = null;

/* بناء شيت المشاركة مرة واحدة بس وإضافته للصفحة (لو لسه مش موجود) */
function ensureShareSheet(){
  if(document.getElementById('share-sheet')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="share-overlay" id="share-overlay" onclick="closeShareSheet()"></div>
    <div class="share-sheet" id="share-sheet">
      <div class="share-handle"></div>
      <button class="modal-close" onclick="closeShareSheet()"><i class="fa-solid fa-xmark"></i></button>
      <div class="share-head">
        <i class="fa-solid fa-share-nodes"></i>
        <div>
          <h4>شارك القطعة دي</h4>
          <span>خلّي أصحابك يشوفوا اختيارك 🤍</span>
        </div>
      </div>
      <div class="share-preview" id="share-preview"></div>
      <div class="share-grid" id="share-grid"></div>
      <button class="btn btn-line btn-full share-copy-btn" id="share-copy-caption">
        <i class="fa-regular fa-copy"></i> نسخ نص العرض كامل
      </button>
    </div>`;
  document.body.appendChild(wrap);
}

function openShareSheet(product){
  ensureShareSheet();
  _shareProduct = product;
  const d = fakeDiscount(product.id, product.price);

  document.getElementById('share-preview').innerHTML = `
    <img src="${productImageUrl(product.id)}" onerror="imgFallback(this, ${product.id})" alt="${product.name}">
    <div class="share-preview-info">
      <div class="share-preview-name">${product.name}</div>
      <div class="share-preview-price">
        <span class="p-price">${product.price} ج.م</span>
        <span class="p-price-old">${d.old} ج.م</span>
        <span class="badge badge-off">-${d.pct}%</span>
      </div>
    </div>`;

  const nativeBtn = navigator.share
    ? `<button class="share-opt native" onclick="shareVia('native')"><span class="share-opt-ic"><i class="fa-solid fa-ellipsis"></i></span><span>المزيد</span></button>`
    : '';

  document.getElementById('share-grid').innerHTML = `
    <button class="share-opt wa" onclick="shareVia('whatsapp')"><span class="share-opt-ic"><i class="fa-brands fa-whatsapp"></i></span><span>واتساب</span></button>
    <button class="share-opt fb" onclick="shareVia('facebook')"><span class="share-opt-ic"><i class="fa-brands fa-facebook-f"></i></span><span>فيسبوك</span></button>
    <button class="share-opt tg" onclick="shareVia('telegram')"><span class="share-opt-ic"><i class="fa-brands fa-telegram"></i></span><span>تليجرام</span></button>
    <button class="share-opt tw" onclick="shareVia('twitter')"><span class="share-opt-ic"><i class="fa-brands fa-x-twitter"></i></span><span>X</span></button>
    <button class="share-opt lnk" onclick="shareVia('link')"><span class="share-opt-ic"><i class="fa-solid fa-link"></i></span><span>نسخ الرابط</span></button>
    ${nativeBtn}
  `;
  document.getElementById('share-copy-caption').onclick = ()=> shareVia('caption');

  document.getElementById('share-overlay').classList.add('open');
  document.getElementById('share-sheet').classList.add('open');
}

function closeShareSheet(){
  const o = document.getElementById('share-overlay');
  const s = document.getElementById('share-sheet');
  if(o) o.classList.remove('open');
  if(s) s.classList.remove('open');
}

function shareVia(channel){
  const product = _shareProduct;
  if(!product) return;
  const caption = buildShareCaption(product);
  const url = productShareUrl(product);

  switch(channel){
    case 'whatsapp':
      window.open('https://wa.me/?text=' + encodeURIComponent(caption), '_blank');
      break;
    case 'facebook':
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener,width=600,height=650');
      if(navigator.clipboard){
        navigator.clipboard.writeText(caption).then(()=> showToast('✓ اتنسخ نص العرض، الصقه في منشورك على فيسبوك')).catch(()=>{});
      }
      break;
    case 'telegram':
      window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(caption), '_blank');
      break;
    case 'twitter':
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(caption), '_blank');
      break;
    case 'link':
      if(navigator.clipboard){
        navigator.clipboard.writeText(url).then(()=> showToast('✓ اتنسخ رابط القطعة')).catch(()=> showToast('انسخ الرابط يدويًا: ' + url));
      }
      break;
    case 'caption':
      if(navigator.clipboard){
        navigator.clipboard.writeText(caption).then(()=> showToast('✓ اتنسخ نص العرض كامل')).catch(()=> showToast('تعذّر النسخ، حاول تاني'));
      }
      break;
    case 'native':
      if(navigator.share){
        navigator.share({ title: `${product.name} | MALLWI BRAND`, text: caption, url }).catch(()=>{});
      }
      break;
  }
  if(channel !== 'native') closeShareSheet(); else closeShareSheet();
}

/* دي الدالة اللي بتتنادى من كل كروت المنتجات والمعاينة السريعة */
function shareProduct(product){
  openShareSheet(product);
}

/* لو حد فتح لينك منتج بمشاركة (?id=) بيفتحله المعاينة السريعة أوتوماتيك */
function openSharedProductIfAny(){
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  if(!id || typeof ALL_PRODUCTS === 'undefined' || !ALL_PRODUCTS.length) return;
  if(typeof openQuickView === 'function'){
    setTimeout(()=> openQuickView(id), 300);
  }
}

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
  closeInstallModal();
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

/* ---------- نافذة الترحيب بتحميل التطبيق ---------- */
const INSTALL_DISMISS_KEY = 'mallwi_install_dismissed';

function openInstallModal(){
  const overlay = document.getElementById('install-overlay');
  if(overlay) overlay.classList.add('open');
}
function closeInstallModal(){
  const overlay = document.getElementById('install-overlay');
  if(overlay) overlay.classList.remove('open');
  localStorage.setItem(INSTALL_DISMISS_KEY, '1');
}

function initInstallModal(){
  const overlay = document.getElementById('install-overlay');
  if(!overlay) return;
  if(isStandalone()) return;
  if(localStorage.getItem(INSTALL_DISMISS_KEY)) return;
  setTimeout(()=> openInstallModal(), 1400);
}

/* ---------- شكرًا بعد تثبيت التطبيق فعليًا ---------- */
window.addEventListener('appinstalled', ()=>{
  localStorage.setItem(INSTALL_DISMISS_KEY, '1');
  const card = document.getElementById('install-card');
  const overlay = document.getElementById('install-overlay');
  if(card && overlay){
    card.innerHTML = `
      <div class="install-thanks">
        <i class="fa-solid fa-circle-check"></i>
        <h3 class="disp">شكرًا لتحميلك التطبيق! 🎉</h3>
        <p>تطبيق MALLWI BRAND بقى جاهز على شاشتك الرئيسية، مستنيينك تتسوّق أحلى قطعة</p>
      </div>`;
    overlay.classList.add('open');
    setTimeout(()=> overlay.classList.remove('open'), 3200);
  } else {
    showToast('🎉 شكرًا لتحميلك تطبيق MALLWI BRAND!');
  }
  const btn = document.getElementById('install-btn');
  if(btn) btn.style.display = 'none';
});

/* ---------- تهيئة عامة عند تحميل كل صفحة ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initReveal();
  renderCartBadge();
  initInstallHint();
  initInstallModal();
  openSharedProductIfAny();
  if(window.location.hash === '#order' && document.getElementById('order-view')){
    showOrderView();
  }
});
