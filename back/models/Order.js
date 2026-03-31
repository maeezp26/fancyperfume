const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // FIX: add name field so admin panel can display product name without extra populate
  name:     { type: String, default: '' },
  mlSize:   { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true, min: 0 },
});

const shippingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true, trim: true },
  zipCode:   { type: String, required: true, match: /^\d{6}$/ },
});

const orderSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items:    { type: [orderItemSchema], required: true },
    shippingInfo: { type: shippingSchema, required: true },
    subtotal:     { type: Number, required: true, min: 0 },
    shippingAmount: { type: Number, required: true, enum: [50, 80] },
    totalAmount:  { type: Number, required: true, min: 0 },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

// DB PERFORMANCE: index for fast user order lookups & admin sort
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
