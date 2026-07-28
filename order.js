/* ============================================================
   MALLWI BRAND — صفحة إتمام الطلب الكاملة (order.html)
   ============================================================ */

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
        <a href="index.html" class="btn btn-gold">الرجوع للتسوق</a>
      </div>`;
    document.getElementById('order-steps').style.display = 'none';
    return;
  }

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
  changeQty(key, delta); // من script.js
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
      <a href="index.html" class="btn btn-gold">الرجوع للرئيسية</a>
    </div>`;
  // نفضّي السلة بعد التأكيد
  saveCart([]);
  localStorage.removeItem('mallwi_coupon');
}

document.addEventListener('DOMContentLoaded', ()=>{
  goStep(1);
  renderOrderPage();
});
