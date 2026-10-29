/**
 * ============================================================================
 * FILE: backend/middleware/authMiddleware.js
 * PURPOSE: Protects private API routes using JSON Web Tokens (JWT).
 * WHY IT IS USED:
 *   1. `protect`: Verifies that a user is logged in before placing orders.
 *   2. `adminOnly`: Verifies that the logged-in user has `role === 'admin'`
 *      before allowing them to Add, Edit, or Delete products.
 * ============================================================================
 */

// Import 'jsonwebtoken' library to verify and decode the encrypted JWT token sent by the frontend
const jwt = require('jsonwebtoken');

// Import the User model to look up the logged-in user's details in MongoDB
const User = require('../models/User');

/**
 * Middleware 1: Verify JWT Token from Authorization header ("Bearer <token>")
 * Parameters:
 *   - req: Incoming HTTP request object (contains headers and body)
 *   - res: Outgoing HTTP response object (used to send error status if unauthorized)
 *   - next: Callback function that passes control to the next middleware or route handler
 */
const protect = async (req, res, next) => {
  try {
    // Declare a variable to store the extracted JWT string
    let token;

    // Check if the request has an Authorization header starting with "Bearer "
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
       token = req.headers.authorization.split(' ')[1];
        }

    // If no token is found in the header, block access immediately with HTTP 401 (Unauthorized)
    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please log in first.' });
    }

    // Verify token validity and expiration using our secret key; returns the decoded payload (e.g., { id: '...' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'safeway_fyp_secret_key_2026');

    // Fetch the user from MongoDB using the ID inside the token, and exclude ('-password') the hashed password for security
    // Attach the found user object to `req.user` so the next route controller knows who is logged in
    req.user = await User.findById(decoded.id).select('-password');

    // Edge case check: If the token is valid but the user was deleted from MongoDB, deny access
    if (!req.user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    // Everything is valid! Call next() to allow the request to proceed to the protected route
    next();
  } catch (error) {
    // Runs if jwt.verify() fails (e.g., token was tampered with, fake, or expired)
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Middleware 2: Restrict route access strictly to Administrators
 * Note: This middleware always runs AFTER `protect`, so `req.user` is already available.
 */
const adminOnly = (req, res, next) => {
  // Check if `req.user` exists and their database role is strictly 'admin'
  if (req.user && req.user.role === 'admin') {
    // User is an Admin! Allow the request to proceed to the Admin route (Add/Edit/Delete product)
    next();
  } else {
    // User is logged in as a regular 'customer', so return HTTP 403 (Forbidden)
    return res.status(403).json({
      message: 'Access denied. Administrator privileges are required for this action.'
    });
  }
};

// Export both middleware functions so they can be plugged into productRoutes, orderRoutes, etc.
module.exports = { protect, adminOnly };