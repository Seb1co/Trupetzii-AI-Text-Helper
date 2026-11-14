(() => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar .toggle');
    const modeToggle = document.querySelector('.mode .toggle-switch');
    const modeText = document.querySelector('.mode .mode-text');

    function setDarkMode(isDark) {
        document.body.classList.toggle('dark', isDark);

        if (modeToggle) {
            modeToggle.setAttribute('aria-pressed', String(isDark));
            modeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        }

        if (modeText) {
            modeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
    }

    setDarkMode(localStorage.getItem('studia-theme') === 'dark');

    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark');
            setDarkMode(isDark);
            localStorage.setItem('studia-theme', isDark ? 'dark' : 'light');
        });
    }

    if (sidebar && sidebarToggle) {
        const savedSidebarState = localStorage.getItem('studia-sidebar');
        const isCollapsed = savedSidebarState
            ? savedSidebarState === 'collapsed'
            : window.matchMedia('(max-width: 700px)').matches;
        sidebar.classList.toggle('close', isCollapsed);
        sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
        sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');

        sidebarToggle.addEventListener('click', () => {
            const collapsed = sidebar.classList.toggle('close');
            localStorage.setItem('studia-sidebar', collapsed ? 'collapsed' : 'expanded');
            sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
            sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        });
    }
})();
