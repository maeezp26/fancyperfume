
// back/routes/product.js

const express = require('express');
const Product = require('../models/Product');
const { createUploader, deleteByUrl } = require('../utils/cloudinary');

const router = express.Router();
const uploader = createUploader('products');

// ✅ FIXED: field name "image" (not imageUrl)
const uploadFields = uploader.fields([
  { name: 'image', maxCount: 1 },
  { name: 'topNotesImages', maxCount: 10 },
  { name: 'middleNotesImages', maxCount: 10 },
  { name: 'baseNotesImages', maxCount: 10 },
]);

// ── GET All Products ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// ── GET Single Product ───────────────────────────────────
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

// ── POST Add Product ─────────────────────────────────────
router.post('/', uploadFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ error: 'name, price, description are required' });
    }

    const parsedNotes = JSON.parse(notes || '{"top":[],"middle":[],"base":[]}');
    const parsedCategory = JSON.parse(category || '[]');

    const mapNotes = (arr, files = []) =>
      (arr || []).map((note, i) => ({
        name: note.name || '',
        imageUrl: files[i]?.path || '',
      }));

    const newProduct = new Product({
      name,
      category: parsedCategory,
      price: parseFloat(price),
      description,
      // ✅ FIXED: use req.files.image
      imageUrl: req.files?.image?.[0]?.path || '',
      notes: {
        top: mapNotes(parsedNotes.top, req.files?.topNotesImages),
        middle: mapNotes(parsedNotes.middle, req.files?.middleNotesImages),
        base: mapNotes(parsedNotes.base, req.files?.baseNotesImages),
      },
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ error: 'Error adding product: ' + err.message });
  }
});

// ── PUT Edit Product ─────────────────────────────────────
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const { name, category, price, description, notes } = req.body;

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const parsedCategory = JSON.parse(category || '[]');
    const parsedNotes = JSON.parse(notes || '{"top":[],"middle":[],"base":[]}');

    const mapNotes = (arr, files = [], existingNotes = []) =>
      (arr || []).map((note, i) => ({
        name: note.name || '',
        imageUrl:
          files[i]?.path ||
          note.imageUrl ||
          existingNotes[i]?.imageUrl ||
          '',
      }));

    const updated = {
      name,
      category: parsedCategory,
      price: parseFloat(price),
      description,
      notes: {
        top: mapNotes(parsedNotes.top, req.files?.topNotesImages, existing.notes?.top),
        middle: mapNotes(parsedNotes.middle, req.files?.middleNotesImages, existing.notes?.middle),
        base: mapNotes(parsedNotes.base, req.files?.baseNotesImages, existing.notes?.base),
      },
    };

    // ✅ FIXED: image handling
    if (req.files?.image?.[0]) {
      await deleteByUrl(existing.imageUrl);
      updated.imageUrl = req.files.image[0].path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updated, { new: true });
    res.json(product);
  } catch (err) {
    console.error('PUT /products/:id error:', err);
    res.status(500).json({ error: 'Error updating product: ' + err.message });
  }
});

// ── DELETE Product ───────────────────────────────────────
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
