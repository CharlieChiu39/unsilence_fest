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

window.downloadSetlist = function() {
    const days = [
        { id: 'day-530', label: '5/30 (六)' },
        { id: 'day-531', label: '5/31 (日)' }
    ];
    let lines = [
        '寧靜音樂節 UNSILENCE FESTIVAL 2026',
        '完整演出時刻表 + 曲目',
        '嘉義文化創意產業園區｜全程免費入場',
        ''
    ];
    days.forEach(({ id, label }) => {
        lines.push('='.repeat(40));
        lines.push(`  ${label}`);
        lines.push('='.repeat(40));
        const container = document.getElementById(id);
        if (!container) return;
        container.querySelectorAll('tbody tr').forEach(row => {
            if (row.dataset.songRow) return;
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) return;
            const seq = cells[0].textContent.trim();
            const time = cells[1].textContent.trim();
            const name = cells[2].querySelector('.song-arrow')
                ? cells[2].textContent.replace('▶','').replace('▼','').trim()
                : cells[2].textContent.trim();
            const song = row.dataset.song || '';
            if (seq === '—') {
                lines.push(`  ${time}  ${name}`);
            } else {
                lines.push(`  #${seq.padStart(2)}  ${time}  ${name}${song ? '  ♪ ' + song : ''}`);
            }
        });
        lines.push('');
    });
    lines.push('—'.repeat(40));
    lines.push('https://unsilence-fest.com');

    const text = lines.join('\n');
    const file = new File([text], 'UNSILENCE_2026_setlist.txt', { type: 'text/plain' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: '寧靜音樂節 2026 歌單' }).catch(() => {});
    } else {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'UNSILENCE_2026_setlist.txt';
        a.click();
        URL.revokeObjectURL(a.href);
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
