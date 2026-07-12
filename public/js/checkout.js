const checkoutLayout = document.getElementById('checkout-layout');
const checkoutAlertSlot = document.getElementById('alert-slot');

function showCheckoutAlert(message, type = 'error') {
  checkoutAlertSlot.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
}

async function init() {
  const { user } = await fetchJSON('/api/auth/me');
  if (!user) {
    window.location.href = '/login.html?redirect=/checkout.html';
    return;
  }

  const cart = await fetchJSON('/api/cart');
  if (cart.items.length === 0) {
    checkoutLayout.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Your cart is empty</h3>
        <p>Add something to your cart before checking out.</p>
        <a href="/index.html" class="btn btn-primary">Browse products</a>
      </div>`;
    return;
  }

  const itemsHtml = cart.items
    .map(
      (i) => `
      <div class="order-line">
        <span>${i.quantity} × ${escapeHtml(i.product.name)}</span>
        <span>${formatPrice(i.lineTotal)}</span>
      </div>`
    )
    .join('');

  checkoutLayout.innerHTML = `
    <div class="form-card" style="max-width:none;">
      <h2>Shipping details</h2>
      <form id="checkout-form">
        <div class="field">
          <label for="shippingName">Full name</label>
          <input type="text" id="shippingName" required value="${escapeHtml(user.name)}" />
        </div>
        <div class="field">
          <label for="shippingAddress">Shipping address</label>
          <textarea id="shippingAddress" rows="3" required placeholder="Street, city, postal code, country"></textarea>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Place order</button>
      </form>
    </div>
    <div class="summary-card">
      <h3 style="margin-bottom:14px;">Order summary</h3>
      ${itemsHtml}
      <div class="summary-row total"><span>Total</span><span>${formatPrice(cart.subtotal)}</span></div>
    </div>
  `;

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const shippingName = document.getElementById('shippingName').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    try {
      const result = await fetchJSON('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingName, shippingAddress })
      });
      window.location.href = `/orders.html?placed=${result.orderId}`;
    } catch (err) {
      showCheckoutAlert(err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
