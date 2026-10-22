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

// POST /api/orders — Customer places an order from Cart.jsx (Saved in MongoDB `orders` collection)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty.' });
    }

    const createdOrder = await Order.create({
      customerName: customerName || shippingAddress?.fullName || 'Customer',
      customerEmail: customerEmail || 'customer@safeway.pk',
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      totalAmount,
      status: 'Processing'
    });

    // Automatically deduct purchased quantity from each product's stock in MongoDB
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

// GET /api/orders — Fetch all orders from MongoDB (Used by Admin Panel & My orders page)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.email) {
      filter.customerEmail = req.query.email;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// PUT /api/orders/:id/status — Admin updates Order Status ('Processing' | 'Shipped' | 'Delivered' | 'Cancelled')
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

// DELETE /api/orders/:id — Admin deletes an order record from MongoDB
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
});

module.exports = router;
