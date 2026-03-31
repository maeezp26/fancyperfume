// server.js — production-ready

// FIX: dotenv MUST be called before anything reads env vars (Razorpay was init'd before dotenv)
const dotenv = require('dotenv');
dotenv.config();

const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const crypto    = require('crypto');
const helmet    = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const productRoutes  = require('./routes/product');
const aboutRoutes    = require('./routes/about');
const feedbackRoute  = require('./routes/feedback');
const homeRoutes     = require('./routes/home');
const authRoutes     = require('./routes/auth');
const cartRoutes     = require('./routes/cart');
const orderRoutes    = require('./routes/orderRoutes');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
}));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://fancyperfume.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // tighter limit for login/register
  message: { success: false, message: 'Too many auth attempts, please slow down.' },
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many payment requests.' },
});

app.use(generalLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
// FIX: 50mb JSON limit is a DoS vector. Multipart uploads go via multer, so JSON stays small.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// ── Static files (uploaded images) ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Razorpay ──────────────────────────────────────────────────────────────────
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/about',    aboutRoutes);
app.use('/api/home',     homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/feedback', feedbackRoute);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes); // includes /admin route with adminMiddleware

// ── Payment routes ────────────────────────────────────────────────────────────
app.post('/api/payment/order', paymentLimiter, authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise, integer
      currency: 'INR',
      receipt:  `perfume_${Date.now()}`,
    });

    res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
});

app.post('/api/payment/verify', paymentLimiter, authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment data' });
    }

    // Verify Razorpay signature
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const Order = require('./models/Order');
    const { items, shippingInfo } = orderData;
    const subtotal       = items.reduce((sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity), 0);
    const shippingAmount = (shippingInfo.state || '').trim().toLowerCase() === 'gujarat' ? 50 : 80;
    const totalAmount    = subtotal + shippingAmount;

    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product:  new mongoose.Types.ObjectId(item.productId),
        name:     item.name || '',
        mlSize:   parseInt(item.mlSize)   || 100,
        quantity: parseInt(item.quantity) || 1,
        price:    parseFloat(item.price)  || 0,
      })),
      shippingInfo: {
        firstName: shippingInfo.firstName || 'Guest',
        lastName:  shippingInfo.lastName  || '',
        email:     shippingInfo.email     || '',
        phone:     shippingInfo.phone     || '',
        address:   shippingInfo.address   || '',
        city:      shippingInfo.city      || '',
        state:     shippingInfo.state     || 'Gujarat',
        zipCode:   shippingInfo.zipCode   || '000000',
      },
      subtotal,
      shippingAmount,
      totalAmount,
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
    });

    console.log('✅ Order saved:', order._id, '₹' + totalAmount);
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error('Payment verify error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// FIX: REMOVED duplicate /api/orders/admin route that was here without adminMiddleware.
// The correct route (with adminMiddleware) lives in routes/orderRoutes.js.

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fancyperfume';
mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('❌ MongoDB Error:', err); process.exit(1); });

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
