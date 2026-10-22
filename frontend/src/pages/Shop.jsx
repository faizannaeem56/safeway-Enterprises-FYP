/**
 * ============================================================================
 * FILE: frontend/src/pages/Shop.jsx
 * PURPOSE: Displays all tech products with Dynamic Category Filtering,
 *          Price Range Slider, Price Sort (Low-to-High / High-to-Low), and Search.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

// All 7 required categories plus 'All'
const CATEGORIES = [
  'All',
  'Computers',
  'Laptops',
  'Smart Watches',
  'Phones',
  'Mobile Accessories',
  'Laptop Accessories',
  'PC Accessories'
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial category from URL query if user clicked a category card on Home page
  const initialCategory = searchParams.get('category') || 'All';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'lowToHigh' | 'highToLow'
  const [searchQuery, setSearchQuery] = useState('');

  // Products Data State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync category if URL parameter changes
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) setSelectedCategory(urlCat);
  }, [searchParams]);

  // Fetch filtered products from Backend API whenever any filter state changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        params.append('maxPrice', maxPrice);
        if (sortOrder !== 'default') params.append('sort', sortOrder);
        if (searchQuery.trim() !== '') params.append('search', searchQuery.trim());

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, maxPrice, sortOrder, searchQuery]);

  // Handler to reset all active filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setMaxPrice(2000);
    setSortOrder('default');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Safeway Tech Catalog</h1>
        <p className="text-sm text-slate-600 mt-1">
          Filter dynamically by category, maximum budget slider, or price sort order
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setSearchParams(category === 'All' ? {} : { category });
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Filter & Sort Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* 1. Keyword Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laptop, RTX, watch..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 2. Price Range Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Max Price Budget:</span>
            <span className="text-blue-600">{maxPrice}</span>
          </div>
          <input
            type="range"
            min="40"
            max="500000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* 3. Price Sort Dropdown (Low to High / High to Low) */}
        <div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="default">Sort By: Featured / Newest</option>
            <option value="lowToHigh">Price: Low to High ↑</option>
            <option value="highToLow">Price: High to Low ↓</option>
          </select>
        </div>

        {/* 4. Reset Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading Safeway products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-base font-bold text-slate-800 mb-1">No matching products found</p>
          <p className="text-xs text-slate-500 mb-4">
            Try increasing the maximum price slider or selecting another category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
