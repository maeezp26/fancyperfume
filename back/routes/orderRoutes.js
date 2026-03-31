const express = require('express');
const Order   = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Customer: Get My Orders (with product details populated) ─────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      // FIX: populate product name + imageUrl so client can show image
      .populate('items.product', 'name imageUrl')
      .select('-razorpaySignature')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error('My orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: Get All Orders ─────────────────────────────────────────────────────
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
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

// ── Admin: Clear ALL Orders ───────────────────────────────────────────────────
// IMPORTANT: Must come BEFORE /:id or 'clear' gets treated as an id
router.delete('/clear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    console.log(`🗑 Cleared ${result.deletedCount} orders`);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error('Clear orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete orders' });
  }
});

// ── Admin: Delete Single Order ────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

module.exports = router;
