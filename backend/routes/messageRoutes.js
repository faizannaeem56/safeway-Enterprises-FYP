/**
 * ============================================================================
 * FILE: backend/routes/messageRoutes.js
 * PURPOSE: Customer Contact Us Submission & Admin Inbox Management API (MongoDB)
 * ============================================================================
 */

const express = require('express');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/messages — Customer submits Contact Us form (Saved in MongoDB `messages` collection)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    const saved = await Message.create({
      name,
      email,
      phone: phone || '+92 300 0000000',
      subject: subject || 'Customer Support Inquiry',
      message,
      status: 'Unread'
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save customer message', error: error.message });
  }
});

// GET /api/messages — Fetch all customer messages from MongoDB (Used by Admin Panel & My orders page)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load messages', error: error.message });
  }
});

// PUT /api/messages/:id — Admin replies to a customer message or marks it as Read
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.adminReply !== undefined) updateFields.adminReply = req.body.adminReply;

    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
});

// DELETE /api/messages/:id — Admin deletes a customer message
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
});

module.exports = router;
