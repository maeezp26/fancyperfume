// server.js - MAIN SERVER FILE


const express = require('express');
const mongoose = require('mongoose'); // 🔥 MOVED TO TOP
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { authMiddleware } = require('./middleware/auth');


const productRoutes = require('./routes/product'); 
const aboutRoutes = require('./routes/about');
const feedbackRoute = require('./routes/feedback');
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middlewares

app.use(cors({
  origin: "https://your-frontend.vercel.app",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));
app.use("/uploads/about", express.static("uploads/about"));

// Routes
app.use("/api/about", aboutRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// MongoDB
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fancyperfume';
mongoose.connect(MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB Error:', error));


// 🔥 FIXED RAZORPAY + ADMIN ROUTES
app.post('/api/payment/order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `perfume_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
});

app.post('/api/payment/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment data' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // 🔥 REAL DB SAVE - FIXED
    const Order = require('./models/Order');
    const { items, shippingInfo } = orderData;
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const shippingAmount = (shippingInfo.state || '').toLowerCase() === 'gujarat' ? 50 : 80;
    const totalAmount = subtotal + shippingAmount;

    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: new mongoose.Types.ObjectId(item.productId || '64f000000000000000000001'),
        mlSize: parseInt(item.mlSize) || 100,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      })),
      shippingInfo: {
        firstName: shippingInfo.firstName || 'Guest',
        lastName: shippingInfo.lastName || '',
        email: shippingInfo.email || '',
        phone: shippingInfo.phone || '',
        address: shippingInfo.address || '',
        city: shippingInfo.city || '',
        state: shippingInfo.state || 'Gujarat',
        zipCode: shippingInfo.zipCode || '395007'
      },
      subtotal,
      shippingAmount,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid'
    });

    console.log('✅ SAVED TO DB:', order._id, '₹' + totalAmount);
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error('SAVE ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔥 ADMIN ORDERS ROUTE
app.get('/api/orders/admin', authMiddleware, async (req, res) => {
  try {
    const Order = require('./models/Order');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    console.log(`📊 Admin: ${orders.length} orders found`);
    res.json(orders);
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error Handler + Server Start (keep same)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
