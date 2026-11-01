/**
 * ============================================================================
 * FILE: frontend/src/context/AuthContext.jsx
 * PURPOSE: Manages User Authentication state across the entire React app.
 * WHY IT IS USED: Allows any component (Navbar, AdminPanel, Checkout) to check
 *                 if a user is logged in, whether they are an Admin, and provides
 *                 `login()`, `signup()`, and `logout()` functions.
 * ============================================================================
 */

// Import React and essential hooks for state management, lifecycle effects, and Context API
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the global Authentication Context container
const AuthContext = createContext();

// AuthProvider component wraps the entire application (in main.jsx) to supply auth state to all child components
export const AuthProvider = ({ children }) => {
  // Store current logged-in user object (includes _id, name, email, role, token); null means guest/logged-out
  const [user, setUser] = useState(null);

  // Track whether the app is still checking localStorage on initial page refresh
  const [loading, setLoading] = useState(true);

  // On initial page load (empty dependency array []), check if a user session was saved in browser localStorage
  useEffect(() => {
    try {
      // Retrieve the saved JSON string from the browser's local storage under the key 'safeway_user'
      const savedUser = localStorage.getItem('safeway_user');
      if (savedUser) {
        // Parse the JSON string back into a JavaScript object and restore the user state
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      // If stored data is corrupted, log the error safely without crashing the app
      console.error('Failed to read user session:', err);
    } finally {
      // Mark initial session check as complete so protected pages can render properly
      setLoading(false);
    }
  }, []);

  /**
   * Function: Log in an existing user via POST /api/auth/login
   */
  const login = async (email, password) => {
    // Send login credentials to the Express backend authentication endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Inform backend that request body is JSON
      body: JSON.stringify({ email, password }) // Convert JS object into a JSON string
    });

    // Parse the JSON response returned by the backend
    const data = await response.json();
    // If HTTP status is not 2xx (e.g., 401 Wrong Password), throw an error to display in the UI
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Update React state with the logged-in user profile and JWT token
    setUser(data);
    // Persist user session in browser localStorage so they stay logged in after refreshing the page
    localStorage.setItem('safeway_user', JSON.stringify(data));
    return data;
  };

  /**
   * Function: Create a new customer account via POST /api/auth/signup
   */
  const signup = async (name, email, password) => {
    // Send registration details to the Express backend signup endpoint
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    // Parse the backend response (contains newly created user object + JWT token)
    const data = await response.json();
    // If signup fails (e.g., 400 Email Already Exists), throw an error for the form to catch
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Automatically log the new user in by saving their data in React state and localStorage
    setUser(data);
    localStorage.setItem('safeway_user', JSON.stringify(data));
    return data;
  };

  /**
   * Function: Clear user session and JWT token on logout
   */
  const logout = () => {
    // Reset user state back to null (switches UI back to guest view)
    setUser(null);
    // Remove saved credentials and JWT token from browser localStorage
    localStorage.removeItem('safeway_user');
  };

  // Expose state variables (user, loading) and action functions (login, signup, logout) to the whole app
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to let any component easily access AuthContext without importing useContext and AuthContext separately
export const useAuth = () => useContext(AuthContext);