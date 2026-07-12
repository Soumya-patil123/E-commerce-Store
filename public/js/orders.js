const ordersList = document.getElementById('orders-list');
const ordersAlertSlot = document.getElementById('alert-slot');

// Cancel Order
async function cancelOrder(id) {

  const confirmCancel = confirm("Are you sure you want to cancel this order?");

  if (!confirmCancel) return;

  try {

    const response = await fetch(`/api/orders/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to cancel order.");
    }

    alert("Order cancelled successfully!");

    init();

  } catch (err) {
    alert(err.message);
  }
}

async function init() {

  const { user } = await fetchJSON('/api/auth/me');

  if (!user) {
    window.location.href = '/login.html?redirect=/orders.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const placedId = params.get('placed');

  if (placedId) {
    ordersAlertSlot.innerHTML = `
      <div class="alert alert-success">
        Order #${placedId} placed successfully — thank you!
      </div>`;
  }

  const orders = await fetchJSON('/api/orders');

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <h3>No orders yet</h3>
        <p>Once you place an order, it'll show up here.</p>
        <a href="/index.html" class="btn btn-primary">
          Browse products
        </a>
      </div>`;
    return;
  }

  const detailPromises = orders.map((o) =>
    fetchJSON(`/api/orders/${o.id}`)
  );

  const fullOrders = await Promise.all(detailPromises);

  ordersList.innerHTML = fullOrders.map((o) => `

    <div class="order-card">

      <div class="order-head">
        <div>
          <strong>Order #${o.id}</strong>

          <span style="color:var(--iron); margin-left:10px;">
            ${new Date(o.created_at).toLocaleString()}
          </span>
        </div>

        <span class="status-pill">
          ${escapeHtml(o.status)}
        </span>
      </div>

      ${o.items.map((i) => `
        <div class="order-line">
          <span>${i.quantity} × ${escapeHtml(i.name)}</span>
          <span>${formatPrice(i.price * i.quantity)}</span>
        </div>
      `).join('')}

      <div class="summary-row total">
        <span>Total</span>
        <span>${formatPrice(o.total)}</span>
      </div>

      <p style="margin-top:10px; color:var(--iron); font-size:0.85rem;">
        Shipping to ${escapeHtml(o.shipping_name)}, ${escapeHtml(o.shipping_address)}
      </p>

      <button
        onclick="cancelOrder(${o.id})"
        class="btn btn-danger"
        style="margin-top:15px;">
        Cancel Order
      </button>

    </div>

  `).join('');
}

document.addEventListener('DOMContentLoaded', init);