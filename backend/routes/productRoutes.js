/**
 * ============================================================================
 * FILE: backend/routes/productRoutes.js
 * PURPOSE: Handles all Product operations including Dynamic Category Filtering,
 *          Price Range Filtering, Price Sorting, and Admin CRUD (Add/Edit/Delete).
 * ============================================================================
 */

const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

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
    const { category, minPrice, maxPrice, sort, search, featured } = req.query;

    // Build a dynamic MongoDB filter object
    const filter = {};

    // 1. Category Filter: If a specific category is selected (and not 'All'), filter by it
    if (category && category !== 'All') {
      filter.category = category;
    }

    // 2. Price Range Filter: Filter products between minPrice and maxPrice
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.price.$gte = Number(minPrice); // Greater than or equal to minPrice
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
      }
    }

    // 3. Keyword Search Filter: Match product name, specs, or description (case-insensitive)
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { specs: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 4. Featured Products Filter (for Home Page showcase)
    if (featured === 'true') {
      filter.featured = true;
    }

    // Determine Sort Order
    let sortOption = { createdAt: -1 }; // Default: Newest products first
    if (sort === 'lowToHigh') {
      sortOption = { price: 1 }; // Ascending price (Low to High)
    } else if (sort === 'highToLow') {
      sortOption = { price: -1 }; // Descending price (High to Low)
    }

    // Execute query against MongoDB
    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (error) {
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
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
    const { name, category, price, stock, warranty, specs, description, image, featured } = req.body;

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

    res.status(201).json(newProduct);
  } catch (error) {
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
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the modified document and validate schema
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found for update' });
    }

    res.json(updatedProduct);
  } catch (error) {
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
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found for deletion' });
    }

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;
