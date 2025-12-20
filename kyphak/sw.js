const CACHE_NAME = 'th-lat-note-v1';
const ASSETS = [
  './',
  './phakkypwa.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: Cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch: Network first, fall back to cache
// (Strategy นี้เหมาะกับแอปที่อาจมีการอัปเดตโค้ดบ่อย แต่ยังอยากให้ทำงาน offline ได้)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // ถ้าโหลดจากเน็ตสำเร็จ ให้ copy ลง cache ไว้ด้วย (update cache)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // ถ้าไม่มีเน็ต ให้ไปดึงจาก cache
        return caches.match(e.request);
      })
  );
});