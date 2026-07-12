const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const detailEl = document.getElementById('product-detail');
const alertSlot = document.getElementById('alert-slot');

function showAlert(message, type = 'success') {
  alertSlot.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
  setTimeout(() => (alertSlot.innerHTML = ''), 3500);
}

async function loadProduct() {
  if (!productId) {
    detailEl.innerHTML = `<div class="empty-state"><h3>No product specified</h3></div>`;
    return;
  }

  try {
    const p = await fetchJSON(`/api/products/${productId}`);
    document.title = `${p.name} — Fieldstone Goods`;

    detailEl.innerHTML = `
      <div class="thumb"><img src="${p.image_url}" alt="${escapeHtml(p.name)}" /></div>
      <div>
        <div class="category">${escapeHtml(p.category)}</div>
        <h1>${escapeHtml(p.name)}</h1>
        <div class="price">${formatPrice(p.price)}</div>
        <p>${escapeHtml(p.description)}</p>
        <p class="stock-note">${
          p.stock > 0 ? `${p.stock} in stock` : 'Currently out of stock'
        }</p>
        <div class="qty-row">
          <div class="qty-stepper">
            <button type="button" id="qty-minus">−</button>
            <input type="number" id="qty-input" value="1" min="1" max="${p.stock}" />
            <button type="button" id="qty-plus">+</button>
          </div>
          <button class="btn btn-primary" id="add-to-cart-btn" ${
            p.stock === 0 ? 'disabled' : ''
          }>Add to cart</button>
        </div>
        <a href="/index.html" class="btn btn-outline">← Back to shop</a>
      </div>
    `;

    const qtyInput = document.getElementById('qty-input');
    document.getElementById('qty-minus').addEventListener('click', () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      qtyInput.value = Math.min(p.stock, parseInt(qtyInput.value, 10) + 1);
    });

    document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
      try {
        await fetchJSON('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: p.id, quantity: parseInt(qtyInput.value, 10) })
        });
        showAlert(`Added ${qtyInput.value} × "${p.name}" to your cart.`);
        refreshHeader();
      } catch (e) {
        showAlert(e.message, 'error');
      }
    });
  } catch (e) {
    detailEl.innerHTML = `<div class="empty-state"><h3>${escapeHtml(e.message)}</h3></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);
