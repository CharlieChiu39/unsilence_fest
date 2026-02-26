// ==========================================
// ✨ 寧靜音樂節：賽博火雞大逃亡 (終極修正版) ✨
// ==========================================
const gameWinUI = document.getElementById('game-window');
const runCanvas = document.getElementById('run-canvas');
const runCtx = runCanvas.getContext('2d');
const gameMsg = document.getElementById('game-msg');
const scoreBoard = document.getElementById('game-score');

// 遊戲狀態與參數
let gameReq, isPlaying = false, score = 0, speed = 8;
let frames = 0, lastTime = 0, accumulator = 0;
const step = 1000 / 60; // 鎖定 60FPS 計算
const TARGET_SCORE = 100;
let hasWon = false;

// 🪐 物理引擎與畫布基準線
// 畫布總高度為 300，設定地平線與地板在 Y=220 的位置，留下方 80px 緩衝
const HORIZON_Y = 220; 
const FLOOR_Y = 220;   
const GRAVITY = 1.0;
const JUMP_POWER = -16;

// 火雞物件 (y 代表腳底座標)
const turkey = { x: 50, y: FLOOR_Y, size: 60, vy: 0, isJumping: false };
let obstacles = [];

// ==========================================
// 1. UI 與狀態控制
// ==========================================
function openGame() {
    gameWinUI.style.display = 'flex';
    if (typeof topZ !== 'undefined') gameWinUI.style.zIndex = ++topZ;
    resetGame();
    drawStaticScene();
}

function closeGame() {
    gameWinUI.style.display = 'none';
    isPlaying = false;
    cancelAnimationFrame(gameReq);
}

// 動態設定 UI 樣式，確保覆蓋並置中
function setMsgStyle() {
    gameMsg.style.position = 'absolute';
    gameMsg.style.top = '0';
    gameMsg.style.left = '0';
    gameMsg.style.width = '100%';
    gameMsg.style.height = '100%';
    gameMsg.style.display = 'flex';
    gameMsg.style.flexDirection = 'column';
    gameMsg.style.justifyContent = 'center';
    gameMsg.style.alignItems = 'center';
    gameMsg.style.padding = '10px';
    gameMsg.style.boxSizing = 'border-box';
    gameMsg.style.zIndex = '50';
}

function resetGame() {
    isPlaying = false; hasWon = false; score = 0; speed = 8; frames = 0; lastTime = 0; accumulator = 0;
    turkey.y = FLOOR_Y; turkey.vy = 0; turkey.isJumping = false; obstacles = [];

    scoreBoard.innerText = `SCORE: ${score}`;
    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'block';

    setMsgStyle();
    gameMsg.style.background = 'rgba(0,0,0,0.6)';
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #ff00ff; font-size: clamp(1.8rem, 6vw, 2.5rem); text-shadow: 2px 2px #000;">SYSTEM BREACH</h2>
        <p style="margin: 10px 0 0 0; font-size: clamp(0.9rem, 3vw, 1.2rem); color: #0f0; text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>
    `;
}

function jump() {
    if (gameWinUI.style.display === 'none') return;
    if (!isPlaying) {
        resetGame();
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

// 註冊所有點擊與按鍵事件
window.addEventListener('keydown', (e) => { if (e.code === 'Space' && gameWinUI.style.display === 'flex') { e.preventDefault(); jump(); }});
['mousedown', 'touchstart'].forEach(evt => {
    runCanvas.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
    gameMsg.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
});

// ==========================================
// 2. 核心繪圖 (Render)
// ==========================================
function drawNeonGrid() {
    runCtx.fillStyle = '#05020a';
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    runCtx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
    runCtx.lineWidth = 2.5;

    // 地平線
    runCtx.beginPath();
    runCtx.moveTo(0, HORIZON_Y);
    runCtx.lineTo(runCanvas.width, HORIZON_Y);
    runCtx.stroke();

    let bgOffset = isPlaying ? (frames * speed * 0.4) % 40 : 0;
    const vpX = runCanvas.width / 2;

    runCtx.beginPath();
    for(let i = 1; i < 10; i++){
        let y = HORIZON_Y + Math.pow(i, 1.8) * 3;
        if(y > runCanvas.height) break;
        runCtx.moveTo(0, y); runCtx.lineTo(runCanvas.width, y);
    }
    for(let x = -runCanvas.width; x < runCanvas.width * 2; x += 40){
        runCtx.moveTo(vpX, HORIZON_Y); runCtx.lineTo(x - bgOffset, runCanvas.height);
    }
    runCtx.stroke();
}

function drawTurkey() {
    runCtx.save();
    runCtx.scale(-1, 1);
    runCtx.font = "60px Arial";
    // ✨ 精確對齊法：讓圖案底部完美貼合 turkey.y (也就是 FLOOR_Y)
    runCtx.textBaseline = "bottom"; 
    runCtx.fillText("🦃", -turkey.x - turkey.size, turkey.y);
    runCtx.restore();
}

function drawStaticScene() { drawNeonGrid(); drawTurkey(); }

// ==========================================
// 3. 遊戲主迴圈 (Update)
// ==========================================
function gameLoop(timestamp) {
    if (!isPlaying) return;
    gameReq = requestAnimationFrame(gameLoop);

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (deltaTime > 100) deltaTime = step;
    accumulator += deltaTime;

    while (accumulator >= step) {
        // 重力與落地
        turkey.vy += GRAVITY;
        turkey.y += turkey.vy;
        if (turkey.y >= FLOOR_Y) { turkey.y = FLOOR_Y; turkey.isJumping = false; turkey.vy = 0; }

        // 生成障礙物
        let canSpawn = true;
        if (obstacles.length > 0 && (runCanvas.width - obstacles[obstacles.length - 1].x < (250 + speed * 10))) {
            canSpawn = false;
        }
        if (canSpawn && frames % Math.floor(Math.random() * 40 + 60) === 0) {
            obstacles.push({ x: runCanvas.width, y: FLOOR_Y, size: 55, type: Math.random() > 0.4 ? "📺" : "🍍" });
        }

        // 移動與碰撞偵測
        const m = 15; // 內縮 15px 增加容錯
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= speed;

            // 完美的 AABB 碰撞矩形
            let tL = turkey.x + m, tR = turkey.x + turkey.size - m;
            let tT = turkey.y - turkey.size + m, tB = turkey.y - m;
            let oL = obs.x + m, oR = obs.x + obs.size - m;
            let oT = obs.y - obs.size + m, oB = obs.y - m;

            if (tL < oR && tR > oL && tT < oB && tB > oT) {
                gameOver(); return;
            }
        }

        // 計分與加速
        if (obstacles.length > 0 && obstacles[0].x < -60) {
            obstacles.shift(); score += 10;
            scoreBoard.innerText = `SCORE: ${score}`;
            if (score >= TARGET_SCORE) { triggerWin(); return; }
            if (score % 30 === 0) speed += 0.5;
        }

        frames++; accumulator -= step;
    }

    // 畫面繪製
    drawNeonGrid();
    drawTurkey();
    obstacles.forEach(obs => {
        runCtx.font = "55px Arial";
        runCtx.textBaseline = "bottom";
        runCtx.fillText(obs.type, obs.x, obs.y);
    });
}

// ==========================================
// 4. 結局 UI
// ==========================================
function gameOver() {
    isPlaying = false; cancelAnimationFrame(gameReq);
    scoreBoard.style.display = 'none'; runCanvas.style.display = 'none';
    setMsgStyle();
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.innerHTML = `
        <h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: clamp(1.5rem, 5vw, 2rem);">[ FATAL ERROR ]</h2>
        <p style="margin: 10px 0; font-size: clamp(1rem, 3vw, 1.2rem); color: #fff;">火雞已被攔截。最終分數: ${score}</p>
        <p class="blink" style="margin: 10px 0 0 0; font-size: 1rem; color: #ff00ff;">> 點擊重新連線 &lt;</p>
    `;
}

function triggerWin() {
    isPlaying = false; hasWon = true; cancelAnimationFrame(gameReq);
    scoreBoard.style.display = 'none'; runCanvas.style.display = 'none';
    setMsgStyle();
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #00ff00; text-shadow: 2px 2px #000; font-size: clamp(1.2rem, 5vw, 1.8rem);">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin: 5px 0 0 0; font-size: clamp(0.8rem, 3.5vw, 1rem); color: #fff; text-align: center;">你成功駭入了寧靜系統！獲得隱藏折扣碼：</p>
        <div style="background: #ff00ff; color: #fff; padding: 5px 10px; margin: 10px 0; font-weight: bold; font-size: clamp(1.1rem, 5vw, 1.5rem); border: 2px solid #fff; word-break: break-all;">TURKEY_BREACH_2026</div>
        <p style="margin: 0; font-size: clamp(0.7rem, 2.5vw, 0.85rem); color: #aaa; text-align: center;">> 請截圖此畫面，至現場周邊攤位出示以享有優惠 &lt;</p>
        <p class="blink" style="margin: 15px 0 0 0; font-size: clamp(0.8rem, 3vw, 1rem); color: #00ff00;">> 點擊畫面重新開始挑戰 &lt;</p>
    `;
}