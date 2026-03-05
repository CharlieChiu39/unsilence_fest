// =========================================
// 按鈕訊號傳輸干擾 (Signal Glitch)
// =========================================
function signalClick(btnElement, windowTitle, fileUrl) {
    if (btnElement.classList.contains('transmitting')) return;

    const originalText = btnElement.innerText;
    const glitchChars = "#$@&%*!";
    btnElement.classList.add('transmitting');

    let scrambleInterval = setInterval(() => {
        btnElement.innerText = originalText.split('').map((char) => {
            if (Math.random() > 0.6) return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            return char;
        }).join('');
    }, 50);

    setTimeout(() => {
        clearInterval(scrambleInterval);
        if (document.body.contains(btnElement)) {
            btnElement.innerText = originalText;
            btnElement.classList.remove('transmitting');
        }
        openApp(windowTitle, fileUrl);
    }, 300);
}

// =========================================
// 特效系統
// =========================================
let lastX = 0, lastY = 0;
let activeStardustCount = 0;
const MAX_STARDUST = 30;

const createStardust = (x, y) => {
    if (document.body.classList.contains('tranquil-mode')) return;
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist < 8) return;
    if (activeStardustCount >= MAX_STARDUST) return;
    lastX = x; lastY = y;

    const shapes = ["+", "□", "0", "1", "·"];
    const count = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'stardust';
        p.innerText = shapes[Math.floor(Math.random() * shapes.length)];
        p.style.left = `${x}px`; p.style.top = `${y}px`;
        p.style.fontSize = Math.random() > 0.5 ? '10px' : '14px';

        const tx = (Math.random() - 0.5) * 60; const ty = Math.random() * 40 + 20;
        p.style.setProperty('--tx', `${tx}px`); p.style.setProperty('--ty', `${ty}px`);
        document.body.appendChild(p);
        activeStardustCount++;
        setTimeout(() => { p.remove(); activeStardustCount--; }, 600);
    }
};

// 爆炸特效：數據崩壞
const createExplosion = (x, y) => {
    if (document.body.classList.contains('tranquil-mode')) return;

    const crashSymbols = ["ERROR", "NULL", "0xFF", "†", "⚠", "{}", "//", "FATAL", "NaN", "?", "█"];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'glitch-particle';
        p.innerText = crashSymbols[Math.floor(Math.random() * crashSymbols.length)];
        p.style.left = `${x}px`; p.style.top = `${y}px`;
        p.style.fontSize = Math.random() > 0.6 ? '16px' : '12px';
        if (Math.random() > 0.8) p.style.color = '#fff';

        const angle = Math.random() * Math.PI * 2; const velocity = Math.random() * 120 + 40;
        p.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
        document.body.appendChild(p); setTimeout(() => p.remove(), 800);
    }
};

const createShatter = (x, y) => {
    if (document.body.classList.contains('tranquil-mode')) return;
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div'); p.className = 'shatter-particle'; p.style.left = `${x}px`; p.style.top = `${y}px`;
        p.style.backgroundColor = '#9d00ff';
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`); p.style.setProperty('--ty', `${Math.random() * 150 + 50}px`);
        document.body.appendChild(p); setTimeout(() => p.remove(), 600);
    }
};

// 雙平台統一監聽：點擊爆炸與滑動星塵
document.addEventListener('pointerdown', (e) => {
    if (e.target.id === 'secret-turkey') return;

    if (e.target.closest('.window')) {
        if (!e.target.closest('.window-header') && !e.target.closest('.close-btn')) {
            createShatter(e.clientX, e.clientY);
        }
    } else if (!e.target.closest('.alert-modal') && !e.target.closest('.sidebar')) {
        createExplosion(e.clientX, e.clientY);
    }
});

document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
        createStardust(e.clientX, e.clientY);
    }
});

// =========================================
// 文字亂碼特效
// =========================================
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*寧靜音樂節";

function triggerGlitch(el, originalText) {
    let iterations = 0;
    clearInterval(el.dataset.interval);
    el.dataset.interval = setInterval(() => {
        el.innerHTML = originalText.split("").map((letter, index) => {
            if (index < iterations || letter === " " || letter === "\n" || letter === ">") {
                return letter === "\n" ? "<br>" : originalText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
        if (iterations >= originalText.length) clearInterval(el.dataset.interval);
        iterations += 1;
    }, 30);
}

// 綁定 Logo 特效
const logoArea = document.querySelector('.logo-area');
if (logoArea) {
    const logoGlitch = () => {
        let el = document.querySelector('.glitch-text');
        if (el) triggerGlitch(el, "寧靜音樂節\nUNSILENCE OS");
    };
    logoArea.addEventListener('mouseover', logoGlitch);
    logoArea.addEventListener('touchstart', logoGlitch, { passive: true });
}

// 綁定選單連結特效（含 sidebar-bottom 的 CREDITS 連結）
document.querySelectorAll('.nav-links a, .sidebar-bottom-link').forEach(link => {
    const linkGlitch = (event) => {
        let el = event.currentTarget;
        triggerGlitch(el, el.dataset.text);
    };
    link.addEventListener('mouseover', linkGlitch);
    link.addEventListener('touchstart', linkGlitch, { passive: true });
});

// =========================================
// BIOS 開機
// =========================================
const biosLines = ["[0x0000] INITIATING KERNEL_CORE...", "[0x001A] ALLOCATING MEMORY BLOCK...", "[0xCCU] ALLOCATING CSIE_MODULE...", "[0x002B] MOUNTING SIGNAL_PROCESSOR...", "...", "> BOOTING TRANQUIL_OS...", "> SYSTEM READY."];
const biosText = document.getElementById('bios-text'); let lineIdx = 0;
function showBios() {
    if (lineIdx < biosLines.length) { biosText.innerHTML += biosLines[lineIdx] + "<br>"; lineIdx++; setTimeout(showBios, 150); }
    else { setTimeout(() => { const biosScreen = document.getElementById('bios-screen'); biosScreen.style.transition = "opacity 0.6s ease"; biosScreen.style.opacity = "0"; setTimeout(() => { biosScreen.style.display = 'none'; preloadApps(); }, 600); }, 500); }
}
window.onload = () => { setTimeout(showBios, 1200); setTimeout(() => { document.getElementById('crt-boot').remove(); }, 2500); };

// =========================================
// 預載系統（含超時與優先級）
// =========================================
const cache = {};

function preloadWithTimeout(file, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    fetch(file, { signal: controller.signal })
        .then(res => {
            clearTimeout(id);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(html => cache[file] = html)
        .catch(e => console.warn(`Preload failed: ${file}`, e));
}

function preloadApps() {
    const priority = ['news.html', 'lineup.html'];
    const others = ['timetable.html', 'map.html', 'goods.html', 'guidelines.html', 'credits.html'];

    priority.forEach(file => preloadWithTimeout(file, 5000));
    setTimeout(() => others.forEach(file => preloadWithTimeout(file, 5000)), 500);
}

// =========================================
// 視窗拖曳（事件委派，修復監聽器洩漏）
// =========================================
const windows = document.querySelectorAll('.window:not(.alert-modal)');
let topZ = 10010;
function focusWindow(win) { windows.forEach(w => w.classList.remove('focused')); win.classList.add('focused'); win.style.zIndex = ++topZ; }

let currentDragging = null;
let dragOffsetX, dragOffsetY, dragParentX, dragParentY;

windows.forEach(win => {
    const header = win.querySelector('.window-header');
    win.addEventListener('pointerdown', () => focusWindow(win));
    header.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('close-btn')) return;
        currentDragging = win;
        focusWindow(win);
        const rect = win.getBoundingClientRect(); const parentRect = win.offsetParent.getBoundingClientRect();
        dragParentX = parentRect.left; dragParentY = parentRect.top;
        win.style.transform = 'none'; win.style.margin = '0'; win.style.bottom = 'auto'; win.style.right = 'auto';
        win.style.left = `${rect.left - dragParentX}px`; win.style.top = `${rect.top - dragParentY}px`;
        dragOffsetX = e.clientX - rect.left; dragOffsetY = e.clientY - rect.top;
        if (e.pointerType === 'touch') win.style.touchAction = 'none';
    });
    if (win.classList.contains('teaser-win')) win.querySelector('.close-btn').onclick = () => win.style.display = 'none';
});

// 單一全域監聽器（取代每個視窗各綁一組）
document.addEventListener('pointermove', (e) => {
    if (!currentDragging) return;
    e.preventDefault();
    // 邊界檢查（允許拖到 sidebar 上方）
    const newLeft = e.clientX - dragOffsetX - dragParentX;
    const newTop = e.clientY - dragOffsetY - dragParentY;
    const maxLeft = window.innerWidth - 60;
    const maxTop = window.innerHeight - 40;
    const minTop = -dragParentY; // 允許拖到視窗頂端（覆蓋 sidebar）
    currentDragging.style.left = `${Math.max(-currentDragging.offsetWidth + 60, Math.min(newLeft, maxLeft))}px`;
    currentDragging.style.top = `${Math.max(minTop, Math.min(newTop, maxTop))}px`;
}, { passive: false });

document.addEventListener('pointerup', () => {
    if (currentDragging && currentDragging.style.touchAction === 'none') currentDragging.style.touchAction = '';
    currentDragging = null;
});
document.addEventListener('pointercancel', () => {
    if (currentDragging && currentDragging.style.touchAction === 'none') currentDragging.style.touchAction = '';
    currentDragging = null;
});

// =========================================
// 智慧排版
// =========================================
let cascadeX = 60, cascadeY = 60;
function getSmartPosition() {
    if (window.innerWidth <= 800) return { isMobile: true };
    cascadeX += 30; cascadeY += 30;
    if (cascadeX > window.innerWidth - 650 || cascadeY > window.innerHeight - 450) { cascadeX = 80; cascadeY = 80; }
    return { top: `${cascadeY}px`, left: `${cascadeX}px` };
}

// =========================================
// 開啟 / 關閉 App
// =========================================
async function openApp(windowTitle, fileUrl) {
    const appWin = document.getElementById('main-app-window'); const contentArea = document.getElementById('app-dynamic-content'); const titleArea = document.getElementById('app-window-title');

    appWin.style.display = 'flex'; focusWindow(appWin);

    const pos = getSmartPosition();
    if (!pos.isMobile) {
        appWin.style.top = pos.top; appWin.style.left = pos.left;
    }

    titleArea.innerText = `📁 ${windowTitle}`; contentArea.innerHTML = "<h3 class='blink'>> 讀取資料中 / LOADING DATA...</h3>";
    try {
        let htmlContent = cache[fileUrl];
        if (!htmlContent) { const response = await fetch(fileUrl); if (!response.ok) throw new Error(); htmlContent = await response.text(); cache[fileUrl] = htmlContent; }
        contentArea.innerHTML = htmlContent;
        if (fileUrl === 'timetable.html') {
            setTimeout(() => {
                const now = new Date(); const currentTime = now.getHours() + (now.getMinutes() / 60);
                const rows = document.querySelectorAll('#timetable tbody tr');
                rows.forEach(row => {
                    const startArr = row.dataset.start.split(':'); const endArr = row.dataset.end.split(':');
                    const start = parseInt(startArr[0]) + (parseInt(startArr[1]) / 60); const end = parseInt(endArr[0]) + (parseInt(endArr[1]) / 60);
                    if (currentTime >= start && currentTime < end) { row.classList.add('current-slot'); row.querySelector('td').innerHTML += '<span class="now-tag">[NOW]</span>'; }
                });
            }, 50);
        }
    } catch (error) { contentArea.innerHTML = `<h3 style='color:red;'>[ 系統錯誤 ] 無法連接到信號源 (${fileUrl})</h3>`; }
}

function closeApp() {
    const appWin = document.getElementById('main-app-window');
    appWin.style.display = 'none';
    document.getElementById('app-dynamic-content').innerHTML = '';
    cascadeX = 60; cascadeY = 60;
    appWin.style.top = ''; appWin.style.left = ''; appWin.style.transform = '';
}

window.scanNode = function(title, text) {
    const info = document.getElementById('radar-info'); if (!info) return;
    info.classList.remove('blink'); info.innerHTML = `<strong style="color:var(--highlight-color)">[解析完成] ${title}</strong><br>`;
    let i = 0; const speed = 30;
    function typeWriter() { if (i < text.length) { info.innerHTML += text.charAt(i); i++; setTimeout(typeWriter, speed); } }
    typeWriter();
};

window.openExternalLink = function(url) { document.getElementById('ext-overlay').style.display = 'block'; document.getElementById('ext-modal').style.display = 'block'; document.getElementById('ext-confirm-btn').href = url; };
function closeExternalWarning() { document.getElementById('ext-overlay').style.display = 'none'; document.getElementById('ext-modal').style.display = 'none'; }

// =========================================
// 模式切換
// =========================================
const modes = ['noise', 'tranquil', 'pineapple']; const modeLabels = ['模式切換: 雜訊', '模式切換: 寧靜', '模式切換: 🍍鳳梨']; let currentModeIndex = 0;
document.getElementById('mode-toggle').onclick = (e) => { document.body.classList.remove(`${modes[currentModeIndex]}-mode`); currentModeIndex = (currentModeIndex + 1) % modes.length; document.body.classList.add(`${modes[currentModeIndex]}-mode`); e.target.innerText = modeLabels[currentModeIndex]; };

// =========================================
// 矩陣背景（改用 requestAnimationFrame）
// =========================================
const canvas = document.getElementById('matrix-bg'); const ctx = canvas.getContext('2d');
let cw, ch; const fontSize = 18; let columns = []; const noiseChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789寧靜音樂節'.split(''); const pineappleChars = ['🍍'];
function initCanvas() { cw = window.innerWidth; ch = window.innerHeight; canvas.width = cw; canvas.height = ch; const colCount = Math.floor(cw / fontSize) + 1; columns = []; for (let i = 0; i < colCount; i++) { columns[i] = Math.random() * -100; } }
window.addEventListener('resize', initCanvas); initCanvas();
function drawMatrix() { if (document.body.classList.contains('tranquil-mode')) { ctx.fillStyle = 'rgba(17, 17, 17, 0.15)'; ctx.fillRect(0, 0, cw, ch); return; } ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? 'rgba(26, 26, 0, 0.15)' : 'rgba(10, 5, 16, 0.15)'; ctx.fillRect(0, 0, cw, ch); ctx.font = `${fontSize}px 'DotGothic16', monospace`; ctx.textBaseline = 'top'; ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? '#ffcc00' : '#0f0'; const chars = document.body.classList.contains('pineapple-mode') ? pineappleChars : noiseChars; for (let i = 0; i < columns.length; i++) { const char = chars[Math.floor(Math.random() * chars.length)]; const x = i * fontSize; const y = columns[i] * fontSize; ctx.fillText(char, x, y); if (y > ch && Math.random() > 0.975) { columns[i] = 0; } else { columns[i]++; } } }

let lastMatrixTime = 0;
function matrixLoop(timestamp) {
    if (timestamp - lastMatrixTime > 50) {
        drawMatrix();
        lastMatrixTime = timestamp;
    }
    requestAnimationFrame(matrixLoop);
}
requestAnimationFrame(matrixLoop);
