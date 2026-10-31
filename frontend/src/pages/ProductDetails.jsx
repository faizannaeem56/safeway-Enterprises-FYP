import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading Safeway Product...</div>;
  }

  if (!product || product.message === "Product not found") {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/shop" className="text-blue-600 hover:underline mt-4 inline-block">Go back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/shop" className="text-blue-600 hover:underline text-sm font-semibold mb-6 inline-block">
        &larr; Back to Shop
      </Link>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-slate-100 p-8 flex items-center justify-center">
          <img 
            src={product.image || product.imageUrl || 'https://via.placeholder.com/500'} 
            alt={product.name} 
            className="max-w-full max-h-96 object-contain rounded-xl"
          />
        </div>
        
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-extrabold text-slate-900 mb-6">
            Rs. {Number(product.price).toLocaleString()}
          </p>
          <div className="text-slate-600 space-y-4 mb-8 text-sm lg:text-base leading-relaxed">
            <p>{product.description}</p>
            {product.specs && <p><strong>Specifications:</strong> {product.specs}</p>}
            {product.warranty && <p><strong>Warranty:</strong> {product.warranty}</p>}
          </div>
          
          <div className="mt-auto">
            <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}