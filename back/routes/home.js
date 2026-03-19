const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Home = require('../models/Home');

const router = express.Router();

// Create directories
['uploads/latestProducts', 'uploads/occasions'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// FIXED Multer - Match your frontend field names EXACTLY
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname.startsWith('latestProducts')) cb(null, 'uploads/latestProducts');
    else if (file.fieldname.startsWith('occasions')) cb(null, 'uploads/occasions');
    else cb(new Error('Invalid field'), false);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET /api/home - PERFECT as is
router.get('/', async (req, res) => {
  try {
    const homeData = await Home.findOne();
    res.json(homeData || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST /api/home - COMPLETELY FIXED
router.post('/', upload.fields([
  { name: 'latestProducts[0]', maxCount: 1 },
  { name: 'latestProducts[1]', maxCount: 1 },
  { name: 'latestProducts[2]', maxCount: 1 },
  { name: 'latestProducts[3]', maxCount: 1 },
  { name: 'latestProducts[4]', maxCount: 1 },
  { name: 'occasions[0]', maxCount: 1 },
  { name: 'occasions[1]', maxCount: 1 },
  { name: 'occasions[2]', maxCount: 1 },
  { name: 'occasions[3]', maxCount: 1 },
  { name: 'occasions[4]', maxCount: 1 },
]), async (req, res) => {
  try {
    console.log('FILES RECEIVED:', req.files);
    const data = JSON.parse(req.body.data || '{}');

    let home = await Home.findOne();
    if (!home) {
      home = new Home({
        latestProducts: [],
        occasions: [],
      });
    }

    // ---- LATEST PRODUCTS (exactly 5) ----
    const latestProducts = [];
    for (let i = 0; i < 5; i++) {
      const product = data.latestProducts?.[i] || {};
      const fileField = `latestProducts[${i}]`;
      const file = req.files[fileField]?.[0];

      if (file) {
        // New image uploaded
        latestProducts[i] = {
          name: product.name || `Product ${i + 1}`,
          image: `uploads/latestProducts/${file.filename}`,
        };
      } else {
        // Keep existing or use default
        latestProducts[i] = {
          name: product.name || home.latestProducts[i]?.name || `Product ${i + 1}`,
          image: home.latestProducts[i]?.image || '',
        };
      }
    }
    home.latestProducts = latestProducts;

    // ---- OCCASIONS (exactly 5) ----
    const occasions = [];
    for (let i = 0; i < 5; i++) {
      const occasion = data.occasions?.[i] || {};
      const fileField = `occasions[${i}]`;
      const file = req.files[fileField]?.[0];

      if (file) {
        // New image uploaded
        occasions[i] = {
          name: occasion.name || `Occasion ${i + 1}`,
          image: `uploads/occasions/${file.filename}`,
        };
      } else {
        // Keep existing or use default
        occasions[i] = {
          name: occasion.name || home.occasions[i]?.name || `Occasion ${i + 1}`,
          image: home.occasions[i]?.image || '',
        };
      }
    }
    home.occasions = occasions;

    console.log('✅ SAVING:', { latestProducts: home.latestProducts, occasions: home.occasions });
    await home.save();
    
    res.json({ message: '✅ Home data updated successfully!' });
  } catch (error) {
    console.error('🚨 ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
