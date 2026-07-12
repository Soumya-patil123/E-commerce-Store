const authAlertSlot = document.getElementById('alert-slot');

function showAuthAlert(message, type = 'error') {
  authAlertSlot.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || '/index.html';
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      await fetchJSON('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      window.location.href = getRedirectTarget();
    } catch (err) {
      showAuthAlert(err.message);
    }
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      await fetchJSON('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      window.location.href = getRedirectTarget();
    } catch (err) {
      showAuthAlert(err.message);
    }
  });
}
