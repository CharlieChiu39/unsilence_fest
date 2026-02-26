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
    // index.html 裡的 topZ 變數
    if (typeof topZ !== 'undefined') gameWinUI.style.zIndex = ++topZ;
    resetGame();
    drawStaticScene();
}

function closeGame() {
    gameWinUI.style.display = 'none';
    isPlaying = false;
    cancelAnimationFrame(gameReq);
}

// 動態設定文字訊息區樣式 ( SYSTEM BREACH 畫面 )
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
        <p style="margin-top: 10px; font-size: clamp(0.9rem, 3vw, 1.2rem); color: #0f0; text-shadow: 1px 1px #000;">> 點擊畫面 或 按空白鍵開始逃亡 &lt;</p>
    `;
}

// 跳躍指令 (開始/跳躍)
function jump() {
    // 如果視窗是關閉的，什麼都不做
    if (gameWinUI.style.display === 'none') return;
    
    // 如果沒在玩，就開始遊戲
    if (!isPlaying) {
        resetGame();
        isPlaying = true;
        gameMsg.style.display = 'none'; // 隱藏文字訊息
        scoreBoard.style.display = 'block'; // 顯示分數
        lastTime = performance.now();
        gameReq = requestAnimationFrame(gameLoop);
        return;
    }
    // 如果在玩，且在地板上，就跳躍
    if (!turkey.isJumping && !hasWon) {
        turkey.vy = JUMP_POWER;
        turkey.isJumping = true;
    }
}

// ==========================================
// ✨ 註冊所有點擊與按鍵事件 (全視窗觸控支援) ✨
// ==========================================
// 1. 空白鍵跳躍
window.addEventListener('keydown', (e) => { 
    if (e.code === 'Space' && gameWinUI.style.display === 'flex') { 
        e.preventDefault(); 
        jump(); 
    }
});

// 2. 鎖定整個遊戲內容區塊 (包含黑邊、畫布與文字)
const gameContentArea = gameWinUI.querySelector('.window-content');

// 使用 'pointerdown' 一次搞定滑鼠與手機觸控，並在 iOS CSS 的 touch-action: none 配合下，不會有延遲
gameContentArea.addEventListener('pointerdown', (e) => {
    // ✨ 重要：如果點到的是視窗右上角的「X (關閉按鈕)」，就不要跳躍，直接讓 HTML 的 onclick 去處理關閉
    if (e.target.classList.contains('close-btn')) return; 
    
    // ✨ 重要：如果是在標題列(紫色區塊)按下的，那是 index.html 的拖曳邏輯負責，這裡不要跳躍
    if (e.target.closest('.window-header')) return;

    if (e.cancelable) {
        e.preventDefault(); // 阻止 iOS 預設的焦點轉移或網頁滑動干擾
    }
    jump();
});

// ==========================================
// 2. 核心繪圖 (Render)
// ==========================================
// 畫賽博網格地面 (包含視差效果)
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

    // 水平線 (產生深度感)
    runCtx.beginPath();
    for(let i = 1; i < 10; i++){
        let y = HORIZON_Y + Math.pow(i, 1.8) * 3;
        if(y > runCanvas.height) break;
        runCtx.moveTo(0, y); runCtx.lineTo(runCanvas.width, y);
    }
    // 透視線 (往中心匯集)
    for(let x = -runCanvas.width; x < runCanvas.width * 2; x += 40){
        runCtx.moveTo(vpX, HORIZON_Y); runCtx.lineTo(x - bgOffset, runCanvas.height);
    }
    runCtx.stroke();
}

// 畫火雞 (精確貼地)
function drawTurkey() {
    runCtx.save();
    runCtx.scale(-1, 1); // 火雞面朝左，鏡像翻轉
    runCtx.font = "60px Arial";
    // ✨ 精確對齊法：讓圖案底部完美貼合 turkey.y (也就是 FLOOR_Y)
    runCtx.textBaseline = "bottom"; 
    runCtx.fillText("🦃", -turkey.x - turkey.size, turkey.y);
    runCtx.restore();
}

// 畫出靜止的開場畫面
function drawStaticScene() { drawNeonGrid(); drawTurkey(); }

// ==========================================
// 3. 遊戲主迴圈 (Update)
// ==========================================
function gameLoop(timestamp) {
    if (!isPlaying) return;
    gameReq = requestAnimationFrame(gameLoop);

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (deltaTime > 100) deltaTime = step; // 防止背景切換後的回溯
    accumulator += deltaTime;

    while (accumulator >= step) {
        // --- 物理計算 ---
        turkey.vy += GRAVITY; // 套用重力
        turkey.y += turkey.vy; // 更新高度
        
        // 落地判定
        if (turkey.y >= FLOOR_Y) { turkey.y = FLOOR_Y; turkey.isJumping = false; turkey.vy = 0; }

        // --- 生成障礙物 (Cluster 生成 + 安全距離邏輯) ---
        let canSpawn = true;
        // 如果還在前一個障礙物的安全空白距離內，就不能生成
        if (obstacles.length > 0 && (runCanvas.width - obstacles[obstacles.length - 1].x < (250 + speed * 10))) {
            canSpawn = false;
        }
        
        // 基礎機率生成
        if (canSpawn && frames % Math.floor(Math.random() * 40 + 60) === 0) {
            // 隨機決定產生 📺 還是 🍍
            obstacles.push({ x: runCanvas.width, y: FLOOR_Y, size: 55, type: Math.random() > 0.4 ? "📺" : "🍍" });
        }

        // --- 移動與碰撞偵測 ---
        const m = 15; // 內縮 15px 增加容錯
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= speed; // 障礙物往左移

            // 完美的 AABB 碰撞矩形計算
            let tL = turkey.x + m, tR = turkey.x + turkey.size - m;
            let tT = turkey.y - turkey.size + m, tB = turkey.y - m;
            let oL = obs.x + m, oR = obs.x + obs.size - m;
            let oT = obs.y - obs.size + m, oB = obs.y - m;

            // 如果矩形重疊，就是撞到了
            if (tL < oR && tR > oL && tT < oB && tB > oT) {
                gameOver(); return; // 撞到就結束
            }
        }

        // --- 計分與移除過期障礙物 ---
        if (obstacles.length > 0 && obstacles[0].x < -60) {
            obstacles.shift(); // 移除離開畫面的障礙物
            score += 10;
            scoreBoard.innerText = `SCORE: ${score}`;
            
            // 勝利判定
            if (score >= TARGET_SCORE) { triggerWin(); return; }
            
            // 每30分加速一次
            if (score % 30 === 0) speed += 0.5;
        }

        frames++; accumulator -= step;
    }

    // --- 畫面繪製 (Render) ---
    drawNeonGrid();
    drawTurkey();
    obstacles.forEach(obs => {
        runCtx.font = "55px Arial";
        runCtx.textBaseline = "bottom";
        runCtx.fillText(obs.type, obs.x, obs.y);
    });
}

// ==========================================
// 4. 結局 UI (GameOver / Win)
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