// ==========================================
// ✨ 寧靜音樂節：賽博火雞大逃亡 (高解析重繪版) ✨
// ==========================================
const gameWinUI = document.getElementById('game-window');
const runCanvas = document.getElementById('run-canvas');
const runCtx = runCanvas.getContext('2d');
const gameMsg = document.getElementById('game-msg');
const scoreBoard = document.getElementById('game-score');

let gameReq, isPlaying = false, score = 0, speed = 8.5;
let frames = 0, lastTime = 0, accumulator = 0;
const step = 1000 / 60;
const TARGET_SCORE = 300;
const INITIAL_SPEED = 8.5;
const SPEED_UP_SCORE_STEP = 40;
const SPEED_INCREMENT = 0.4;
const SPAWN_RANDOM_RANGE = 35;
const SPAWN_BASE_FRAMES = 55;
let hasWon = false;
let couponClockTimer = null;

// 折價券即時時鐘：每秒更新簽發時間，讓店員辨識為「現場即時通關」而非舊截圖
function stopCouponClock() {
    if (couponClockTimer) { clearInterval(couponClockTimer); couponClockTimer = null; }
}
function formatCouponNow() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const HORIZON_Y = 220; const FLOOR_Y = 220; const GRAVITY = 1.0; const JUMP_POWER = -16;
const turkey = { x: 50, y: FLOOR_Y, size: 65, vy: 0, isJumping: false };
let obstacles = [];

// ✨ 重製版高解析賽博火雞 (16x16 網格精準繪製)
// 包含特徵：展開的霓虹扇尾、胖胖的咖啡色身體、明顯的紅肉垂、賽博腿
// p=霓虹粉尾, c=青色尾, b=咖啡色身, r=紅肉垂, y=黃嘴, w=白眼, k=黑瞳, o=橘腿
const turkeySprites = [
    [ // Frame 0: 跑步姿勢 1 (雙腿張開)
        "   p c p c p    ",
        "  c p c p c p   ",
        "   p c p c p   r",
        "  c p c p c p rry",
        "   p c bbbbb  wky",
        "    c bbbbbbb  r",
        "      bbbbbbbb  ",
        "      bbbbbbbb  ",
        "       bbbbbb   ",
        "        o   o   ",
        "       oo   oo  "
    ],
    [ // Frame 1: 跑步姿勢 2 (雙腿收攏交叉)
        "   c p c p c    ",
        "  p c p c p c   ",
        "   c p c p c   r",
        "  p c p c p c rry",
        "   c p bbbbb  wky",
        "    p bbbbbbb  r",
        "      bbbbbbbb  ",
        "      bbbbbbbb  ",
        "       bbbbbb   ",
        "         o      ",
        "        oo      "
    ],
    [ // Frame 2: 跳躍姿勢 (雙腿上縮)
        "   p c p c p    ",
        "  c p c p c p   ",
        "   p c p c p   r",
        "  c p c p c p rry",
        "   p c bbbbb  wky",
        "    c bbbbbbb  r",
        "      bbbbbbbb  ",
        "      bbbbbbbb  ",
        "       bbbbbb   ",
        "        oo oo   ",
        "                "
    ]
];

function openGame() { 
    gameWinUI.style.display = 'flex'; 
    if (typeof focusWindow === 'function') focusWindow(gameWinUI); 
    resetGame(); 
    drawStaticScene(); 
}

function closeGame() {
    gameWinUI.style.display = 'none';
    isPlaying = false;
    stopCouponClock();
    cancelAnimationFrame(gameReq);
    // ✨ 確保手機版拖曳後關閉，下次開啟能回到完美的置中預設位置
    gameWinUI.style.top = ''; 
    gameWinUI.style.left = ''; 
    gameWinUI.style.bottom = '';
    gameWinUI.style.right = '';
    gameWinUI.style.transform = '';
}

function setMsgStyle() {
    gameMsg.style.position = 'absolute'; gameMsg.style.top = '0'; gameMsg.style.left = '0'; gameMsg.style.width = '100%'; gameMsg.style.height = '100%';
    gameMsg.style.display = 'flex'; gameMsg.style.flexDirection = 'column'; gameMsg.style.alignItems = 'center';
    // safe center：內容裝得下就置中，超過高度時改從頂端對齊並可捲動，避免標題被裁切
    gameMsg.style.justifyContent = 'center'; gameMsg.style.justifyContent = 'safe center';
    gameMsg.style.overflowY = 'auto';
    gameMsg.style.padding = '10px'; gameMsg.style.boxSizing = 'border-box'; gameMsg.style.zIndex = '50';
}

function resetGame() {
    stopCouponClock();
    // 還原遊戲畫布的 8:3 比例（通關畫面會暫時解除以容納折價券）
    gameContentArea.style.setProperty('aspect-ratio', '8 / 3');
    gameContentArea.style.removeProperty('min-height');
    isPlaying = false; hasWon = false; score = 0; speed = INITIAL_SPEED; frames = 0; lastTime = 0; accumulator = 0;
    turkey.y = FLOOR_Y; turkey.vy = 0; turkey.isJumping = false; obstacles = [];
    scoreBoard.innerText = `SCORE: ${score}`; scoreBoard.style.display = 'none'; runCanvas.style.display = 'block';
    setMsgStyle(); gameMsg.style.background = 'rgba(0,0,0,0.6)';
    gameMsg.innerHTML = `<h2 class="blink" style="margin: 0; color: #ff00ff; font-size: clamp(1.8rem, 6vw, 2.5rem); text-shadow: 2px 2px #000;">SYSTEM BREACH</h2><p style="margin-top: 10px; font-size: clamp(0.9rem, 3vw, 1.2rem); color: #0f0; text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>`;
}

function jump() {
    if (gameWinUI.style.display === 'none') return;
    if (!isPlaying) { resetGame(); isPlaying = true; gameMsg.style.display = 'none'; scoreBoard.style.display = 'block'; lastTime = performance.now(); gameReq = requestAnimationFrame(gameLoop); return; }
    if (!turkey.isJumping && !hasWon) { turkey.vy = JUMP_POWER; turkey.isJumping = true; }
}

window.addEventListener('keydown', (e) => { if (e.code === 'Space' && gameWinUI.style.display === 'flex') { e.preventDefault(); jump(); } });

// 防反白與手勢阻絕
const gameContentArea = gameWinUI.querySelector('.window-content');
gameContentArea.addEventListener('pointerdown', (e) => {
    // 排除：關閉鈕、window-header（拖曳）、按鈕/連結（如通關畫面的 IG 按鈕）
    if (e.target.closest('.close-btn')) return;
    if (e.target.closest('.window-header')) return;
    if (e.target.closest('button, a')) return;
    if (e.cancelable) e.preventDefault();
    jump();
});
gameContentArea.addEventListener('dblclick', (e) => e.preventDefault());

function drawNeonGrid() {
    runCtx.fillStyle = '#05020a'; runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    runCtx.strokeStyle = 'rgba(255, 0, 255, 0.8)'; runCtx.lineWidth = 2.5;
    runCtx.beginPath(); runCtx.moveTo(0, HORIZON_Y); runCtx.lineTo(runCanvas.width, HORIZON_Y); runCtx.stroke();
    let bgOffset = isPlaying ? (frames * speed * 0.4) % 40 : 0; const vpX = runCanvas.width / 2;
    runCtx.beginPath();
    for(let i = 1; i < 10; i++){ let y = HORIZON_Y + Math.pow(i, 1.8) * 3; if(y > runCanvas.height) break; runCtx.moveTo(0, y); runCtx.lineTo(runCanvas.width, y); }
    for(let x = -runCanvas.width; x < runCanvas.width * 2; x += 40){ runCtx.moveTo(vpX, HORIZON_Y); runCtx.lineTo(x - bgOffset, runCanvas.height); }
    runCtx.stroke();
}

function drawPixelTurkey() {
    // 依據狀態決定當前影格
    const frameIndex = turkey.isJumping ? 2 : (Math.floor(frames / 6) % 2);
    const pattern = turkeySprites[frameIndex];
    
    // 計算單一像素方塊的大小 (配合 16 單位寬的陣列)
    const pSize = turkey.size / 16; 
    const startY = turkey.y - (pattern.length * pSize); 

    runCtx.save();
    // ✨ 修正：移除翻轉，讓火雞面向右邊
    const startX = turkey.x; 

    for (let r = 0; r < pattern.length; r++) {
        let row = pattern[r];
        for (let c = 0; c < row.length; c++) {
            let char = row[c];
            if (char !== ' ') {
                if (char === 'p') runCtx.fillStyle = '#ff00ff'; // 霓虹粉尾巴
                else if (char === 'c') runCtx.fillStyle = '#00ffff'; // 青色尾巴
                else if (char === 'b') runCtx.fillStyle = '#8b4513'; // 咖啡色身體
                else if (char === 'r') runCtx.fillStyle = '#ff0000'; // 紅色肉垂
                else if (char === 'y') runCtx.fillStyle = '#ffea00'; // 黃色嘴巴
                else if (char === 'w') runCtx.fillStyle = '#ffffff'; // 白色眼球
                else if (char === 'k') runCtx.fillStyle = '#000000'; // 黑色瞳孔
                else if (char === 'o') runCtx.fillStyle = '#ff8800'; // 橘色腿部
                
                runCtx.fillRect(startX + (c * pSize), startY + (r * pSize), pSize, pSize);
            }
        }
    }
    runCtx.restore();
}

function drawStaticScene() { drawNeonGrid(); drawPixelTurkey(); }

function gameLoop(timestamp) {
    if (!isPlaying) return;
    gameReq = requestAnimationFrame(gameLoop);
    let deltaTime = timestamp - lastTime; lastTime = timestamp;
    if (deltaTime > 100) deltaTime = step; accumulator += deltaTime;

    while (accumulator >= step) {
        turkey.vy += GRAVITY; turkey.y += turkey.vy;
        if (turkey.y >= FLOOR_Y) { turkey.y = FLOOR_Y; turkey.isJumping = false; turkey.vy = 0; }
        let canSpawn = true;
        if (obstacles.length > 0 && (runCanvas.width - obstacles[obstacles.length - 1].x < (250 + speed * 10))) canSpawn = false;
        if (canSpawn && frames % Math.floor(Math.random() * SPAWN_RANDOM_RANGE + SPAWN_BASE_FRAMES) === 0) obstacles.push({ x: runCanvas.width, y: FLOOR_Y, size: 55, type: Math.random() > 0.4 ? "📺" : "🍍" });

        const m = 15;
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i]; obs.x -= speed;
            let tL = turkey.x + m, tR = turkey.x + turkey.size - m, tT = turkey.y - turkey.size + m, tB = turkey.y - m;
            let oL = obs.x + m, oR = obs.x + obs.size - m, oT = obs.y - obs.size + m, oB = obs.y - m;
            if (tL < oR && tR > oL && tT < oB && tB > oT) { gameOver(); return; }
        }

        if (obstacles.length > 0 && obstacles[0].x < -60) {
            obstacles.shift(); score += 10; scoreBoard.innerText = `SCORE: ${score}`;
            if (score >= TARGET_SCORE) { triggerWin(); return; }
            if (score % SPEED_UP_SCORE_STEP === 0) speed += SPEED_INCREMENT;
        }
        frames++; accumulator -= step;
    }
    drawNeonGrid(); drawPixelTurkey();
    obstacles.forEach(obs => { runCtx.font = "55px Arial"; runCtx.textBaseline = "bottom"; runCtx.fillText(obs.type, obs.x, obs.y); });
}

function gameOver() {
    isPlaying = false; cancelAnimationFrame(gameReq); scoreBoard.style.display = 'none'; runCanvas.style.display = 'none'; setMsgStyle(); gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.innerHTML = `<h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: clamp(1.5rem, 5vw, 2rem);">[ FATAL ERROR ]</h2><p style="margin: 10px 0; font-size: clamp(1rem, 3vw, 1.2rem); color: #fff;">信號源已被攔截。最終分數: ${score}</p><p class="blink" style="margin: 10px 0 0 0; font-size: 1rem; color: #ff00ff;">> 點擊重新連線 &lt;</p>`;
}

function triggerWin() {
    isPlaying = false; hasWon = true; cancelAnimationFrame(gameReq); scoreBoard.style.display = 'none'; runCanvas.style.display = 'none'; setMsgStyle(); gameMsg.style.background = 'rgba(0,0,0,0.92)';
    // 通關畫面解除 8:3 比例並給足高度，讓折價券完整顯示（畫布此時已隱藏）
    // 用 important 覆寫手機 media query 的 aspect-ratio:8/3 !important
    gameContentArea.style.setProperty('aspect-ratio', 'auto', 'important');
    gameContentArea.style.setProperty('min-height', '300px', 'important');
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin:0; color:#00ff00; text-shadow:2px 2px #000; font-size:clamp(1.1rem,4.5vw,1.6rem);">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin:4px 0 8px; font-size:clamp(0.75rem,3vw,0.95rem); color:#fff; text-align:center;">火雞成功脫逃！系統掉出一張折價券</p>
        <div style="position:relative; width:min(86%,320px); padding:10px 16px; background:#0a1f0a; border:2px dashed #00ff00; border-radius:4px; box-shadow:0 0 12px rgba(0,255,0,0.35), inset 0 0 18px rgba(0,255,0,0.12); text-align:center; color:#00ff00; font-family:'DotGothic16',monospace;">
            <div style="font-size:clamp(0.7rem,2.8vw,0.85rem); letter-spacing:2px;">周邊折價券 · VOUCHER</div>
            <div style="font-size:clamp(1.8rem,8vw,2.4rem); font-weight:bold; line-height:1.1; margin:2px 0; text-shadow:2px 2px #000;">−$10</div>
            <div style="font-size:clamp(0.72rem,2.8vw,0.9rem); color:#fff;">周邊購買現折 10 元</div>
            <div style="margin-top:8px; border-top:1px solid rgba(0,255,0,0.4); padding-top:8px; font-size:clamp(0.6rem,2.3vw,0.72rem); color:#9fd99f; line-height:1.6; text-align:left;">
                · 購買時出示本通關畫面折抵<br>
                · 一人限用一次
            </div>
            <div style="margin-top:8px; font-size:clamp(0.58rem,2.2vw,0.7rem); color:#7fbf7f;">
                <span style="color:#ff0000; animation:blinker 1s linear infinite;">●</span> 簽發時間
                <span id="coupon-clock" style="color:#fff;">${formatCouponNow()}</span>
            </div>
        </div>
        <p class="blink" style="margin:8px 0 0; font-size:clamp(0.72rem,2.5vw,0.88rem); color:#555;">> 點擊畫面重新開始挑戰 &lt;</p>`;
    stopCouponClock();
    couponClockTimer = setInterval(() => {
        const el = document.getElementById('coupon-clock');
        if (!el) { stopCouponClock(); return; }
        el.textContent = formatCouponNow();
    }, 1000);
}
