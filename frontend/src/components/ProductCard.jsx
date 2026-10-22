/**
 * ============================================================================
 * FILE: frontend/src/components/ProductCard.jsx
 * PURPOSE: Reusable UI card displaying a single tech product's image, category,
 *          name, specs, warranty, stock status, price, and "Add to Cart" button.
 * ============================================================================
 */

import React, { useState } from 'react';
import { ShoppingCart, Check, Shield, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Handler for adding product to cart with a brief visual confirmation
  const handleAdd = () => {
    addToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Product Image & Category Badge */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
          {product.category}
        </span>
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            product.stock > 0
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
        </span>
      </div>

      {/* Product Body Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{product.rating || 4.8}</span>
            <span className="text-slate-400 font-normal ml-1">• {product.warranty}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">
            {product.name}
          </h3>

          <p className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2 line-clamp-1">
            {product.specs}
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 mb-4">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              {Number(product.price).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              addedFeedback
                ? 'bg-emerald-600 text-white'
                : product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
