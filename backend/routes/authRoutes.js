/**
 * ============================================================================
 * FILE: backend/routes/authRoutes.js
 * PURPOSE: Handles User Registration (Signup), Login, and Profile retrieval.
 * WHY IT IS USED: Authenticates customers and admins using hashed passwords
 *                 (bcryptjs) and returns signed JWT tokens for session state.
 * ============================================================================
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper Function: Generates a signed JWT token containing user ID and role
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'safeway_fyp_secret_key_2026',
    { expiresIn: '7d' } // Token remains valid for 7 days
  );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account (Customer by default)
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields (Name, Email, Password).' });
    }

    // 2. Check if a user with this email already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash the plain-text password using bcryptjs (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save the new user in MongoDB
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer'
    });

    // 5. Return user details and JWT token so the user is immediately logged in
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
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
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 2. Compare submitted password with hashed password in database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Send back user profile + JWT token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged-in user's profile information
 * @access  Private (Requires JWT token)
 */
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
