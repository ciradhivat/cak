const CACHE_NAME = 'cak-store-v3'; // เปลี่ยนเวอร์ชันเพื่อทดสอบการ update ได้เลย
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // ตรวจสอบว่ามีไฟล์รูปนี้จริง หรือแก้เป็น path ที่ถูก
  './icon-512.png'
];

// 1. Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // ลบ self.skipWaiting() ออก เพื่อให้รอ User ยืนยันการอัปเดต
});

// 2. Activate Event
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

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// 4. Message Event (เพิ่มใหม่): เพื่อรับคำสั่ง update จาก index.html
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
