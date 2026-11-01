/**
 * ============================================================================
 * FILE: frontend/src/formatPrice.js
 * PURPOSE: Global currency formatting utility function for the frontend.
 * WHY IT IS USED: Converts raw numeric prices from MongoDB (e.g., 125000) into
 *                 clean, comma-separated Pakistani Rupee strings (e.g., "Rs. 125,000")
 *                 across Product Cards, Cart, Checkout, and Admin tables.
 * ============================================================================
 */

// Helper function that takes a raw number or numeric string and returns a formatted PKR price string
const formatPrice = (amount) => {
  // Convert the incoming value (which might be a string or number) into a strict JavaScript Number
  const price = Number(amount);

  // Safety Check: Verify if the converted value is a valid finite number (guards against NaN, null, undefined, or Infinity)
  if (!Number.isFinite(price)) {
    // Return a safe fallback string so the UI never displays "Rs. NaN" to the customer
    return 'Rs. 0';
  }

  // Use JavaScript's built-in Internationalization API (Intl.NumberFormat) with the 'en-PK' (Pakistan) locale
  // This automatically inserts thousand-separator commas and limits decimals to at most 2 digits
  return `Rs. ${new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 2
  }).format(price)}`;
};

// Export the utility function so any component or page can import and use it
export default formatPrice;