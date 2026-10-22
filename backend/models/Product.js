/**
 * ============================================================================
 * FILE: backend/models/Product.js
 * PURPOSE: Defines the MongoDB Schema for Safeway Enterprises tech products.
 * WHY IT IS USED: Ensures every product belongs to one of the 7 required tech
 *                 categories and includes price, stock, warranty, and specs
 *                 for both frontend filtering and the Gemini AI assistant.
 * ============================================================================
 */

const mongoose = require('mongoose');

// The exact 7 product categories required by Safeway Enterprises
const ALLOWED_CATEGORIES = [
  'Computers',
  'Laptops',
  'Smart Watches',
  'Phones',
  'Mobile Accessories',
  'Laptop Accessories',
  'PC Accessories'
];

const productSchema = new mongoose.Schema(
  {
    // Product title (e.g., "ASUS ROG Strix G16 Gaming Laptop")
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },

    // Must match one of the 7 official categories for dynamic filtering
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ALLOWED_CATEGORIES
    },

    // Product price in Rupees (or local currency) used for Price Filtering & Sorting
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0
    },

    // Available inventory count in stock
    stock: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },

    // Official warranty duration (used on product cards & by the Gemini AI chatbot)
    warranty: {
      type: String,
      default: '1 Year Official Safeway Warranty'
    },

    // Short technical specifications string (e.g., "Intel i7-13650HX, RTX 4060, 16GB RAM")
    specs: {
      type: String,
      required: [true, 'Technical specifications are required']
    },

    // Detailed description explaining product features and use cases
    description: {
      type: String,
      required: [true, 'Product description is required']
    },

    // Image URL or data URI for displaying the product photo
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    },

    // Customer star rating (out of 5.0)
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },

    // Boolean flag to showcase top products on the Home Page
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
