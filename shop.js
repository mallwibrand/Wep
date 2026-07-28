let ALL_PRODUCTS = [];
let qvState = { product:null, size:null, color:null, qty:1 };

function initShop(products){
  ALL_PRODUCTS = products;
  applyFilters();
}

function productCardHTML(p){
  const d = fakeDiscount(p.id, p.price);
  return `
  <div class="p-card">
    <div class="p-media" onclick="openQuickView(${p.id})">
      <img src="${productImageUrl(p.id)}" onerror="imgFallback(this, ${p.id})" alt="${p.name}" loading="lazy">
      <div class="p-badges">
        ${p.isNew?'<span class="badge badge-new">جديد</span>':''}
        <span class="badge badge-off">-${d.pct}%</span>
      </div>
      <div class="soon-tag"><i class="fa-regular fa-clock"></i> صورة توضيحية · قريبًا</div>
    </div>
    <div class="p-body">
      <div class="p-name">${p.name}</div>
      <div class="p-price-row">
        <span class="p-price">${p.price} ج.م</span>
        <span class="p-price-old">${d.old} ج.م</span>
      </div>
      <button class="p-add" onclick="openQuickView(${p.id})">إضافة للسلة</button>
    </div>
  </div>`;
}

function applyFilters(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const sort = document.getElementById('sort-select')?.value || 'default';

  let list = ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(q));

  if(sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price);
  else if(sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price);
  else if(sort === 'new') list = [...list].sort((a,b)=>(b.isNew?1:0)-(a.isNew?1:0));

  if(list.length === 0){
    grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-magnifying-glass" style="font-size:1.6rem;color:var(--brass);margin-bottom:10px;display:block;"></i>لا توجد نتائج مطابقة</div>';
    return;
  }
  grid.innerHTML = list.map(productCardHTML).join('');
}

/* ---------- Quick View ---------- */
function openQuickView(id){
  const p = ALL_PRODUCTS.find(x => x.id === id);
  if(!p) return;
  qvState = { product:p, size:p.sizes[0], color:p.colors[0], qty:1 };
  renderQuickView();
  document.getElementById('qv-overlay').classList.add('open');
}
function closeQuickView(){
  document.getElementById('qv-overlay').classList.remove('open');
}
function renderQuickView(){
  const p = qvState.product;
  const d = fakeDiscount(p.id, p.price);
  const box = document.getElementById('qv-box');
  box.innerHTML = `
    <button class="modal-close" onclick="closeQuickView()"><i class="fa-solid fa-xmark"></i></button>
    <div class="qv-media">
      <img src="${productImageUrl(p.id)}" onerror="imgFallback(this, ${p.id})" alt="${p.name}">
      <div class="soon-tag" style="position:absolute;left:12px;bottom:12px;right:12px;"><i class="fa-regular fa-clock"></i> صورة توضيحية · المنتج سيتوفر قريبًا</div>
    </div>
    <div class="qv-body">
      <h3>${p.name}</h3>
      <p class="qv-desc">${p.description}</p>
      <div class="qv-price"><span>${p.price} ج.م</span><span class="p-price-old">${d.old} ج.م</span><span class="p-off">-${d.pct}%</span></div>

      <div class="opt-label">المقاس</div>
      <div class="opt-row" id="qv-sizes">
        ${p.sizes.map(s=>`<button type="button" class="opt-pill ${s===qvState.size?'active':''}" onclick="setQvSize('${s}')">${s}</button>`).join('')}
      </div>

      <div class="opt-label">اللون</div>
      <div class="opt-row" id="qv-colors">
        ${p.colors.map(c=>`<button type="button" class="opt-pill ${c===qvState.color?'active':''}" onclick="setQvColor('${c}')">${c}</button>`).join('')}
      </div>

      <div class="qty-row">
        <button class="qty-btn" onclick="changeQvQty(-1)">−</button>
        <span id="qv-qty">${qvState.qty}</span>
        <button class="qty-btn" onclick="changeQvQty(1)">+</button>
      </div>

      <button class="btn btn-gold btn-full" onclick="addQvToCart()"><i class="fa-solid fa-bag-shopping"></i> إضافة للسلة</button>
    </div>
  `;
}
function setQvSize(s){ qvState.size = s; renderQuickView(); }
function setQvColor(c){ qvState.color = c; renderQuickView(); }
function changeQvQty(d){ qvState.qty = Math.max(1, qvState.qty + d); renderQuickView(); }
function addQvToCart(){
  addToCart(qvState.product, qvState.size, qvState.color, qvState.qty);
  closeQuickView();
}
