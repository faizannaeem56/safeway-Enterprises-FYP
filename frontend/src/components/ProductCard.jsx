/**
 * ============================================================================
 * FILE: frontend/src/components/ProductCard.jsx
 * PURPOSE: Displays a single product card with link to product details.
 * ============================================================================
 */

// Import core React library to build the reusable UI component
import React from 'react';

// Import Link from react-router-dom to navigate to the Product Details page without refreshing the browser
import { Link } from 'react-router-dom';

// ProductCard receives a single `product` object via props from parent pages (like Home.jsx or Shop.jsx)
export default function ProductCard({ product }) {
  return (
    // Wrap the whole card inside a clickable Link pointing to `/product/<MongoDB_ID>`
    // 'flex flex-col h-full' ensures all cards in a row stretch to the exact same height
    <Link 
      to={`/product/${product._id}`} 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition block flex flex-col h-full"
    >
      {/* Top Image Box: Fixed height (h-48) with overflow-hidden so the zoom animation stays neatly inside the card */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img 
          // Fallback chain: Use `product.image`, or `product.imageUrl`, or a 300px placeholder if both are missing
          src={product.image || product.imageUrl || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          // 'object-cover' crops the photo cleanly, and 'hover:scale-105' creates a smooth zoom-in effect on hover
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>
      
      {/* Card Body: 'flex-grow' pushes the price bar to the bottom even if the description text is short */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        {/* Category Pill Badge (e.g., Laptops, Smart Watches, Phones) */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
          {product.category}
        </span>
        
        {/* Product Name: 'line-clamp-1' cuts off long titles with '...' after 1 line */}
        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
        
        {/* Short Description: 'line-clamp-2' limits description preview to 2 lines maximum */}
        <p className="text-xs text-slate-500 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* Bottom Price & Action Row: 'mt-auto' pins this bar firmly to the bottom edge of the card */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          {/* Convert price to a Number and add thousand-separator commas (e.g., Rs. 125,000) */}
          <span className="text-sm font-extrabold text-slate-900">
            Rs. {Number(product.price).toLocaleString()}
          </span>
          {/* Visual prompt inviting the user to click for full specifications */}
          <span className="text-xs font-semibold text-blue-600 hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}