/**
 * ============================================================================
 * FILE: frontend/src/App.jsx
 * PURPOSE: Root layout component and client-side Routing table for the store.
 * WHY IT IS USED: Keeps the Navbar, Gemini AI ChatWidget, and Footer visible
 *                 on every page while dynamically switching the main page
 *                 content based on the current URL path.
 * ============================================================================
 */

// Import core React library to build the root functional component
import React from 'react';

// Import Routes and Route from react-router-dom to map URL paths to specific page components
import { Routes, Route } from 'react-router-dom';

// Import persistent layout components that stay visible across the entire website
import Navbar from './components/Navbar';         // Top navigation header with links & cart badge
import Footer from './components/Footer';         // Bottom footer with company info & quick links
import ChatWidget from './components/ChatWidget'; // Floating 24/7 Google Gemini AI support button

// Import all 9 page components from the 'pages' directory
import Home from './pages/Home';                     // Landing page with hero banner & featured items
import Shop from './pages/Shop';                     // Full catalog with category, search & price filters
import Cart from './pages/Cart';                     // Shopping cart & customer checkout form
import Myorders from './pages/MyOrders';             // Customer order tracking & inquiry history
import Auth from './pages/Auth';                     // Unified Login & Signup page
import AdminPanel from './pages/AdminPanel';         // Admin dashboard for managing products, orders & inbox
import About from './pages/About';                   // Company profile, mission & team overview
import Contact from './pages/Contact';               // Customer 'Contact Us' inquiry form & store location
import ProductDetails from './pages/ProductDetails'; // Single product view with full specs & warranty info

// Main App component exported as the default module for main.jsx
export default function App() {
  return (
    // Outer wrapper: 'min-h-screen flex flex-col' ensures the footer always sticks to the bottom of the screen
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navigation Bar (always visible at the top of every page) */}
      <Navbar />

      {/* Main Content Area: 'flex-grow' expands this section to fill available vertical screen space */}
      <main className="flex-grow">
        {/* Routes container evaluates the current URL and renders the first matching Route */}
        <Routes>
          {/* Home Page Route (Default landing URL) */}
          <Route path="/" element={<Home />} />

          {/* Shop Catalog Route (Displays all 7 tech categories & filters) */}
          <Route path="/shop" element={<Shop />} />

          {/* Dynamic Product Details Route (':id' is a URL parameter holding the MongoDB Product ID) */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Shopping Cart & Checkout Route */}
          <Route path="/cart" element={<Cart />} />

          {/* Customer Order History & Tracking Route */}
          <Route path="/orders" element={<Myorders />} />

          {/* Customer & Admin Login / Registration Route */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin Dashboard Route (Protected inside the component for Admin role only) */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* About Us Page Route */}
          <Route path="/about" element={<About />} />

          {/* Contact Us Form & Helpline Page Route */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      {/* Floating Gemini AI Assistant Widget (accessible from any page in the bottom-right corner) */}
      <ChatWidget />

      {/* Global Website Footer (always visible at the bottom of every page) */}
      <Footer />
    </div>
  );
}