const CACHE_NAME = 'cak-store-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install Event: เก็บไฟล์ลง Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 2. Activate Event: ลบ Cache เก่าทิ้งเมื่อมีการอัปเดต
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: ดึงข้อมูลจาก Cache ก่อน ถ้าไม่มีค่อยไปโหลดจากเน็ต
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // เจอใน cache ส่งกลับเลย
        }
        return fetch(event.request); // ไม่เจอ ไปโหลดใหม่
      })
  );
});