const grid = document.getElementById('product-grid');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search-input');

let debounceTimer;

function renderProducts(products) {
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Nothing matches that search</h3>
        <p>Try a different keyword or clear the filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
      <a class="product-card" href="/product.html?id=${p.id}">
        <div class="thumb"><img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" /></div>
        <div class="body">
          <div class="category">${escapeHtml(p.category)}</div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="price">${formatPrice(p.price)}</div>
        </div>
      </a>`
    )
    .join('');
}

async function loadCategories() {
  const categories = await fetchJSON('/api/products/categories');
  categoryFilter.innerHTML =
    '<option value="">All categories</option>' +
    categories.map((c) => `<option value="${c}">${escapeHtml(c)}</option>`).join('');
}

async function loadProducts() {
  const category = categoryFilter.value;
  const q = searchInput.value.trim();
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (q) params.set('q', q);

  const products = await fetchJSON(`/api/products?${params.toString()}`);
  renderProducts(products);
}

categoryFilter.addEventListener('change', loadProducts);
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 250);
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadProducts();
});
