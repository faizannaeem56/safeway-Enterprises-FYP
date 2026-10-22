/**
 * ============================================================================
 * FILE: backend/models/User.js
 * PURPOSE: Defines the MongoDB Schema for Users (both Customers and Admins).
 * WHY IT IS USED: Stores account credentials and role permissions so users can
 *                 log in, place orders, or manage products in the Admin Panel.
 * ============================================================================
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Full name of the customer or administrator
    name: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true
    },

    // Unique email address used for logging in
    email: {
      type: String,
      required: [true, 'Please enter your email address'],
      unique: true,
      lowercase: true,
      trim: true
    },

    // Hashed password (encrypted using bcryptjs before saving)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },

    // Role determines whether user is a regular customer or an Admin
    // Admins can add, edit, and delete products from the Admin Panel
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    }
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamps
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
