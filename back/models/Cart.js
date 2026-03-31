const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  mlSize: { type: Number, required: true, min: 3, enum: [3, 6, 12], default: 3 },
  price:  { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:       [cartItemSchema],
  // BUG FIX: old pre-save hook added +60 shipping here, which is wrong.
  // Shipping is dynamic (₹50 Gujarat / ₹80 outside) and must be calculated at checkout.
  // totalAmount in the cart = item subtotal only.
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

// Correct: totalAmount = sum of (price × quantity), no shipping baked in
cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

// DB PERFORMANCE: index for fast cart lookup per user
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
