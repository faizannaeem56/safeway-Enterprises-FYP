/**
 * ============================================================================
 * FILE: frontend/src/main.jsx
 * PURPOSE: Mounts the React application and wraps it with global providers:
 *          1. HashRouter (for page navigation)
 *          2. AuthProvider (for Login/Signup state & JWT management)
 *          3. CartProvider (for Shopping Cart state & bill calculation)
 * ============================================================================
 */

// Import core React library to support JSX syntax and component rendering
import React from 'react';

// Import ReactDOM client to mount our React component tree into the browser's HTML DOM
import ReactDOM from 'react-dom/client';

// Import HashRouter to handle client-side routing without causing 404 errors on page refresh
import { HashRouter } from 'react-router-dom';

// Import the root App component that holds our Navbar, Pages, and Footer
import App from './App';

// Import AuthProvider so every component in the app can access the logged-in user's state
import { AuthProvider } from './context/AuthContext';

// Import CartProvider so any page can add/remove items from the shopping cart globally
import { CartProvider } from './context/CartContext';

// Import global CSS stylesheet (includes Tailwind CSS / custom styles)
import './index.css';

// Select the <div id="root"></div> element from index.html and render our React application inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch potential bugs and deprecated React practices during development
  <React.StrictMode>
    {/* HashRouter enables seamless URL navigation (e.g., /#/shop, /#/cart) across the app */}
    <HashRouter>
      {/* AuthProvider wraps the app to share user authentication data globally */}
      <AuthProvider>
        {/* CartProvider wraps App so shopping cart items and totals are accessible everywhere */}
        <CartProvider>
          {/* Main application component containing all routes and UI views */}
          <App />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);