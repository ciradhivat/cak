const webpush = require('web-push');

// 1. ใส่ VAPID Keys ของคุณ (ต้องตรงกับที่ใช้ใน index.html)
// ถ้าคุณทำหาย หรือจำ Private Key ไม่ได้ ต้องไป Generate ใหม่ทั้งคู่
const vapidKeys = {
  publicKey: 'BKUDmY_hkeUeuFfdc77JgVgacjVpkHlESB84o-Y83-MHVXINvvxaJ7bfvGV9MmNgYuRReQ0PdAYlGPMmDIqdwZg',
  privateKey: 'YoNdBJf14pdo47TZec0Z7Y-FomEF_HoXoI5DQXK25ss' // <--- เอา Private Key มาใส่ตรงนี้
};

// ตั้งค่า VAPID
webpush.setVapidDetails(
  'mailto: ciradhivat@gmail.com', // อีเมลผู้ดูแล (ใส่เมลมั่วๆ ก็ได้สำหรับการเทสต์)
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 2. เอา JSON ที่คุณได้มา "วางตรงนี้"
const pushSubscription = {
  endpoint: "https://fcm.googleapis.com/wp/e9bk0OFzVuk:APA91bGGkF4RKeMl2n7Swglv134RY6P0sTkV5vQcj28YmrM3afxabZbx5lxswwKtftoHDfhINxlLIP2FYIfJrQBFo-7SVnE1vcXnY4Gd-QyahUzNB8oq4BM5kjWAE7PdxzMytomwgjJ1",
  expirationTime: null,
  keys: {
    p256dh: "BLotU5EcWaHbrQ155yWfo_cb6Ory6EXt1z0nM0uE0O4Jd1HTi0o3qXf8H1Y8jVDwjKcPSg1ierhTs7-ozOtNoKM",
    auth: "vZRgUFNM_tSckFUuOZGEbg"
  }
};

// 3. ข้อมูลที่จะส่ง
const payload = JSON.stringify({
  title: 'แจ้งเตือนวันพระ',
  body: 'ทดสอบส่งจาก Server สำเร็จแล้ว!',
  icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
});

// 4. สั่งยิง!
webpush.sendNotification(pushSubscription, payload)
  .then(response => console.log('✅ ส่งสำเร็จ!', response.statusCode))
  .catch(error => console.error('❌ ส่งไม่ผ่าน:', error));

