/**
 * ============================================================================
 * FILE: frontend/src/pages/Home.jsx
 * PURPOSE: Landing page for Safeway Enterprises.
 * SECTIONS:
 *   1. Modern Hero Banner with Call-to-Action buttons
 *   2. Interactive 7-Category Overview Grid (clicking any category filters Shop)
 *   3. Featured Tech Products fetched from Backend API
 *   4. Safeway Value Propositions (Official Warranty, Express Shipping, Gemini AI)
 * ============================================================================
 */

// Import React and essential hooks:
// - useState: to store the list of featured products fetched from the backend
// - useEffect: to trigger the API call once when the Home page loads
import React, { useEffect, useState } from 'react';

// Import Link (for declarative links) and useNavigate (for programmatic navigation on button click)
import { Link, useNavigate } from 'react-router-dom';

// Import UI icons for the hero banner and the 7 tech product departments
import { ArrowRight, ShieldCheck, Truck, Sparkles, Monitor, Laptop, Watch, Smartphone, Headphones, HardDrive, Keyboard } from 'lucide-react';

// Import the reusable ProductCard component to display each featured product neatly
import ProductCard from '../components/ProductCard';

// The 7 required Safeway Enterprises product categories
// Each object pairs the exact database category name with a Lucide icon component and a short tagline
const CATEGORIES = [
  { name: 'Computers', icon: Monitor, desc: 'Gaming rigs & office desktops' },
  { name: 'Laptops', icon: Laptop, desc: 'MacBooks, gaming & student laptops' },
  { name: 'Smart Watches', icon: Watch, desc: 'Apple Watch & Galaxy wearables' },
  { name: 'Phones', icon: Smartphone, desc: 'PTA-approved flagship smartphones' },
  { name: 'Mobile Accessories', icon: Headphones, desc: 'ANC earbuds & 200W power banks' },
  { name: 'Laptop Accessories', icon: HardDrive, desc: 'USB-C hubs & cooling stands' },
  { name: 'PC Accessories', icon: Keyboard, desc: 'Mechanical keyboards & gaming mice' }
];

// Main Home Page component rendered at the root URL ('/')
export default function Home() {
  // State array holding up to 6 featured products returned by MongoDB
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Initialize navigate function to redirect users when they click a category card
  const navigate = useNavigate();

  // Fetch featured products from the Express backend on mount (empty dependency array [])
  useEffect(() => {
    // Request only products where `featured: true` from GET /api/products
    fetch('/api/products?featured=true')
      .then((res) => res.json()) // Parse the JSON response body
      .then((data) => {
        // Verify the response is an array, then take the first 6 products (.slice(0, 6)) for a clean 3x2 grid
        if (Array.isArray(data)) setFeaturedProducts(data.slice(0, 6));
      })
      .catch((err) => console.error('Failed to load featured products:', err));
  }, []);

  return (
    <div>
      {/* 1. HERO BANNER — Dark gradient showcase introducing Safeway Enterprises & Gemini AI */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Column: Badge, Main Heading, Subtext, and Call-to-Action (CTA) Buttons */}
          <div>
            {/* Highlight Pill Badge for Google Gemini AI Support */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-cyan-300 border border-cyan-400/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI Support
            </span>

            {/* Main Hero Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Next-Generation Tech from <span className="text-cyan-400">Safeway Enterprises</span>
            </h1>

            {/* Supporting Value Statement */}
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              Shop genuine Computers, Gaming Laptops, Smart Watches, Flagship Phones, and Pro Accessories backed by official Safeway warranty and instant AI guidance.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Primary CTA: Redirects customer to the full Shop catalog */}
              <Link
                to="/shop"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition"
              >
                Explore All Products <ArrowRight className="w-4 h-4" />
              </Link>
              {/* Secondary CTA: Redirects visitor to the About Us page */}
              <Link
                to="/about"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
              >
                About Safeway
              </Link>
            </div>
          </div>

          {/* Right Column: High-resolution Gaming Laptop Showcase Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80"
              alt="Safeway Enterprises Showcase"
              className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover h-72 sm:h-96"
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW (All 7 Required Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Browse by Category</h2>
            <p className="text-sm text-slate-600">
              Click any of our 7 specialized tech departments to filter products dynamically
            </p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-blue-600 hover:underline">
            View All Departments →
          </Link>
        </div>

        {/* 7-Column Responsive Grid displaying each category as an interactive card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {CATEGORIES.map((cat) => {
            // Assign the icon component to a capitalized variable so JSX can render it dynamically
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.name}
                // Navigate to /shop with the selected category safely URL-encoded in the query string
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left flex flex-col justify-between group"
              >
                {/* Category Icon Box (turns solid blue when hovering over the parent button via 'group-hover') */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-3 transition">
                  <IconComponent className="w-5 h-5" />
                </div>
                {/* Category Name & Short Description */}
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS — Displays up to 6 top-rated items from MongoDB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Tech Deals</h2>
            <p className="text-sm text-slate-600">Top-rated hardware handpicked by Safeway engineers</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-blue-600 hover:underline">
            Shop Full Catalog →
          </Link>
        </div>

        {/* 3-Column Product Grid rendering reusable ProductCard components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}