const express = require('express');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Required fields missing.' });

    const saved = await Message.create({ name, email, phone: phone || '+92 300 0000000', subject: subject || 'Inquiry', message, status: 'Unread' });
    res.status(201).json(saved);
  } catch (error) { res.status(500).json({ message: 'Failed to save message', error: error.message }); }
});

router.get('/', async (req, res) => {
  try {
    let filter = {};
    const userEmail = req.query.email || req.headers['user-email'];
    
    if (userEmail) {
      filter.email = { $regex: new RegExp(`^${userEmail}$`, 'i') };
    }
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ message: 'Failed to load messages', error: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.adminReply !== undefined) updateFields.adminReply = req.body.adminReply;

    const updated = await Message.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: 'Message not found' });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Failed to update message', error: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete message', error: error.message }); }
});

module.exports = router;