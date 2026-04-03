// back/routes/product.js
const express = require('express');
const Product = require('../models/Product');
const { createUploader, deleteByUrl } = require('../utils/cloudinary');

const router   = express.Router();
const uploader = createUploader('products');

const uploadFields = uploader.fields([
  { name: 'image',             maxCount: 1  },
  { name: 'topNotesImages',    maxCount: 10 },
  { name: 'middleNotesImages', maxCount: 10 },
  { name: 'baseNotesImages',   maxCount: 10 },
]);

// Wrap multer to catch its errors (file size exceeded, wrong format, etc.)
const upload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err.message);
      return res.status(400).json({ error: 'Image upload failed: ' + err.message });
    }
    next();
  });
};

// ── GET All Products ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
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
    console.error('GET /products/:id error:', err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// ── POST Add Product ──────────────────────────────────────────────────────────
router.post('/', upload, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    let parsedNotes    = { top: [], middle: [], base: [] };
    let parsedCategory = [];

    try { parsedNotes    = notes    ? JSON.parse(notes)    : parsedNotes;    } catch(e) {}
    try { parsedCategory = category ? JSON.parse(category) : parsedCategory; } catch(e) {}

    const files = req.files || {};

    const mapNotes = (arr = [], filesArr = []) =>
      arr.map((note, i) => ({
        name:     note?.name || '',
        imageUrl: filesArr?.[i]?.path || '',
      }));

    const newProduct = new Product({
      name:        name.trim(),
      category:    parsedCategory,
      price:       Number(price),
      description: (description || '').trim(),
      imageUrl:    files.image?.[0]?.path || '',
      notes: {
        top:    mapNotes(parsedNotes.top,    files.topNotesImages),
        middle: mapNotes(parsedNotes.middle, files.middleNotesImages),
        base:   mapNotes(parsedNotes.base,   files.baseNotesImages),
      },
    });

    const saved = await newProduct.save();
    res.status(201).json({ success: true, product: saved });

  } catch (err) {
    console.error('POST /products error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT Edit Product ──────────────────────────────────────────────────────────
router.put('/:id', upload, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let parsedCategory = [];
    let parsedNotes    = { top: [], middle: [], base: [] };
    try { parsedCategory = category ? JSON.parse(category) : []; } catch(e) {}
    try { parsedNotes    = notes    ? JSON.parse(notes)    : parsedNotes; } catch(e) {}

    const files = req.files || {};

    const mapNotes = (arr = [], uploadedFiles = [], existingNotes = []) =>
      arr.map((note, i) => ({
        name:     note?.name || '',
        imageUrl: uploadedFiles[i]?.path || note?.imageUrl || existingNotes[i]?.imageUrl || '',
      }));

    const updated = {
      name:        (name || '').trim(),
      category:    parsedCategory,
      price:       parseFloat(price),
      description: (description || '').trim(),
      notes: {
        top:    mapNotes(parsedNotes.top,    files.topNotesImages,    existing.notes?.top),
        middle: mapNotes(parsedNotes.middle, files.middleNotesImages, existing.notes?.middle),
        base:   mapNotes(parsedNotes.base,   files.baseNotesImages,   existing.notes?.base),
      },
    };

    if (files.image?.[0]) {
      await deleteByUrl(existing.imageUrl);
      updated.imageUrl = files.image[0].path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updated, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    console.error('PUT /products/:id error:', err);
    res.status(500).json({ error: 'Error updating product: ' + err.message });
  }
});

// ── DELETE Product ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    await deleteByUrl(deleted.imageUrl);
    for (const type of ['top', 'middle', 'base']) {
      for (const note of deleted.notes?.[type] || []) {
        await deleteByUrl(note.imageUrl);
      }
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('DELETE /products/:id error:', err);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
