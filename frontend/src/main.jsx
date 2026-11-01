/**
 * ============================================================================
 * FILE: frontend/src/main.jsx
 * PURPOSE: Mounts the React application and wraps it with global providers:
 *          1. HashRouter (for page navigation)
 *          2. AuthProvider (for Login/Signup state & JWT management)
 *          3. CartProvider (for Shopping Cart state & bill calculation)
 * ============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
