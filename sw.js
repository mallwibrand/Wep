/* ============================================================
   MALLWI BRAND — Service Worker
   بيخلي الموقع شغال أوفلاين وقابل للتثبيت كتطبيق
   ============================================================ */
const CACHE_NAME = 'mallwi-cache-v3';
const CORE_ASSETS = [
  'index.html',
  'men.html',
  'women.html',
  'style.css',
  'script.js',
  'shop.js',
  'products.js',
  'manifest.json',
  'imgs/brand.png',
  'imgs/icon-192.png',
  'imgs/icon-512.png'
];

/* الملفات دي بتتغيّر باستمرار (بيانات المنتجات وكل ملفات المنطق/الشكل)
   فلازم كل مرة نجيبها من النت الأول (Network First) عشان أي تعديل تعمله
   في products.js أو غيره يظهر فورًا من غير ما المستخدم يحتاج يمسح الكاش.
   لو النت مقطوع بيرجع ياخد آخر نسخة محفوظة عنده (Offline fallback). */
const NETWORK_FIRST = ['.html', '.js', '.css', '.json'];
function isNetworkFirst(url){
  return NETWORK_FIRST.some(ext => url.pathname.endsWith(ext));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (isNetworkFirst(url)) {
    // Network First: يجيب أحدث نسخة من النت، ولو فشل (أوفلاين) يرجع للكاش
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First: للصور وباقي الملفات الثابتة (أسرع وأخف على النت)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
