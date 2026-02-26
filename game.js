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

// 🎯 [新增] 設定解鎖彩蛋的目標分數 (方便測試先設為 100 分，可自行修改)
const TARGET_SCORE = 100; 
let hasWon = false; // 記錄是否已經贏得遊戲

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
    isPlaying = false;
    hasWon = false; // 重置勝利狀態
    score = 0;
    speed = 6;
    frames = 0;
    turkey.y = 150;
    turkey.vy = 0;
    turkey.isJumping = false;
    obstacles = []; 
    scoreBoard.innerText = `SCORE: ${score}`;
    gameMsg.style.display = 'flex'; 
    gameMsg.innerHTML = '<h2 class="blink" style="margin: 0; color: #ff00ff; font-size: 2rem; text-shadow: 2px 2px #000;">SYSTEM BREACH</h2><p style="margin-top: 10px; font-size: 1.2rem; text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>';
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
        gameLoop(); 
        return;
    }
    
    // 如果遊戲正在進行且火雞在地上，則跳躍
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
function drawTurkey() {
    runCtx.save(); 
    runCtx.scale(-1, 1); 
    runCtx.font = "30px Arial";
    runCtx.fillText("🦃", -turkey.x - 30, turkey.y + 25);
    runCtx.restore(); 
}

function drawStaticScene() {
    runCtx.fillStyle = '#05020a'; 
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);
    
    runCtx.strokeStyle = 'rgba(157, 0, 255, 0.5)'; 
    runCtx.lineWidth = 2;
    runCtx.beginPath(); 
    runCtx.moveTo(0, 180); 
    runCtx.lineTo(runCanvas.width, 180); 
    runCtx.stroke();
    
    drawTurkey(); 
}

function gameLoop() {
    if (!isPlaying) return;
    
    runCtx.fillStyle = '#05020a';
    runCtx.fillRect(0, 0, runCanvas.width, runCanvas.height);

    runCtx.strokeStyle = 'rgba(157, 0, 255, 0.5)';
    runCtx.lineWidth = 2;
    runCtx.beginPath(); 
    runCtx.moveTo(0, 180); 
    runCtx.lineTo(runCanvas.width, 180); 
    runCtx.stroke();

    turkey.vy += turkey.gravity;
    turkey.y += turkey.vy;
    
    if (turkey.y >= 150) {
        turkey.y = 150;
        turkey.isJumping = false;
        turkey.vy = 0;
    }

    drawTurkey();

    if (frames % Math.floor(Math.random() * 60 + 60) === 0) {
        const type = Math.random() > 0.3 ? "📺" : "🍍";
        obstacles.push({ x: runCanvas.width, y: 155, size: 25, type: type });
    }

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= speed;
        
        runCtx.font = "25px Arial";
        runCtx.fillText(obs.type, obs.x, obs.y + 25);

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
        
        // 🎯 [新增] 檢查是否達到目標分數！
        if (score >= TARGET_SCORE) {
            triggerWin();
            return; // 停止動畫迴圈
        }

        if (score % 100 === 0) speed += 0.5; 
    }

    frames++;
    gameReq = requestAnimationFrame(gameLoop);
}

// ==========================================
// 4. 遊戲結束 / 勝利處理
// ==========================================
function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameReq);
    gameMsg.style.display = 'flex';
    gameMsg.innerHTML = `<h2 style="margin: 0; color: #ff0000; text-shadow: 2px 2px #000; font-size: 2rem;">[ FATAL ERROR ]</h2><p style="margin-top: 10px; font-size: 1.2rem;">火雞已被攔截。最終分數: ${score}</p><p class="blink" style="font-size: 1rem; margin-top: 15px; color: #ff00ff;">> 點擊重新連線 &lt;</p>`;
}

// 🎯 [新增] 勝利彩蛋畫面
function triggerWin() {
    isPlaying = false;
    hasWon = true;
    cancelAnimationFrame(gameReq); // 停止遊戲背景動畫
    gameMsg.style.display = 'flex';
    gameMsg.innerHTML = `
        <h2 class="blink" style="margin: 0; color: #00ff00; text-shadow: 2px 2px #000; font-size: 2rem;">[ SYSTEM OVERRIDE SUCCESS ]</h2>
        <p style="margin-top: 10px; font-size: 1.1rem; color: #fff;">你成功駭入了寧靜系統！獲得隱藏周邊折扣碼：</p>
        <div style="background: #ff00ff; color: #fff; padding: 10px 20px; margin-top: 15px; font-weight: bold; font-size: 1.5rem; border: 2px solid #fff;">TURKEY_BREACH_2026</div>
        <p style="font-size: 0.9rem; margin-top: 15px; color: #aaa;">> 請截圖此畫面，至現場周邊攤位出示以享有折價優惠 &lt;</p>
        <p class="blink" style="font-size: 1rem; margin-top: 15px; color: #00ff00;">> 點擊畫面重新開始挑戰 &lt;</p>
    `;
}