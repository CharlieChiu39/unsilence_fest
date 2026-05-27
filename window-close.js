(() => {
    const GLYPHS = ['†', '░', '⊗', '✕', '×', '✗'];

    // iOS Ghost-Click 防護：視窗關閉後 ~300ms 內，iOS 會在相同座標補發
    // 一個合成 click 事件，可能打到底層的 mode-toggle 等按鈕。
    // 僅在 iOS 上啟用，用時間戳記攔截這個多餘的 click。
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let _ghostGuardUntil = 0;

    function closeWindow(win) {
        if (!win) return;
        win.classList.remove('window-closing');

        if (win.classList.contains('alert-modal')) {
            if (typeof window.closeExternalWarning === 'function') {
                window.closeExternalWarning();
            } else {
                win.style.display = 'none';
                const overlay = document.getElementById('ext-overlay');
                if (overlay) overlay.style.display = 'none';
            }
            return;
        }

        if (win.id === 'main-app-window') {
            if (typeof window.closeApp === 'function') window.closeApp();
            else { win.style.display = 'none'; const c = document.getElementById('app-dynamic-content'); if (c) c.innerHTML = ''; }
            return;
        }

        if (win.id === 'gallery-window') {
            if (typeof window.closeGallery === 'function') window.closeGallery();
            else win.style.display = 'none';
            return;
        }

        if (win.id === 'game-window') {
            if (typeof window.closeGame === 'function') window.closeGame();
            else win.style.display = 'none';
            return;
        }

        win.style.display = 'none';
    }

    function playCloseEffect(btn, win, onDone) {
        // B: X glitch 閃爍
        let t = 0;
        const iv = setInterval(() => {
            btn.textContent = GLYPHS[t++ % GLYPHS.length];
            if (t >= 5) {
                clearInterval(iv);
                btn.textContent = 'X';
                onDone();
            }
        }, 40); // 5 × 40ms = 200ms

        // D: 視窗淡出 + 亮閃
        win.classList.add('window-closing');
        win.addEventListener('animationend', () => win.classList.remove('window-closing'), { once: true });
    }

    function handleClose(event) {
        // iOS Ghost-Click 攔截：若在防護期內收到非 close-btn 的 click，直接吸收
        if (isIOS && event.type === 'click' && Date.now() < _ghostGuardUntil) {
            if (!(event.target.closest && event.target.closest('.close-btn'))) {
                event.stopPropagation();
                event.preventDefault();
                return;
            }
        }

        const btn = event.target.closest && event.target.closest('.close-btn');
        if (!btn) return;

        const win = btn.closest('.window');
        if (!win) return;

        // 所有 phase 都攔截，但只在 pointerdown 時啟動特效（避免三次觸發）
        event.preventDefault();
        event.stopPropagation();
        if (event.type !== 'pointerdown') return;

        // 防止重複觸發
        if (btn.dataset.closing) return;
        btn.dataset.closing = '1';

        playCloseEffect(btn, win, () => {
            delete btn.dataset.closing;
            closeWindow(win);
            // 視窗關閉後設定 ghost-click 防護期（iOS 補發 click 約在 300ms 內）
            if (isIOS) _ghostGuardUntil = Date.now() + 450;
        });
    }

    document.addEventListener('pointerdown', handleClose, true);
    document.addEventListener('pointerup', handleClose, true);
    document.addEventListener('click', handleClose, true);
})();
