import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './css/AddToCartButton.css';

export default function AddToCartButton({ 
  product, 
  className = '', 
  size = 'medium',
  quantity = 1,      // ✅ ADD
  mlSize = 3         // ✅ ADD
}) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

const handleAddToCart = async () => {
  if (!isAuthenticated()) {
    navigate('/Login');
    return;
  }

    setLoading(true);
    setMessage('');

   try {
    // ✅ Use props directly (not product prop which doesn't have them)
    const cartQuantity = quantity || 1;  // From ProductDetails props
    const cartMlSize = mlSize || 3;      // From ProductDetails props
    
    console.log('Adding:', { 
      productId: product._id, 
      quantity: cartQuantity, 
      mlSize: cartMlSize 
    });

      const result = await addToCart(product._id, cartQuantity, cartMlSize);
      console.log('Add to cart result:', result);
       if (result.success) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    setMessage('Error adding to cart');
    setTimeout(() => setMessage(''), 3000);
  } finally {
    setLoading(false);
  }
};

  const buttonClass = `add-to-cart-btn ${className} ${size}`;

  return (
    <div className="add-to-cart-container">
      <button 
        onClick={(e) => {
    e.preventDefault();      // stop Link default navigation
    e.stopPropagation();     // stop event bubbling to Link
    handleAddToCart();       // your existing logic
  }}
        disabled={loading}
        className={buttonClass}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      {message && (
        <div className={`cart-message ${message.includes('Added') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
