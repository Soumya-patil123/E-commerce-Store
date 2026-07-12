const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// =======================
// Checkout
// =======================
router.post('/checkout', requireAuth, (req, res) => {
  const cart = req.session.cart || {};
  const ids = Object.keys(cart).map(Number);
  const { shippingName, shippingAddress } = req.body;

  if (ids.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  if (!shippingName || !shippingAddress) {
    return res.status(400).json({
      error: 'Shipping name and address are required.'
    });
  }

  const placeholders = ids.map(() => '?').join(',');
  const products = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids);

  // Check stock
  for (const p of products) {
    if (cart[p.id] > p.stock) {
      return res.status(400).json({
        error: `"${p.name}" only has ${p.stock} left in stock.`
      });
    }
  }

  const total =
    Math.round(
      products.reduce((sum, p) => sum + p.price * cart[p.id], 0) * 100
    ) / 100;

  const placeOrder = db.transaction(() => {

    const orderResult = db.prepare(`
      INSERT INTO orders
      (user_id,total,status,shipping_name,shipping_address)
      VALUES (?,?, 'placed', ?, ?)
    `).run(
      req.session.userId,
      total,
      shippingName,
      shippingAddress
    );

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items
      (order_id,product_id,quantity,price)
      VALUES (?,?,?,?)
    `);

    const updateStock = db.prepare(`
      UPDATE products
      SET stock = stock - ?
      WHERE id = ?
    `);

    for (const p of products) {
      insertItem.run(orderId, p.id, cart[p.id], p.price);
      updateStock.run(cart[p.id], p.id);
    }

    return orderId;
  });

  const orderId = placeOrder();

  req.session.cart = {};

  res.status(201).json({
    orderId,
    total
  });
});

// =======================
// Get Orders
// =======================
router.get('/', requireAuth, (req, res) => {

  const orders = db.prepare(`
    SELECT *
    FROM orders
    WHERE user_id=?
    ORDER BY created_at DESC
  `).all(req.session.userId);

  res.json(orders);

});

// =======================
// Order Details
// =======================
router.get('/:id', requireAuth, (req, res) => {

  const order = db.prepare(`
    SELECT *
    FROM orders
    WHERE id=? AND user_id=?
  `).get(req.params.id, req.session.userId);

  if (!order) {
    return res.status(404).json({
      error: 'Order not found.'
    });
  }

  const items = db.prepare(`
    SELECT
      oi.quantity,
      oi.price,
      p.name,
      p.image_url
    FROM order_items oi
    JOIN products p
      ON p.id = oi.product_id
    WHERE oi.order_id=?
  `).all(order.id);

  res.json({
    ...order,
    items
  });

});

// =======================
// Cancel Order
// =======================
router.delete('/:id', requireAuth, (req, res) => {

  const order = db.prepare(`
    SELECT *
    FROM orders
    WHERE id=? AND user_id=?
  `).get(req.params.id, req.session.userId);

  if (!order) {
    return res.status(404).json({
      error: 'Order not found.'
    });
  }

  // Restore stock
  const items = db.prepare(`
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id=?
  `).all(req.params.id);

  const restore = db.prepare(`
    UPDATE products
    SET stock = stock + ?
    WHERE id = ?
  `);

  const transaction = db.transaction(() => {

    for (const item of items) {
      restore.run(item.quantity, item.product_id);
    }

    db.prepare(`
      DELETE FROM order_items
      WHERE order_id=?
    `).run(req.params.id);

    db.prepare(`
      DELETE FROM orders
      WHERE id=?
    `).run(req.params.id);

  });

  transaction();

  res.json({
    success: true,
    message: 'Order cancelled successfully.'
  });

});

module.exports = router;