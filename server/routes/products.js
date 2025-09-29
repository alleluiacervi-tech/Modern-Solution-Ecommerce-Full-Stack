const express = require('express');
const pool = require('../db/connection');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM products 
      WHERE stock > 0 
      ORDER BY created_at DESC
    `);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM products 
      WHERE category = $1 AND stock > 0 
      ORDER BY created_at DESC
    `, [category]);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  const { query } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM products 
      WHERE (title ILIKE $1 OR description ILIKE $1) AND stock > 0
      ORDER BY created_at DESC
    `, [`%${query}%`]);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
});

module.exports = router;