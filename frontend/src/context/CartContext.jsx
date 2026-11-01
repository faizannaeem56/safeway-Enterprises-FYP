/**
 * ============================================================================
 * FILE: frontend/src/context/CartContext.jsx
 * PURPOSE: Manages the global Shopping Cart state across the entire store.
 * WHY IT IS USED: Handles adding/removing products, adjusting item quantities,
 *                 saving the cart in localStorage, and dynamically calculating
 *                 the Subtotal, Shipping Fee, and Grand Total Bill.
 * ============================================================================
 */

// Import React and essential hooks for state, lifecycle synchronization, and Context API
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the global Shopping Cart Context container
const CartContext = createContext();

// CartProvider wraps the app (in main.jsx) so all pages and components can access cart data
export const CartProvider = ({ children }) => {
  // Initialize cartItems state using a lazy initializer function:
  // On first load, it checks browser localStorage for 'safeway_cart' so items aren't lost on refresh
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('safeway_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      // Fallback to an empty cart array if localStorage data is corrupted
      return [];
    }
  });

  // Automatically sync `cartItems` to browser localStorage whenever an item is added, updated, or removed
  useEffect(() => {
    try {
      localStorage.setItem('safeway_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to persist cart:', err);
    }
  }, [cartItems]);

  /**
   * Function: Add a product to the cart (or increment its quantity if already in the cart)
   */
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if this product (by MongoDB _id) already exists in the cart array
      const existingIndex = prevItems.findIndex((item) => item._id === product._id);

      // If the product is already in the cart (index is 0 or higher), increase its quantity by 1
      if (existingIndex > -1) {
        const updated = [...prevItems]; // Create a shallow copy of the cart array (immutability)
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }

      // If the product is not in the cart yet, append it as a new item with quantity: 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  /**
   * Function: Completely remove a specific product from the cart by its ID
   */
  const removeFromCart = (productId) => {
    // Filter out the item whose _id matches the given productId
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  /**
   * Function: Increase or decrease the quantity of a cart item
   */
  const updateQuantity = (productId, newQuantity) => {
    // If the user decreases quantity below 1 (i.e., to 0), automatically remove the item from the cart
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Otherwise, map through the cart and update the quantity for the matching product
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Function: Empty the entire shopping cart (called after successful order checkout)
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // ============================================================================
  // DERIVED CART CALCULATIONS (Automatically recomputed on every state change)
  // ============================================================================

  // Total number of individual units in the cart (shown on the red Navbar badge)
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Sum of (price * quantity) for every item in the cart
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Free shipping on empty cart or orders >= Rs. 25,000; otherwise flat shipping fee of 250
  const shippingFee = subtotal === 0 || subtotal >= 25000 ? 0 : 250;

  // Final playable amount combining subtotal and shipping charges
  const totalBill = subtotal + shippingFee;

  // Provide cart state, action methods, and calculated totals to all child components
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

// Custom hook to let any component access CartContext easily via `const { addToCart } = useCart();`
export const useCart = () => useContext(CartContext);