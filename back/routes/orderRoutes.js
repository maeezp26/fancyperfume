const express = require('express');
const Order   = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const calculateShipping = (state = '') =>
  state.trim().toLowerCase() === 'gujarat' ? 50 : 80;

// ── Customer: Get My Orders ───────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    // PERFORMANCE: .lean() + only needed fields
    const orders = await Order.find({ user: req.user._id })
      .select('-razorpaySignature') // don't expose signature to client
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: Get All Orders ─────────────────────────────────────────────────────
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .select('-razorpaySignature')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(orders);
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: Clear All Orders ───────────────────────────────────────────────────
router.delete('/clear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete orders' });
  }
});

module.exports = router;
