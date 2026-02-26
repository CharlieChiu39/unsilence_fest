// ==========================================
// ✨ 彩蛋遊戲：賽博火雞大逃亡 (Cyber Turkey Run) ✨
// ==========================================
const gameWinUI = document.getElementById('game-window');
const runCanvas = document.getElementById('run-canvas');
const runCtx = runCanvas.getContext('2d');
const gameMsg = document.getElementById('game-msg');
const scoreBoard = document.getElementById('game-score');

let gameReq, isPlaying = false, score = 0, speed = 6;
let frames = 0;

// 🎯 解鎖彩蛋的目標分數
const TARGET_SCORE = 100; 
let hasWon = false; 

// 🔥 固定時間步長 (Fixed Time Step) 變數
let lastTime = 0;
let accumulator = 0;
const step = 1000 / 60; // 固定每次物理更新為 60 FPS 的時間 (約 16.66ms)

// 火雞物理設定
const turkey = { x: 50, y: 150, size: 30, vy: 0, gravity: 0.8, jumpPower: -12, isJumping: false };
let obstacles = [];

// ==========================================
// 1. 遊戲視窗控制
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
    isPlaying = false; hasWon = false; score = 0; speed = 6; frames = 0; lastTime = 0; accumulator = 0; turkey.y = 150; turkey.vy = 0; turkey.isJumping = false; obstacles = []; 
    
    scoreBoard.innerText = `SCORE: ${score}`;
    scoreBoard.style.display = 'none'; // ✨ 修改這裡：遊戲尚未開始前，先隱藏分數板
    runCanvas.style.display = 'block'; 
    
    // ✨ 保持絕對定位，完美覆蓋畫布且不破壞外層比例
    gameMsg.style.position = 'absolute'; 
    gameMsg.style.background = 'rgba(0,0,0,0.6)';
    gameMsg.style.display = 'flex'; 
    gameMsg.innerHTML = '<h2 class="blink" style="margin: 0; color: #ff00ff; font-size: clamp(1.5rem, 5vw, 2rem); text-shadow: 2px 2px #000;">SYSTEM BREACH</h2><p style="margin-top: 10px; font-size: clamp(1rem, 3vw, 1.2rem); text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>';
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
        scoreBoard.style.display = 'block'; // ✨ 新增這行：玩家點擊開始逃亡後，才顯示分數板
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
// ==========================================
// 3. 畫面繪製與動畫迴圈
// ==========================================
function drawTurkey() {
    runCtx.save(); 
    runCtx.scale(-1, 1); 
    runCtx.font = "30px Arial";
    runCtx.fillText("🦃", -turkey.x - 30, turkey.y + 25);
    runCtx.restore(); 
}

// ✨ 新增全域變數：控制網格滾動的偏移量
let bgOffset = 0; 

// ✨ 新增：繪製賽博龐克動態網格背景
// ✨ 繪製賽博龐克動態網格背景
function drawNeonGrid() {
    runCtx.fillStyle = '#05020a'; 
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    
    // 🔥 提升亮度與粗細，讓手機上也清晰可見！
    runCtx.strokeStyle = 'rgba(255, 0, 255, 0.8)'; // 改為明亮的桃紅色
    runCtx.lineWidth = 2.5; 
    
    const horizonY = 180;
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

function drawStaticScene() {
    bgOffset = 0; // 靜態畫面重置偏移
    drawNeonGrid(); // 取代原本的純色背景
    drawTurkey(); 
}

// 🔥 採用時間累加器 (Fixed Time Step) 的主迴圈
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
        
        if (turkey.y >= 150) {
            turkey.y = 150;
            turkey.isJumping = false;
            turkey.vy = 0;
        }

        let canSpawn = true;
        if (obstacles.length > 0) {
            let lastObs = obstacles[obstacles.length - 1];
            if (runCanvas.width - lastObs.x < 250) {
                canSpawn = false;
            }
        }

        if (canSpawn && frames % Math.floor(Math.random() * 60 + 60) === 0) {
            const type = Math.random() > 0.3 ? "📺" : "🍍";
            obstacles.push({ x: runCanvas.width, y: 155, size: 25, type: type });
        }

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= speed;

            if (turkey.x < obs.x + obs.size - 5 && 
                turkey.x + turkey.size - 5 > obs.x &&
                turkey.y < obs.y + obs.size - 5 && 
                turkey.y + turkey.size - 5 > obs.y) {
                gameOver();
                return;
            }
        }

        if (obstacles.length > 0 && obstacles[0].x < -30) {
            obstacles.shift();
            score += 10;
            scoreBoard.innerText = `SCORE: ${score}`;
            
            if (score >= TARGET_SCORE) {
                triggerWin();
                return; 
            }

            if (score % 100 === 0) speed += 0.5; 
        }

        frames++;
        accumulator -= step; 
    }

    // --- 區塊 B: 畫面繪製 (Render) ---
    // ✨ 呼叫我們剛剛寫的超酷網格背景
    drawNeonGrid();

    drawTurkey();

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        runCtx.font = "25px Arial";
        runCtx.fillText(obs.type, obs.x, obs.y + 25);
    }
}

// ==========================================
// 4. 遊戲結束 / 勝利處理
// ==========================================
function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameReq);
    
    scoreBoard.style.display = 'none'; // 隱藏分數
    runCanvas.style.display = 'none';  // ✨ 徹底隱藏畫布，釋放空間
    
    gameMsg.style.position = 'absolute'; 
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.style.display = 'flex';
    gameMsg.innerHTML = `<h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: clamp(1.5rem, 5vw, 2rem);">[ FATAL ERROR ]</h2><p style="margin-top: 10px; font-size: clamp(1rem, 3vw, 1.2rem);">火雞已被攔截。最終分數: ${score}</p><p class="blink" style="font-size: 1rem; margin-top: 15px; color: #ff00ff;">> 點擊重新連線 &lt;</p>`;
}

function triggerWin() {
    isPlaying = false;
    hasWon = true;
    cancelAnimationFrame(gameReq); 
    
    scoreBoard.style.display = 'none'; // 隱藏分數防重疊
    runCanvas.style.display = 'none';  // ✨ 徹底隱藏畫布，釋放空間
    
    gameMsg.style.position = 'absolute';
    gameMsg.style.background = 'rgba(0,0,0,0.9)';
    gameMsg.style.display = 'flex';
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #00ff00; text-shadow: 2px 2px #000; font-size: clamp(1.2rem, 5vw, 2rem);">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin-top: 10px; font-size: clamp(0.9rem, 4vw, 1.1rem); color: #fff; padding: 0 10px;">你成功駭入了寧靜系統！<br>獲得隱藏周邊折扣碼：</p>
        <div style="background: #ff00ff; color: #fff; padding: 10px 15px; margin-top: 10px; font-weight: bold; font-size: clamp(1.2rem, 5vw, 1.5rem); border: 2px solid #fff; word-break: break-all;">TURKEY_BREACH_2026</div>
        <p style="font-size: clamp(0.75rem, 3vw, 0.9rem); margin-top: 15px; color: #aaa; padding: 0 10px;">> 請截圖此畫面，<br>至現場周邊攤位出示以享有折價優惠 &lt;</p>
        <p class="blink" style="font-size: clamp(0.8rem, 3vw, 1rem); margin-top: 10px; color: #00ff00;">> 點擊畫面重新開始挑戰 &lt;</p>
    `;
}