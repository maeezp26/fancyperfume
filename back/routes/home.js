// back/routes/home.js
// Images stored on Cloudinary — permanent CDN URLs

const express = require('express');
const Home    = require('../models/Home');
const { createUploader, deleteByUrl, formatUploadError } = require('../utils/cloudinary');

const router   = express.Router();
const uploader = createUploader('home');

const rawUpload = uploader.fields([
  { name: 'latestProducts[0]', maxCount: 1 },
  { name: 'latestProducts[1]', maxCount: 1 },
  { name: 'latestProducts[2]', maxCount: 1 },
  { name: 'latestProducts[3]', maxCount: 1 },
  { name: 'latestProducts[4]', maxCount: 1 },
  { name: 'occasions[0]',      maxCount: 1 },
  { name: 'occasions[1]',      maxCount: 1 },
  { name: 'occasions[2]',      maxCount: 1 },
  { name: 'occasions[3]',      maxCount: 1 },
  { name: 'occasions[4]',      maxCount: 1 },
]);

const upload = (req, res, next) => {
  rawUpload(req, res, (err) => {
    if (err) {
      const message = formatUploadError(err);
      console.error('Home upload error:', message);
      return res.status(400).json({ success: false, error: `Image upload failed: ${message}` });
    }

    next();
  });
};

// ── GET /api/home ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const homeData = await Home.findOne().lean();
    res.json(homeData || {});
  } catch (error) {
    console.error('GET /home error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/home (upsert) ───────────────────────────────────────────────────
router.post('/', upload, async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');

    let home = await Home.findOne();
    if (!home) home = new Home({ latestProducts: [], occasions: [] });

    // ── Latest Products ───────────────────────────────────────────────────────
    const latestProducts = [];
    for (let i = 0; i < 5; i++) {
      const incoming  = data.latestProducts?.[i] || {};
      const existing  = home.latestProducts[i]  || {};
      const file      = req.files?.[`latestProducts[${i}]`]?.[0];

      if (file) {
        // New image → delete old Cloudinary image if it exists
        await deleteByUrl(existing.image);
        latestProducts[i] = { name: incoming.name || existing.name || `Product ${i + 1}`, image: file.path };
      } else {
        // Keep existing image; only update name if provided
        latestProducts[i] = { name: incoming.name || existing.name || `Product ${i + 1}`, image: existing.image || '' };
      }
    }
    home.latestProducts = latestProducts;

    // ── Occasions ─────────────────────────────────────────────────────────────
    const occasions = [];
    for (let i = 0; i < 5; i++) {
      const incoming = data.occasions?.[i] || {};
      const existing = home.occasions[i]   || {};
      const file     = req.files?.[`occasions[${i}]`]?.[0];

      if (file) {
        await deleteByUrl(existing.image);
        occasions[i] = { name: incoming.name || existing.name || `Occasion ${i + 1}`, image: file.path };
      } else {
        occasions[i] = { name: incoming.name || existing.name || `Occasion ${i + 1}`, image: existing.image || '' };
      }
    }
    home.occasions = occasions;

    // ── Optional text fields ──────────────────────────────────────────────────
    if (data.bannerHeading)     home.bannerHeading     = data.bannerHeading;
    if (data.bannerSubHeading)  home.bannerSubHeading  = data.bannerSubHeading;
    if (data.tagline)           home.tagline           = data.tagline;
    if (data.bottomDescription) home.bottomDescription = data.bottomDescription;

    await home.save();
    res.json({ message: '✅ Home page updated successfully!' });
  } catch (error) {
    console.error('POST /home error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
