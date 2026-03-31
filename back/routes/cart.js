const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price imageUrl category');

    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1, mlSize = 3 } = req.body; // ✅ Added mlSize

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ✅ Calculate price based on mlSize (price is per 3ml base)
    const pricePerMl = product.price / 3;
    const itemPrice = pricePerMl * mlSize;

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart (same product + mlSize)
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && item.mlSize === mlSize
    );

    if (existingItemIndex !== -1) {
      // ✅ Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // ✅ Add new item with mlSize & calculated price
      cart.items.push({
        product: productId,
        quantity: quantity,
        mlSize: mlSize,      // ✅ Store mlSize
        price: itemPrice     // ✅ Store calculated price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl category');

    cart.subtotal = cart.items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update item quantity
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

  const item = cart.items.id(itemId);
if (!item) {
  return res.status(404).json({ message: 'Item not found' });
}

if (quantity <= 0) {
  cart.items = cart.items.filter(
    (it) => it._id.toString() !== itemId
  );
} else {
  item.quantity = quantity;
}


    await cart.save();
    await cart.populate('items.product', 'name price imageUrl category');
    
    cart.subtotal = cart.items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ ADD THIS NEW ROUTE after router.put('/update/:itemId', ...)
router.put('/update-ml/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { mlSize } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // ✅ Recalculate price based on new mlSize
    const product = await Product.findById(item.product);
    const pricePerMl = product.price / 3;
    item.mlSize = mlSize;
    item.price = pricePerMl * mlSize;

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl category');

    cart.subtotal = cart.items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);

    res.json({ message: 'mlSize updated', cart });
  } catch (error) {
    console.error('Update mlSize error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Remove item from cart
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
  (item) => item._id.toString() !== itemId
);

await cart.save();
await cart.populate('items.product', 'name price imageUrl category');

cart.subtotal = cart.items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);

res.json({ message: 'Item removed from cart', cart });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
