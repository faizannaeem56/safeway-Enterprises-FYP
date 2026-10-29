/**
 * ============================================================================
 * FILE: backend/routes/productRoutes.js
 * PURPOSE: Handles all Product operations including Dynamic Category Filtering,
 *          Price Range Filtering, Price Sorting, and Admin CRUD (Add/Edit/Delete).
 * ============================================================================
 */

// Import Express to create a modular router for product-related endpoints
const express = require('express');

// Import the Product Mongoose model to query, insert, update, and delete products in MongoDB
const Product = require('../models/Product');

// Import security middlewares to ensure only logged-in Admins can add, edit, or delete products
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Initialize an Express Router instance
const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Fetch products with dynamic filtering by Category, Price Range, Search, and Sort
 * @access  Public
 *
 * EXAMPLE QUERY PARAMETERS:
 *   /api/products?category=Laptops&minPrice=500&maxPrice=2000&sort=lowToHigh&search=gaming
 */
router.get('/', async (req, res) => {
  try {
    // Extract optional filter and sort parameters from the URL query string (req.query)
    const { category, minPrice, maxPrice, sort, search, featured } = req.query;

    // Build a dynamic MongoDB filter object (starts empty; if no filters are sent, it fetches all products)
    const filter = {};

    // 1. Category Filter: If a specific category is selected (and not 'All'), filter by it
    if (category && category !== 'All') {
      filter.category = category;
    }

    // 2. Price Range Filter: Filter products between minPrice and maxPrice
    if (minPrice !== undefined || maxPrice !== undefined) {
      // Initialize nested price filter object for MongoDB comparison operators
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        // $gte = Greater Than or Equal to: convert query string to Number
        filter.price.$gte = Number(minPrice); // Greater than or equal to minPrice
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        // $lte = Less Than or Equal to: convert query string to Number
        filter.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
      }
    }

    // 3. Keyword Search Filter: Match product name, specs, or description (case-insensitive)
    if (search && search.trim() !== '') {
      // $or checks if the search keyword appears in ANY of the three fields (name, specs, or description)
      // $regex performs partial text matching, and $options: 'i' makes it case-insensitive ("ROG" matches "rog")
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { specs: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 4. Featured Products Filter (for Home Page showcase)
    // Note: Query parameters in URLs are always strings, so we compare with the string 'true'
    if (featured === 'true') {
      filter.featured = true;
    }

    // Determine Sort Order based on the 'sort' query parameter
    // In MongoDB: -1 means Descending (High to Low / Newest first), and 1 means Ascending (Low to High)
    let sortOption = { createdAt: -1 }; // Default: Newest products first
    if (sort === 'lowToHigh') {
      sortOption = { price: 1 }; // Ascending price (Low to High)
    } else if (sort === 'highToLow') {
      sortOption = { price: -1 }; // Descending price (High to Low)
    }

    // Execute query against MongoDB using the constructed filter and sort options
    const products = await Product.find(filter).sort(sortOption);
    // Send the matched products array back to the frontend as JSON
    res.json(products);
  } catch (error) {
    // Handle unexpected database or query errors with HTTP 500
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Fetch single product details by its MongoDB ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    // Look up a single product in MongoDB using the ':id' route parameter from the URL
    const product = await Product.findById(req.params.id);
    // If no product exists with that ID, return HTTP 404 (Not Found)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Return the found product object as JSON
    res.json(product);
  } catch (error) {
    // Runs if the ID format is invalid or a database error occurs
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Admin Panel: Add a new product to the store catalog
 * @access  Private / Admin Only
 */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    // Extract product fields submitted from the Admin Add Product form
    const { name, category, price, stock, warranty, specs, description, image, featured } = req.body;

    // Create and save the new product document in MongoDB
    // Explicitly cast price/stock to Number and featured to Boolean for type safety
    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      warranty: warranty || '1 Year Official Safeway Warranty',
      specs,
      description,
      image,
      featured: Boolean(featured)
    });

    // Return HTTP 201 (Created) along with the newly created product document
    res.status(201).json(newProduct);
  } catch (error) {
    // Return HTTP 400 (Bad Request) if required fields are missing or category enum validation fails
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Admin Panel: Edit / Update an existing product by ID
 * @access  Private / Admin Only
 */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Find the product by ID and update it with the new data in req.body
    // { new: true } returns the updated product instead of the old one
    // { runValidators: true } forces Mongoose to re-check schema rules (like allowed categories and min price)
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the modified document and validate schema
    );

    // If no product matches the ID, return HTTP 404
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found for update' });
    }

    // Send back the updated product document
    res.json(updatedProduct);
  } catch (error) {
    // Return HTTP 400 if validation fails during the update
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Admin Panel: Remove a product from the database
 * @access  Private / Admin Only
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Find the product by its MongoDB ID and permanently remove it from the collection
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    // If no product was found with that ID, return HTTP 404
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found for deletion' });
    }

    // Confirm deletion and return the deleted product's ID so the frontend can remove it from UI state
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    // Handle unexpected server errors during deletion
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

// Export the router so it can be mounted at '/api/products' in server.js
module.exports = router;