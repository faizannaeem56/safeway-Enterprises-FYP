/**
 * ============================================================================
 * FILE: frontend/src/pages/Contact.jsx
 * PURPOSE: Contact Us Page for Safeway Enterprises (Saves Messages to MongoDB)
 * ============================================================================
 */

// Import React and the useState hook to manage form input states and success feedback flags
import React, { useState } from 'react';

// Main Contact page component rendered at '/contact'
const Contact = () => {
  // Form input state object tracking all 5 input fields required for a support inquiry
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  
  // State to track whether the message has been successfully submitted to the backend
  const [submitted, setSubmitted] = useState(false);

  /**
   * Function: Submits customer inquiry details to POST /api/messages on the backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form refresh reload
    try {
      // Send POST request to the Express backend message route
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) // Convert form state object into JSON string
      });
      setSubmitted(true); // Show success message banner
      setForm({ name: '', email: '', phone: '', subject: '', message: '' }); // Clear form inputs
    } catch (err) {
      // Alert customer if network error occurs
      alert('Failed to send message: ' + err.message);
    }
  };

  return (
    // Responsive 2-column grid container (Left column: Company info & hours; Right column: Contact form)
    <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: Head Office Details, Support Hours, and Gemini AI Notice */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">24/7 Support</span>
        <h1 className="text-3xl font-extrabold mt-1 mb-4">Contact Safeway Enterprises</h1>
        <p className="text-sm text-slate-300 mb-6">
          Have a question about bulk corporate orders, warranty claims, or custom gaming PCs? Reach out to our team or use the Gemini AI chat widget in the bottom-right corner.
        </p>
        <div className="space-y-3 text-sm text-slate-200">
          <p><strong>Head Office:</strong> Shop No:112 Aitchion housing society, Lahore, Pakistan</p>
          <p><strong>Phone:</strong> +92 321-1006989</p>
          <p><strong>Email:</strong> contact.safeway.ent@gmail.com</p>
          <p><strong>Hours:</strong> Mon – Sat, 10:00 AM – 8:00 PM</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Contact Us Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Send Us a Direct Message</h2>
        
        {/* Conditional Success Alert Banner */}
        {submitted && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
            Thank you! Your message has been send to our Admin Inbox.
          </div>
        )}

        {/* Full Name Input */}
        <input type="text" required placeholder="Your Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        
        {/* Email Address Input */}
        <input type="email" required placeholder="Your Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        
        {/* Phone Number Input */}
        <input type="text" required placeholder="Your Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        
        {/* Message Subject Input */}
        <input type="text" required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        
        {/* Detailed Message Textarea */}
        <textarea rows="4" required placeholder="How can we help you?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
        
        {/* Submit Button */}
        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
          Send Message
        </button>
      </form>
    </div>
  );
};

// Export Contact component as default module
export default Contact;