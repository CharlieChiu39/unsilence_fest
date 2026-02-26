// ==========================================
// ✨ 彩蛋遊戲：賽博火雞大逃亡 (Cyber Turkey Run) ✨
// ==========================================
const gameWinUI = document.getElementById('game-window');
const runCanvas = document.getElementById('run-canvas');
const runCtx = runCanvas.getContext('2d');
const gameMsg = document.getElementById('game-msg');
const scoreBoard = document.getElementById('game-score');

let gameReq, isPlaying = false, score = 0, speed = 8;
let frames = 0;

// 🎯 解鎖彩蛋的目標分數
const TARGET_SCORE = 100;
let hasWon = false;

// 🔥 固定時間步長 (Fixed Time Step) 變數
let lastTime = 0;
let accumulator = 0;
const step = 1000 / 60; // 60 FPS

// 🦖 小恐龍物理引擎設定 (高重力、爆發跳躍、大尺寸)
const FLOOR_Y = 170;
const turkey = { x: 50, y: FLOOR_Y, size: 60, vy: 0, gravity: 1.2, jumpPower: -18, isJumping: false };
let obstacles = [];

// ==========================================
// 1. 遊戲視窗與 UI 控制
// ==========================================
function openGame() {
    gameWinUI.style.display = 'flex';
    if (typeof topZ !== 'undefined') {
        gameWinUI.style.zIndex = ++topZ;
    }
    resetGame();
    drawStaticScene();
}

function closeGame() {
    gameWinUI.style.display = 'none';
    isPlaying = false;
    cancelAnimationFrame(gameReq);
}

function resetGame() {
    isPlaying = false; hasWon = false; score = 0; speed = 8; frames = 0; lastTime = 0; accumulator = 0;
    turkey.y = FLOOR_Y; turkey.vy = 0; turkey.isJumping = false; obstacles = [];

    scoreBoard.innerText = `SCORE: ${score}`;
    scoreBoard.style.display = 'none'; // 尚未開始前隱藏分數防重疊
    runCanvas.style.display = 'block';

    // ✨ 滿版覆蓋排版：絕對居中、禁止滾動、彈性字體
    gameMsg.style.position = 'absolute';
    gameMsg.style.top = '0';
    gameMsg.style.left = '0';
    gameMsg.style.width = '100%';
    gameMsg.style.height = '100%';
    gameMsg.style.background = 'rgba(0,0,0,0.6)';
    gameMsg.style.display = 'flex';
    gameMsg.style.flexDirection = 'column';
    gameMsg.style.justifyContent = 'center';
    gameMsg.style.alignItems = 'center';
    gameMsg.style.overflowY = 'hidden';
    gameMsg.style.padding = '0';
    gameMsg.style.boxSizing = 'border-box';

    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #ff00ff; font-size: clamp(1.8rem, 6vw, 2.5rem); text-shadow: 2px 2px #000;">SYSTEM BREACH</h2>
        <p style="margin-top: 10px; font-size: clamp(0.9rem, 3vw, 1.2rem); text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>
    `;
}

// ==========================================
// 2. 玩家操作邏輯
// ==========================================
function jump() {
    if (gameWinUI.style.display === 'none') return;

    if (!isPlaying) {
        resetGame();
        isPlaying = true;
        gameMsg.style.display = 'none';
        scoreBoard.style.display = 'block'; // 正式起跑才顯示分數
        gameReq = requestAnimationFrame(gameLoop);
        return;
    }

    if (!turkey.isJumping && !hasWon) {
        turkey.vy = turkey.jumpPower;
        turkey.isJumping = true;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameWinUI.style.display === 'flex') {
        e.preventDefault();
        jump();
    }
});

const startEvents = ['mousedown', 'touchstart'];
startEvents.forEach(evt => {
    runCanvas.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
    gameMsg.addEventListener(evt, (e) => { if(evt === 'touchstart') e.preventDefault(); jump(); }, {passive: false});
});

// ==========================================
// 3. 畫面繪製與動畫迴圈
// ==========================================
let bgOffset = 0;

function drawNeonGrid() {
    runCtx.fillStyle = '#05020a';
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);

    runCtx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
    runCtx.lineWidth = 2.5;

    const horizonY = 230;
    const vpX = runCanvas.width / 2;
    const gridSpacing = 40;

    runCtx.beginPath();
    runCtx.moveTo(0, horizonY);
    runCtx.lineTo(runCanvas.width, horizonY);
    runCtx.stroke();

    if (isPlaying) bgOffset = (bgOffset + speed * 0.4) % gridSpacing;

    runCtx.beginPath();
    for(let i = 1; i < 10; i++){
        let y = horizonY + Math.pow(i, 1.8) * 3;
        if(y > runCanvas.height) break;
        runCtx.moveTo(0, y);
        runCtx.lineTo(runCanvas.width, y);
    }
    for(let x = -runCanvas.width; x < runCanvas.width * 2; x += gridSpacing){
        let movingX = x - bgOffset;
        runCtx.moveTo(vpX, horizonY);
        runCtx.lineTo(movingX, runCanvas.height);
    }
    runCtx.stroke();
}

function drawTurkey() {
    runCtx.save();
    runCtx.scale(-1, 1);
    runCtx.font = "60px Arial";
    runCtx.fillText("🦃", -turkey.x - 60, turkey.y + 50);
    runCtx.restore();
}

function drawStaticScene() {
    bgOffset = 0;
    drawNeonGrid();
    drawTurkey();
}

function gameLoop(timestamp) {
    if (!isPlaying) return;

    gameReq = requestAnimationFrame(gameLoop);

    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (deltaTime > 1000) deltaTime = step;
    accumulator += deltaTime;

    // --- 區塊 A: 邏輯運算 (Update) ---
    while (accumulator >= step) {
        turkey.vy += turkey.gravity;
        turkey.y += turkey.vy;

        if (turkey.y >= FLOOR_Y) {
            turkey.y = FLOOR_Y;
            turkey.isJumping = false;
            turkey.vy = 0;
        }

        let canSpawn = true;
        if (obstacles.length > 0) {
            let lastObs = obstacles[obstacles.length - 1];
            let minGap = 250 + (speed * 10);
            if (runCanvas.width - lastObs.x < minGap) {
                canSpawn = false;
            }
        }

        if (canSpawn && frames % Math.floor(Math.random() * 50 + 50) === 0) {
            const type = Math.random() > 0.4 ? "📺" : "🍍";
            obstacles.push({ x: runCanvas.width, y: 175, size: 55, type: type });
        }

        // 🛡️ 內縮碰撞框 (Hitbox)：給予玩家 15px 的容錯空間
        let hitMargin = 15;

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= speed;

            if (turkey.x + hitMargin < obs.x + obs.size - hitMargin &&
                turkey.x + turkey.size - hitMargin > obs.x + hitMargin &&
                turkey.y + hitMargin < obs.y + obs.size - hitMargin &&
                turkey.y + turkey.size - hitMargin > obs.y + hitMargin) {
                gameOver();
                return;
            }
        }

        if (obstacles.length > 0 && obstacles[0].x < -60) {
            obstacles.shift();
            score += 10;
            scoreBoard.innerText = `SCORE: ${score}`;

            if (score >= TARGET_SCORE) {
                triggerWin();
                return;
            }
            if (score % 30 === 0) speed += 0.5;
        }

        frames++;
        accumulator -= step;
    }

    // --- 區塊 B: 畫面繪製 (Render) ---
    drawNeonGrid();
    drawTurkey();

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        runCtx.font = "55px Arial";
        runCtx.fillText(obs.type, obs.x, obs.y + 45);
    }
}

// ==========================================
// 4. 遊戲結束 / 勝利處理
// ==========================================
function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameReq);

    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'none';

    gameMsg.style.position = 'absolute';
    gameMsg.style.top = '0';
    gameMsg.style.left = '0';
    gameMsg.style.width = '100%';
    gameMsg.style.height = '100%';
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.style.display = 'flex';
    gameMsg.style.flexDirection = 'column';
    gameMsg.style.justifyContent = 'center';
    gameMsg.style.alignItems = 'center';
    gameMsg.style.overflowY = 'hidden';
    gameMsg.style.padding = '10px';
    gameMsg.style.boxSizing = 'border-box';

    gameMsg.innerHTML = `
        <h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: clamp(1.5rem, 5vw, 2rem);">[ FATAL ERROR ]</h2>
        <p style="margin: 10px 0; font-size: clamp(1rem, 3vw, 1.2rem);">火雞已被攔截。最終分數: ${score}</p>
        <p class="blink" style="margin: 10px 0 0 0; font-size: 1rem; color: #ff00ff;">> 點擊重新連線 &lt;</p>
    `;
}

function triggerWin() {
    isPlaying = false;
    hasWon = true;
    cancelAnimationFrame(gameReq);

    scoreBoard.style.display = 'none';
    runCanvas.style.display = 'none';

    gameMsg.style.position = 'absolute';
    gameMsg.style.top = '0';
    gameMsg.style.left = '0';
    gameMsg.style.width = '100%';
    gameMsg.style.height = '100%';
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.style.display = 'flex';
    gameMsg.style.flexDirection = 'column';
    gameMsg.style.justifyContent = 'center';
    gameMsg.style.alignItems = 'center';
    gameMsg.style.overflowY = 'hidden';
    gameMsg.style.padding = '10px';
    gameMsg.style.boxSizing = 'border-box';

    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #00ff00; text-shadow: 2px 2px #000; font-size: clamp(1.2rem, 5vw, 1.8rem);">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin: 5px 0 0 0; font-size: clamp(0.8rem, 3.5vw, 1rem); color: #fff; text-align: center;">你成功駭入了寧靜系統！獲得隱藏折扣碼：</p>
        <div style="background: #ff00ff; color: #fff; padding: 5px 10px; margin: 10px 0; font-weight: bold; font-size: clamp(1.1rem, 5vw, 1.5rem); border: 2px solid #fff; word-break: break-all;">TURKEY_BREACH_2026</div>
        <p style="margin: 0; font-size: clamp(0.7rem, 2.5vw, 0.85rem); color: #aaa; text-align: center;">> 請截圖此畫面，至現場周邊攤位出示以享有優惠 &lt;</p>
        <p class="blink" style="margin: 15px 0 0 0; font-size: clamp(0.8rem, 3vw, 1rem); color: #00ff00;">> 點擊畫面重新開始挑戰 &lt;</p>
    `;
}