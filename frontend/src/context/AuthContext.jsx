/**
 * ============================================================================
 * FILE: frontend/src/context/AuthContext.jsx
 * PURPOSE: Manages User Authentication state across the entire React app.
 * WHY IT IS USED: Allows any component (Navbar, AdminPanel, Checkout) to check
 *                 if a user is logged in, whether they are an Admin, and provides
 *                 `login()`, `signup()`, and `logout()` functions.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Store current logged-in user object (includes _id, name, email, role, token)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial page load, check if a user session was saved in localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('safeway_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Failed to read user session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Function: Log in an existing user via POST /api/auth/login
   */
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data);
    localStorage.setItem('safeway_user', JSON.stringify(data));
    return data;
  };

  /**
   * Function: Create a new customer account via POST /api/auth/signup
   */
  const signup = async (name, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    setUser(data);
    localStorage.setItem('safeway_user', JSON.stringify(data));
    return data;
  };

  /**
   * Function: Clear user session and JWT token on logout
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('safeway_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
