(function () {
    const usernameKey = 'studia-user';
    const page = window.location.pathname.split('/').pop() || 'index.html';

    function getCurrentUser() {
        return sessionStorage.getItem(usernameKey) || localStorage.getItem(usernameKey);
    }

    function clearCurrentUser() {
        sessionStorage.removeItem(usernameKey);
        localStorage.removeItem(usernameKey);
    }

    if (page === 'login.html') {
        if (getCurrentUser()) {
            window.location.replace('index.html');
            return;
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const username = loginForm.elements.username.value.trim();
                const rememberUser = loginForm.elements.remember.checked;
                clearCurrentUser();
                (rememberUser ? localStorage : sessionStorage).setItem(usernameKey, username);
                window.location.replace('index.html');
            });
        }
        return;
    }

    const username = getCurrentUser();
    if (!username) {
        window.location.replace('login.html');
        return;
    }

    const profileName = document.querySelector('.profession');
    if (profileName) {
        profileName.textContent = `@${username}`;
    }

    document.querySelectorAll('[data-logout]').forEach(function (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            clearCurrentUser();
            window.location.replace('login.html');
        });
    });
})();