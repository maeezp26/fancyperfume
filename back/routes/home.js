// back/routes/home.js
// Images now stored on Cloudinary — never disappear on Render redeploy
const express = require('express');
const Home    = require('../models/Home');
const { createUploader } = require('../utils/cloudinary');

const router = express.Router();

// Separate Cloudinary folders for clarity
const homeUploader = createUploader('home');

const upload = homeUploader.fields([
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

// GET /api/home
router.get('/', async (req, res) => {
  try {
    const homeData = await Home.findOne();
    res.json(homeData || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/home
router.post('/', upload, async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');

    let home = await Home.findOne();
    if (!home) {
      home = new Home({ latestProducts: [], occasions: [] });
    }

    // ---- LATEST PRODUCTS ----
    const latestProducts = [];
    for (let i = 0; i < 5; i++) {
      const product   = data.latestProducts?.[i] || {};
      const fileField = `latestProducts[${i}]`;
      const file      = req.files?.[fileField]?.[0];

      if (file) {
        // New Cloudinary upload — file.path is the full CDN URL
        latestProducts[i] = {
          name:  product.name || `Product ${i + 1}`,
          image: file.path,  // full https://res.cloudinary.com/... URL
        };
      } else {
        // Keep existing
        latestProducts[i] = {
          name:  product.name  || home.latestProducts[i]?.name  || `Product ${i + 1}`,
          image: home.latestProducts[i]?.image || '',
        };
      }
    }
    home.latestProducts = latestProducts;

    // ---- OCCASIONS ----
    const occasions = [];
    for (let i = 0; i < 5; i++) {
      const occasion  = data.occasions?.[i] || {};
      const fileField = `occasions[${i}]`;
      const file      = req.files?.[fileField]?.[0];

      if (file) {
        occasions[i] = {
          name:  occasion.name || `Occasion ${i + 1}`,
          image: file.path,
        };
      } else {
        occasions[i] = {
          name:  occasion.name  || home.occasions[i]?.name  || `Occasion ${i + 1}`,
          image: home.occasions[i]?.image || '',
        };
      }
    }
    home.occasions = occasions;

    // Text fields
    if (data.bannerHeading)    home.bannerHeading    = data.bannerHeading;
    if (data.bannerSubHeading) home.bannerSubHeading = data.bannerSubHeading;
    if (data.tagline)          home.tagline          = data.tagline;
    if (data.bottomDescription)home.bottomDescription= data.bottomDescription;

    await home.save();
    res.json({ message: '✅ Home data updated successfully!' });
  } catch (error) {
    console.error('Home save error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
