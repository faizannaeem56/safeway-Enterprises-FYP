/**
 * ============================================================================
 * FILE: frontend/src/components/ProductCard.jsx
 * PURPOSE: Displays a single product card with link to product details.
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link 
      to={`/product/${product._id}`} 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition block flex flex-col h-full"
    >
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img 
          src={product.image || product.imageUrl || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
          {product.category}
        </span>
        
        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
        
        <p className="text-xs text-slate-500 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          <span className="text-sm font-extrabold text-slate-900">
            Rs. {Number(product.price).toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-blue-600 hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}