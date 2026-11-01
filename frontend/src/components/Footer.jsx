/**
 * ============================================================================
 * FILE: frontend/src/components/Footer.jsx
 * PURPOSE: Displays Safeway Enterprises company info, category shortcuts,
 *          and customer policy highlights at the bottom of every page.
 * ============================================================================
 */

// Import core React library to render the footer component
import React from 'react';

// Import Link from react-router-dom for seamless client-side page navigation
import { Link } from 'react-router-dom';

// Import icons for brand logo, location pin, phone number, and email address
import { Cpu, MapPin, Phone, Mail } from 'lucide-react';

// Import useAuth hook to check if the current user is an Admin
import { useAuth } from '../context/AuthContext';

// Main Footer component rendered at the bottom of the layout inside App.jsx
export default function Footer() {
  // Get the currently logged-in user object from AuthContext
  const { user } = useAuth();

  return (
    // Dark slate footer container with top border and margin to separate it from page content
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-16">
      
      {/* Responsive 4-Column Grid: 1 column on mobile screens, 4 columns on medium/desktop screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* COLUMN 1: Company Brand Logo & Brief Introduction */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            {/* Blue CPU icon badge */}
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white">Safeway Enterprises</span>
          </div>
          {/* Short company mission statement highlighting products, warranty, and Gemini AI support */}
          <p className="text-sm text-slate-400 leading-relaxed">
            Your trusted destination for genuine Computers, Laptops, Smart Watches, Phones, and Official Tech Accessories backed by Safeway Warranty and 24/7 Gemini AI Support.
          </p>
        </div>

        {/* COLUMN 2: Direct Category Filter Links (Passes '?category=...' query parameter to Shop page) */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Product Categories
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/shop?category=Computers" className="hover:text-white">Computers</Link></li>
            <li><Link to="/shop?category=Laptops" className="hover:text-white">Laptops</Link></li>
            <li><Link to="/shop?category=Smart Watches" className="hover:text-white">Smart Watches</Link></li>
            <li><Link to="/shop?category=Phones" className="hover:text-white">Phones</Link></li>
            <li><Link to="/shop?category=Mobile Accessories" className="hover:text-white">Mobile, Laptop & PC Accessories</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: Quick Customer Navigation Links & Conditional Admin Shortcut */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/orders" className="hover:text-white">Track My orders</Link></li>
            <li><Link to="/about" className="hover:text-white">About Safeway Enterprises</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact & Support</Link></li>
            <li><Link to="/cart" className="hover:text-white">View Shopping Cart</Link></li>
            
            {/* Role Check: Only display the 'Admin Dashboard' link if an Admin is logged in */}
            {user && user.role === 'admin' && (
              <li><Link to="/admin" className="text-amber-400 hover:text-amber-300 font-semibold">Admin Dashboard</Link></li>
            )}
          </ul>
        </div>

        {/* COLUMN 4: Physical Head Office Address, Helpline Phone, and Official Email */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Head Office
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {/* Store Address */}
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
              <span> Shop No:112 Aitchion housing society, Lahore, Pakistan</span>
            </li>
            {/* Support Phone Number */}
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+92 321-1006989</span>
            </li>
            {/* Official Email */}
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>contact.safeway.ent@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar & Store Policy Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Dynamically renders the current calendar year (e.g., 2026) using JavaScript Date API */}
        <p>© {new Date().getFullYear()} Safeway Enterprises. Built with MERN Stack .</p>
        <p>Free Shipping on orders Over 25,000 • 7-Day Easy Return Policy</p>
      </div>
    </footer>
  );
}