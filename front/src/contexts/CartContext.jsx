import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // ✅ FIXED: Only call fetchCart when authenticated AND has token
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping cart fetch');
        setCart({ items: [], totalAmount: 0 });
        return;
      }

<<<<<<< HEAD
      const response = await axios.get('http://localhost:5000/api/cart', {
=======
      const response = await axios.get('import.meta.env.VITE_API_URL/api/cart', {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (error) {
      // ✅ SILENTLY handle 401 - treat as empty cart (no console.error)
      if (error.response?.status === 401) {
        console.log('401 - No cart access, treating as empty cart');
        setCart({ items: [], totalAmount: 0 });
        return;
      }
      // Only log other errors
      console.error('Cart fetch error (non-401):', error.response?.data || error.message);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, mlSize = 3) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      console.log('Adding to cart:', { productId, quantity, mlSize });
      
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await axios.post('http://localhost:5000/api/cart/add', {
=======
      const response = await axios.post('import.meta.env.VITE_API_URL/api/cart/add', {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        productId,
        quantity,
        mlSize
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Add to cart response:', response.data);
      setCart(response.data.cart);
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add item to cart' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      console.log('Updating quantity:', itemId, quantity);
      
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/api/cart/update/${itemId}`, {
=======
      const response = await axios.put(`import.meta.env.VITE_API_URL/api/cart/update/${itemId}`, {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error.response?.data || error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateMlSize = async (itemId, mlSize) => {
    try {
      setLoading(true);
      console.log('Updating mlSize:', itemId, mlSize);
      
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/api/cart/update-ml/${itemId}`, {
=======
      const response = await axios.put(`import.meta.env.VITE_API_URL/api/cart/update-ml/${itemId}`, {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        mlSize
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error updating mlSize:', error.response?.data || error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
=======
      const response = await axios.delete(`import.meta.env.VITE_API_URL/api/cart/remove/${itemId}`, {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error.response?.data || error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      await axios.delete('http://localhost:5000/api/cart/clear', {
=======
      await axios.delete('import.meta.env.VITE_API_URL/api/cart/clear', {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart({ items: [], totalAmount: 0 });
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.totalAmount;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    updateMlSize,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    getTotalAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
