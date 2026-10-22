/**
 * ============================================================================
 * FILE: frontend/src/context/CartContext.jsx
 * PURPOSE: Manages the Shopping Cart state across the entire React website.
 * WHY IT IS USED: Provides functions to Add items to cart, Remove items,
 *                 Increase/Decrease quantities, and automatically calculates
 *                 the Subtotal, Shipping Fee, and Final Total Bill.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart items from localStorage so cart persists on page refresh
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('safeway_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('safeway_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to persist cart:', err);
    }
  }, [cartItems]);

  /**
   * Function 1: Add a product to the cart (or increment quantity if already added)
   */
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item._id === product._id);
      if (existingIndex > -1) {
        // Product already in cart -> increase quantity by 1
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      // Product not in cart -> add with quantity = 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  /**
   * Function 2: Remove a product completely from the shopping cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  /**
   * Function 3: Update quantity of a specific cart item (+1 or -1)
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Function 4: Empty the cart after successful order checkout
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total number of items in the cart (for the Navbar badge)
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate Subtotal price of all items
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Free shipping on orders over $150; otherwise flat $10 shipping fee
  const shippingFee = subtotal === 0 || subtotal >= 25000 ? 0 : 10;

  // Final Total Bill
  const totalBill = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        shippingFee,
        totalBill
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
