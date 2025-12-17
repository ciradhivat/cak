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
    'mailto: ciradhivat@gmail.com',
    publicVapidKey,
    privateVapidKey
);

// 2. คำนวณวันพระ
// หมายเหตุ: เนื่องจาก PakkhakhanaEngine ในตัวอย่างเป็นแบบ Reset state
// คุณจำเป็นต้องปรับ Logic ตรงนี้ให้ Sync กับวันที่จริง (Anchor Date)
function checkTodayStatus() {
    // ใช้ PakkhakhanaEngine เพื่อคำนวณวันพระ
    const engine = new PakkhakhanaEngine();
    
    // TODO: ใส่ Logic เทียบวันที่จริงตรงนี้
    // ปัจจุบัน: ใช้ตัวอย่างวันที่เพื่อทดสอบ
    // สำหรับการใช้งานจริง ต้องคำนวณจำนวนวันตั้งแต่ anchor date
    const anchorDate = new Date('1736-01-28); // ตัวอย่าง anchor date
    const today = new Date();
    
    // คำนวณจำนวนวันจาก anchor date ถึงวันนี้
    const diffTime = Math.abs(today - anchorDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Fast forward ไปยังวันปัจจุบัน
    engine.fastForward(diffDays);
    
    // ดึงสถานะปัจจุบัน
    const status = engine.getCurrentStatus();
    const isWanPhra = status.isWanPhra; // ได้ค่า isWanPhra จากการคำนวณ
    
    if (isWanPhra) {
        return {
            shouldNotify: true,
            title: "แจ้งเตือนจาก GitHub Actions",
            body: "วันนี้เป็นวันพระ"
        };
    } else {
        return {
            shouldNotify: true, // ตั้งค่าเป็น true ถ้าต้องการแจ้งเตือนทุกวัน
            title: "แจ้งเตือนจาก GitHub Actions",
            body: "วันนี้ไม่ใช่วันพระ"
        };
    }
}

const status = checkTodayStatus();

if (status.shouldNotify) {
    const pushSubscription = JSON.parse(subscriptionJson);

    const payload = JSON.stringify({
        title: status.title,
        body: status.body,
        icon: 'icon-192.png'
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