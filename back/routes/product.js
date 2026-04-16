// back/routes/product.js
const express = require('express');
const Product = require('../models/Product');
const { createUploader, deleteByUrl, formatUploadError } = require('../utils/cloudinary');

const router   = express.Router();
const uploader = createUploader('products');

const rawUpload = uploader.any();

// Wrapper that catches multer/Cloudinary errors and returns clean JSON
const upload = (req, res, next) => {
  rawUpload(req, res, (err) => {
    if (err) {
      const message = formatUploadError(err);
      console.error('Upload error:', message);
      return res.status(400).json({ success: false, error: 'Image upload failed: ' + message });
    }
    next();
  });
};

// ── GET All Products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// ── GET Single Product ───────────────────────────────────────────────────────
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

// ── POST Add Product ─────────────────────────────────────────────────────────
router.post('/', upload, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    // Only name, price, category are truly required
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'name and price are required' });
    }

    let parsedNotes    = { top: [], middle: [], base: [] };
    let parsedCategory = [];
    try { parsedNotes    = notes    ? JSON.parse(notes)    : parsedNotes;    } catch(e) { /* ignore */ }
    try { parsedCategory = category ? JSON.parse(category) : parsedCategory; } catch(e) { /* ignore */ }

    const files = req.files || [];
    const mapNotes = (type, arr = []) =>
      arr.map((note, i) => {
        const file = files.find(f => f.fieldname === `${type}NotesImage_${i}`);
        return {
          name:     note?.name || '',
          imageUrl: file?.path || '',
        };
      });

    const newProduct = new Product({
      name:        name.trim(),
      category:    parsedCategory,
      price:       Number(price),
      description: (description || '').trim(),
      imageUrl:    files.find(f => f.fieldname === 'image')?.path || '',
      notes: {
        top:    mapNotes('top',    parsedNotes.top),
        middle: mapNotes('middle', parsedNotes.middle),
        base:   mapNotes('base',   parsedNotes.base),
      },
    });

    const saved = await newProduct.save();
    res.status(201).json({ success: true, product: saved });
  } catch (err) {
    console.error('POST /products error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT Edit Product ─────────────────────────────────────────────────────────
router.put('/:id', upload, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let parsedCategory = [];
    let parsedNotes    = { top: [], middle: [], base: [] };
    try { parsedCategory = category ? JSON.parse(category) : []; } catch(e) { /* ignore */ }
    try { parsedNotes    = notes    ? JSON.parse(notes)    : parsedNotes; } catch(e) { /* ignore */ }

    const files = req.files || [];
    const mapNotes = (type, arr = [], existingNotes = []) =>
      arr.map((note, i) => {
        const file = files.find(f => f.fieldname === `${type}NotesImage_${i}`);
        return {
          name:     note?.name || '',
          imageUrl: file?.path || note?.imageUrl || existingNotes[i]?.imageUrl || '',
        };
      });

    const updated = {
      name:        (name || '').trim(),
      category:    parsedCategory,
      price:       parseFloat(price),
      description: (description || '').trim(),
      notes: {
        top:    mapNotes('top',    parsedNotes.top,    existing.notes?.top),
        middle: mapNotes('middle', parsedNotes.middle, existing.notes?.middle),
        base:   mapNotes('base',   parsedNotes.base,   existing.notes?.base),
      },
    };

    const imageFile = files.find(f => f.fieldname === 'image');
    if (imageFile) {
      await deleteByUrl(existing.imageUrl);
      updated.imageUrl = imageFile.path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updated, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    console.error('PUT /products/:id error:', err);
    res.status(500).json({ error: 'Error updating product: ' + err.message });
  }
});

// ── DELETE Product ───────────────────────────────────────────────────────────
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
