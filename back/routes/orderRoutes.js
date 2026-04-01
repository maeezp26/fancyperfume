const express = require('express');
const Order   = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Customer: Get My Orders ───────────────────────────────────────────────────
// Customer always sees their own orders regardless of admin deletions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
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

// ── Admin: Get All Orders (only non-deleted) ──────────────────────────────────
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const orders = await Order.find({ deletedByAdmin: { $ne: true } })
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

// ── Admin: Soft-delete ALL Orders from admin view ─────────────────────────────
// FIX: Does NOT actually delete from DB — customer still sees their orders
// Must be declared BEFORE /:id
router.delete('/clear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await Order.updateMany(
      { deletedByAdmin: { $ne: true } },
      { $set: { deletedByAdmin: true } }
    );
    console.log(`🗑 Admin hid ${result.modifiedCount} orders`);
    res.json({ success: true, deleted: result.modifiedCount });
  } catch (err) {
    console.error('Clear orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear orders' });
  }
});

// ── Admin: Soft-delete Single Order from admin view ───────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { deletedByAdmin: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order removed from admin view' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

module.exports = router;
