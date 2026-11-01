/**
 * ============================================================================
 * FILE: backend/routes/chatRoutes.js
 * PURPOSE: Real AI Chat Support Integration using Google Gemini API
 *          (`@google/generative-ai`).
 * WHY IT IS USED:
 *   Instead of hardcoded `if-else` rules, this route fetches the LIVE product
 *   catalog directly from MongoDB and injects it—along with Safeway Enterprises'
 *   official warranty, shipping, and return policies—into the Gemini AI
 *   system prompt. Customers can ask natural questions and get accurate answers
 * ============================================================================
 */

// Import Express to create a modular router for the AI chat endpoint
const express = require('express');

// Import the official Google Generative AI SDK to communicate with the Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import the Product model to fetch live inventory data from MongoDB
const Product = require('../models/Product');

// Initialize an Express Router instance
const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Send a customer message to Google Gemini AI with live store context
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Extract the incoming user message and optional previous chat history from the request body
    const { message, history = [] } = req.body;

    // Validate that the user actually typed a message
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Please enter a valid question.' });
    }

    // 1. Check that the Google Gemini API key is configured in the `.env` file
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If the API key is missing, return a user-friendly error message to the frontend chat UI
      return res.status(500).json({
        reply:
          '⚠️ Gemini API Key is missing on the server. Please add GEMINI_API_KEY to your backend/.env file.'
      });
    }

    // 2. Fetch the LIVE product inventory from MongoDB so the AI knows every
    //    current product, category, price, stock status, warranty, and specification.
    const products = await Product.find({});

    // Map through the array of product objects and convert them into a readable text format for the AI
    // Example: "1. [Laptops] ASUS ROG — Price: Rs.250000 | Stock: 5 units available | Warranty: 1 Year | Specs: i7"
    const formattedCatalog = products
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.category}] ${p.name} — Price: Rs.${p.price} | Stock: ${
            p.stock > 0 ? `${p.stock} units available` : 'Out of Stock'
          } | Warranty: ${p.warranty} | Specs: ${p.specs}`
      )
      .join('\n'); // Join the mapped array into a single large multi-line string

    // 3. Construct the comprehensive System Prompt for Safeway Enterprises
    // This serves as the 'Brain' and rulebook for the Gemini AI model
    const systemInstruction = `
You are the official AI Customer Support Specialist for **Safeway Enterprises**, a premier technology and electronics e-commerce company.

=== SAFEWAY ENTERPRISES COMPANY POLICIES ===
1. **Official Warranty Policy:**
   - Computers & Laptops: 1 to 2 Years Official Brand + Safeway Hardware Warranty.
   - Smart Watches & Phones: 1 Year Official PTA-Approved / Brand Warranty.
   - Mobile Accessories, Laptop Accessories & PC Accessories: 6 Months to 1 Year Replacement Warranty against manufacturing defects.
2. **Return & Exchange Policy:**
   - 7-Day Easy Return & Replacement if a product arrives damaged, defective, or sealed-box unopened.
   - Refunds are processed within 3–5 business days via original payment method or bank transfer.
3. **Shipping & Delivery Information:**
   - FREE Express Shipping on all orders above 150.
   - Standard flat shipping rate of 10 on orders under 150.
   - Delivery time: 24–48 hours in major cities (Lahore, Islamabad, Karachi) and 3–5 working days nationwide.
   - Cash on Delivery (COD) and Online Card/Bank Transfer are both supported.
4. **Customer Support Hours & Contact:**
   - Live AI Support: 24/7.
   - Human Helpline: +92 321-1006989 | Email: contact.safeway.ent@gmail.com | Head Office: Shop No:112 Aitchion housing society, Lahore, Pakistan.

=== LIVE PRODUCT CATALOG (FROM MONGODB DATABASE) ===
${formattedCatalog}

=== INSTRUCTIONS FOR ANSWERING CUSTOMERS ===
- Always answer politely, concisely, and accurately using ONLY the live product catalog and company policies above.
- When a customer asks for recommendations (e.g., "Do you have gaming laptops under 1500?" or "What is the warranty on mobile accessories?"), name the exact matching products, their exact prices (Rs.), key specs, warranty, and stock availability.
- If a product is out of stock or not in our catalog, politely inform the customer and suggest the closest available alternative from our catalog.
`;

    // 4. Initialize the official Google Generative AI SDK with the provided API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure the specific AI model to use and pass the system instructions
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite', // Using the specific Gemini model provided by the developer
      systemInstruction // Injects the live catalog and rules we built above
    });

    // 5. Convert previous chat history (if any) into Gemini's expected format
    // This allows the AI to remember the context of the current conversation
    const formattedHistory = history
      .filter((msg) => msg.role === 'user' || msg.role === 'model') // Ensure valid roles
      .map((msg) => ({
        role: msg.role, // 'user' or 'model'
        parts: [{ text: msg.text }] // The actual message text content
      }));

    // 6. Start a multi-turn chat session with the formatted history
    const chatSession = model.startChat({
      history: formattedHistory
    });

    let result;
    const maxAttempts = 3;

    // Retry mechanism loop: Try to send the message to the AI, and retry if the API is temporarily busy
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Attempt to send the current user message to the Gemini API
        result = await chatSession.sendMessage(message);
        break; // If successful, exit the retry loop immediately
      } catch (error) {
        // Check if the error is a temporary server issue (e.g., 503 Service Unavailable, 429 Too Many Requests)
        const isTemporary =
          /503|429|500|502|504|overloaded|high demand/i.test(
            error.message || ''
          );

        // If it's a permanent error (like wrong API key) or we ran out of attempts, throw the error down to the main catch block
        if (!isTemporary || attempt === maxAttempts) {
          throw error;
        }

        // Calculate exponential backoff delay (2 seconds, then 4 seconds...)
        const delay = attempt * 2000;
        console.log(
          `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxAttempts} in ${delay / 1000}s`
        );

        // Pause execution for the calculated delay duration before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Extract the final text response generated by the AI
    const aiReply = result.response.text();

    // 7. Return the dynamic Gemini AI response back to the React frontend chat UI
    res.json({ reply: aiReply });
  } catch (error) {
    // Handle API key errors, strict network blocks, or formatting issues
    console.error('Gemini AI Chat Error:', error.message);
    res.status(500).json({
      reply: 'Sorry, our AI assistant encountered a temporary connection issue. Please try again in a moment.',
      error: error.message
    });
  }
});

// Export the router so it can be mounted at '/api/chat' in server.js
module.exports = router;