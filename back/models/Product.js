const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: [String], required: true },
  price:       { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  imageUrl:    { type: String, required: true },
  notes: {
    top:    [{ name: String, imageUrl: String }],
    middle: [{ name: String, imageUrl: String }],
    base:   [{ name: String, imageUrl: String }],
  },
}, { timestamps: true });

// DB PERFORMANCE: text index for search, category for filtering
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });

module.exports = mongoose.model('Product', ProductSchema);
