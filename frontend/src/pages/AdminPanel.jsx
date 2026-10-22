/**
 * ============================================================================
 * FILE: frontend/src/pages/AdminPanel.jsx
 * PURPOSE: Complete Store Admin Dashboard connected to MongoDB REST APIs
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Package,
  Mail,
  Cpu,
  ShieldCheck,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Computers',
  'Laptops',
  'Smart Watches',
  'Phones',
  'Mobile Accessories',
  'Laptop Accessories',
  'PC Accessories'
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Live MongoDB State Collections
  const [products, setProducts] = useState([]);
  const [orders, setorders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  // Product Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Laptops',
    price: '',
    stock: 10,
    warranty: '1 Year Official Safeway Warranty',
    specs: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    featured: false
  });

  const showBanner = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const fetchAllAdminData = async () => {
    try {
      const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      const [prodRes, ordRes, msgRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers }),
        fetch('/api/messages', { headers })
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const msgData = await msgRes.json();

      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(ordData)) setorders(ordData);
      if (Array.isArray(msgData)) setMessages(msgData);
    } catch (err) {
      console.error('Failed to load Admin data from MongoDB:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAllAdminData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            HTTP 403 Forbidden — Admin Role Required
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
            Administrator Access Only
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            The Safeway Enterprises Admin Panel is hidden from regular customers. Please sign in with the official Administrator account.
          </p>
          <Link
            to="/auth"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            Go to Administrator Login
          </Link>
        </div>
      </div>
    );
  }

  const handleorderstatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showBanner(`Order status updated to "${newStatus}" in MongoDB!`);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showBanner('Order deleted from MongoDB.');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (msgId) => {
    const replyText = (replyDrafts[msgId] || '').trim();
    if (!replyText) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: 'Replied', adminReply: replyText })
      });
      if (res.ok) {
        setReplyDrafts({ ...replyDrafts, [msgId]: '' });
        showBanner('Official reply saved to MongoDB and sent to customer!');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkMessageRead = async (msgId) => {
    try {
      await fetch(`/api/messages/${msgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: 'Read' })
      });
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch(`/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showBanner('Customer message deleted from inbox.');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock)
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Operation failed');
      }

      showBanner(editingId ? 'Product updated in MongoDB!' : 'New product added to MongoDB!');
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Laptops',
        price: '',
        stock: 10,
        warranty: '1 Year Official Safeway Warranty',
        specs: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        featured: false
      });
      fetchAllAdminData();
    } catch (error) {
      showBanner(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      warranty: product.warranty,
      specs: product.specs,
      description: product.description,
      image: product.image,
      featured: product.featured || false
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        showBanner('Product removed from MongoDB.');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = messages.filter((m) => m.status === 'Unread').length;
  const pendingorders = orders.filter((o) => o.status === 'Processing').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Safeway Enterprises — Central Admin Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            orders, Customer Messages & Inventory CRUD
          </h1>
          <p className="text-xs text-slate-500">
            Connected live to MongoDB (<code>orders</code>, <code>messages</code>, and <code>products</code> collections).
          </p>
        </div>
        <button
          onClick={fetchAllAdminData}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync MongoDB Data</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
          ✓ {statusMessage}
        </div>
      )}

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400"
        >
          <span className="text-[11px] font-bold uppercase text-slate-400">Customer orders</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {orders.length} orders (Rs. {totalRevenue.toLocaleString()})
          </div>
          <span className="text-xs text-amber-600 font-semibold">{pendingorders} Processing</span>
        </div>

        <div
          onClick={() => setActiveTab('messages')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400"
        >
          <span className="text-[11px] font-bold uppercase text-slate-400">Customer Messages</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {messages.length} Inquiries
          </div>
          <span className="text-xs text-rose-600 font-semibold">{unreadCount} Unread in Inbox</span>
        </div>

        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400"
        >
          <span className="text-[11px] font-bold uppercase text-slate-400">Store Inventory</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {products.length} Products
          </div>
          <span className="text-xs text-emerald-600 font-semibold">7 Hardware Categories</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Customer orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Customer Messages ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Manage Products CRUD ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold">Incoming Customer orders (MongoDB `orders`)</h2>
            <span className="text-xs text-cyan-400 font-bold">{orders.length} Total</span>
          </div>
          {orders.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">No customer orders yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {orders.map((ord) => (
                <div key={ord._id} className="p-5 hover:bg-slate-50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-bold font-mono mr-2">
                        #{String(ord._id).slice(-6).toUpperCase()}
                      </span>
                      <strong className="text-sm text-slate-900">
                        {ord.shippingAddress?.fullName || ord.customerName}
                      </strong>{' '}
                      <span className="text-xs text-slate-500">({ord.customerEmail})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.status || 'Processing'}
                        onChange={(e) => handleorderstatusChange(ord._id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-extrabold text-xs">
                        Rs. {Number(ord.totalAmount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(ord._id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="md:col-span-2 space-y-1">
                      <div className="font-bold text-slate-700">Ordered Items:</div>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x <strong>{item.name}</strong></span>
                          <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 space-y-1 text-slate-600">
                      <div><strong>Phone:</strong> {ord.shippingAddress?.phone}</div>
                      <div><strong>City:</strong> {ord.shippingAddress?.city}</div>
                      <div><strong>Address:</strong> {ord.shippingAddress?.addressLine}</div>
                      <div><strong>Payment:</strong> {ord.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMER MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold">Customer Contact Us Inbox (MongoDB `messages`)</h2>
            <span className="text-xs text-amber-400 font-bold">{unreadCount} Unread</span>
          </div>
          {messages.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">No messages in inbox.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {messages.map((msg) => (
                <div key={msg._id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-sm text-slate-900">{msg.subject}</strong>{' '}
                      <span className="text-xs text-slate-500">
                        — From: {msg.name} ({msg.email} | {msg.phone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        {msg.status}
                      </span>
                      {msg.status === 'Unread' && (
                        <button
                          onClick={() => handleMarkMessageRead(msg._id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                    {msg.message}
                  </div>

                  {msg.adminReply && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>Sent Admin Reply:</strong> {msg.adminReply}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyDrafts[msg._id] || ''}
                      onChange={(e) => setReplyDrafts({ ...replyDrafts, [msg._id]: e.target.value })}
                      placeholder={`Reply to ${msg.name}...`}
                      className="flex-grow px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      onClick={() => handleSendReply(msg._id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCTS INVENTORY CRUD */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleProductSubmit}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 h-fit"
          >
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Existing Product' : 'Add New Product'}
            </h2>
            <input
              type="text"
              required
              placeholder="Product Title *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="number"
                required
                placeholder="Price (Rs.) *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="number"
                required
                placeholder="Stock *"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Key Specs (CPU, RAM, SSD) *"
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="text"
              placeholder="Official Warranty"
              value={formData.warranty}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <textarea
              rows="3"
              required
              placeholder="Product Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingId ? 'Save Changes' : 'Add Product'}</span>
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-slate-500 line-clamp-1">{prod.specs}</div>
                      </td>
                      <td className="p-3.5">{prod.category}</td>
                      <td className="p-3.5 font-bold">Rs. {prod.price}</td>
                      <td className="p-3.5">{prod.stock}</td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}