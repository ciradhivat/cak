const CACHE_NAME = 'pfäk-ide-v3'; // อัปเดตเวอร์ชัน cache
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ติดตั้ง Service Worker และ Cache ไฟล์
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ทำงานเมื่อมีการเรียกใช้ข้อมูล (Network First, fallback to Cache)
// วิธีนี้ดีสำหรับ Editor เพื่อให้แน่ใจว่าได้โค้ดล่าสุดเสมอ แต่ถ้าเน็ตหลุดก็ยังใช้ได้
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// ลบ Cache เก่าเมื่อมีการอัปเดต Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});