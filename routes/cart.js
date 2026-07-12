const express = require('express');
const db = require('../db/database');

const router = express.Router();

function getCart(req) {
  if (!req.session.cart) req.session.cart = {}; // { productId: quantity }
  return req.session.cart;
}

function cartWithDetails(cart) {
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) return { items: [], subtotal: 0 };

  const placeholders = ids.map(() => '?').join(',');
  const products = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids);

  const items = products.map((p) => ({
    product: p,
    quantity: cart[p.id],
    lineTotal: Math.round(p.price * cart[p.id] * 100) / 100
  }));

  const subtotal = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  return { items, subtotal };
}

// Get current cart
router.get('/', (req, res) => {
  const cart = getCart(req);
  res.json(cartWithDetails(cart));
});

// Add / update item quantity
router.post('/items', (req, res) => {
  const { productId, quantity } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (qty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  const cart = getCart(req);
  cart[productId] = qty;
  res.json(cartWithDetails(cart));
});

// Remove item
router.delete('/items/:productId', (req, res) => {
  const cart = getCart(req);
  delete cart[req.params.productId];
  res.json(cartWithDetails(cart));
});

// Clear cart
router.delete('/', (req, res) => {
  req.session.cart = {};
  res.json({ items: [], subtotal: 0 });
});

module.exports = router;
