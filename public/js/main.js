// Shared across all pages: header auth state + cart badge count.

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

async function refreshHeader() {
  const navAccount = document.getElementById('nav-account');
  const cartCountEl = document.getElementById('cart-count');

  try {
    const { user } = await fetchJSON('/api/auth/me');
    if (navAccount) {
      if (user) {
        navAccount.innerHTML = `
          <a href="/orders.html">My Orders</a>
          <a href="#" id="logout-link">Sign out (${escapeHtml(user.name)})</a>
        `;
        document.getElementById('logout-link').addEventListener('click', async (e) => {
          e.preventDefault();
          await fetchJSON('/api/auth/logout', { method: 'POST' });
          window.location.href = '/index.html';
        });
      } else {
        navAccount.innerHTML = `
          <a href="/login.html">Sign in</a>
          <a href="/register.html">Register</a>
        `;
      }
    }
  } catch (e) {
    /* ignore — header still renders without account links */
  }

  try {
    const cart = await fetchJSON('/api/cart');
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = count;
  } catch (e) {
    /* ignore */
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatPrice(n) {
  return `$${Number(n).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', refreshHeader);
