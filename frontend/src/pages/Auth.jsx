/**
 * ============================================================================
 * FILE: frontend/src/pages/Auth.jsx
 * PURPOSE: Clean Login and Create Account (Signup) page using JWT AuthContext.
 * ============================================================================
 */

// Import React and useState hook to manage form inputs, error messages, and login/signup mode toggle
import React, { useState } from 'react';

// Import useNavigate hook from react-router-dom to redirect users after successful authentication
import { useNavigate } from 'react-router-dom';

// Import custom useAuth hook to access global authentication functions (`login` and `signup`)
import { useAuth } from '../context/AuthContext';

// Main Auth page component rendered at '/auth'
export default function Auth() {
  // State to toggle between Login mode (true) and Signup mode (false)
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form input states
  const [name, setName] = useState('');         // Used only in Signup mode for Full Name
  const [email, setEmail] = useState('');       // User email address
  const [password, setPassword] = useState(''); // User account password
  const [errorMsg, setErrorMsg] = useState(''); // Stores error messages (e.g., wrong password, user not found)

  // Extract authentication methods from AuthContext and navigation helper from React Router
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  /**
   * Function: Handle form submission for either Login or Signup
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form refresh
    setErrorMsg('');    // Clear any previous error messages

    try {
      let loggedInUser;
      
      // If in login mode, call login() from AuthContext; otherwise call signup()
      if (isLoginMode) {
        loggedInUser = await login(email, password);
      } else {
        loggedInUser = await signup(name, email, password);
      }

      // ROLE-BASED REDIRECTION:
      // Redirect Admin users directly to the Admin Dashboard (/admin), and regular Customers to the Shop catalog (/shop)
      if (loggedInUser && loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      // Capture authentication failure errors (e.g., invalid credentials or email already in use) and display them in the UI
      setErrorMsg(err.message);
    }
  };

  return (
    // Centered card container with top and bottom margins
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Dynamic Title based on whether user is Signing In or Creating an Account */}
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
          {isLoginMode ? 'Sign In to Safeway' : 'Create Customer Account'}
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          {isLoginMode
            ? 'Enter your credentials below. Admin accounts automatically unlock the Admin Dashboard.'
            : 'Register your customer account with Safeway Enterprises.'}
        </p>

        {/* Conditional Error Banner: Displays authentication errors in red if `errorMsg` is not empty */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CONDITIONAL FIELD: Full Name input field appears ONLY in Signup mode */}
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Faizan Naeem or Sadia Mushtaq or Iqra Naeem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          )}

          {/* Email Address Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com or admin@safeway.pk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {/* Submit Button (Dynamically changes text between 'Sign In' and 'Create Account') */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
          >
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode Footer Button: Switches between Sign In and Signup views */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {isLoginMode
              ? "Don't have an account? Create here"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}