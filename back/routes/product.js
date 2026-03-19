// routes/product.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const Product = require('../models/Product');

const router = express.Router();

// ————————————————
// Multer Storage
// ————————————————
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random()*1e6)}`;
    const sanitized    = file.originalname.replace(/\s+/g, "_");
    const uniqueName   = `${file.fieldname}-${uniqueSuffix}-${sanitized}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ————————————————
// GET All Products
// ————————————————
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// ————————————————
// POST Add New Product
// ————————————————
router.post(
  '/',
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'topNotesImages', maxCount: 10 },
    { name: 'middleNotesImages', maxCount: 10 },
    { name: 'baseNotesImages', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, category, price, description, notes } = req.body;

      const parsedNotes = JSON.parse(notes);
      const parsedCategory = JSON.parse(category); // <-- array

      const mapNotesWithImages = (arr, files = []) =>
        arr.map((note, i) => ({
          name: note.name,
          imageUrl: files[i] ? `/uploads/${files[i].filename}` : "",
        }));

      const newProduct = new Product({
        name,
        category: parsedCategory,        // <-- use array
        price,
        description,
        imageUrl: req.files.imageUrl?.[0]
          ? `/uploads/${req.files.imageUrl[0].filename}`
          : "",
        notes: {
          top: mapNotesWithImages(parsedNotes.top, req.files.topNotesImages),
          middle: mapNotesWithImages(
            parsedNotes.middle,
            req.files.middleNotesImages
          ),
          base: mapNotesWithImages(parsedNotes.base, req.files.baseNotesImages),
        },
      });

      const saved = await newProduct.save();
      res.json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding product" });
    }
  }
);


// ————————————————
// PUT Edit Product
// ————————————————
router.put(
  '/:id',
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'topNotesImages', maxCount: 10 },
    { name: 'middleNotesImages', maxCount: 10 },
    { name: 'baseNotesImages', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, category, price, description, notes } = req.body;

      const parsedCategory = JSON.parse(category); // <-- array
      const parsedNotes = JSON.parse(notes);

      const mapNotesWithImages = (arr, files = []) =>
        arr.map((note, i) => ({
          name: note.name,
          imageUrl: files[i]
            ? `/uploads/${files[i].filename}`
            : note.imageUrl || "",
        }));

      const updated = {
        name,
        category: parsedCategory,        // <-- use array
        price,
        description,
        notes: {
          top: mapNotesWithImages(parsedNotes.top, req.files.topNotesImages),
          middle: mapNotesWithImages(
            parsedNotes.middle,
            req.files.middleNotesImages
          ),
          base: mapNotesWithImages(parsedNotes.base, req.files.baseNotesImages),
        },
      };

      if (req.files.imageUrl?.[0]) {
        updated.imageUrl = `/uploads/${req.files.imageUrl[0].filename}`;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updated,
        { new: true }
      );
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating product" });
    }
  }
);


// ————————————————
// DELETE Product
// ————————————————
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
