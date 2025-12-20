const CACHE_NAME = 'phak-reader-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './01.md',
    './02.md',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&family=Maitree:wght@300;500;700&display=swap',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 1. Install Event: Cache core assets immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Fetch Event: Network-First strategy (fallback to Cache)
// เหมาะสำหรับ Reader ที่อาจมีการแก้คำผิดในไฟล์ md แต่ถ้าไม่มีเน็ตก็อ่านไฟล์เก่าได้
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // ถ้าโหลดจากเน็ตได้ ให้ update cache ด้วย
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // ถ้าไม่มีเน็ต ให้ไปดึงจาก cache
                return caches.match(event.request);
            })
    );
});

// 3. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});