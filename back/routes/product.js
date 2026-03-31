// routes/product.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const Product = require('../models/Product');

const router = express.Router();

// ── Multer Storage ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const sanitized    = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitized}`);
  },
});

// FIX: Add file size limit (5MB) and type filter — prevents large/malicious uploads
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

const uploadFields = upload.fields([
  { name: 'imageUrl',          maxCount: 1  },
  { name: 'topNotesImages',    maxCount: 10 },
  { name: 'middleNotesImages', maxCount: 10 },
  { name: 'baseNotesImages',   maxCount: 10 },
]);

// ── GET All Products ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // PERFORMANCE: .lean() returns plain JS objects — 2-3x faster than Mongoose documents
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
router.post('/', uploadFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const parsedNotes    = JSON.parse(notes);
    const parsedCategory = JSON.parse(category);

    const mapNotes = (arr, files = []) =>
      arr.map((note, i) => ({
        name:     note.name,
        imageUrl: files[i] ? `/uploads/${files[i].filename}` : '',
      }));

    const newProduct = new Product({
      name,
      category: parsedCategory,
      price,
      description,
      imageUrl: req.files?.imageUrl?.[0] ? `/uploads/${req.files.imageUrl[0].filename}` : '',
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
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const parsedCategory = JSON.parse(category);
    const parsedNotes    = JSON.parse(notes);

    const mapNotes = (arr, files = []) =>
      arr.map((note, i) => ({
        name:     note.name,
        imageUrl: files[i] ? `/uploads/${files[i].filename}` : (note.imageUrl || ''),
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

    if (req.files?.imageUrl?.[0]) {
      updated.imageUrl = `/uploads/${req.files.imageUrl[0].filename}`;
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
