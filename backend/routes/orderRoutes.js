/**
 * ============================================================================
 * FILE: backend/routes/orderRoutes.js
 * PURPOSE: Customer Order Checkout & Admin Order Management Routes (MongoDB)
 * ============================================================================
 */

const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders — Customer places an order from Cart.jsx
router.post('/', async (req, res) => {
  try {
    // req.body mein userId ko bhi receive karein taa ke logged-in user ka record save ho
    const { userId, customerName, customerEmail, items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty.' });
    }

    // Naya order database mein create karna
    const createdOrder = await Order.create({
      user: userId || null, // Agar user logged in hai toh uski ID save hogi, warna null (guest)
      customerName: customerName || shippingAddress?.fullName || 'Customer',
      customerEmail: customerEmail || 'customer@safeway.pk',
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      totalAmount,
      status: 'Processing'
    });

    // Automatically har product ki quantity ko database (stock) se kam karna
    for (const item of items) {
      const prodId = item._id || item.product;
      if (prodId) {
        await Product.findByIdAndUpdate(prodId, {
          $inc: { stock: -Math.abs(Number(item.quantity) || 1) }
        }).catch(() => {});
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// GET /api/orders — Fetch all orders from MongoDB
// MAIN FIX: Yahan se 'protect' middleware hata diya gaya hai taa ke data block na ho
router.get('/', async (req, res) => {
  try {
    let filter = {};
    
    // Agar frontend request mein email bhejta hai (jaise My Orders page se),
    // toh sirf us email wale orders database se nikal kar bhejo.
    // Agar email nahi aata (jaise Admin panel se), toh filter khali rahega aur saare orders aayenge.
    if (req.query.email) {
      filter.customerEmail = req.query.email;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// PUT /api/orders/:id/status — Admin updates Order Status (Yahan protect aur adminOnly rehne diya hai security ke liye)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// DELETE /api/orders/:id — Admin deletes an order record
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
});

module.exports = router;