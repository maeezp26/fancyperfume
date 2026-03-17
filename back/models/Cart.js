const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  mlSize: {              // ✅ ADD THIS LINE
    type: Number,
    required: true,
    min: 3,
    enum: [3, 6, 12],    // ✅ Only allow 3ml, 6ml, 12ml
    default: 3
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

cartSchema.pre('save', function(next) {
  const subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  this.totalAmount = subtotal + 60; // ✅ Add ₹60 shipping automatically
  next();
});


module.exports = mongoose.model('Cart', cartSchema);
