const express = require('express');
const pool = require('../db/connection');
const { requireVerification } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', requireVerification, async (req, res) => {
  const { items, total } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, 'pending']
    );

    const order = orderResult.rows[0];

    // Add order items and update stock
    for (const item of items) {
      // Check product availability
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.title}`);
      }

      // Insert order item
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, product.price]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create order'
    });
  } finally {
    client.release();
  }
});

// Get user orders
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    const ordersResult = await client.query(`
      SELECT o.*, 
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
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    client.release();

    res.json(ordersResult.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    const orderResult = await client.query(`
      SELECT o.*, 
             array_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_title', p.title,
                 'product_image', p.image_url
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id
    `, [id, userId]);

    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    client.release();

    res.json(orderResult.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router;