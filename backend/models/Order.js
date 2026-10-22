/**
 * ============================================================================
 * FILE: backend/models/Order.js
 * PURPOSE: MongoDB Schema for Customer orders placed via Shopping Cart Checkout
 * ============================================================================
 */

const mongoose = require('mongoose');

const orderschema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: false
        },
        name: { type: String, required: true },
        category: { type: String, default: 'Electronics' },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      addressLine: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery (COD)'
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderschema);
