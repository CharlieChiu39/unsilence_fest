// =========================================
// 資安：Frame Buster（防止被惡意 iframe 嵌入造成 clickjacking）
// =========================================
if (window.top !== window.self) {
    try { window.top.location.href = window.self.location.href; }
    catch (e) { document.body.innerHTML = ''; }
}

// =========================================
// 按鈕訊號傳輸干擾 (Signal Glitch)
// =========================================
function signalClick(btnElement, windowTitle, fileUrl) {
    if (btnElement.classList.contains('transmitting')) return;
    if (typeof gtag === 'function') gtag('event', 'nav_click', { page_name: fileUrl });

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

// touch 模式降頻：每 3 次才產生一次星塵，避免手機過度耗電
let stardustTouchCounter = 0;
document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') {
        createStardust(e.clientX, e.clientY);
    } else if (e.pointerType === 'touch') {
        if (++stardustTouchCounter % 3 === 0) createStardust(e.clientX, e.clientY);
    }
}, { passive: true });

// =========================================
// 文字亂碼特效
// =========================================
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*寧靜音樂節";

function triggerGlitch(el, originalText) {
    let iterations = 0;
    clearInterval(el.dataset.interval);
    el.dataset.interval = setInterval(() => {
        el.textContent = originalText.split("").map((letter, index) => {
            if (index < iterations || letter === " ") {
                return originalText[index];
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
        let cn = document.querySelector('.logo-cn');
        let en = document.querySelector('.logo-en');
        if (cn) triggerGlitch(cn, "寧靜音樂節");
        if (en) triggerGlitch(en, "UNSILENCE OS");
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
    } catch (error) {
        // 用 textContent 避免任何潛在的注入風險
        const h3 = document.createElement('h3');
        h3.style.color = 'red';
        h3.textContent = `[ 系統錯誤 ] 無法連接到信號源 (${fileUrl})`;
        contentArea.replaceChildren(h3);
    }
}

function closeApp() {
    const appWin = document.getElementById('main-app-window');
    appWin.style.display = 'none';
    document.getElementById('app-dynamic-content').innerHTML = '';
    cascadeX = 60; cascadeY = 60;
    appWin.style.top = ''; appWin.style.left = ''; appWin.style.transform = '';
}

// 外部連結警告窗（含 URL 白名單驗證，防止任意網址注入）
const EXT_LINK_WHITELIST = [
    'https://www.instagram.com/',
    'https://instagram.com/',
    'https://open.spotify.com/',
    'https://docs.google.com/',
    'https://forms.gle/'
];
window.openExternalLink = function(url) {
    // 白名單驗證
    const isAllowed = EXT_LINK_WHITELIST.some(prefix => url.startsWith(prefix));
    if (!isAllowed) { console.warn('Blocked external URL:', url); return; }
    if (typeof gtag === 'function') gtag('event', 'external_link_click', { link_url: url });
    document.getElementById('ext-overlay').style.display = 'block';
    document.getElementById('ext-modal').style.display = 'block';
    document.getElementById('ext-confirm-btn').href = url;
};
function closeExternalWarning() { document.getElementById('ext-overlay').style.display = 'none'; document.getElementById('ext-modal').style.display = 'none'; }

// =========================================
// 分享按鈕 (Web Share API)
// =========================================
window.shareWebsite = function() {
    if (typeof gtag === 'function') gtag('event', 'share_click');
    const shareData = {
        title: '寧靜音樂節 UNSILENCE FESTIVAL 2026',
        text: '搖滾 × 吉他 × 嘻哈，全程免費入場｜5/30-31 嘉義文化創意產業園區',
        url: 'https://unsilence-fest.com/'
    };
    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        navigator.clipboard.writeText('https://unsilence-fest.com/').then(() => {
            const btn = document.getElementById('share-btn');
            const orig = btn.getAttribute('data-tooltip');
            btn.setAttribute('data-tooltip', '> 已複製連結!');
            setTimeout(() => btn.setAttribute('data-tooltip', orig), 2000);
        });
    }
};

// =========================================
// 模式切換
// =========================================
const modes = ['noise', 'tranquil', 'pineapple'];
const modeLabels = ['模式切換: 雜訊', '模式切換: 寧靜', '模式切換: 🍍鳳梨'];
const modeThemeColors = ['#0a0510', '#111111', '#1a1a00'];
let currentModeIndex = 0;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
document.getElementById('mode-toggle').onclick = (e) => {
    document.body.classList.remove(`${modes[currentModeIndex]}-mode`);
    currentModeIndex = (currentModeIndex + 1) % modes.length;
    document.body.classList.add(`${modes[currentModeIndex]}-mode`);
    e.target.innerText = modeLabels[currentModeIndex];
    if (themeColorMeta) themeColorMeta.setAttribute('content', modeThemeColors[currentModeIndex]);
};

// =========================================
// 矩陣背景（改用 requestAnimationFrame）
// =========================================
const canvas = document.getElementById('matrix-bg'); const ctx = canvas.getContext('2d');
let cw, ch; const fontSize = 18; let columns = []; const noiseChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789寧靜音樂節'.split(''); const pineappleChars = ['🍍'];
function initCanvas() { cw = window.innerWidth; ch = window.innerHeight; canvas.width = cw; canvas.height = ch; const colCount = Math.floor(cw / fontSize) + 1; columns = []; for (let i = 0; i < colCount; i++) { columns[i] = Math.random() * -100; } }
window.addEventListener('resize', initCanvas); initCanvas();
function drawMatrix() { if (document.body.classList.contains('tranquil-mode')) { ctx.fillStyle = 'rgba(17, 17, 17, 0.15)'; ctx.fillRect(0, 0, cw, ch); return; } ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? 'rgba(26, 26, 0, 0.15)' : 'rgba(10, 5, 16, 0.15)'; ctx.fillRect(0, 0, cw, ch); ctx.font = `${fontSize}px 'DotGothic16', monospace`; ctx.textBaseline = 'top'; ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? '#ffcc00' : '#0f0'; const chars = document.body.classList.contains('pineapple-mode') ? pineappleChars : noiseChars; for (let i = 0; i < columns.length; i++) { const char = chars[Math.floor(Math.random() * chars.length)]; const x = i * fontSize; const y = columns[i] * fontSize; ctx.fillText(char, x, y); if (y > ch && Math.random() > 0.975) { columns[i] = 0; } else { columns[i]++; } } }

// mobile 降頻：手機從 20fps 改為 10fps（省電 + 減少 jank）
const isMobileDevice = window.matchMedia('(max-width: 800px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
const matrixInterval = isMobileDevice ? 100 : 50;
let lastMatrixTime = 0;
function matrixLoop(timestamp) {
    if (timestamp - lastMatrixTime > matrixInterval) {
        drawMatrix();
        lastMatrixTime = timestamp;
    }
    requestAnimationFrame(matrixLoop);
}
requestAnimationFrame(matrixLoop);

// =========================================
// 時刻表：頁籤切換 + 曲目 Accordion
// =========================================
window.switchDay = function(day) {
    const d530 = document.getElementById('day-530');
    const d531 = document.getElementById('day-531');
    if (!d530 || !d531) return;
    d530.style.display = day === '530' ? '' : 'none';
    d531.style.display = day === '531' ? '' : 'none';
    const btn530 = document.getElementById('tab-btn-530');
    const btn531 = document.getElementById('tab-btn-531');
    if (!btn530 || !btn531) return;
    if (day === '530') {
        btn530.style.cssText += ';background:var(--btn-bg);color:#000;border-color:#fff;border-right-color:#555;border-bottom-color:#555;';
        btn531.style.cssText += ';background:#2a2a3a;color:#aaa;border-color:#555;border-right-color:#333;border-bottom-color:#333;';
    } else {
        btn531.style.cssText += ';background:var(--btn-bg);color:#000;border-color:#fff;border-right-color:#555;border-bottom-color:#555;';
        btn530.style.cssText += ';background:#2a2a3a;color:#aaa;border-color:#555;border-right-color:#333;border-bottom-color:#333;';
    }
};

window.downloadSetlist = async function(btnEl) {
    // 找到觸發按鈕（支援從 onclick="downloadSetlist(this)" 或無參數呼叫）
    const btn = btnEl || (event && event.currentTarget);
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '生成中...'; btn.disabled = true; }

    try {
        // === 1. 從 DOM 蒐集資料 ===
        const days = [
            { id: 'day-530', label: '5/30 (六)', dateStr: '2026.05.30' },
            { id: 'day-531', label: '5/31 (日)', dateStr: '2026.05.31' }
        ];
        const data = days.map(({ id, label, dateStr }) => {
            const acts = [];
            const container = document.getElementById(id);
            if (!container) return { label, dateStr, acts };
            container.querySelectorAll('tbody tr').forEach(row => {
                if (row.dataset.songRow) return;
                const cells = row.querySelectorAll('td');
                if (cells.length < 3) return;
                const seq = cells[0].textContent.trim();
                const time = cells[1].textContent.trim();
                const name = cells[2].querySelector('.song-arrow')
                    ? cells[2].textContent.replace('▶', '').replace('▼', '').trim()
                    : cells[2].textContent.trim();
                const song = row.dataset.song || '';
                acts.push({ seq, time, name, song });
            });
            return { label, dateStr, acts };
        });

        // === 2. 計算畫布大小 ===
        const W = 1080;
        const ROW_H = 56;
        const DAY_HEADER_H = 100;
        const DAY_SPACING = 40;
        const HEADER_H = 300;
        const FOOTER_H = 120;
        const totalActs = data.reduce((s, d) => s + d.acts.length, 0);
        const H = HEADER_H + data.length * (DAY_HEADER_H + DAY_SPACING) + totalActs * ROW_H + FOOTER_H;

        // === 3. 建立 Canvas ===
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        const FONT_TC = '"Microsoft JhengHei", "PingFang TC", "Noto Sans TC", "Microsoft YaHei", sans-serif';
        const FONT_MONO = '"Consolas", "Menlo", "Courier New", monospace';

        // === 4. 背景與網格 ===
        ctx.fillStyle = '#0a0510';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(157, 0, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        // === 5. 邊框角落（賽博龐克風） ===
        ctx.fillStyle = '#ff00ff';
        const cs = 50;
        ctx.fillRect(0, 0, cs, 6); ctx.fillRect(0, 0, 6, cs);
        ctx.fillRect(W - cs, 0, cs, 6); ctx.fillRect(W - 6, 0, 6, cs);
        ctx.fillRect(0, H - 6, cs, 6); ctx.fillRect(0, H - cs, 6, cs);
        ctx.fillRect(W - cs, H - 6, cs, 6); ctx.fillRect(W - 6, H - cs, 6, cs);

        // === 6. 主標題區 ===
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        // 寧靜音樂節 - 霓虹粉
        ctx.fillStyle = 'rgba(157, 0, 255, 0.6)';
        ctx.font = `bold 96px ${FONT_TC}`;
        ctx.fillText('寧靜音樂節', W / 2 + 4, 110 + 4);
        ctx.fillStyle = '#ff00ff';
        ctx.fillText('寧靜音樂節', W / 2, 110);
        // 英文副標 - 綠色
        ctx.fillStyle = 'rgba(0, 100, 50, 0.8)';
        ctx.font = `bold 42px ${FONT_MONO}`;
        ctx.fillText('UNSILENCE FESTIVAL 2026', W / 2 + 2, 170 + 2);
        ctx.fillStyle = '#00ff88';
        ctx.fillText('UNSILENCE FESTIVAL 2026', W / 2, 170);
        // 分隔線
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(200, 200, W - 400, 3);
        // 副標資訊
        ctx.fillStyle = '#fff';
        ctx.font = `26px ${FONT_TC}`;
        ctx.fillText('完整演出歌單  ▍  嘉義文化創意產業園區 G9', W / 2, 240);
        ctx.fillStyle = '#aaa';
        ctx.font = `22px ${FONT_TC}`;
        ctx.fillText('全程免費入場  ▍  搖滾 × 吉他 × 嘻哈', W / 2, 275);

        // === 7. 繪製每一天 ===
        let y = HEADER_H;
        data.forEach(({ label, dateStr, acts }) => {
            // Day header
            ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
            ctx.fillRect(40, y, W - 80, DAY_HEADER_H);
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(40, y, 8, DAY_HEADER_H);
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ff00ff';
            ctx.font = `bold 48px ${FONT_TC}`;
            ctx.fillText(`DAY ${label.startsWith('5/30') ? '1' : '2'}`, 70, y + 50);
            ctx.fillStyle = '#fff';
            ctx.font = `bold 36px ${FONT_TC}`;
            ctx.fillText(label, 220, y + 50);
            ctx.fillStyle = '#aaa';
            ctx.font = `22px ${FONT_MONO}`;
            ctx.fillText(dateStr, 70, y + 85);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#00ffff';
            ctx.font = `22px ${FONT_MONO}`;
            ctx.fillText(`${acts.length} acts`, W - 70, y + 85);
            y += DAY_HEADER_H + 10;

            // Acts
            acts.forEach((act, idx) => {
                // 斑馬紋背景
                if (idx % 2 === 0) {
                    ctx.fillStyle = 'rgba(157, 0, 255, 0.08)';
                    ctx.fillRect(40, y, W - 80, ROW_H);
                }
                // 左側 # 序號
                ctx.textAlign = 'left';
                ctx.fillStyle = '#666';
                ctx.font = `bold 20px ${FONT_MONO}`;
                ctx.fillText(act.seq === '—' ? '   ' : `#${act.seq.padStart(2, '0')}`, 60, y + 36);
                // 時間（青色）
                ctx.fillStyle = '#00ffff';
                ctx.font = `bold 22px ${FONT_MONO}`;
                ctx.fillText(act.time, 140, y + 36);
                // 團名（白色粗體）
                ctx.fillStyle = act.seq === '—' ? '#aaa' : '#fff';
                ctx.font = act.seq === '—' ? `italic 22px ${FONT_TC}` : `bold 24px ${FONT_TC}`;
                ctx.fillText(act.name, 310, y + 36);
                // 曲目（右側粉色，若有）
                if (act.song && act.seq !== '—') {
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#ff66cc';
                    ctx.font = `18px ${FONT_TC}`;
                    // 防止曲名過長
                    let songText = `♪ ${act.song}`;
                    const maxW = 380;
                    if (ctx.measureText(songText).width > maxW) {
                        while (ctx.measureText(songText + '…').width > maxW && songText.length > 5) {
                            songText = songText.slice(0, -1);
                        }
                        songText += '…';
                    }
                    ctx.fillText(songText, W - 60, y + 36);
                }
                // 列底細線
                ctx.strokeStyle = 'rgba(157, 0, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(40, y + ROW_H);
                ctx.lineTo(W - 40, y + ROW_H);
                ctx.stroke();
                y += ROW_H;
            });
            y += DAY_SPACING;
        });

        // === 8. Footer ===
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(200, H - FOOTER_H + 10, W - 400, 2);
        ctx.fillStyle = '#00ff88';
        ctx.font = `bold 32px ${FONT_MONO}`;
        ctx.fillText('unsilence-fest.com', W / 2, H - FOOTER_H + 60);
        ctx.fillStyle = '#888';
        ctx.font = `20px ${FONT_TC}`;
        ctx.fillText('長按圖片儲存到相簿 ▍ 完整資訊請見官網', W / 2, H - FOOTER_H + 95);

        // === 9. 輸出 PNG 並分享/下載 ===
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], 'UNSILENCE_2026_setlist.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: '寧靜音樂節 2026 歌單' });
            } catch (e) { /* user cancelled */ }
        } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'UNSILENCE_2026_setlist.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }
        if (typeof gtag === 'function') gtag('event', 'setlist_download', { format: 'png' });
    } catch (e) {
        console.error('歌單生成失敗:', e);
        alert('歌單生成失敗，請重試');
    } finally {
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
};

window.toggleSong = function(row) {
    var next = row.nextElementSibling;
    if (next && next.dataset.songRow) {
        next.style.display = next.style.display === 'none' ? '' : 'none';
        var arrow = row.querySelector('.song-arrow');
        if (arrow) arrow.textContent = next.style.display === '' ? '▼' : '▶';
        return;
    }
    var song = row.dataset.song;
    if (!song) return;
    var tr = document.createElement('tr');
    tr.dataset.songRow = '1';
    var td = document.createElement('td');
    td.colSpan = 3;
    td.style.cssText = 'padding:3px 6px 6px 18px; border:1px solid var(--win-border); border-top:none; color:var(--highlight-color); font-size:11px;';
    td.textContent = '♪ ' + song; // 用 textContent 避免任何 HTML 注入
    tr.appendChild(td);
    row.parentNode.insertBefore(tr, row.nextSibling);
    var arrow = row.querySelector('.song-arrow');
    if (arrow) arrow.textContent = '▼';
};
