const CACHE_NAME = 'pakkhakhana-static-v4';
const ASSETS = [
  './',
  './index.html',
  './pakkhakhana.js',
  './manifest.json'
];

// 1. Install & Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 2. Activate & Cleanup
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

// 3. Fetch Strategy (Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// --- 4. Push Event (หัวใจสำคัญ) ---
self.addEventListener('push', (event) => {
  let data = {};
  
  // พยายามแกะ JSON ถ้า Server ส่งมา
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'แจ้งเตือนวันพระ', body: event.data.text() };
    }
  } else {
    // กรณีทดสอบแบบไม่ส่ง Data มาเลย
    data = { title: 'แจ้งเตือนวันพระ', body: 'ถึงเวลาตรวจสอบปฏิทินแล้ว' };
  }

  const options = {
    body: data.body,
    // ใช้ไอคอนพื้นฐานถ้าไม่มีไอคอนเฉพาะ
    icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    vibrate: [100, 50, 100],
    data: {
      url: './index.html'
    },
    // Actions เพิ่มเติม (ถ้า Browser รองรับ)
    actions: [
        { action: 'open', title: 'เปิดดูเลย' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'วันพระ', options)
  );
});

// 5. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // พยายามเปิดหน้าต่างที่มีอยู่แล้ว หรือเปิดใหม่
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. ถ้ามีหน้า index.html เปิดอยู่ ให้ Focus
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. ถ้าไม่มี ให้เปิดใหม่
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});


