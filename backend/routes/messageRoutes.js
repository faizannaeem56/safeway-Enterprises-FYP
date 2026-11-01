/**
 * ============================================================================
 * FILE: backend/routes/messageRoutes.js
 * PURPOSE: Customer Contact Us Submission & Admin Inbox Management API (MongoDB)
 * ============================================================================
 */

// Import Express to create a modular router for handling customer inquiries
const express = require('express');

// Import the Message model to save and retrieve contact form submissions from MongoDB
const Message = require('../models/Message');

// Import security middlewares to ensure only Admins can reply to or delete messages
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Initialize an Express Router instance
const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    Customer submits a new inquiry via the 'Contact Us' form
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Extract customer details from the frontend request body
    const { name, email, phone, subject, message } = req.body;
    
    // Basic Validation: Ensure mandatory fields are provided before hitting the database
    if (!name || !email || !message) return res.status(400).json({ message: 'Required fields missing.' });

    // Create a new message document in MongoDB
    // We provide fallback values for optional fields (phone, subject) to prevent schema validation errors
    const saved = await Message.create({ 
      name, 
      email, 
      phone: phone || '+92 300 0000000', 
      subject: subject || 'Inquiry', 
      message, 
      status: 'Unread' // New messages always start as 'Unread' in the Admin Inbox
    });
    
    // Return HTTP 201 (Created) and send the saved message back as confirmation
    res.status(201).json(saved);
  } catch (error) { 
    res.status(500).json({ message: 'Failed to save message', error: error.message }); 
  }
});

/**
 * @route   GET /api/messages
 * @desc    Fetch customer messages. If a user email is provided, it returns only their history.
 *          If no email is provided (Admin request), it returns all messages.
 * @access  Public (But filtered securely via email query)
 */
router.get('/', async (req, res) => {
  try {
    // Initialize an empty filter object (fetches all messages if no specific user email is passed)
    let filter = {};
    
    // Extract email from query string or headers (fallback to prevent Vercel dropping URL params)
    const userEmail = req.query.email || req.headers['user-email'];
    
    if (userEmail) {
      // Clean up accidental spaces around the email string
      const cleanEmail = userEmail.trim();
      
      // Use $or operator to search for the email in both 'email' and 'customerEmail' fields
      // $regex with 'i' flag ensures the search is case-insensitive (e.g., 'Ali@abc.com' matches 'ali@abc.com')
      filter = {
        $or: [
          { email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } },
          { customerEmail: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }
        ]
      };
    }

    // Fetch messages from MongoDB matching the filter, sorted by newest first (-1)
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) { 
    res.status(500).json({ message: 'Failed to load messages', error: error.message }); 
  }
});

/**
 * @route   PUT /api/messages/:id
 * @desc    Admin Panel: Reply to a customer message or manually update its status ('Read', 'Replied')
 * @access  Private / Admin Only
 */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Initialize an empty object to store only the fields the Admin wants to update
    const updateFields = {};
    
    // If the admin changes the status dropdown, add it to updateFields
    if (req.body.status) updateFields.status = req.body.status;
    
    // If the admin typed a reply, add it to updateFields.
    // We check !== undefined so even an empty string ('') can be saved if the admin wants to clear the reply
    if (req.body.adminReply !== undefined) updateFields.adminReply = req.body.adminReply;

    // Find the specific message by ID and apply the updates. { new: true } returns the updated document.
    const updated = await Message.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    
    // If ID is wrong or message is already deleted, return HTTP 404
    if (!updated) return res.status(404).json({ message: 'Message not found' });
    
    // Send updated message data back to refresh the Admin UI
    res.json(updated);
  } catch (error) { 
    res.status(500).json({ message: 'Failed to update message', error: error.message }); 
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Admin Panel: Permanently delete a customer message / spam inquiry
 * @access  Private / Admin Only
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Find the message by its MongoDB ID and remove it from the 'messages' collection
    await Message.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to delete message', error: error.message }); 
  }
});

// Export the router so it can be mounted at '/api/messages' in server.js
module.exports = router;