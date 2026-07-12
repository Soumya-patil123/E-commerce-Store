const cartLayout = document.getElementById('cart-layout');
const cartAlertSlot = document.getElementById('alert-slot');

function showCartAlert(message, type = 'error') {
  cartAlertSlot.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
  setTimeout(() => (cartAlertSlot.innerHTML = ''), 3500);
}

async function loadCart() {
  const cart = await fetchJSON('/api/cart');

  if (cart.items.length === 0) {
    cartLayout.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Your cart is empty</h3>
        <p>Take a look through the shop and add something you like.</p>
        <a href="/index.html" class="btn btn-primary">Browse products</a>
      </div>`;
    return;
  }

  const itemsHtml = cart.items
    .map(
      (i) => `
      <div class="cart-item" data-product-id="${i.product.id}">
        <img src="${i.product.image_url}" alt="${escapeHtml(i.product.name)}" />
        <div>
          <div class="name">${escapeHtml(i.product.name)}</div>
          <div class="unit-price">${formatPrice(i.product.price)} each</div>
        </div>
        <div class="qty-stepper">
          <button type="button" class="qty-minus">−</button>
          <input type="number" class="qty-input" value="${i.quantity}" min="1" max="${i.product.stock}" />
          <button type="button" class="qty-plus">+</button>
        </div>
        <div style="text-align:right;">
          <div class="line-total">${formatPrice(i.lineTotal)}</div>
          <button class="remove-link">Remove</button>
        </div>
      </div>`
    )
    .join('');

  cartLayout.innerHTML = `
    <div>${itemsHtml}</div>
    <div class="summary-card">
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(cart.subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(cart.subtotal)}</span></div>
      <a href="/checkout.html" class="btn btn-primary btn-block" style="margin-top:16px;">Proceed to checkout</a>
    </div>
  `;

  cartLayout.querySelectorAll('.cart-item').forEach((row) => {
    const productId = row.dataset.productId;
    const qtyInput = row.querySelector('.qty-input');

    async function updateQty(newQty) {
      try {
        await fetchJSON('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: Number(productId), quantity: newQty })
        });
        await loadCart();
        refreshHeader();
      } catch (e) {
        showCartAlert(e.message);
      }
    }

    row.querySelector('.qty-minus').addEventListener('click', () => {
      const val = Math.max(1, parseInt(qtyInput.value, 10) - 1);
      updateQty(val);
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10) + 1;
      updateQty(val);
    });
    qtyInput.addEventListener('change', () => {
      updateQty(Math.max(1, parseInt(qtyInput.value, 10) || 1));
    });

    row.querySelector('.remove-link').addEventListener('click', async () => {
      await fetchJSON(`/api/cart/items/${productId}`, { method: 'DELETE' });
      await loadCart();
      refreshHeader();
    });
  });
}

document.addEventListener('DOMContentLoaded', loadCart);
