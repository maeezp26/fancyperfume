const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, contact, city, password } = req.body;

    if (!name || !contact || !city || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const user = new User({
      name,
      email: contact.includes('@') ? contact : '',
      phone: !contact.includes('@') ? contact : '',
      city,
      password,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { usernameOrPhone, password } = req.body;
    if (!usernameOrPhone || !password) {
      return res.status(400).json({ message: 'Credentials required' });
    }

    const user = await User.findOne({
      $or: [{ email: usernameOrPhone }, { phone: usernameOrPhone }],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── Profile ───────────────────────────────────────────────────────────────────
// FIX: was manually decoding JWT — now uses authMiddleware (consistent + DRY)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
