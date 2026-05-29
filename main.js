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

    // 已處於持續亂碼狀態：跳過視覺動畫，直接開啟視窗
    if (btnElement.dataset.glitched === 'true') {
        openApp(windowTitle, fileUrl);
        return;
    }

    const originalText = btnElement.dataset.text || btnElement.innerText;
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
            // 若 0.3s 內使用者已觸發持續亂碼，不還原文字（避免閃爍）
            if (btnElement.dataset.glitched !== 'true') {
                btnElement.innerText = originalText;
            }
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
    // 遊戲視窗內由 game.js 自己處理，不再觸發 shatter（避免與 jump 雙重觸發）
    if (e.target.closest('#game-window')) return;

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
// 等寬亂碼字元集：半形原字只換半形、全形原字只換全形，避免亂碼撐爆寬度導致折行
const glitchHalf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
const glitchFull = "寧靜音樂節雜訊干擾";
function randGlitch(char) {
    const pool = char.charCodeAt(0) > 0xff ? glitchFull : glitchHalf;
    return pool[Math.floor(Math.random() * pool.length)];
}

const glitchTimers = new WeakMap();
function triggerGlitch(el, originalText) {
    if (!originalText) return; // #6 防呆：dataset.text 可能不存在
    let iterations = 0;
    // 清除前一輪 interval（如果有）
    const prev = glitchTimers.get(el);
    if (prev) clearInterval(prev);
    const id = setInterval(() => {
        el.textContent = originalText.split("").map((letter, index) => {
            if (index < iterations || letter === " ") {
                return originalText[index];
            }
            return randGlitch(letter);
        }).join("");
        if (iterations >= originalText.length) {
            clearInterval(id);
            glitchTimers.delete(el);
        }
        iterations += 1;
    }, 30);
    glitchTimers.set(el, id);
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

// =========================================
// 持久亂碼 toggle（用 WeakMap 記錄 interval）
// =========================================
function startPersistentGlitch(el, originalText) {
    const prev = glitchTimers.get(el);
    if (prev) { clearInterval(prev); glitchTimers.delete(el); }
    const id = setInterval(() => {
        el.textContent = originalText.split('').map((char) => {
            if (char === ' ' || char === '_') return char;
            if (Math.random() > 0.35) return randGlitch(char);
            return char;
        }).join('');
    }, 80);
    glitchTimers.set(el, id);
}

// 綁定選單連結特效（含 sidebar-bottom 的 CREDITS 連結）
document.querySelectorAll('.nav-links a, .sidebar-bottom-link').forEach(link => {
    const linkGlitch = (event) => {
        let el = event.currentTarget;
        // 持續亂碼狀態下停用 hover 特效
        if (el.dataset.glitched === 'true') return;
        triggerGlitch(el, el.dataset.text);
    };
    link.addEventListener('mouseover', linkGlitch);
    link.addEventListener('touchstart', linkGlitch, { passive: true });

    // 第一次點擊 → 持久亂碼；第二次點擊 → 還原原文
    link.addEventListener('click', function() {
        const el = this;
        const originalText = el.dataset.text;
        if (!originalText) return;

        if (el.dataset.glitched === 'true') {
            // 還原
            const prev = glitchTimers.get(el);
            if (prev) { clearInterval(prev); glitchTimers.delete(el); }
            el.textContent = originalText;
            el.dataset.glitched = 'false';
            delete el.dataset.tooltip;
        } else {
            // 啟動持久亂碼
            startPersistentGlitch(el, originalText);
            el.dataset.glitched = 'true';
            el.dataset.tooltip = '> 訊號干擾中 · 再點一下還原';
        }
    });
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
window.addEventListener('load', () => {
    setTimeout(showBios, 1200);
    setTimeout(() => {
        const boot = document.getElementById('crt-boot');
        if (boot) boot.remove();
    }, 2500);
    // iOS：測量 sidebar 高度並寫入 CSS 變數，讓 main-app-window / gallery-window
    // 從 sidebar 正下方開始，而非從 viewport 中心算起。
    updateIosWinTop();
});

function updateIosWinTop() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const h = sidebar.offsetHeight;
    if (h > 0) {
        document.documentElement.style.setProperty('--ios-win-top', (h + 6) + 'px');
    }
}
window.addEventListener('resize', updateIosWinTop);

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
let currentDragHeader = null;
let currentDragPointerId = null;
let dragOffsetX, dragOffsetY, dragParentX, dragParentY;

windows.forEach(win => {
    const header = win.querySelector('.window-header');
    const isTeaser = win.classList.contains('teaser-win');
    win.addEventListener('pointerdown', (e) => {
        focusWindow(win);
        // 可互動元素（按鈕、連結、有 onclick 的元素）不觸發拖曳，讓 click 正常發火
        if (e.target.closest('.close-btn') || e.target.closest('button') || e.target.closest('a') || e.target.closest('[onclick]')) return;
        // 非 teaser 視窗：只從 header 拖曳（content 區域可捲動，不搶奪 touch）
        if (!isTeaser && !e.target.closest('.window-header')) return;
        currentDragging = win;
        currentDragHeader = win; // setPointerCapture 改在 win 上，endDrag 亦同
        currentDragPointerId = e.pointerId;
        // iOS Safari：必須 setPointerCapture，否則 touch 拖曳時 pointermove 不穩定觸發
        try { win.setPointerCapture(e.pointerId); } catch (_) {}
        // iOS：preventDefault 阻止瀏覽器把此 touch 當作 scroll / text-selection 手勢
        if (e.pointerType === 'touch') e.preventDefault();
        const rect = win.getBoundingClientRect();
        // position: fixed 的視窗（iOS Safari 的 main-app / gallery / game）offsetParent 為 null。
        // 此時 inline left/top 是相對 viewport，等同 parentRect = {0,0}。
        const offsetParent = win.offsetParent;
        const parentRect = offsetParent ? offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
        dragParentX = parentRect.left; dragParentY = parentRect.top;
        win.style.transform = 'none'; win.style.margin = '0'; win.style.bottom = 'auto'; win.style.right = 'auto';
        win.style.left = `${rect.left - dragParentX}px`; win.style.top = `${rect.top - dragParentY}px`;
        dragOffsetX = e.clientX - rect.left; dragOffsetY = e.clientY - rect.top;
        if (e.pointerType === 'touch') win.style.touchAction = 'none';
    });
    // 所有視窗的關閉鈕：阻止 pointerdown 冒泡（避免被當作拖曳起點）
    const closeBtn = win.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    }
});

// 共用：把當前指標座標套用到正在拖曳的視窗
function applyDragPosition(clientX, clientY) {
    if (!currentDragging) return;
    const newLeft = clientX - dragOffsetX - dragParentX;
    const newTop = clientY - dragOffsetY - dragParentY;
    const MIN_VISIBLE = 100;
    const viewport = window.visualViewport;
    const viewportWidth = viewport ? viewport.width : window.innerWidth;
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const maxLeft = viewportWidth - MIN_VISIBLE;
    const maxTop = viewportHeight - MIN_VISIBLE;
    const minTop = -dragParentY;
    const minLeft = -currentDragging.offsetWidth + MIN_VISIBLE;
    currentDragging.style.left = `${Math.max(minLeft, Math.min(newLeft, maxLeft))}px`;
    currentDragging.style.top = `${Math.max(minTop, Math.min(newTop, maxTop))}px`;
}

// 單一全域監聽器（取代每個視窗各綁一組）
document.addEventListener('pointermove', (e) => {
    if (!currentDragging) return;
    e.preventDefault();
    applyDragPosition(e.clientX, e.clientY);
}, { passive: false });

function endDrag() {
    if (currentDragging && currentDragging.style.touchAction === 'none') currentDragging.style.touchAction = '';
    if (currentDragging && currentDragPointerId != null) {
        try { currentDragging.releasePointerCapture(currentDragPointerId); } catch (_) {}
    }
    currentDragging = null;
    currentDragHeader = null;
    currentDragPointerId = null;
}
function endPointerDrag(e) {
    // iOS Safari 在判定 touch 可能為 scroll 時會「立刻」派發 pointercancel
    // （甚至在使用者真的移動之前），如果直接收 currentDragging = null，後續的
    // touchmove fallback 就完全失效。touch 一律交給 touchend/touchcancel 收尾。
    if (e && e.pointerType === 'touch') return;
    endDrag();
}
document.addEventListener('pointerup', endPointerDrag);
document.addEventListener('pointercancel', endPointerDrag);

// iOS Safari fix：pointermove 是由 touchmove 合成出來的，在合成 event 上 preventDefault
// 不會阻止底層 touchmove 的默認行為，所以 iOS 仍會把 touch 解釋為 scroll，導致 pointermove
// 不穩定觸發甚至完全中斷。
// 解法：拖曳期間用非被動 touchmove 親自擋掉 scroll，同時直接從 touch 座標套用位置
// （作為 pointermove 沒觸發時的 fallback；如果 pointermove 也觸發了，兩邊算同一個結果，安全。）
document.addEventListener('touchmove', (e) => {
    if (!currentDragging) return;
    e.preventDefault();
    const t = e.touches[0];
    if (t) applyDragPosition(t.clientX, t.clientY);
}, { passive: false });
document.addEventListener('touchend', endDrag);
document.addEventListener('touchcancel', endDrag);

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
                const now = new Date();
                // 只有 5/30 或 5/31 才標 [NOW]
                const m = now.getMonth() + 1, d = now.getDate();
                if (!((m === 5 && d === 30) || (m === 5 && d === 31))) return;
                const currentTime = now.getHours() + (now.getMinutes() / 60);
                const dayId = d === 30 ? 'day-530' : 'day-531';
                // 活動當天自動切到今天的頁籤（5/30 為預設，只需在 5/31 主動切換）
                if (d === 31 && typeof window.switchDay === 'function') window.switchDay('531');
                const rows = document.querySelectorAll('#' + dayId + ' tbody tr');
                rows.forEach(row => {
                    if (row.dataset.songRow) return;
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 3) return;
                    // 從時間欄字串解析（格式：「12:30 – 12:35」）
                    const timeStr = cells[1].textContent.trim();
                    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*[–\-—~]\s*(\d{1,2}):(\d{2})/);
                    if (!match) return;
                    const start = parseInt(match[1]) + parseInt(match[2]) / 60;
                    const end = parseInt(match[3]) + parseInt(match[4]) / 60;
                    if (currentTime >= start && currentTime < end) {
                        row.classList.add('current-slot');
                        // 用 DOM API 安全附加，避免 innerHTML 重複附加
                        if (!row.querySelector('.now-tag')) {
                            const tag = document.createElement('span');
                            tag.className = 'now-tag';
                            tag.textContent = '[NOW]';
                            cells[0].appendChild(tag);
                        }
                    }
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
    if (!appWin) return;
    appWin.style.display = 'none';
    const content = document.getElementById('app-dynamic-content');
    if (content) content.innerHTML = '';
    cascadeX = 60; cascadeY = 60;
    appWin.style.top = ''; appWin.style.left = ''; appWin.style.bottom = ''; appWin.style.right = ''; appWin.style.transform = '';
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
    const isAllowed = EXT_LINK_WHITELIST.some(prefix => url.startsWith(prefix));
    if (!isAllowed) { console.warn('Blocked external URL:', url); return; }
    if (typeof gtag === 'function') gtag('event', 'external_link_click', { link_url: url });
    const overlay = document.getElementById('ext-overlay');
    const modal = document.getElementById('ext-modal');
    const confirm = document.getElementById('ext-confirm-btn');
    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'block';
    if (confirm) confirm.href = url;
};
function closeExternalWarning() {
    const overlay = document.getElementById('ext-overlay');
    const modal = document.getElementById('ext-modal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
}

// =========================================
// 分享按鈕 (Web Share API + clipboard fallback)
// =========================================
const SHARE_URL = 'https://unsilence-fest.com/';

function showShareFeedback(message) {
    const btn = document.getElementById('share-btn');
    if (btn) {
        const origTooltip = btn.dataset.origTooltip || btn.getAttribute('data-tooltip') || '> SHARE_訊號';
        btn.dataset.origTooltip = origTooltip;
        btn.setAttribute('data-tooltip', message);
        btn.setAttribute('title', message.replace(/^>\s*/, ''));
        clearTimeout(btn._shareFeedbackTimer);
        btn._shareFeedbackTimer = setTimeout(() => {
            btn.setAttribute('data-tooltip', origTooltip);
            btn.setAttribute('title', '分享活動');
        }, 2200);
    }

    let toast = document.getElementById('share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

async function copyShareUrl() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(SHARE_URL);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = SHARE_URL;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('copy command failed');
}

window.shareWebsite = async function() {
    if (typeof gtag === 'function') gtag('event', 'share_click');
    const shareData = {
        title: '寧靜音樂節 UNSILENCE FESTIVAL 2026',
        text: '搖滾 × 吉他 × 嘻哈，全程免費入場｜5/30-31 嘉義文化創意產業園區',
        url: SHARE_URL
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showShareFeedback('> 分享完成');
            return;
        } catch (error) {
            if (error && error.name === 'AbortError') {
                showShareFeedback('> 分享已取消');
                return;
            }
        }
    }

    try {
        await copyShareUrl();
        showShareFeedback('> 已複製連結!');
    } catch (error) {
        console.warn('Share fallback failed:', error);
        showShareFeedback(`> 請複製：${SHARE_URL}`);
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
const modeToggleBtn = document.getElementById('mode-toggle');
if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', (e) => {
        document.body.classList.remove(`${modes[currentModeIndex]}-mode`);
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        document.body.classList.add(`${modes[currentModeIndex]}-mode`);
        e.currentTarget.textContent = modeLabels[currentModeIndex];
        if (themeColorMeta) themeColorMeta.setAttribute('content', modeThemeColors[currentModeIndex]);
    });
}

// =========================================
// Gallery 相簿（商品形象照扇形瀏覽）
// =========================================
const GALLERY_DATA = {
    guitar:    { name: '壓克力吊飾・吉他款', images: ['吉他壓克力形象照1.jpg', '吉他壓克力形象照2.jpg'] },
    cat:       { name: '壓克力吊飾・貓咪款', images: ['貓咪壓克力形象照.jpg'] },
    towel:     { name: '毛巾',               images: ['毛巾形象照1.jpg', '毛巾形象照2.jpg', '毛巾形象照3.jpg', '毛巾形象照4.jpg'] },
    cupsleeve: { name: '杯套',               images: ['杯套形象照1.jpg', '杯套形象照2.jpg'] },
    lighter:   { name: '打火機',             images: ['打火機形象照1.jpg', '打火機形象照2.jpg'] }
};

let galleryProduct = null;
let galleryIdx = 0;

function galleryFanAngles(n) {
    if (n === 1) return [0];
    const max = n <= 2 ? 15 : n <= 3 ? 22 : 30;
    return Array.from({ length: n }, (_, i) => -max + (2 * max / (n - 1)) * i);
}

function galleryFanOffsets(n) {
    if (n === 1) return [0];
    const step = 55;
    return Array.from({ length: n }, (_, i) => Math.round(-step * (n - 1) / 2 + step * i));
}

function gallerySelectCard(idx) {
    if (idx === galleryIdx) return;
    galleryIdx = idx;
    const images = galleryProduct.images;
    const pad = n => String(n + 1).padStart(2, '0');

    // B: glitch flash，src 延遲 80ms 在閃爍中途更新
    const mainImg = document.getElementById('gallery-main-img');
    mainImg.classList.remove('gallery-glitch');
    void mainImg.offsetWidth;
    mainImg.classList.add('gallery-glitch');
    mainImg.addEventListener('animationend', () => mainImg.classList.remove('gallery-glitch'), { once: true });
    setTimeout(() => { mainImg.src = 'images/goods/' + images[idx]; }, 80);

    // C: 掃描線擦過
    const scanEl = document.getElementById('gallery-scan');
    scanEl.classList.remove('scanning');
    void scanEl.offsetWidth;
    scanEl.classList.add('scanning');
    scanEl.addEventListener('animationend', () => scanEl.classList.remove('scanning'), { once: true });

    document.getElementById('gallery-info').textContent = `> IMG_${pad(idx)} / ${pad(images.length - 1)} · ${galleryProduct.name}`;
    document.querySelectorAll('.gallery-card').forEach(card => {
        const sel = parseInt(card.dataset.idx) === idx;
        card.classList.toggle('selected', sel);
        card.style.zIndex = sel ? 100 : card.dataset.baseZ;
    });
}

window.openGallery = function(productKey) {
    const data = GALLERY_DATA[productKey];
    if (!data) return;
    galleryProduct = data;
    galleryIdx = 0;

    const win = document.getElementById('gallery-window');
    const pad = n => String(n + 1).padStart(2, '0');
    document.getElementById('gallery-title').textContent = `📷 GALLERY_${productKey.toUpperCase()}.img`;
    document.getElementById('gallery-main-img').src = 'images/goods/' + data.images[0];
    document.getElementById('gallery-main-img').alt = data.name;
    document.getElementById('gallery-info').textContent = `> IMG_${pad(0)} / ${pad(data.images.length - 1)} · ${data.name}`;

    const fanEl = document.getElementById('gallery-fan');
    fanEl.innerHTML = '';
    const angles = galleryFanAngles(data.images.length);
    const offsets = galleryFanOffsets(data.images.length);
    data.images.forEach((img, i) => {
        const card = document.createElement('div');
        card.className = 'gallery-card' + (i === 0 ? ' selected' : '');
        card.dataset.idx = i;
        card.dataset.baseZ = i + 1;
        card.style.setProperty('--fan-angle', angles[i] + 'deg');
        card.style.setProperty('--fan-x', offsets[i] + 'px');
        card.style.zIndex = i === 0 ? 100 : i + 1;
        // A: 扇形展開動畫，從疊合狀態 stagger 展開
        card.style.opacity = '0';
        card.style.transform = 'translateX(0) rotate(0deg) scale(0.8)';
        card.style.transition = 'none';
        card.style.willChange = 'transform, opacity';
        card.innerHTML = `<img src="images/goods/${img}" alt="IMG_${pad(i)}" loading="lazy"><span class="card-label">IMG_${pad(i)}</span>`;
        card.addEventListener('click', () => gallerySelectCard(i));
        fanEl.appendChild(card);
        setTimeout(() => {
            card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, border-color 0.2s, box-shadow 0.25s ease';
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = '';
            });
            card.addEventListener('transitionend', function cleanup(e) {
                if (e.propertyName === 'transform') {
                    card.style.transition = '';
                    card.style.willChange = '';
                    card.removeEventListener('transitionend', cleanup);
                }
            });
        }, i * 70);
    });

    win.style.display = 'flex';
    focusWindow(win);
    const pos = getSmartPosition();
    if (!pos.isMobile) { win.style.top = pos.top; win.style.left = pos.left; }
};

window.closeGallery = function() {
    const win = document.getElementById('gallery-window');
    win.style.display = 'none';
    win.style.top = '';
    win.style.left = '';
    win.style.bottom = '';
    win.style.right = '';
    win.style.transform = '';
};

// =========================================
// 矩陣背景（改用 requestAnimationFrame）
// =========================================
const canvas = document.getElementById('matrix-bg'); const ctx = canvas.getContext('2d');
let cw, ch; const fontSize = 18; let columns = []; const noiseChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789寧靜音樂節'.split(''); const pineappleChars = ['🍍'];
function initCanvas() {
    const viewport = window.visualViewport;
    const newCw = Math.ceil(viewport ? viewport.width : window.innerWidth);
    const newCh = Math.ceil(viewport ? viewport.height : window.innerHeight);
    // 尺寸沒變直接略過：iOS/Android 捲動時網址列縮放會狂發 visualViewport resize，
    // 若每次都重建 columns，雨滴會被重置成從頂端落下而閃爍。
    if (newCw === cw && newCh === ch) return;
    cw = newCw;
    ch = newCh;
    canvas.width = cw;
    canvas.height = ch;
    const colCount = Math.floor(cw / fontSize) + 1;
    // 只有寬度（欄數）真的改變才重建雨滴；純高度變化（網址列）保留現有雨滴狀態。
    if (columns.length !== colCount) {
        columns = [];
        for (let i = 0; i < colCount; i++) { columns[i] = Math.random() * -100; }
    }
}
window.addEventListener('resize', initCanvas);
if (window.visualViewport) window.visualViewport.addEventListener('resize', initCanvas);
initCanvas();
function drawMatrix() { if (document.body.classList.contains('tranquil-mode')) { ctx.fillStyle = 'rgba(17, 17, 17, 0.15)'; ctx.fillRect(0, 0, cw, ch); return; } ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? 'rgba(26, 26, 0, 0.15)' : 'rgba(10, 5, 16, 0.15)'; ctx.fillRect(0, 0, cw, ch); ctx.font = `${fontSize}px 'DotGothic16', monospace`; ctx.textBaseline = 'top'; ctx.fillStyle = document.body.classList.contains('pineapple-mode') ? '#ffcc00' : '#0f0'; const chars = document.body.classList.contains('pineapple-mode') ? pineappleChars : noiseChars; for (let i = 0; i < columns.length; i++) { const char = chars[Math.floor(Math.random() * chars.length)]; const x = i * fontSize; const y = columns[i] * fontSize; ctx.fillText(char, x, y); if (y > ch && Math.random() > 0.975) { columns[i] = 0; } else { columns[i]++; } } }

// mobile 降頻：手機從 20fps 改為 10fps（省電 + 減少 jank）
const isMobileDevice = window.matchMedia('(max-width: 800px)').matches
    || /Android|iPhone|iPad/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)); // iPadOS 13+ 偽裝成桌面 UA
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
    // 用 class 切換，避免 cssText 無限累加
    btn530.classList.toggle('tab-active', day === '530');
    btn530.classList.toggle('tab-inactive', day !== '530');
    btn531.classList.toggle('tab-active', day === '531');
    btn531.classList.toggle('tab-inactive', day !== '531');
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
    // 支援多首歌，以 ' | ' 分隔，每首獨立一行
    var songs = song.split(' | ');
    var tr = document.createElement('tr');
    tr.dataset.songRow = '1';
    var td = document.createElement('td');
    td.colSpan = 3;
    td.style.cssText = 'padding:3px 6px 6px 18px; border:1px solid var(--win-border); border-top:none; color:var(--highlight-color); font-size:11px; line-height:1.9;';
    songs.forEach(function(s, i) {
        if (i > 0) td.appendChild(document.createElement('br'));
        td.appendChild(document.createTextNode('♪ ' + s.trim()));
    });
    tr.appendChild(td);
    row.parentNode.insertBefore(tr, row.nextSibling);
    var arrow = row.querySelector('.song-arrow');
    if (arrow) arrow.textContent = '▼';
};
