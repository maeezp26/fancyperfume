import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../utils/api';

const CartContext = createContext();
const ANONYMOUS_CART_KEY = 'fancy_perfume_anonymous_cart';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load anonymous cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ANONYMOUS_CART_KEY);
      if (saved) {
        const anonymous = JSON.parse(saved);
        setCart(anonymous);
      }
    } catch (e) {
      console.error('Failed to load anonymous cart:', e);
    }
  }, []);

  // When user logs in, merge anonymous cart with backend cart
  useEffect(() => {
    if (isAuthenticated() && user) {
      mergeAndLoadCart();
    } else if (!isAuthenticated()) {
      // User logged out - switch to anonymous cart
      const saved = localStorage.getItem(ANONYMOUS_CART_KEY);
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch (e) {
          setCart({ items: [], totalAmount: 0 });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Merge anonymous cart items with backend cart when user logs in
  const mergeAndLoadCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      
      // Get anonymous cart
      const anonymousCart = localStorage.getItem(ANONYMOUS_CART_KEY);
      let itemsToAdd = [];
      
      if (anonymousCart) {
        try {
          const parsed = JSON.parse(anonymousCart);
          itemsToAdd = parsed.items || [];
        } catch (e) {
          console.error('Failed to parse anonymous cart:', e);
        }
      }

      // Fetch user's server cart
      const response = await axios.get(apiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const serverCart = response.data;

      // Merge items: add anonymous items to server cart
      if (itemsToAdd.length > 0) {
        for (const item of itemsToAdd) {
          try {
            await axios.post(
              apiUrl('/api/cart/add'),
              { 
                productId: item.product?._id || item.product, 
                quantity: item.quantity, 
                mlSize: item.mlSize 
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (e) {
            console.error('Failed to merge item:', e);
          }
        }
      }

      // Fetch updated cart after merge
      const finalResponse = await axios.get(apiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: finalResponse.data?.items || [], totalAmount: finalResponse.data?.totalAmount || 0 });
      
      // Clear anonymous cart
      localStorage.removeItem(ANONYMOUS_CART_KEY);
    } catch (error) {
      console.error('Cart merge error:', error);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Load from anonymous cart
      const saved = localStorage.getItem(ANONYMOUS_CART_KEY);
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch (e) {
          setCart({ items: [], totalAmount: 0 });
        }
      }
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/api/cart'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: response.data?.items || [], totalAmount: response.data?.totalAmount || 0 });
    } catch (error) {
      if (error.response?.status === 401) {
        setCart({ items: [], totalAmount: 0 });
        return;
      }
      console.error('Cart fetch error:', error.response?.data || error.message);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId, quantity = 1, mlSize = 3) => {
    // ✅ CHANGED: No auth required - supports both authenticated and anonymous users
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        // Authenticated user - use backend
        const response = await axios.post(
          apiUrl('/api/cart/add'),
          { productId, quantity, mlSize },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCart(response.data.cart);
        return { success: true, message: 'Item added to cart' };
      } else {
        // Anonymous user - use localStorage
        const saved = localStorage.getItem(ANONYMOUS_CART_KEY);
        let anonCart = saved ? JSON.parse(saved) : { items: [], totalAmount: 0 };

        // Check if item already exists
        const existingIdx = anonCart.items.findIndex(
          (it) => it.product === productId && it.mlSize === mlSize
        );

        if (existingIdx !== -1) {
          anonCart.items[existingIdx].quantity += quantity;
        } else {
          anonCart.items.push({
            product: productId,
            quantity,
            mlSize,
            price: 0, // Will be fetched/calculated when user views cart
          });
        }

        // Recalculate total
        anonCart.totalAmount = anonCart.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        
        localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(anonCart));
        setCart(anonCart);
        return { success: true, message: 'Item added to cart' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        await axios.delete(apiUrl('/api/cart/clear'), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        localStorage.removeItem(ANONYMOUS_CART_KEY);
      }
      
      setCart({ items: [], totalAmount: 0 });
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => cart?.items?.length || 0;
  const getTotalAmount = () => cart.totalAmount;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, updateMlSize, removeFromCart, clearCart, fetchCart, getCartItemCount, getTotalAmount }}>
      {children}
    </CartContext.Provider>
  );
};
