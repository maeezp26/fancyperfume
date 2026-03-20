const express = require('express');
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ✅ SHIPPING LOGIC (BACKEND AUTHORITY)
const calculateShipping = (state = '') => {
  return state.trim().toLowerCase() === 'gujarat' ? 50 : 80;
};

// ✅ CUSTOMER: Create Order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      subtotal,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body; // ❌ shippingAmount REMOVED

    // ✅ Calculate in backend
    const shippingAmount = calculateShipping(shippingInfo.state);
    const totalAmount = subtotal + shippingAmount;

    const order = new Order({
      user: req.user._id,
      items,
      shippingInfo,
      subtotal,
      shippingAmount,
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: razorpayPaymentId ? 'paid' : 'pending',
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Order creation failed' });
  }
});

// ✅ CUSTOMER: Get My Orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ ADMIN: Get All Orders
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/clear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ success: true, message: 'All orders deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete orders' });
  }
});

module.exports = router;
