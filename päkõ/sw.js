const CACHE_NAME = 'pakkhakhana-static-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/pakkhakhana.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// --- ส่วนรับ Push Notification ---
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'วันพระ', body: event.data.text() };
    }
  }

  const title = data.title || 'วันนี้วันพระ';
  const options = {
    body: data.body || 'เช็คปฏิทินปักขคณนาของคุณได้เลย',
    // ใช้ไอคอนปฏิทินตามที่ขอ
    icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png', 
    badge: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});
