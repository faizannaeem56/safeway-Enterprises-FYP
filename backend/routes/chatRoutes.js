/**
 * ============================================================================
 * FILE: backend/routes/chatRoutes.js
 * PURPOSE: Real AI Chat Support Integration using Google Gemini API
 *          (`@google/generative-ai`).
 * WHY IT IS USED:
 *   Instead of hardcoded `if-else` rules, this route fetches the LIVE product
 *   catalog directly from MongoDB and injects it—along with Safeway Enterprises'
 *   official warranty, shipping, and return policies—into the Gemini AI
 *   system prompt. Customers can ask natural questions and get accurate answe$
 * ============================================================================
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Send a customer message to Google Gemini AI with live store context
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Please enter a valid question.' });
    }

    // 1. Check that the Google Gemini API key is configured in `.env`
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        reply:
          '⚠️ Gemini API Key is missing on the server. Please add GEMINI_API_KEY to your backend/.env file.'
      });
    }

    // 2. Fetch the LIVE product inventory from MongoDB so the AI knows every
    //    current product, category, price, stock status, warranty, and specification.
    const products = await Product.find({});

    const formattedCatalog = products
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.category}] ${p.name} — Price: Rs.${p.price} | Stock: ${
            p.stock > 0 ? `${p.stock} units available` : 'Out of Stock'
          } | Warranty: ${p.warranty} | Specs: ${p.specs}`
      )
      .join('\n');

    // 3. Construct the comprehensive System Prompt for Safeway Enterprises
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
   - Human Helpline: +92 (42) 3576-9900 | Email: support@safeway.pk | Head Office: Gulberg III, Lahore.

=== LIVE PRODUCT CATALOG (FROM MONGODB DATABASE) ===
${formattedCatalog}

=== INSTRUCTIONS FOR ANSWERING CUSTOMERS ===
- Always answer politely, concisely, and accurately using ONLY the live product catalog and company policies above.
- When a customer asks for recommendations (e.g., "Do you have gaming laptops under 1500?" or "What is the warranty on mobile accessories?"), name the exact matching products, their exact prices (Rs.), key specs, warranty, and stock availability.
- If a product is out of stock or not in our catalog, politely inform the customer and suggest the closest available alternative from our catalog.
`;

    // 4. Initialize the official Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction
    });

    // 5. Convert previous chat history (if any) into Gemini's expected format
    const formattedHistory = history
      .filter((msg) => msg.role === 'user' || msg.role === 'model')
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

    // 6. Start a multi-turn chat session and send the customer's new message
    const chatSession = model.startChat({
      history: formattedHistory
    });

    
let result;
const maxAttempts = 3;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    result = await chatSession.sendMessage(message);
    break;
  } catch (error) {
    const isTemporary =
      /503|429|500|502|504|overloaded|high demand/i.test(
        error.message || ''
      );

    if (!isTemporary || attempt === maxAttempts) {
      throw error;
    }

    const delay = attempt * 2000;
    console.log(
      `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxAttempts} in ${delay / 1000}s`
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
    const aiReply = result.response.text();

    // 7. Return the dynamic Gemini AI response to the React frontend
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Gemini AI Chat Error:', error.message);
    res.status(500).json({
      reply: 'Sorry, our AI assistant encountered a temporary connection issue. Please try again in a moment.',
      error: error.message
    });
  }
});

module.exports = router;
