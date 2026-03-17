import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './css/HeaderFooter.css';
import './css/Cart.css';

export default function Cart() {
 const { cart, loading, updateQuantity, updateMlSize, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  // ✅ FIXED: Correct parameters & NO redundant useCart()
  const handleMlChange = async (e, itemId, newMlSize) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      console.log('Changing mlSize:', itemId, 'to', newMlSize); // ✅ Debug log
      await updateMlSize(itemId, newMlSize); // ✅ Uses already destructured function
    } catch (error) {
      console.error('Error updating mlSize:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

 // Not logged in
if (!isAuthenticated){
  return (
    <main className="luxury-cart">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Shopping Cart</h1>
          <p className="hero-subtitle">Login to view your luxury collection</p>
        </div>
      </section>
      <div className="empty-cart-state">
        <div className="empty-icon">🔒</div>
        <h2>Login Required</h2>
        <p>You need to be logged in to view your cart.</p>
        <div className="empty-actions">
          <button onClick={() => navigate('/login')} className="luxury-btn primary">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="luxury-btn secondary">
            Create Account
          </button>
        </div>
      </div>
    </main>
  );
}

// Loading
if (loading) {
  return (
    <main className="luxury-cart">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Shopping Cart</h1>
        </div>
      </section>
      <div className="cart-loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your luxury collection...</p>
      </div>
    </main>
  );
}

// Empty cart
if (!cart || cart.items.length === 0) {
  return (
    <main className="luxury-cart">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Shopping Cart</h1>
        </div>
      </section>
      <div className="empty-cart-state">
        <div className="empty-icon">🛍️</div>
        <h2>Your Cart is Empty</h2>
        <p>Discover our premium fragrance collection</p>
        <button onClick={() => navigate('/category')} className="luxury-btn primary large">
          Continue Shopping
        </button>
      </div>
    </main>
  );
}


  return (
    <main className="luxury-cart">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Shopping Cart</h1>
          <p className="hero-subtitle">Review your premium selection</p>
        </div>
      </section>

      <div className="cart-container">
        <div className="cart-header">
          <div>
            <h2 className="section-title">Your Selection</h2>
            <p className="items-count">{cart.items.length} items</p>
          </div>
          <button type="button" onClick={handleClearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>



        <div className="cart-layout">
          <div className="cart-items-section">
            {cart.items.map((item) => (    
              <div className="luxury-cart-item" key={item._id}>
                <div className="item-image">
                  <img
                    src={
                      item.product.imageUrl.startsWith('http')
                        ? item.product.imageUrl
                        : `http://localhost:5000${item.product.imageUrl}`
                    }
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <div className="item-meta">
                    <span className="item-category">
                      {Array.isArray(item.product.category)
                        ? item.product.category.join(', ')
                        : item.product.category}
                    </span>
                    <span className="item-size">({item.mlSize}ml)</span>
                    <span className="item-price">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* ✅ FIXED: Correct onClick parameters */}
                <div className="ml-selector">
                  <label className="selector-label">Size</label>
                  <div className="size-buttons">
                    {[3, 6, 12].map((size) => (
                      <button
                      type="button" 
                        key={size}
                        className={`size-btn ${item.mlSize === size ? 'active' : ''}`}
                        onClick={(e) => handleMlChange(e, item._id, size)}  // ✅ e FIRST, then item._id, then size
                      >
                        {size}ml
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quantity-controls">
                  <button
                  type="button" 
                    className="qty-btn decrease"
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                  type="button" 
                    className="qty-btn increase"
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>

                <button
                type="button" 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item._id)}
                >
                  <span>✕</span>
                </button>
              </div>
            ))}
          </div>

          {/* ... rest of your summary stays the same ... */}
         <div className="cart-summary">
  <h3 className="summary-title">Order Summary</h3>
  
  <div className="summary-item">
    <span>Subtotal ({cart.items.length} items)</span>
    <span>₹{cart.subtotal?.toLocaleString() || (cart.totalAmount - 60).toLocaleString()}</span>
  </div>
  
  <div className="summary-item">
    <span>Shipping</span>
    <span>₹50 OR ₹80</span>
  </div>
  
  <hr className="divider" />
  
  <div className="summary-total">
    <span>Total</span>
    <strong>₹{cart.totalAmount.toLocaleString()}</strong>
  </div>

  <button   type="button" onClick={handleCheckout} className="checkout-btn primary">
    Proceed to Checkout
  </button>

  <button type="button" onClick={() => navigate('/category')} className="continue-shopping-btn">
    Continue Shopping
  </button>
</div>

        </div>
      </div>
    </main>
  );
}
