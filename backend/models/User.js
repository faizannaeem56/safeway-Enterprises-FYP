/**
 * ============================================================================
 * FILE: backend/models/User.js
 * PURPOSE: Defines the MongoDB Schema for Users (both Customers and Admins).
 * WHY IT IS USED: Stores account credentials and role permissions so users can
 *                 log in, place orders, or manage products in the Admin Panel.
 * ============================================================================
 */

// Import Mongoose to create a structured schema and interact with the MongoDB 'users' collection
const mongoose = require('mongoose');

// Define the structure (blueprint) and validation rules for a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    // Full name of the customer or administrator
    name: {
      type: String, // Data type must be a text string
      required: [true, 'Please enter your full name'], // Validation: Cannot save a user without a name
      trim: true // Automatically removes accidental extra spaces from the start and end (e.g., "  Faizan  " -> "Faizan")
    },

    // Unique email address used for logging in
    email: {
      type: String, // Data type must be a text string
      required: [true, 'Please enter your email address'], // Validation: Email is mandatory
      unique: true, // Creates a unique index in MongoDB so two accounts cannot register with the same email
      lowercase: true, // Converts email to lowercase before saving (e.g., "User@Gmail.com" -> "user@gmail.com")
      trim: true // Removes accidental leading or trailing whitespace
    },

    // Hashed password (encrypted using bcryptjs before saving)
    password: {
      type: String, // Stores the encrypted password hash string
      required: [true, 'Please provide a password'], // Validation: Password is mandatory
      minlength: 6 // Minimum length validation (at least 6 characters required)
    },

    // Role determines whether user is a regular customer or an Admin
    // Admins can add, edit, and delete products from the Admin Panel
    role: {
      type: String, // Data type is a string
      enum: ['customer', 'admin'], // Restricts valueStrictly to either 'customer' or 'admin' (blocks any other role name)
      default: 'customer' // If no role is specified during signup, automatically assign 'customer'
    }
  },
  {
    // Automatically adds `createdAt` (account creation date) and `updatedAt` (last modified date) fields
    timestamps: true
  }
);

// Compile the schema into a Model named 'User' (MongoDB will create a 'users' collection) and export it
module.exports = mongoose.model('User', userSchema);