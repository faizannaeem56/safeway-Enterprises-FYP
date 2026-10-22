/**
 * ============================================================================
 * FILE: frontend/src/pages/Cart.jsx
 * PURPOSE: Shopping Cart & Checkout page connected to MongoDB (`POST /api/orders`).
 * ============================================================================
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, shippingFee, totalBill } =
    useCart();
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: 'Lahore',
    addressLine: '',
    paymentMethod: 'Cash on Delivery (COD)'
  });
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer Rs.{user.token}` } : {})
        },
        body: JSON.stringify({
          customerName: shippingAddress.fullName || user?.name || 'Customer',
          customerEmail: shippingAddress.email || user?.email || 'customer@safeway.pk',
          items: cartItems.map((item) => ({
            product: item._id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            city: shippingAddress.city,
            addressLine: shippingAddress.addressLine
          },
          paymentMethod: shippingAddress.paymentMethod,
          totalAmount: totalBill
        })
      });

      const savedOrder = await response.json();
      if (!response.ok) {
        throw new Error(savedOrder.message || 'Failed to save order');
      }

      setOrderPlaced(savedOrder);
      clearCart();
    } catch (err) {
      alert('Order submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Your order number ID is • : {orderPlaced._id}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
            Thank You for Shopping with Safeway Enterprises!
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Your order for <strong>Rs.{Number(orderPlaced.totalAmount).toLocaleString()}</strong> has been received by our Admin team and is currently marked as <strong>{orderPlaced.status}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              Track My Order Status
            </Link>
            <Link
              to="/shop"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h3>
          <p className="text-xs text-slate-500 mb-5">
            Browse our 7 tech categories and add laptops, phones, or accessories to your cart.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-500">Rs.{item.price} each</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-100 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-100 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-extrabold text-slate-900">
                      Rs.{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Order Bill Summary</h2>
            <div className="space-y-2.5 text-sm border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">Rs.{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-600">
                  {shippingFee === 0 ? 'FREE' : `Free shipping`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-base font-extrabold text-slate-900 mb-6">
              <span>Total Bill</span>
              <span className="text-xl text-blue-600">Rs.{totalBill.toLocaleString()}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <input
                type="text"
                required
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                placeholder="Full Recipient Name *"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="email"
                required
                value={shippingAddress.email}
                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                placeholder="Email Address for Order Tracking *"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="text"
                required
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                placeholder="Phone Number (+92 300 ...) *"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  placeholder="City *"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <select
                  value={shippingAddress.paymentMethod}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, paymentMethod: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Cash on Delivery (COD)">Cash on Delivery</option>
                  <option value="Online Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <input
                type="text"
                required
                value={shippingAddress.addressLine}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                placeholder="Complete Street Address *"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition"
              >
                {submitting ? 'Saving Order to MongoDB...' : `Confirm & Place Order`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
