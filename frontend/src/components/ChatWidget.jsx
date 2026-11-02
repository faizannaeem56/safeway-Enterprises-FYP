/**
 * ============================================================================
 * FILE: frontend/src/components/ChatWidget.jsx
 * PURPOSE: Floating bottom-right AI Chat Support Widget for Safeway Enterprises.
 * CONNECTS TO: `POST /api/chat` on the Node.js backend, which uses the official
 *              Google Gemini API (`@google/generative-ai`) injected with our
 *              real MongoDB product catalog and company policies.
 * ============================================================================
 */

// Import React and essential hooks for state, DOM reference, and auto-scrolling
import React, { useState, useRef, useEffect } from 'react';

// Import clean UI icons from lucide-react
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';

// Main ChatWidget component rendered globally inside App.jsx
export default function ChatWidget() {
  // State to toggle the floating chat window open or closed
  const [isOpen, setIsOpen] = useState(false);

  // State for the current user input text inside the message box
  const [input, setInput] = useState('');

  // State for loading indicator while Gemini generates a response
  const [isTyping, setIsTyping] = useState(false);

  // Conversation history state (Starts with 1 initial welcome message from the AI model)
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! 👋 I am the Safeway Enterprises Gemini AI Assistant. Ask me anything about our laptops, computers, phones, accessories, prices, or warranty policies!'
    }
  ]);

  // Reference to the bottom of the messages container for smooth auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message whenever messages update or chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  /**
   * Function: Send the customer's question to our Node.js Gemini API backend
   */
  const handleSendMessage = async (customPrompt) => {
    // Use the preset suggestion text if clicked; otherwise use the input box text
    const questionText = (customPrompt ?? input).trim();
    if (!questionText || isTyping) return;

    // 1. Append the user's message to the chat window immediately
    // As soon as this runs, messages.length becomes 2, hiding the suggestion chips!
    const updatedMessages = [...messages, { role: 'user', text: questionText }];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Call our backend route `POST /api/chat`
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: questionText,
          history: messages.slice(1) // Pass conversation context (excluding initial greeting)
        })
      });

      const data = await response.json();

      // 3. Append Gemini's dynamic answer to the chat window
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply || 'I could not process that request right now.'
        }
      ]);
    } catch (error) {
      // Show friendly error message if backend server is unreachable
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: '⚠️ Unable to reach the backend server. Please make sure the Node/Express server is running on port 5000.'
        }
      ]);
    } finally {
      // Turn off the typing indicator
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Chat Window (Visible when `isOpen` is true) */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-3">
          
          {/* Header (shrink-0 prevents header from shrinking when messages grow) */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight flex items-center gap-1">
                  Safeway Gemini AI <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <span className="text-[11px] text-blue-100">
                  Live Catalog & Policy Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List (flex-grow takes up all available middle space and scrolls vertically) */}
          <div className="flex-grow p-3.5 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-500">
                  Gemini AI is checking Safeway inventory...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips: ONLY rendered when `messages.length === 1` (before first question is sent) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => handleSendMessage('Do you have laptops?')}
                className="text-[11px] bg-white border border-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap hover:border-blue-500 text-slate-700"
              >
                Do you have laptops?
              </button>
              <button
                onClick={() => handleSendMessage('What is the warranty on mobile accessories?')}
                className="text-[11px] bg-white border border-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap hover:border-blue-500 text-slate-700"
              >
                Warranty on accessories?
              </button>
            </div>
          )}

          {/* Input Box (shrink-0 keeps the input form locked at its full height at the bottom) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, prices, or warranty..."
              className="flex-grow text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition"
      >
        <MessageSquare className="w-5 h-5" />
        <span>{isOpen ? 'Close AI Chat' : 'AI Support'}</span>
      </button>
    </div>
  );
}