/**
 * ============================================================================
 * FILE: backend/routes/orderRoutes.js
 * PURPOSE: Handles Checkout, Order Placement, Inventory Deduction, and 
 *          Admin Order Management (Status updates & Deletion).
 * ============================================================================
 */

// Import Express to create a modular router for order-related endpoints
const express = require('express');

// Import the Order and Product models to interact with MongoDB collections
const Order = require('../models/Order');
const Product = require('../models/Product');

// Import security middlewares to protect Admin-only routes
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Initialize an Express Router instance
const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Place a new order (Checkout) and automatically reduce product stock
 * @access  Public (Guest or Logged-in Customer)
 */
router.post('/', async (req, res) => {
  try {
    // Extract checkout details and cart items sent from the frontend
    const { userId, customerName, customerEmail, items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    // Validation: Ensure the cart is not empty before placing an order
    if (!items || items.length === 0) return res.status(400).json({ message: 'Your shopping cart is empty.' });

    // Create a new order document in MongoDB with fallback default values if some data is missing
    const createdOrder = await Order.create({
      user: userId || null, // Null if it's a guest checkout
      customerName: customerName || shippingAddress?.fullName || 'Customer',
      customerEmail: customerEmail || 'customer@safeway.pk',
      items, 
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      totalAmount, 
      status: 'Processing' // Initial status for all new orders
    });

    // INVENTORY DEDUCTION LOGIC: Loop through each item bought in the order
    for (const item of items) {
      // Find the product ID (supports different frontend object structures)
      const prodId = item._id || item.product;
      if (prodId) {
        // Decrease the available stock in the Products collection
        // $inc is a MongoDB operator. We use -Math.abs() to ensure we subtract the exact quantity bought
        await Product.findByIdAndUpdate(prodId, { $inc: { stock: -Math.abs(Number(item.quantity) || 1) } }).catch(() => {});
      }
    }
    
    // Return HTTP 201 (Created) and send the generated order receipt back to frontend
    res.status(201).json(createdOrder);
  } catch (error) { 
    // Handle unexpected server errors during checkout
    res.status(500).json({ message: 'Failed to place order', error: error.message }); 
  }
});

/**
 * @route   GET /api/orders
 * @desc    Fetch order history for a specific customer OR fetch all orders for Admin
 * @access  Public (But filtered securely via email query)
 */
router.get('/', async (req, res) => {
  try {
    // Initialize an empty filter object (if empty, it fetches all orders)
    let filter = {};
    
    // Vercel bug se bachne ke liye email URL aur Header dono jagah check karein
    // Extracts the user email from the query string (?email=...) or custom request headers
    const userEmail = req.query.email || req.headers['user-email'];
    
    if (userEmail) {
      // $regex aur 'i' ka matlab hai uppercase/lowercase ka farq ignore karein
      // Matches the exact email ignoring case (e.g., 'Faizan@gmail.com' == 'faizan@gmail.com')
      filter.customerEmail = { $regex: new RegExp(`^${userEmail}$`, 'i') };
    }
    
    // Fetch orders from MongoDB based on the filter and sort by newest first (-1)
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    
    // Send the orders array back to the frontend
    res.json(orders);
  } catch (error) { 
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message }); 
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Admin Panel: Update the fulfillment status of an order (e.g., 'Shipped', 'Delivered')
 * @access  Private / Admin Only
 */
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    // Find order by ID and update ONLY the 'status' field. { new: true } returns the updated document.
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    // If order ID does not exist, return HTTP 404
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    
    // Return the updated order to update the Admin UI
    res.json(updated);
  } catch (error) { 
    res.status(500).json({ message: 'Failed to update order status', error: error.message }); 
  }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Admin Panel: Permanently delete an order record
 * @access  Private / Admin Only
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Find and delete the order by its MongoDB ID
    await Order.findByIdAndDelete(req.params.id);
    
    // Return success message
    res.json({ message: 'Order deleted successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to delete order', error: error.message }); 
  }
});

module.exports = router;