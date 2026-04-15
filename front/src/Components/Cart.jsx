import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './css/HeaderFooter.css';
import './css/Cart.css';
import { assetUrl } from '../utils/api';

export default function Cart() {
 const { cart, loading, updateQuantity, updateMlSize, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasCartItems = Array.isArray(cart?.items) && cart.items.length > 0;
  const isInitialLoading = loading && !hasCartItems;
  const isUpdatingCart = loading && hasCartItems;

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
if (!isAuthenticated()){
  return (
    <main className="luxury-cart">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">Shopping Cart</h1>
          {hasCartItems && <p className="hero-subtitle">Login to checkout your collection</p>}
          {!hasCartItems && <p className="hero-subtitle">Login to view your cart</p>}
        </div>
      </section>
      
      {hasCartItems ? (
        <>
          {/* Show cart items for anonymous users but disable checkout */}
          <div className="cart-container">
            <div className="cart-header">
              <div>
                <h2 className="section-title">Your Selection</h2>
                <p className="items-count">
                  {cart.items.length} items{isUpdatingCart ? ' • Updating...' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearCart}
                className="clear-cart-btn"
                disabled={isUpdatingCart}
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-layout" aria-busy={isUpdatingCart}>
              <div className="cart-items-section">
                {cart.items.filter(item => item.product).map((item) => (    
                  <div className="luxury-cart-item" key={item._id}>
                    <div className="item-image">
                      <img
                        src={item.product.imageUrl ? assetUrl(item.product.imageUrl) : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%221a1a2e%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'}
                        alt={item.product.name}
                        onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%221a1a2e%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'; }}
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

                    <div className="ml-selector">
                      <label className="selector-label">Size</label>
                      <div className="size-buttons">
                        {[3, 6, 12].map((size) => (
                          <button
                            type="button" 
                            key={size}
                            className={`size-btn ${item.mlSize === size ? 'active' : ''}`}
                            disabled={isUpdatingCart}
                            onClick={(e) => handleMlChange(e, item._id, size)}
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
                        disabled={isUpdatingCart}
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        type="button" 
                        className="qty-btn increase"
                        disabled={isUpdatingCart}
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
                      disabled={isUpdatingCart}
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      <span>✕</span>
                    </button>
                  </div>
                ))}
              </div>

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

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="checkout-btn primary"
                  disabled={isUpdatingCart}
                >
                  Login to Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-cart-state">
          <div className="empty-icon">🔒</div>
          <h2>Login to Shop</h2>
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
      )}
    </main>
  );
}

// Loading
if (isInitialLoading) {
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
if (!hasCartItems) {
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
            <p className="items-count">
              {cart.items.length} items{isUpdatingCart ? ' • Updating...' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearCart}
            className="clear-cart-btn"
            disabled={isUpdatingCart}
          >
            Clear Cart
          </button>
        </div>



        <div className="cart-layout" aria-busy={isUpdatingCart}>
          <div className="cart-items-section">
            {cart.items.filter(item => item.product).map((item) => (    
              <div className="luxury-cart-item" key={item._id}>
                <div className="item-image">
                  <img
                    src={item.product.imageUrl ? assetUrl(item.product.imageUrl) : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%221a1a2e%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'}
                    alt={item.product.name}
                    onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%221a1a2e%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'; }}
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
                        disabled={isUpdatingCart}
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
                    disabled={isUpdatingCart}
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                  type="button" 
                    className="qty-btn increase"
                    disabled={isUpdatingCart}
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
                  disabled={isUpdatingCart}
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

  <button
    type="button"
    onClick={handleCheckout}
    className="checkout-btn primary"
    disabled={isUpdatingCart}
  >
    Proceed to Checkout
  </button>

  <button
    type="button"
    onClick={() => navigate('/category')}
    className="continue-shopping-btn"
    disabled={isUpdatingCart}
  >
    Continue Shopping
  </button>
</div>

        </div>
      </div>
    </main>
  );
}
