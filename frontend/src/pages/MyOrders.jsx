/**
 * ============================================================================
 * FILE: frontend/src/pages/Myorders.jsx
 * PURPOSE: Customer Portal to track live Order Status (`Processing`, `Shipped`,
 *          `Delivered`) and view Official Admin Replies to Contact Us messages.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, RefreshCw } from 'lucide-react';

export default function Myorders() {
  const [orders, setorders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      let userEmail = '';
      const userInfoStr = localStorage.getItem('userInfo');
      
      if (userInfoStr) {
        const parsedInfo = JSON.parse(userInfoStr);
        // Email extract karne ka secure tareeqa
        userEmail = parsedInfo.email || parsedInfo.user?.email || '';
      }

      // 🚨 MAIN SECURITY FIX: Agar user ka email nahi hai (guest user), toh API call yahin rok dein!
      if (!userEmail) {
        setorders([]);
        setMessages([]);
        setLoading(false);
        return; // Is se aage ka code nahi chalega aur sabke orders show nahi honge
      }

      // Agar email mil jaye toh sirf us email ka data mangwayein
      const queryParam = `?email=${userEmail}`;
      
      const [ordRes, msgRes] = await Promise.all([
        fetch(`/api/orders${queryParam}`),
        fetch(`/api/messages${queryParam}`)
      ]);
      
      const ordData = await ordRes.json();
      const msgData = await msgRes.json();
      
      if (Array.isArray(ordData)) setorders(ordData);
      if (Array.isArray(msgData)) setMessages(msgData);
    } catch (err) {
      console.error('Error loading orders/messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Safeway Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My orders & Customer Support Replies
          </h1>
          <p className="text-xs text-slate-500">
            Live data fetched from MongoDB orders and messages collections.
          </p>
        </div>
        <button
          onClick={fetchCustomerData}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold">Placed Hardware orders ({orders.length})</span>
          </div>
          <Link to="/shop" className="text-xs text-cyan-400 hover:underline">
            + Shop More Products
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading orders from MongoDB...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No orders found yet. Add items to your cart and place an order!
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {orders.map((ord) => (
              <div key={ord._id} className="p-5 hover:bg-slate-50 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs font-mono">
                      #{String(ord._id).slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {ord.shippingAddress?.fullName || ord.customerName}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      ● {ord.status || 'Processing'}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      Rs.{Number(ord.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <div className="font-bold text-slate-700 mb-1">Ordered Items:</div>
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>
                          {item.quantity}x <strong>{item.name}</strong>
                        </span>
                        <span className="font-semibold text-slate-900">
                          Rs.{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 text-slate-600 space-y-1">
                    <div><strong>City:</strong> {ord.shippingAddress?.city}</div>
                    <div><strong>Address:</strong> {ord.shippingAddress?.addressLine}</div>
                    <div><strong>Phone:</strong> {ord.shippingAddress?.phone}</div>
                    <div><strong>Payment:</strong> {ord.paymentMethod || 'Cash on Delivery'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">
              Contact Us Inquiries & Official Admin Replies ({messages.length})
            </span>
          </div>
          <Link to="/contact" className="text-xs font-semibold text-blue-600 hover:underline">
            + Send New Message
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {messages.map((msg) => (
            <div key={msg._id} className="p-5 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-slate-900 text-sm">
                  {msg.subject}{' '}
                  <span className="font-normal text-xs text-slate-500">
                    — sent by {msg.name} ({msg.email})
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    msg.status === 'Replied'
                      ? 'bg-emerald-100 text-emerald-800'
                      : msg.status === 'Read'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {msg.status}
                </span>
              </div>
              <p className="text-slate-600">{msg.message}</p>
              {msg.adminReply && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <strong>Official Safeway Admin Reply:</strong> {msg.adminReply}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}