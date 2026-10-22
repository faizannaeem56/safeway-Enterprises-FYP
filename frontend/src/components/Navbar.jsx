/**
 * ============================================================================
 * FILE: frontend/src/components/Navbar.jsx
 * PURPOSE: Responsive top navigation bar for Safeway Enterprises.
 * ROLE SECURITY: The 'Admin Panel' button is STRICTLY HIDDEN from regular
 *                customers and guests! It only renders when `user.role === 'admin'`.
 * ============================================================================
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, User, LogOut, Cpu, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg'
      : 'text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">
              SAFEWAY
            </span>
            <span className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
              Enterprises
            </span>
          </div>
        </Link>

        {/* Primary Navigation Links */}
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

        {/* Right Action Icons: Cart & User Auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition"
            title="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
                {user.name} {user.role === 'admin' ? '⚡ (Admin)' : ''}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
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
