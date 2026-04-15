import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // FIX #1: Depend on `user` (changes only on login/logout), NOT on
  // `isAuthenticated` function reference — that changes every render → infinite loop.
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    // FIX #2: original code referenced `response.data` BEFORE the axios call
    // when token was missing → ReferenceError crash. Now just bail early.
    if (!token) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: response.data?.items || [], totalAmount: response.data?.totalAmount || 0 });
    } catch (error) {
      if (error.response?.status === 401) { setCart({ items: [], totalAmount: 0 }); return; }
      console.error('Cart fetch error:', error.response?.data || error.message);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId, quantity = 1, mlSize = 3) => {
    // FIX #3: isAuthenticated is a FUNCTION — must call it with ()
    if (!isAuthenticated()) throw new Error('Please login to add items to cart');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        apiUrl('/api/cart/add'),
        { productId, quantity, mlSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to add item to cart' };
    } finally { setLoading(false); }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        apiUrl(`/api/cart/update/${itemId}`),
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error.response?.data || error.message);
      return { success: false };
    } finally { setLoading(false); }
  };

  const updateMlSize = async (itemId, mlSize) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        apiUrl(`/api/cart/update-ml/${itemId}`),
        { mlSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error updating mlSize:', error.response?.data || error.message);
      return { success: false };
    } finally { setLoading(false); }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        apiUrl(`/api/cart/remove/${itemId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error.response?.data || error.message);
      return { success: false };
    } finally { setLoading(false); }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(apiUrl('/api/cart/clear'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: [], totalAmount: 0 });
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      return { success: false };
    } finally { setLoading(false); }
  };

  // Header badge should show how many products are in the cart,
  // not the summed quantity of a single product line.
  const getCartItemCount = () => cart?.items?.length || 0;
  const getTotalAmount = () => cart.totalAmount;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, updateMlSize, removeFromCart, clearCart, fetchCart, getCartItemCount, getTotalAmount }}>
      {children}
    </CartContext.Provider>
  );
};
