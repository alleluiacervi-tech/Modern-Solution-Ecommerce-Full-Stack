const express = require('express');
const pool = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();

    const stats = {};

    // Total products
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    stats.totalProducts = parseInt(productsResult.rows[0].count);

    // Total orders
    const ordersResult = await client.query('SELECT COUNT(*) as count FROM orders');
    stats.totalOrders = parseInt(ordersResult.rows[0].count);

    // Total users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']);
    stats.totalUsers = parseInt(usersResult.rows[0].count);

    // Total revenue
    const revenueResult = await client.query(`
      SELECT COALESCE(SUM(total), 0) as revenue 
      FROM orders 
      WHERE status IN ('completed', 'delivered')
    `);
    stats.totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

    client.release();

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Product management routes

// Create product
router.post('/products', async (req, res) => {
  const { title, description, price, stock, category, image_url } = req.body;

  try {
    const client = await pool.connect();

    const result = await client.query(`
      INSERT INTO products (title, description, price, stock, category, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, price, stock, category, image_url]);

    client.release();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock, category, image_url } = req.body;

  try {
    const client = await pool.connect();

    const result = await client.query(`
      UPDATE products 
      SET title = $1, description = $2, price = $3, stock = $4, 
          category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, description, price, stock, category, image_url, id]);

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get all orders (admin)
router.get('/orders', async (req, res) => {
  try {
    const client = await pool.connect();

    const ordersResult = await client.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             array_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_title', p.title
               )
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    client.release();

    res.json(ordersResult.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(`
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT id, name, email, role, is_verified, provider, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;