/**
 * PakkhakhanaEngine (ปฏิทินปักขคณนา)
 * Library สำหรับคำนวณปฏิทินปักขคณนาตามคัมภีร์
 */
class PakkhakhanaEngine {
    constructor() {
        this.reset();
    }

    // เริ่มต้นกระดานใหม่ (Reset State)
    reset() {
        this.s = {
            sampayu: { currentL: 1, currentS: 1, maxL: 18, maxS: 17 },
            payu: { currentL: 1, currentS: 1, maxL: 11, maxS: 10, walkRow: 'large', cycle: 0 },
            samu: { currentL: 1, currentS: 1, maxL: 7, maxS: 6, walkRow: 'small', cycle: 0 },
            vag: { currentL: 1, currentS: 1, maxL: 4, maxS: 3, walkRow: 'large', cycle: 0 },
            pak: { currentL: 1, currentS: 1, maxL: 5, maxS: 4, walkRow: 'small', cycle: 0 },
            dithi: { currentL: 1, currentS: 1, maxL: 15, maxS: 14, walkRow: 'large', cycle: 0 },
            nextMoveIsDithi: true,
            pakAccumulator: 0
        };
        
        // กำหนดค่าเริ่มต้นตามกฎ
        this._determinePayuRowFromSampayu();
        this._determineSamuRowFromPayu();
        this._determineVagRowFromSamu();
        this._determinePakRowFromVag();
        this._determineDithiRowFromPak();
    }

    // --- Helper Methods (Internal Logic) ---
    _determineDithiRowFromPak() {
        const p = this.s.pak;
        this.s.dithi.walkRow = ((p.walkRow === 'large' && p.currentL === p.maxL) || (p.walkRow === 'small' && p.currentS === p.maxS)) ? 'small' : 'large';
    }
    _determinePakRowFromVag() {
        const v = this.s.vag;
        this.s.pak.walkRow = ((v.walkRow === 'large' && v.currentL === v.maxL) || (v.walkRow === 'small' && v.currentS === v.maxS)) ? 'large' : 'small';
    }
    _determineVagRowFromSamu() {
        const sm = this.s.samu;
        this.s.vag.walkRow = ((sm.walkRow === 'large' && sm.currentL === sm.maxL) || (sm.walkRow === 'small' && sm.currentS === sm.maxS)) ? 'small' : 'large';
    }
    _determineSamuRowFromPayu() {
        const py = this.s.payu;
        this.s.samu.walkRow = ((py.walkRow === 'large' && py.currentL === py.maxL) || (py.walkRow === 'small' && py.currentS === py.maxS)) ? 'large' : 'small';
    }
    _determinePayuRowFromSampayu() {
        this.s.payu.walkRow = (this.s.sampayu.currentL === this.s.sampayu.maxL) ? 'small' : 'large';
    }

    // --- Core Logic: เดินหมุด 1 วัน ---
    nextStep() {
        const b = this.s;

        if (b.nextMoveIsDithi) {
            if (b.dithi.walkRow === 'large') {
                if (b.dithi.currentL < b.dithi.maxL) b.dithi.currentL++;
                else { b.dithi.currentL = 1; b.nextMoveIsDithi = false; b.dithi.cycle++; }
            } else {
                if (b.dithi.currentS < b.dithi.maxS) b.dithi.currentS++;
                else { b.dithi.currentS = 1; b.nextMoveIsDithi = false; b.dithi.cycle++; }
            }
            if (b.nextMoveIsDithi) return;
        }

        if (!b.nextMoveIsDithi) {
            if (b.pak.walkRow === 'large') {
                if (b.pak.currentL < b.pak.maxL) b.pak.currentL++;
                else { b.pak.currentL = 1; b.pak.cycle++; 
b.pakAccumulator++; }
            } else {
                if (b.pak.currentS < b.pak.maxS) b.pak.currentS++;
                else { b.pak.currentS = 1; b.pak.cycle++; 
b.pakAccumulator++; }
            }
            
            this._determineDithiRowFromPak();

            if (b.pak.cycle > 0) {
                if (b.vag.walkRow === 'large') {
                    if (b.vag.currentL < b.vag.maxL) b.vag.currentL++;
                    else { b.vag.currentL = 1; b.vag.cycle++; }
                } else {
                    if (b.vag.currentS < b.vag.maxS) b.vag.currentS++;
                    else { b.vag.currentS = 1; b.vag.cycle++; }
                }
                b.pak.cycle = 0;
                this._determinePakRowFromVag();

                if (b.vag.cycle > 0) {
                    if (b.samu.walkRow === 'large') {
                        if (b.samu.currentL < b.samu.maxL) b.samu.currentL++;
                        else { b.samu.currentL = 1; b.samu.cycle++; }
                    } else {
                        if (b.samu.currentS < b.samu.maxS) b.samu.currentS++;
                        else { b.samu.currentS = 1; b.samu.cycle++; }
                    }
                    b.vag.cycle = 0;
                    this._determineVagRowFromSamu();

                    if (b.samu.cycle > 0) {
                        if (b.payu.walkRow === 'large') {
                            if (b.payu.currentL < b.payu.maxL) b.payu.currentL++;
                            else { b.payu.currentL = 1; b.payu.cycle++; }
                        } else {
                            if (b.payu.currentS < b.payu.maxS) b.payu.currentS++;
                            else { b.payu.currentS = 1; b.payu.cycle++; }
                        }
                        b.samu.cycle = 0;
                        this._determineSamuRowFromPayu();

                        if (b.payu.cycle > 0) {
                            if (b.sampayu.currentL < b.sampayu.maxL) b.sampayu.currentL++;
                            else b.sampayu.currentL = 1;
                            b.payu.cycle = 0;
                            this._determinePayuRowFromSampayu();
                        }
                    }
                }
            }
            b.nextMoveIsDithi = true;
        }
    }



    // เดินหน้าข้ามเวลา
    fastForward(days) {
        for (let i = 0; i < days; i++) this.nextStep();
    }

    // ดึงค่าสถานะปัจจุบัน
    getCurrentStatus() {
        const b = this.s;

console.log("pakL =",b.pak.currentL);
console.log("pakS =",b.pak.currentS);
console.log("pakAccumulator =",b.pakAccumulator);

        const dithiPos = (b.dithi.walkRow === 'large') ? b.dithi.currentL : b.dithi.currentS;
        const maxDithi = (b.dithi.walkRow === 'large') ? b.dithi.maxL : b.dithi.maxS;
        
        // 8 ค่ำ หรือ วันสิ้นปักข์ (14/15)
        let isWanPhra = (dithiPos === 8 || dithiPos === maxDithi);

        return {
            dithi: dithiPos,
            maxDithi: maxDithi,
            isWaxing: ((b.pakAccumulator) % 2 === 0), 
            isWanPhra: isWanPhra
        };


    }

    // Clone ตัวเอง (สำหรับ Simulation)
    clone() {
        const newEngine = new PakkhakhanaEngine();
        newEngine.s = JSON.parse(JSON.stringify(this.s));
        return newEngine;
    }
}

// Export for Universal Usage (Browser Global or Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PakkhakhanaEngine;
} else if (typeof window !== 'undefined') {
    window.PakkhakhanaEngine = PakkhakhanaEngine;
}
