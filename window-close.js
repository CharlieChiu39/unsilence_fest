(() => {
    const GLYPHS = ['†', '░', '⊗', '✕', '×', '✗'];

    // Ghost-Click 防護：視窗關閉後瀏覽器可能在相同座標補發合成 click 事件，
    // 可能打到底層的 mode-toggle 等按鈕。
    // 關鍵：guard 必須在 pointerdown 當下（t=0）立刻設定，
    // 因為 viewport-fit=cover 移除了 300ms 延遲，ghost click 最快在 t≈50ms 就到。
    let _ghostGuardUntil = 0;
    let _ghostGuardX = -9999;
    let _ghostGuardY = -9999;

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
        // X glitch 閃爍
        let t = 0;
        const iv = setInterval(() => {
            btn.textContent = GLYPHS[t++ % GLYPHS.length];
            if (t >= 5) {
                clearInterval(iv);
                btn.textContent = 'X';
                onDone();
            }
        }, 40); // 5 × 40ms = 200ms

        // 視窗淡出 + 亮閃
        win.classList.add('window-closing');
        win.addEventListener('animationend', () => win.classList.remove('window-closing'), { once: true });
    }

    function handleClose(event) {
        // Ghost-Click 攔截：在防護期內，若 click 落在關閉按鈕附近且不是 close-btn 本身，吸收掉
        if (event.type === 'click' && Date.now() < _ghostGuardUntil) {
            if (!(event.target.closest && event.target.closest('.close-btn'))) {
                const dx = event.clientX - _ghostGuardX;
                const dy = event.clientY - _ghostGuardY;
                if (dx * dx + dy * dy < 80 * 80) {
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }
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

        // ★ 立刻設定 ghost-click 防護（不能等動畫結束才設，那樣已經太晚了）
        _ghostGuardUntil = Date.now() + 600;
        _ghostGuardX = event.clientX;
        _ghostGuardY = event.clientY;

        playCloseEffect(btn, win, () => {
            delete btn.dataset.closing;
            closeWindow(win);
            // 動畫結束後再延長一次，確保完整覆蓋
            _ghostGuardUntil = Math.max(_ghostGuardUntil, Date.now() + 450);
        });
    }

    document.addEventListener('pointerdown', handleClose, true);
    document.addEventListener('pointerup', handleClose, true);
    document.addEventListener('click', handleClose, true);
})();
