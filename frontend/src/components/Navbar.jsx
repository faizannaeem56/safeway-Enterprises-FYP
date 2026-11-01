/**
 * ============================================================================
 * FILE: frontend/src/components/Navbar.jsx
 * PURPOSE: Responsive top navigation bar for Safeway Enterprises.
 * ROLE SECURITY: The 'Admin Panel' button is STRICTLY HIDDEN from regular
 *                customers and guests! It only renders when `user.role === 'admin'`.
 * ============================================================================
 */

// Import React to build our functional navigation bar component
import React from 'react';

// Import Link (for page navigation without reload) and useLocation (to detect the current URL path)
import { Link, useLocation } from 'react-router-dom';

// Import clean SVG icons from the lucide-react icon library
import { ShoppingCart, ShieldCheck, User, LogOut, Cpu, Package } from 'lucide-react';

// Import custom Context hooks to read the logged-in user and shopping cart counter
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Main Navbar component rendered at the top of every page via App.jsx
export default function Navbar() {
  // Destructure current logged-in `user` object and `logout` function from AuthContext
  const { user, logout } = useAuth();

  // Destructure total quantity of items in the cart from CartContext
  const { totalItemsCount } = useCart();

  // Get the current browser route location object (e.g., location.pathname === '/shop')
  const location = useLocation();

  // Helper function: Returns active blue highlight classes if the link matches the current URL path
  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg'
      : 'text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition';

  return (
    // Sticky header stays fixed at the top of the viewport with a subtle glassmorphism blur effect
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo — Clicking this redirects the user back to the Home Page ('/') */}
        <Link to="/" className="flex items-center gap-2.5">
          {/* Gradient icon box featuring a CPU chip icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          {/* Company Title and Subtitle */}
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">
              SAFEWAY
            </span>
            <span className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
              Enterprises
            </span>
          </div>
        </Link>

        {/* Primary Navigation Links (Hidden on small mobile screens, flex on medium+ screens) */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/shop" className={isActive('/shop')}>
            Shop Products
          </Link>
          <Link to="/orders" className={isActive('/orders')}>
            My orders
          </Link>
          <Link to="/about" className={isActive('/about')}>
            About Us
          </Link>
          <Link to="/contact" className={isActive('/contact')}>
            Contact Us
          </Link>

          {/* STRICT ROLE CHECK: Admin Panel link ONLY appears when logged in as Admin */}
          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-bold shadow-sm transition ml-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Action Icons: Shopping Cart & User Authentication Controls */}
        <div className="flex items-center gap-3">
          {/* Shopping Cart Button with Dynamic Item Counter Badge */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition"
            title="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {/* Conditional Badge: Only displays the blue number bubble if cart has 1 or more items */}
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Conditional Rendering (Ternary Operator): Show User Name + Logout if logged in, otherwise show Login/Signup button */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Display logged-in user's name and an 'Admin' tag if they have admin privileges */}
              <span className="hidden sm:inline-block text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
                {user.name} {user.role === 'admin' ? '⚡ (Admin)' : ''}
              </span>
              {/* Logout Button: Calls logout() from AuthContext to clear session & localStorage */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Guest View: Redirects to '/auth' login/signup page */
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition"
            >
              <User className="w-4 h-4" />
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}