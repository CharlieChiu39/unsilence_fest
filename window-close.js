(() => {
    function closeWindow(win) {
        if (!win) return;

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
            win.style.display = 'none';
            const content = document.getElementById('app-dynamic-content');
            if (content) content.innerHTML = '';
            return;
        }

        if (win.id === 'game-window' && typeof window.closeGame === 'function') {
            window.closeGame();
            return;
        }

        win.style.display = 'none';
    }

    function handleClose(event) {
        const btn = event.target.closest && event.target.closest('.close-btn');
        if (!btn) return;

        const win = btn.closest('.window');
        if (!win) return;

        event.preventDefault();
        event.stopPropagation();
        closeWindow(win);
    }

    document.addEventListener('pointerdown', handleClose, true);
    document.addEventListener('pointerup', handleClose, true);
    document.addEventListener('click', handleClose, true);
})();
