/**
 * ============================================================================
 * FILE: backend/server.js
 * PURPOSE: Main entry point for the Safeway Enterprises Node.js + Express backend.
 * CONNECTS: MongoDB database via Mongoose and mounts all REST API routes.
 * ============================================================================
 */

// Import Express framework to build our REST API and handle HTTP requests/responses
const express = require('express');

// Import Mongoose (Object Data Modeling library) to interact with MongoDB using schemas
const mongoose = require('mongoose');

// Import CORS middleware to allow requests from our React frontend running on a different port
const cors = require('cors');

// Import dotenv to read secret configuration variables (like DB URL and API keys) from the .env file
const dotenv = require('dotenv');

// Load environment variables from .env file into Node's global process.env object
dotenv.config();

// Import modular route files from the 'routes' folder to keep the code organized
const authRoutes = require('./routes/authRoutes');       // Handles user signup, login, and profile routes
const productRoutes = require('./routes/productRoutes'); // Handles fetching, adding, updating, and deleting products
const orderRoutes = require('./routes/orderRoutes');     // Handles customer checkout and order management
const chatRoutes = require('./routes/chatRoutes');       // Handles Google Gemini AI chatbot requests
const messageRoutes = require('./routes/messageRoutes'); // Handles customer contact/inquiry messages

// Initialize the main Express application instance
const app = express();

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// 1. Enable Cross-Origin Resource Sharing (CORS) so our React frontend (port 5173)
//    can communicate with this Express backend (port 5000) without browser blocks.
app.use(cors());

// 2. Parse incoming JSON request bodies (e.g., login data, new product data, chat messages)
//    This allows us to access frontend data using 'req.body' inside our route controllers.
app.use(express.json());

// ============================================================================
// DATABASE CONNECTION (MongoDB via Mongoose)
// ============================================================================

// Read the MongoDB connection string from .env; if not found, use the local MongoDB database URL as a fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safeway_enterprises';

// Connect to MongoDB asynchronously using Promises (.then for success, .catch for error handling)
mongoose
  .connect(MONGO_URI)
  .then(() => {
    // Runs when the database connection is established successfully
    console.log('✅ Connected successfully to MongoDB (Safeway Enterprises Database)');
  })
  .catch((error) => {
    // Runs if the database fails to connect (e.g., MongoDB service is stopped or URI is wrong)
    console.error('❌ MongoDB connection error:', error.message);
  });

// ============================================================================
// API ROUTES MOUNTING
// ============================================================================

// Health-check GET endpoint to quickly test in the browser or Postman if the server is alive
app.get('/api/health', (req, res) => {
  // Send back a JSON response with status and company details
  res.json({
    status: 'OK',
    company: 'Safeway Enterprises',
    message: 'MERN Stack Backend API is running smoothly.'
  });
});

// Mount User Authentication routes at base path '/api/auth' (Signup, Login, Profile)
app.use('/api/auth', authRoutes);

// Mount Product routes at base path '/api/products' (Get All, Category/Price Filter, Admin Add/Edit/Delete)
app.use('/api/products', productRoutes);

// Mount Order routes at base path '/api/orders' (Checkout & Order History)
app.use('/api/orders', orderRoutes);

// Mount Google Gemini AI Chat Support route at base path '/api/chat'
app.use('/api/chat', chatRoutes);

// Mount Contact Us / Customer Inquiry message routes at base path '/api/messages'
app.use('/api/messages', messageRoutes);

// ============================================================================
// START EXPRESS SERVER
// ============================================================================

// Set the server port from the .env file, or default to port 5000 if not specified
const PORT = process.env.PORT || 5000;

// Start listening for incoming HTTP requests on the specified PORT
app.listen(PORT, () => {
  console.log(`🚀 Safeway Enterprises Backend Server running on http://localhost:${PORT}`);
});