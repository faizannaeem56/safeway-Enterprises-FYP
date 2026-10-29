/**
 * ============================================================================
 * FILE: backend/models/Product.js
 * PURPOSE: Defines the MongoDB Schema for Safeway Enterprises tech products.
 * WHY IT IS USED: Ensures every product belongs to one of the 7 required tech
 *                 categories and includes price, stock, warranty, and specs
 *                 for both frontend filtering and the Gemini AI assistant.
 * ============================================================================
 */

// Import Mongoose to define the product schema and interact with the MongoDB 'products' collection
const mongoose = require('mongoose');

// The exact 7 product categories required by Safeway Enterprises
// Storing these in a constant array makes it easy to validate and maintain allowed categories
const ALLOWED_CATEGORIES = [
  'Computer',
  'Laptops',
  'Smart Watches',
  'Phones',
  'Mobile Accessories',
  'Laptop Accessories',
  'PC Accessories'
];

// Define the structure and validation rules for a Product document in MongoDB
const productSchema = new mongoose.Schema(
  {
    // Product title (e.g., "ASUS ROG Strix G16 Gaming Laptop")
    name: {
      type: String, // Must be a text string
      required: [true, 'Product name is required'], // Validation: Cannot save a product without a title
      trim: true // Removes accidental leading/trailing spaces from the product name
    },

    // Must match one of the 7 official categories for dynamic filtering
    category: {
      type: String, // Must be a text string
      required: [true, 'Product category is required'], // Validation: Category is mandatory
      enum: ALLOWED_CATEGORIES // Restricts the category strictly to one of the 7 values in ALLOWED_CATEGORIES
    },

    // Product price in Rupees (or local currency) used for Price Filtering & Sorting
    price: {
      type: Number, // Stored as a numeric value so we can perform math, sorting, and range queries ($gte, $lte)
      required: [true, 'Product price is required'], // Validation: Every product must have a price
      min: 0 // Prevents negative prices from being saved in the database
    },

    // Available inventory count in stock
    stock: {
      type: Number, // Numeric count of available units
      required: true, // Stock count is mandatory
      default: 10, // If the admin doesn't specify stock when adding a product, it defaults to 10 units
      min: 0 // Stock cannot drop below 0 (prevents negative inventory)
    },

    // Official warranty duration (used on product cards & by the Gemini AI chatbot)
    warranty: {
      type: String, // Text description of the warranty coverage
      default: '1 Year Official Safeway Warranty' // Automatically sets a 1-year warranty if left blank
    },

    // Short technical specifications string (e.g., "Intel i7-13650HX, RTX 4060, 16GB RAM")
    specs: {
      type: String, // Quick summary of hardware specs shown on product cards and read by the AI assistant
      required: [true, 'Technical specifications are required'] // Mandatory field for tech products
    },

    // Detailed description explaining product features and use cases
    description: {
      type: String, // Full paragraph description shown on the Product Details view
      required: [true, 'Product description is required'] // Mandatory field
    },

    // Image URL or data URI for displaying the product photo
    image: {
      type: String, // Stores either a web image URL (https://...) or a Base64 image string
      default: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' // Fallback laptop image if admin provides no photo
    },

    // Customer star rating (out of 5.0)
    rating: {
      type: Number, // Numeric rating (supports decimals like 4.8)
      default: 4.8, // Default high rating for newly added products
      min: 1, // Lowest possible star rating is 1
      max: 5 // Highest possible star rating is 5
    },

    // Boolean flag to showcase top products on the Home Page
    featured: {
      type: Boolean, // True or False value
      default: false // By default, new products are not featured unless marked 'true'
    }
  },
  {
    // Automatically adds `createdAt` (when product was added) and `updatedAt` (when last edited) fields
    timestamps: true
  }
);

// Compile the schema into a Model named 'Product' (creates 'products' collection in MongoDB) and export it
module.exports = mongoose.model('Product', productSchema);