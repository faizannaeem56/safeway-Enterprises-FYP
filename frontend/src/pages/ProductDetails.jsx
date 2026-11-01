/**
 * ============================================================================
 * FILE: frontend/src/pages/ProductDetails.jsx
 * PURPOSE: Displays the full details, specifications, warranty, and 'Add to Cart'
 *          action for a single product selected by the customer.
 * ============================================================================
 */

// Import React and essential hooks for local state and lifecycle side-effects
import React, { useState, useEffect } from 'react';

// Import useParams (to extract the dynamic ':id' from the URL) and Link (for navigation)
import { useParams, Link } from 'react-router-dom';

// Yahan humne useCart hook import kiya hai jo error nahi dega
// Import the custom useCart hook to access the global shopping cart functions
import { useCart } from '../context/CartContext'; 

// Main ProductDetails page component rendered at '/product/:id'
export default function ProductDetails() {
  // Extract the MongoDB product ID parameter from the current browser URL (e.g., /product/65f1a2...)
  const { id } = useParams();

  // State to hold the fetched product object from the backend
  const [product, setProduct] = useState(null);

  // State to track whether the API request is still loading
  const [loading, setLoading] = useState(true);
  
  // Custom hook se addToCart function nikala
  // Destructure the addToCart method from CartContext so the user can add this item to their cart
  const { addToCart } = useCart(); 

  // Fetch the specific product's details from the backend whenever the component mounts or the URL `id` changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Send GET request to the Express backend route GET /api/products/:id
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        // Save the returned product object into state
        setProduct(data);
      } catch (err) {
        // Log any network or server errors to the console
        console.error('Error fetching product:', err);
      } finally {
        // Stop the loading indicator once the request finishes (success or error)
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 1. Loading Guard: Show a clean loading message while waiting for the backend response
  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading Safeway Product...</div>;
  }

  // 2. Not Found Guard: If product is null or backend returned a 404 "Product not found" message, show an error view
  if (!product || product.message === "Product not found") {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/shop" className="text-blue-600 hover:underline mt-4 inline-block">Go back to Shop</Link>
      </div>
    );
  }

  // 3. Main Product Details Layout (2-Column Responsive Card on Medium+ Screens)
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back navigation link returning the customer to the main Shop catalog */}
      <Link to="/shop" className="text-blue-600 hover:underline text-sm font-semibold mb-6 inline-block">
        &larr; Back to Shop
      </Link>
      
      {/* Outer Product Showcase Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Column: High-Resolution Product Image Container */}
        <div className="md:w-1/2 bg-slate-100 p-8 flex items-center justify-center">
          <img 
            // Fallback chain: Use product.image, or product.imageUrl, or a 500px placeholder image
            src={product.image || product.imageUrl || 'https://via.placeholder.com/500'} 
            alt={product.name} 
            className="max-w-full max-h-96 object-contain rounded-xl"
          />
        </div>
        
        {/* Right Column: Product Information, Specs, Warranty, and Add to Cart Button */}
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Category Badge */}
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-4">
            {product.category}
          </span>

          {/* Product Title */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>

          {/* Formatted Product Price in Pakistani Rupees (PKR) */}
          <p className="text-2xl font-extrabold text-slate-900 mb-6">
            Rs. {Number(product.price).toLocaleString()}
          </p>

          {/* Description, Hardware Specifications, and Official Warranty Details */}
          <div className="text-slate-600 space-y-4 mb-8 text-sm lg:text-base leading-relaxed">
            <p>{product.description}</p>
            {/* Conditionally render Specifications and Warranty only if they exist on the product document */}
            {product.specs && <p><strong>Specifications:</strong> {product.specs}</p>}
            {product.warranty && <p><strong>Warranty:</strong> {product.warranty}</p>}
          </div>
          
          {/* Action Button: Adds the current product object to CartContext and localStorage */}
          <div className="mt-auto">
            <button 
              onClick={() => addToCart(product)} 
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}