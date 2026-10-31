const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, customerName, customerEmail, items, shippingAddress, paymentMethod, totalAmount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Your shopping cart is empty.' });

    const createdOrder = await Order.create({
      user: userId || null,
      customerName: customerName || shippingAddress?.fullName || 'Customer',
      customerEmail: customerEmail || 'customer@safeway.pk',
      items, shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      totalAmount, status: 'Processing'
    });

    for (const item of items) {
      const prodId = item._id || item.product;
      if (prodId) {
        await Product.findByIdAndUpdate(prodId, { $inc: { stock: -Math.abs(Number(item.quantity) || 1) } }).catch(() => {});
      }
    }
    res.status(201).json(createdOrder);
  } catch (error) { res.status(500).json({ message: 'Failed to place order', error: error.message }); }
});

router.get('/', async (req, res) => {
  try {
    let filter = {};
    // Vercel bug se bachne ke liye email URL aur Header dono jagah check karein
    const userEmail = req.query.email || req.headers['user-email'];
    
    if (userEmail) {
      // $regex aur 'i' ka matlab hai uppercase/lowercase ka farq ignore karein
      filter.customerEmail = { $regex: new RegExp(`^${userEmail}$`, 'i') };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch orders', error: error.message }); }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Failed to update order status', error: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete order', error: error.message }); }
});

module.exports = router;