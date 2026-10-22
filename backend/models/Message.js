/**
 * ============================================================================
 * FILE: backend/models/Message.js
 * PURPOSE: Mongoose Schema for Customer Contact Us Messages / Inquiries
 * ============================================================================
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Replied'],
      default: 'Unread'
    },
    adminReply: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
