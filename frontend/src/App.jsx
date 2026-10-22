/**
 * ============================================================================
 * FILE: frontend/src/App.jsx
 * PURPOSE: Main Layout and Route Configuration for Safeway Enterprises.
 * CONNECTS: Navbar, Page Routes (Home, Shop, Cart, Myorders, Auth, Admin, About, Contact),
 *           Floating Gemini AI Chat Support Widget, and Footer.
 * ============================================================================
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Myorders from './pages/MyOrders';
import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Myorders />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <ChatWidget />
      <Footer />
    </div>
  );
}
