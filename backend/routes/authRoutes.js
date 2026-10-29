/**
 * ============================================================================
 * FILE: backend/routes/authRoutes.js
 * PURPOSE: Handles User Registration (Signup), Login, and Profile retrieval.
 * WHY IT IS USED: Authenticates customers and admins using hashed passwords
 *                 (bcryptjs) and returns signed JWT tokens for session state.
 * ============================================================================
 */

// Import Express to create a modular router for authentication endpoints
const express = require('express');

// Import bcryptjs to securely hash plain-text passwords and verify them during login
const bcrypt = require('bcryptjs');

// Import jsonwebtoken to create signed digital tokens (JWT) for logged-in sessions
const jwt = require('jsonwebtoken');

// Import the User Mongoose model to query and create users in MongoDB
const User = require('../models/User');

// Import the 'protect' middleware to secure private routes (like viewing user profile)
const { protect } = require('../middleware/authMiddleware');

// Initialize an Express Router instance
const router = express.Router();

/**
 * Helper Function: Generates a signed JWT token containing user ID and role
 * Parameters:
 *   - id: The MongoDB _id of the user
 *   - role: The user's role ('customer' or 'admin')
 */
const generateToken = (id, role) => {
  // Sign the payload ({ id, role }) using our secret key from .env (or fallback key)
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'safeway_fyp_secret_key_2026',
    { expiresIn: '7d' } // Token remains valid for 7 days before requiring re-login
  );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account (Customer by default)
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    // Destructure name, email, and password submitted from the React Signup form
    const { name, email, password } = req.body;

    // 1. Validate that all required fields are provided by the user
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields (Name, Email, Password).' });
    }

    // 2. Check if a user with this email already exists in MongoDB (case-insensitive check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Return HTTP 400 (Bad Request) to prevent duplicate accounts
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash the plain-text password using bcryptjs (10 salt rounds)
    //    Generating a 'salt' adds random characters before hashing so two identical passwords never have the same hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save the new user document in MongoDB with the encrypted password
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword, // Never store plain-text passwords in the database!
      role: 'customer' // Force new signups to be 'customer' for security
    });

    // 5. Return HTTP 201 (Created) with user details and JWT token so the user is immediately logged in
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    // Catch any unexpected database or server errors and return HTTP 500
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing user & return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    // Extract email and password sent from the React Login form
    const { email, password } = req.body;

    // 1. Find user by email in MongoDB (safely convert email to lowercase first)
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) {
      // Return HTTP 401 (Unauthorized) if no account matches the email
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 2. Compare submitted plain-text password with the hashed password stored in database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      // Return HTTP 401 (Unauthorized) if the password does not match
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Credentials are valid! Send back user profile details + newly signed JWT token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    // Handle unexpected server errors during login
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged-in user's profile information
 * @access  Private (Requires JWT token verified by 'protect' middleware)
 */
router.get('/profile', protect, async (req, res) => {
  // `req.user` was already fetched and attached by the `protect` middleware in authMiddleware.js
  res.json(req.user);
});

// Export the router so it can be mounted at '/api/auth' in server.js
module.exports = router;
