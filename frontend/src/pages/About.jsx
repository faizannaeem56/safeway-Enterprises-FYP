/**
 * ============================================================================
 * FILE: frontend/src/pages/About.jsx
 * PURPOSE: Dedicated professional About Us page for Safeway Enterprises.
 * ============================================================================
 */

// Import React library to build the functional About Us page component
import React from 'react';

// Import Lucide icons for warranty shield, CPU hardware badge, awards, and team overview
import { ShieldCheck, Cpu, Award, Users } from 'lucide-react';

// Main About page component rendered at '/about'
export default function About() {
  return (
    // Centered container with max width, horizontal padding, and vertical spacing
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Subtitle Badge */}
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
          About Our Company
        </span>

        {/* Main Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 mb-4">
          Safeway Enterprises — Empowering Digital Innovation
        </h1>

        {/* Company Overview & Mission Statement Paragraph[cite: 1] */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          Founded with a mission to make authentic, high-performance computing and smart electronics accessible across Pakistan, <strong>Safeway Enterprises</strong> specializes in custom Desktop Computers, Gaming & Business Laptops, Smart Watches, Flagship Smartphones, and Certified Accessories. As a modern E-Commerce platform, we combine rigorous hardware quality assurance with real-time Google Gemini AI customer assistance.
        </p>

        {/* 2-Column Grid Highlighting Core Company Values[cite: 1] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Feature Card 1: Official Warranty & Quality Assurance[cite: 1] */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-7 h-7 text-blue-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-base mb-1">100% Genuine & Warranted</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every device sold by Safeway Enterprises includes a verifiable 6-Month to 2-Year Official Warranty and a 7-day replacement guarantee.
            </p>
          </div>

          {/* Feature Card 2: AI-First Shopping Experience via Google Gemini[cite: 1] */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <Cpu className="w-7 h-7 text-blue-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-base mb-1">AI-First Shopping Experience</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our integrated Google Gemini AI assistant reads live inventory and specifications to recommend the right hardware for your exact budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}