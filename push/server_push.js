const webPush = require('web-push');
const fs = require('fs');

// นำเข้า Logic ปฏิทิน (ต้องแน่ใจว่าไฟล์ pakkhakhana.js อยู่ในโฟลเดอร์เดียวกัน)
// และในไฟล์ pakkhakhana.js ต้องมี module.exports = PakkhakhanaEngine; ที่บรรทัดสุดท้าย
const PakkhakhanaEngine = require('./pakkhakhana.js');

// 1. รับค่า Keys จาก GitHub Secrets (เพื่อความปลอดภัย)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
// ข้อมูล Subscription ของผู้ใช้ (ในระบบจริงควรดึงจาก Database)
// สำหรับ GitHub Actions เราจะเก็บ JSON ของคุณไว้ใน Secret ชื่อ 'SUBSCRIPTION_JSON'
const subscriptionJson = process.env.SUBSCRIPTION_JSON; 

if (!publicVapidKey || !privateVapidKey || !subscriptionJson) {
    console.error("❌ Error: Missing Environment Variables (VAPID Keys or Subscription)");
    process.exit(1);
}

// ตั้งค่า Web Push
webPush.setVapidDetails(
    'mailto:ciradhivat@gmail.com',
    publicVapidKey,
    privateVapidKey
);

// 2. คำนวณวันพระ
// หมายเหตุ: เนื่องจาก PakkhakhanaEngine ในตัวอย่างเป็นแบบ Reset state
// คุณจำเป็นต้องปรับ Logic ตรงนี้ให้ Sync กับวันที่จริง (Anchor Date)
// ในตัวอย่างนี้ ผมจะสมมติการส่งแจ้งเตือนแบบ "ทดสอบ" เพื่อให้มั่นใจว่าระบบทำงาน
function checkTodayStatus() {
    // TODO: ใส่ Logic เทียบวันที่จริงตรงนี้
    // ตัวอย่าง: ถ้าวันนี้ตรงกับเงื่อนไข ให้ return ข้อความ
    
    // เพื่อให้ทดสอบผ่าน GitHub Actions ได้ ผมจะส่งข้อความทุกครั้งที่รัน
    // ในใช้งานจริง คุณสามารถใส่ if (isWanPhra) {...} ครอบไว้
    if (isWanPhra) {
    return {
        shouldNotify: true,
        title: "แจ้งเตือนจาก GitHub Actions",
        body: "ทดสอบระบบแจ้งเตือนประจำวัน (Run via Workflow)"
    };
    }
}

const status = checkTodayStatus();

if (status.shouldNotify) {
    const pushSubscription = JSON.parse(subscriptionJson);

    const payload = JSON.stringify({
        title: status.title,
        body: status.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
    });

    console.log("🚀 กำลังส่งแจ้งเตือน...");

    webPush.sendNotification(pushSubscription, payload)
        .then(response => console.log(`✅ ส่งสำเร็จ! Status: ${response.statusCode}`))
        .catch(error => {
            console.error("❌ ส่งไม่ผ่าน:", error);
            process.exit(1);
        });
} else {
    console.log("วันนี้ไม่มีการแจ้งเตือน");
}

