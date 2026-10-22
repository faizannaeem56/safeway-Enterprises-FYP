/**
 * ============================================================================
 * FILE: frontend/src/pages/Contact.jsx
 * PURPOSE: Contact Us Page for Safeway Enterprises (Saves Messages to MongoDB)
 * ============================================================================
 */
import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-slate-900 text-white p-8 rounded-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">24/7 Support</span>
        <h1 className="text-3xl font-extrabold mt-1 mb-4">Contact Safeway Enterprises</h1>
        <p className="text-sm text-slate-300 mb-6">
          Have a question about bulk corporate orders, warranty claims, or custom gaming PCs? Reach out to our team or use the Gemini AI chat widget in the bottom-right corner.
        </p>
        <div className="space-y-3 text-sm text-slate-200">
          <p><strong>Head Office:</strong> 112A Aitchion housing society, Lahore, Pakistan</p>
          <p><strong>Phone:</strong> +92 321-1006989</p>
          <p><strong>Email:</strong> contact.safeway.ent@gmail.com</p>
          <p><strong>Hours:</strong> Mon – Sat, 10:00 AM – 8:00 PM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Send Us a Direct Message</h2>
        {submitted && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
            Thank you! Your message has been send to our Admin Inbox.
          </div>
        )}
        <input type="text" required placeholder="Your Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        <input type="email" required placeholder="Your Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        <input type="text" required placeholder="Your Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        <input type="text" required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        <textarea rows="4" required placeholder="How can we help you?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
