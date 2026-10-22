/**
 * ============================================================================
 * FILE: backend/server.js
 * PURPOSE: Main entry point for the Safeway Enterprises Node.js + Express backend.
 * CONNECTS: MongoDB database via Mongoose and mounts all REST API routes.
 * ============================================================================
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file into process.env
dotenv.config();

// Import modular route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize the Express application
const app = express();

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// 1. Enable Cross-Origin Resource Sharing (CORS) so our React frontend (port 5173)
//    can communicate with this Express backend (port 5000) without browser blocks.
app.use(cors());

// 2. Parse incoming JSON request bodies (e.g., login data, new product data, chat messages)
app.use(express.json());

// ============================================================================
// DATABASE CONNECTION (MongoDB via Mongoose)
// ============================================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safeway_enterprises';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB (Safeway Enterprises Database)');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// ============================================================================
// API ROUTES MOUNTING
// ============================================================================

// Health-check endpoint to verify server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    company: 'Safeway Enterprises',
    message: 'MERN Stack Backend API is running smoothly.'
  });
});

// Mount User Authentication routes (Signup, Login, Profile)
app.use('/api/auth', authRoutes);

// Mount Product routes (Get All, Category/Price Filter, Admin Add/Edit/Delete)
app.use('/api/products', productRoutes);

// Mount Order routes (Checkout & Order History)
app.use('/api/orders', orderRoutes);

// Mount Google Gemini AI Chat Support route
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// ============================================================================
// START EXPRESS SERVER
// ============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Safeway Enterprises Backend Server running on http://localhost:${PORT}`);
});
