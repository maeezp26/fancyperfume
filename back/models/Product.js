const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: [String], required: true },
  price:       { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  // FIX: imageUrl is NOT required — admin may not upload an image immediately
  imageUrl:    { type: String, default: '' },
  notes: {
    top:    [{ name: String, imageUrl: { type: String, default: '' } }],
    middle: [{ name: String, imageUrl: { type: String, default: '' } }],
    base:   [{ name: String, imageUrl: { type: String, default: '' } }],
  },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });

module.exports = mongoose.model('Product', ProductSchema);
