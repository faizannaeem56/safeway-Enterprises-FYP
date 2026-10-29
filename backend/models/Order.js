/**
 * ============================================================================
 * FILE: backend/models/Order.js
 * PURPOSE: MongoDB Schema for Customer orders placed via Shopping Cart Checkout
 * ============================================================================
 */

// Import Mongoose to define the order schema and interact with the MongoDB 'orders' collection
const mongoose = require('mongoose');

// Define the structure and validation rules for an Order document in MongoDB
const orderschema = new mongoose.Schema(
  {
    // Reference to the registered User who placed the order (Foreign Key relationship)
    user: {
      type: mongoose.Schema.Types.ObjectId, // Stores the unique 24-character MongoDB ID of the user
      ref: 'User', // Links this field to the 'User' model for population if needed
      required: false // Optional so guest users (not logged in) can also place orders
    },

    // Full name of the customer placing the order
    customerName: {
      type: String, // Must be a text string
      required: true, // Validation: Customer name is mandatory at checkout
      trim: true // Removes accidental extra spaces from start and end
    },

    // Email address of the customer for order tracking and confirmation
    customerEmail: {
      type: String, // Must be a text string
      required: true, // Validation: Customer email is mandatory
      trim: true // Removes accidental leading or trailing whitespace
    },

    // Array of purchased cart items (allows multiple products in a single order)
    items: [
      {
        // Reference to the original Product document in the 'products' collection
        product: {
          type: mongoose.Schema.Types.ObjectId, // Stores the unique MongoDB ID of the purchased product
          ref: 'Product', // Links to the 'Product' model
          required: false // Optional fallback in case a custom or deleted product is referenced
        },
        // Snapshot of the product name at the time of purchase
        name: { type: String, required: true },
        // Snapshot of the product category (defaults to 'Electronics' if not provided)
        category: { type: String, default: 'Electronics' },
        // Snapshot of the unit price at the exact time the order was placed
        price: { type: Number, required: true },
        // Number of units bought for this specific item (must be at least 1)
        quantity: { type: Number, required: true, min: 1 }
      }
    ],

    // Nested object storing complete delivery details for the courier
    shippingAddress: {
      fullName: { type: String, required: true }, // Receiver's full name
      phone: { type: String, required: true }, // Active contact number for delivery calls
      city: { type: String, required: true }, // Destination city (e.g., Lahore, Karachi, Islamabad)
      addressLine: { type: String, required: true } // Complete street/house address
    },

    // Selected payment option during checkout
    paymentMethod: {
      type: String, // Text string representing payment mode
      default: 'Cash on Delivery (COD)' // Defaults to COD if no payment method is specified
    },

    // Final grand total bill of the order in Rupees (sum of price * quantity for all items)
    totalAmount: {
      type: Number, // Numeric value for accounting and revenue calculations
      required: true // Mandatory field
    },

    // Current fulfillment stage of the order (updated by Admin from the Admin Dashboard)
    status: {
      type: String, // Text string
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], // Restricts order status strictly to these 4 stages
      default: 'Processing' // Every new order starts in the 'Processing' state automatically
    }
  },
  {
    // Automatically adds `createdAt` (order date/time) and `updatedAt` (status update time)
    timestamps: true
  }
);

// Compile the schema into a Model named 'Order' (creates 'orders' collection in MongoDB) and export it
module.exports = mongoose.model('Order', orderschema);