// back/routes/auth.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const User    = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, contact, city, password } = req.body;
    if (!name || !contact || !city || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists with this email or phone' });

    const user = new User({
      name,
      email: contact.includes('@') ? contact.toLowerCase().trim() : '',
      phone: !contact.includes('@') ? contact.trim() : '',
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
    if (!usernameOrPhone || !password)
      return res.status(400).json({ message: 'Credentials required' });

    // FIX: search by email OR phone — previously this worked fine on backend,
    // but the frontend was blocking email input with a special-character check.
    // Now the backend also normalises email to lowercase for safe comparison.
    const lookup = String(usernameOrPhone).trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { phone: usernameOrPhone.trim() },
      ],
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

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Verifies Google ID token, creates or finds user, returns JWT
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential required' });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(501).json({ message: 'Google OAuth not configured on server' });
    }

    // Verify Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket  = await client.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, sub: googleId } = payload;
    if (!email) return res.status(400).json({ message: 'No email in Google account' });

    // Find existing user by email, or create a new one
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // New Google user — create without password (they sign in via Google only)
      user = new User({
        name:        name || email.split('@')[0],
        email:       email.toLowerCase(),
        phone:       '',
        city:        'Not specified',  // can update in Profile
        // Random password that can never be guessed (Google users don't use password login)
        password:    require('crypto').randomBytes(32).toString('hex'),
        googleId,
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Google login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// ── Forgot Password — generate OTP ────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ message: 'Email or phone is required' });

    const lookup = String(contact).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: lookup }, { phone: contact.trim() }],
    });

    if (!user) return res.status(404).json({ message: 'No account found with this email or phone' });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // TODO: In production, send OTP via email/SMS instead of returning it
    console.log(`🔑 Password reset OTP for ${contact}: ${otp}`);

    res.json({
      message: 'OTP sent successfully. Please check your email/phone.',
      // DEV ONLY: remove this in production when actual email/SMS sending is implemented
      otp,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Reset Password — verify OTP and set new password ──────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { contact, otp, newPassword } = req.body;
    if (!contact || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const lookup = String(contact).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: lookup }, { phone: contact.trim() }],
    });

    if (!user) return res.status(404).json({ message: 'No account found' });

    // Verify OTP
    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (!user.resetOtpExpires || user.resetOtpExpires < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    // Set new password & clear OTP fields
    user.password = newPassword;
    user.resetOtp = '';
    user.resetOtpExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Get Profile ───────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ── Update Profile ────────────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, city, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (city) user.city = city.trim();

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password required to set new password' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      user.password = newPassword;
    }

    await user.save();
    const updatedUser = { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role };
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Profile updated successfully', user: updatedUser, token });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
