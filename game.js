/**
 * ============================================================
 * 🛠️ 寧靜音樂節：賽博火雞大逃亡 (Cyber Turkey Run) - 專業完整版
 * ============================================================
 * * 本程式碼整合以下核心功能：
 * 1. Google Chrome Dino 物理手感 (高重力、爆發起跳)
 * 2. 賽博龐克動態無限網格 (Parallax Grid)
 * 3. AABB 碰撞偵測 + 容錯邊距 (Hitbox Margins)
 * 4. 手機全螢幕 APP 式體驗
 * 5. 動態難度增加系統 (Speed Scaling)
 */

// 1. DOM 元素宣告
const gameWinUI = document.getElementById('game-window');
const runCanvas = document.getElementById('run-canvas');
const runCtx = runCanvas.getContext('2d');
const gameMsg = document.getElementById('game-msg');
const scoreBoard = document.getElementById('game-score');

// 2. 遊戲參數配置 (Config)
const TARGET_SCORE = 100;
const INITIAL_SPEED = 8;
const MAX_SPEED = 15;
const GRAVITY = 1.2;          // Google Dino 標竿重力
const JUMP_POWER = -18;       // Google Dino 標竿跳躍初速
const FLOOR_Y = 170;          // 地板 Y 座標 (配合 300 高度的畫布)
const HORIZON_Y = 230;        // 視覺天際線 (背景裝飾)
const HITBOX_MARGIN = 15;     // 碰撞容錯範圍 (像素)

// 3. 遊戲狀態變數
let gameReq;
let isPlaying = false;
let hasWon = false;
let score = 0;
let speed = INITIAL_SPEED;
let frames = 0;
let lastTime = 0;
let accumulator = 0;
const step = 1000 / 60; // 鎖定 60 FPS 物理計算

// 4. 遊戲物件宣告
const turkey = {
    x: 50,
    y: FLOOR_Y,
    size: 60,
    vy: 0,
    isJumping: false
};
let obstacles = [];

// ==========================================
// 🕹️ 核心控制邏輯
// ==========================================

function openGame() {
    gameWinUI.style.display = 'flex';
    // 提升 z-index 確保在最上層
    if (typeof topZ !== 'undefined') gameWinUI.style.zIndex = ++topZ;
    resetGame();
    drawStaticScene(); 
}

function closeGame() {
    gameWinUI.style.display = 'none';
    isPlaying = false;
    cancelAnimationFrame(gameReq);
}

/**
 * 重置遊戲環境與 UI
 */
function resetGame() {
    isPlaying = false;
    hasWon = false;
    score = 0;
    speed = INITIAL_SPEED;
    frames = 0;
    accumulator = 0;
    lastTime = 0;
    
    // 重置火雞位置
    turkey.y = FLOOR_Y;
    turkey.vy = 0;
    turkey.isJumping = false;
    obstacles = []; 
    
    // UI 重置
    scoreBoard.innerText = `SCORE: ${score}`;
    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'block'; 
    
    // 設定手機版/電腦版共用的置中提示
    gameMsg.style.display = 'flex'; 
    gameMsg.style.background = 'rgba(0,0,0,0.8)';
    gameMsg.style.flexDirection = 'column';
    gameMsg.style.justifyContent = 'center';
    gameMsg.style.alignItems = 'center';
    gameMsg.style.padding = '20px';
    
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #ff00ff; font-size: clamp(1.8rem, 6vw, 2.5rem); text-shadow: 2px 2px #000;">SYSTEM BREACH</h2>
        <p style="margin-top: 10px; font-size: clamp(0.9rem, 3vw, 1.2rem); text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 <</p>
    `;
}

/**
 * 跳躍觸發 (含起始遊戲判定)
 */
function jump() {
    if (gameWinUI.style.display === 'none') return;
    
    if (!isPlaying) {
        // 從起始畫面進入遊戲
        isPlaying = true;
        gameMsg.style.display = 'none'; 
        scoreBoard.style.display = 'block';
        lastTime = performance.now();
        gameReq = requestAnimationFrame(gameLoop); 
        return;
    }
    
    if (!turkey.isJumping && !hasWon) {
        turkey.vy = JUMP_POWER;
        turkey.isJumping = true;
    }
}

// 事件監聽：相容電腦鍵盤與手機觸控
window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
['mousedown', 'touchstart'].forEach(evt => {
    runCanvas.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
    gameMsg.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
});

// ==========================================
// 🎨 渲染引擎 (Renderer)
// ==========================================

function drawNeonGrid() {
    // 基礎背景
    runCtx.fillStyle = '#05020a'; 
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    
    // 網格樣式
    runCtx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
    runCtx.lineWidth = 2.5; 
    
    // 1. 繪製水平天際線
    runCtx.beginPath(); 
    runCtx.moveTo(0, HORIZON_Y); 
    runCtx.lineTo(runCanvas.width, HORIZON_Y); 
    runCtx.stroke();

    // 2. 繪製動態網格 (Parallax Effect)
    let bgOffset = isPlaying ? (frames * speed * 0.4) % 40 : 0;
    const vpX = runCanvas.width / 2; // 消失點 (Vanishing Point)

    runCtx.beginPath();
    // 橫向透視線
    for(let i = 1; i < 10; i++){
        let y = HORIZON_Y + Math.pow(i, 1.8) * 3;
        if(y > runCanvas.height) break;
        runCtx.moveTo(0, y);
        runCtx.lineTo(runCanvas.width, y);
    }
    // 縱向收縮線
    for(let x = -runCanvas.width; x < runCanvas.width * 2; x += 40){
        runCtx.moveTo(vpX, HORIZON_Y);
        runCtx.lineTo(x - bgOffset, runCanvas.height);
    }
    runCtx.stroke();
}

function drawTurkey() {
    runCtx.save();
    runCtx.scale(-1, 1); // 讓火雞面向右方跑
    runCtx.font = "60px Arial";
    // 繪製火雞，y+50 是為了讓腳部對齊 FLOOR_Y
    runCtx.fillText("🦃", -turkey.x - 60, turkey.y + 50);
    runCtx.restore();
}

function drawStaticScene() {
    drawNeonGrid();
    drawTurkey();
}

// ==========================================
// ⚙️ 遊戲主迴圈 (Main Loop)
// ==========================================

function gameLoop(timestamp) {
    if (!isPlaying) return;
    
    gameReq = requestAnimationFrame(gameLoop);

    // 計算 Delta Time
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 防止背景切換導致的巨量時間跳躍
    if (deltaTime > 100) deltaTime = step;
    accumulator += deltaTime;

    // --- 區塊 A: 物理與邏輯更新 (Update) ---
    while (accumulator >= step) {
        // 1. 重力運算
        turkey.vy += GRAVITY;
        turkey.y += turkey.vy;
        
        // 2. 落地判定
        if (turkey.y >= FLOOR_Y) {
            turkey.y = FLOOR_Y;
            turkey.isJumping = false;
            turkey.vy = 0;
        }

        // 3. 障礙物生成邏輯
        let canSpawn = true;
        if (obstacles.length > 0) {
            let lastObs = obstacles[obstacles.length - 1];
            if (runCanvas.width - lastObs.x < (250 + speed * 5)) canSpawn = false;
        }
        
        if (canSpawn && frames % 80 === 0 && Math.random() > 0.5) {
            const type = Math.random() > 0.4 ? "📺" : "🍍";
            obstacles.push({ x: runCanvas.width, y: 175, size: 55, type: type });
        }

        // 4. 碰撞偵測 (AABB with Margins)
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= speed;

            const m = HITBOX_MARGIN;
            if (turkey.x + m < obs.x + obs.size - m && 
                turkey.x + turkey.size - m > obs.x + m &&
                turkey.y + m < obs.y + obs.size - m && 
                turkey.y + turkey.size - m > obs.y + m) {
                gameOver();
                return;
            }
        }

        // 5. 分數計算與難度提升
        if (obstacles.length > 0 && obstacles[0].x < -60) {
            obstacles.shift();
            score += 10;
            scoreBoard.innerText = `SCORE: ${score}`;
            
            if (score >= TARGET_SCORE) { triggerWin(); return; }
            if (score % 30 === 0 && speed < MAX_SPEED) speed += 0.5;
        }

        frames++;
        accumulator -= step;
    }

    // --- 區塊 B: 畫面渲染 (Render) ---
    drawNeonGrid();
    drawTurkey();
    obstacles.forEach(obs => {
        runCtx.font = "55px Arial";
        runCtx.fillText(obs.type, obs.x, obs.y + 45);
    });
}

// ==========================================
// 🏆 結局處理 (Endings)
// ==========================================

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameReq);
    
    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'none';
    
    gameMsg.style.display = 'flex';
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.innerHTML = `
        <h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: clamp(1.5rem, 5vw, 2rem);">[ FATAL ERROR ]</h2>
        <p style="margin: 10px 0; font-size: clamp(1rem, 3vw, 1.2rem);">火雞已被攔截。最終分數: ${score}</p>
        <p class="blink" style="margin: 10px 0 0 0; font-size: 1rem; color: #ff00ff;">> 點擊重新連線 <</p>
    `;
}

function triggerWin() {
    isPlaying = false;
    hasWon = true;
    cancelAnimationFrame(gameReq); 
    
    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'none';
    
    gameMsg.style.display = 'flex';
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #00ff00; text-shadow: 2px 2px #000; font-size: clamp(1.2rem, 5vw, 1.8rem);">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin: 5px 0 0 0; font-size: clamp(0.8rem, 3.5vw, 1rem); color: #fff; text-align: center;">你成功駭入了寧靜系統！獲得隱藏折扣碼：</p>
        <div style="background: #ff00ff; color: #fff; padding: 10px 15px; margin: 10px 0; font-weight: bold; font-size: clamp(1.1rem, 5vw, 1.5rem); border: 2px solid #fff; word-break: break-all;">TURKEY_BREACH_2026</div>
        <p style="margin: 0; font-size: clamp(0.7rem, 2.5vw, 0.85rem); color: #aaa; text-align: center;">> 請截圖此畫面，至現場周邊攤位出示以享有優惠 <</p>
        <p class="blink" style="margin: 15px 0 0 0; font-size: clamp(0.8rem, 3vw, 1rem); color: #00ff00;">> 點擊畫面重新開始挑戰 <</p>
    `;
}