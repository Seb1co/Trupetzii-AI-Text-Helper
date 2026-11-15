(
    function () {
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
            loginForm.addEventListener('submit', async function (event) {
                event.preventDefault();

                const username = loginForm.elements.username.value.trim();
                const password = loginForm.elements.password.value;
                const rememberUser = loginForm.elements.remember.checked;
                const loginMessage = document.getElementById('loginMessage');
                const submitButton = loginForm.querySelector('button[type="submit"]');

                if (loginMessage) {
                    loginMessage.textContent = '';
                }
                if (submitButton) {
                    submitButton.disabled = true;
                }

                try {
                    const response = await fetch('http://127.0.0.1:8000/log_in', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const result = await response.json();

                    if (!response.ok || result.status !== 'success') {
                        if (loginMessage) {
                            loginMessage.textContent = result.message || 'Invalid username or password.';
                        }
                        return;
                    }

                    clearCurrentUser();
                    (rememberUser ? localStorage : sessionStorage).setItem(usernameKey, username);
                    window.location.replace('index.html');
                } catch (error) {
                    console.error('Login request failed:', error);
                    if (loginMessage) {
                        loginMessage.textContent = 'Could not connect to the server. Please try again.';
                    }
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }
            });
        }
        return;
    }

    const username = getCurrentUser();
    window.username = username;
    console.log(username);
    
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