/* ============================================================
   MALLWI BRAND — مولّد صفحات المشاركة الثابتة (p/ID.html)
   ============================================================
   ليه محتاجين الملف ده؟
   الموقع كله صفحة واحدة تفاعلية (Client-Side) شغالة بـ JavaScript، ومواقع
   زي فيسبوك وواتساب وتليجرام لما بتعمل معاينة للينك بتقرا وسوم <meta> بس
   من غير ما تشغّل الجافاسكريبت. يعني لو شاركت لينك المنتج مباشرة
   (men.html?id=101) هيطلعلهم لوجو البراند العام مش صورة المنتج.

   الحل: السكربت ده بيولّد ملف HTML ثابت صغير لكل منتج جوه فولدر p/,
   فيه بس وسوم meta بصورة وسعر واسم المنتج، وبيحوّل أي زائر حقيقي فورًا
   لصفحة المنتج الحقيقية (رجالي/حريمي) وتفتحله المعاينة السريعة تلقائيًا.
   كراولر فيسبوك/واتساب بيقرا الميتا بتاعت صفحة p/ID.html ويطلع صورة
   المنتج صح، والمستخدم العادي مايحسش بأي فرق لأنه بيتحول فورًا.

   طريقة الاستخدام (مرة واحدة كل ما تضيف/تعدّل منتج في products.js):
     node generate-share-pages.js
   ثم ارفع فولدر p/ الجديد مع باقي ملفات الموقع.

   محتاج بس Node.js مثبت على جهازك (مفيش أي مكتبات خارجية مطلوبة). */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mallwibrand.github.io/Wep';
const ROOT = __dirname;

function loadProducts(){
  const code = fs.readFileSync(path.join(ROOT, 'products.js'), 'utf8');
  const fn = new Function(code + '\nreturn ALL_PRODUCTS_MASTER;');
  return fn();
}

function fakeDiscount(id, price){
  const seed = (id * 9301 + 49297) % 233280;
  const rnd = seed / 233280;
  const pct = 12 + Math.round(rnd * 26);
  let old = Math.round((price / (1 - pct/100)) / 5) * 5;
  if(old <= price) old = price + 20;
  return { pct, old };
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildPage(p){
  const page = p.category === 'women' ? 'women.html' : 'men.html';
  const targetUrl = `${SITE_URL}/${page}?id=${p.id}`;
  const imageUrl = `${SITE_URL}/imgs/products/${p.id}.jpg`;
  const d = fakeDiscount(p.id, p.price);
  const desc = `${p.name} — ${p.price} ج.م بدلاً من ${d.old} ج.م (خصم ${d.pct}%) | MALLWI BRAND`;
  const title = `${p.name} | MALLWI BRAND`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">

<meta property="og:type" content="product">
<meta property="og:site_name" content="MALLWI BRAND">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="500">
<meta property="og:image:height" content="650">
<meta property="og:url" content="${SITE_URL}/p/${p.id}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${imageUrl}">

<link rel="canonical" href="${targetUrl}">
<meta http-equiv="refresh" content="0; url=${targetUrl}">
<script>location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body>
<p style="font-family:sans-serif;text-align:center;padding:40px 20px;">
  جارِ تحويلك لصفحة المنتج… لو التحويل مايحصلش تلقائيًا،
  <a href="${targetUrl}">اضغط هنا</a>.
</p>
</body>
</html>
`;
}

function main(){
  const products = loadProducts();
  const outDir = path.join(ROOT, 'p');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  let count = 0;
  for(const p of products){
    const html = buildPage(p);
    fs.writeFileSync(path.join(outDir, `${p.id}.html`), html, 'utf8');
    count++;
  }
  console.log(`✓ تم توليد ${count} صفحة معاينة داخل فولدر p/`);
}

main();
