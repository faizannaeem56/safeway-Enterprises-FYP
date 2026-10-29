/**
 * ============================================================================
 * FILE: backend/models/Message.js
 * PURPOSE: Mongoose Schema for Customer Contact Us Messages / Inquiries
 * ============================================================================
 */

// Import Mongoose to define the message schema and interact with the MongoDB 'messages' collection
const mongoose = require('mongoose');

// Define the structure and validation rules for a Contact Us Message document in MongoDB
const messageSchema = new mongoose.Schema(
  {
    // Full name of the visitor or customer submitting the inquiry
    name: { type: String, required: true, trim: true },

    // Email address of the sender so the Admin can contact them back
    email: { type: String, required: true, trim: true },

    // Active phone/WhatsApp number of the sender for urgent support calls
    phone: { type: String, required: true, trim: true },

    // Brief topic of the message (e.g., "Bulk Laptop Order", "Warranty Claim")
    subject: { type: String, required: true, trim: true },

    // Detailed body text of the customer's question or feedback
    message: { type: String, required: true, trim: true },

    // Tracks whether the Admin has opened or responded to this inquiry in the Admin Panel
    status: {
      type: String, // Stored as a text string
      enum: ['Unread', 'Read', 'Replied'], // Restricts message status strictly to these 3 stages
      default: 'Unread' // Every newly submitted message automatically starts as 'Unread'
    },

    // Stores the Admin's official response text if replied via the Admin Dashboard
    adminReply: { type: String, default: '' }
  },
  // Automatically adds `createdAt` (when message was sent) and `updatedAt` (when status/reply changed)
  { timestamps: true }
);

// Compile the schema into a Model named 'Message' (creates 'messages' collection in MongoDB) and export it
module.exports = mongoose.model('Message', messageSchema);