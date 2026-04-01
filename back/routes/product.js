// back/routes/product.js
// Images now stored on Cloudinary — never disappear on Render redeploy
const express = require('express');
const path    = require('path');
const Product = require('../models/Product');
const { createUploader, deleteImage } = require('../utils/cloudinary');

const router = express.Router();

// One uploader per folder bucket
const productUploader = createUploader('products');
const notesUploader   = createUploader('notes');

const uploadFields = productUploader.fields([
  { name: 'imageUrl',          maxCount: 1  },
]);

// Notes images handled by a separate uploader instance
const uploadAllFields = multerCombined();

function multerCombined() {
  // We can't mix two CloudinaryStorage instances in one .fields() call,
  // so we define all fields under one uploader pointing to a shared folder.
  const { createUploader: cu } = require('../utils/cloudinary');
  const uploader = cu('products');
  return uploader.fields([
    { name: 'imageUrl',          maxCount: 1  },
    { name: 'topNotesImages',    maxCount: 10 },
    { name: 'middleNotesImages', maxCount: 10 },
    { name: 'baseNotesImages',   maxCount: 10 },
  ]);
}

// ── GET All Products ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// ── GET Single Product ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// ── POST Add New Product ──────────────────────────────────────────────────────
router.post('/', uploadAllFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const parsedNotes    = JSON.parse(notes);
    const parsedCategory = JSON.parse(category);

    // Cloudinary returns file.path as the full HTTPS URL
    const mapNotes = (arr, files = []) =>
      arr.map((note, i) => ({
        name:     note.name,
        imageUrl: files[i] ? files[i].path : '',
      }));

    const newProduct = new Product({
      name,
      category: parsedCategory,
      price,
      description,
      // Cloudinary: file.path is the full CDN URL
      imageUrl: req.files?.imageUrl?.[0]?.path || '',
      notes: {
        top:    mapNotes(parsedNotes.top,    req.files?.topNotesImages),
        middle: mapNotes(parsedNotes.middle, req.files?.middleNotesImages),
        base:   mapNotes(parsedNotes.base,   req.files?.baseNotesImages),
      },
    });

    const saved = await newProduct.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding product' });
  }
});

// ── PUT Edit Product ──────────────────────────────────────────────────────────
router.put('/:id', uploadAllFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const parsedCategory = JSON.parse(category);
    const parsedNotes    = JSON.parse(notes);

    const mapNotes = (arr, files = []) =>
      arr.map((note, i) => ({
        name:     note.name,
        imageUrl: files[i] ? files[i].path : (note.imageUrl || ''),
      }));

    const updated = {
      name,
      category: parsedCategory,
      price,
      description,
      notes: {
        top:    mapNotes(parsedNotes.top,    req.files?.topNotesImages),
        middle: mapNotes(parsedNotes.middle, req.files?.middleNotesImages),
        base:   mapNotes(parsedNotes.base,   req.files?.baseNotesImages),
      },
    };

    // Only update main image if a new one was uploaded
    if (req.files?.imageUrl?.[0]) {
      updated.imageUrl = req.files.imageUrl[0].path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updated, { new: true });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating product' });
  }
});

// ── DELETE Product ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
