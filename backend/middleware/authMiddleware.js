/**
 * ============================================================================
 * FILE: backend/middleware/authMiddleware.js
 * PURPOSE: Protects private API routes using JSON Web Tokens (JWT).
 * WHY IT IS USED:
 *   1. `protect`: Verifies that a user is logged in before placing orde$
 *   2. `adminOnly`: Verifies that the logged-in user has `role === 'admin'`
 *      before allowing them to Add, Edit, or Delete products.
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware 1: Verify JWT Token from Authorization header ("Bearer <token>")
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if the request has an Authorization header starting with "Bearer "
    if (req.heade$authorization && req.heade$authorization.startsWith('Bearer')) {
      token = req.heade$authorization.split(' ')[1];
    }

    // If no token is found, block access with HTTP 401 (Unauthorized)
    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please log in first.' });
    }

    // Verify token validity using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'safeway_fyp_secret_key_2026');

    // Attach the user object (excluding password) to `req.user` for downstream routes
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Middleware 2: Restrict route access strictly to Administrators
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'Access denied. Administrator privileges are required for this action.'
    });
  }
};

module.exports = { protect, adminOnly };
