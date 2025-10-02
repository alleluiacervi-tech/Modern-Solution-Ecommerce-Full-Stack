const express = require('express');
const pool = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { createTransfer, getTransferStatus, requestToPay, getRequestToPayStatus } = require('../utils/momo');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations including product management, payroll, and payments
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Apply admin middleware to all routes
router.use(requireAdmin);

// Allowed categories consistent with homepage sidebar
const ALLOWED_CATEGORIES = [
  "Men's Clothing",
  "Women\u2019s Clothing",
  'Women\'s Clothing',
  'Accessories',
  'Shoes',
  'Jewelry',
  'Bags & Backpacks',
  'Watches',
  'Electronics'
];

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage for direct stream upload
const upload = multer({ storage: multer.memoryStorage() });

async function uploadToCloudinary(buffer, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kapee/products', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

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

// Create product (supports file upload: image or video)
router.post('/products', upload.single('media'), async (req, res) => {
  const { title, description, price, stock, category, mediaType } = req.body;

  try {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let image_url = null;
    if (req.file) {
      const isVideo = mediaType === 'video' || /video\//.test(req.file.mimetype);
      const result = await uploadToCloudinary(req.file.buffer, isVideo ? 'video' : 'image');
      image_url = result.secure_url;
    }

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

// Update product (supports replacing media)
router.put('/products/:id', upload.single('media'), async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock, category, image_url, mediaType } = req.body;

  try {
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let mediaUrl = image_url || null;
    if (req.file) {
      const isVideo = mediaType === 'video' || /video\//.test(req.file.mimetype);
      const result = await uploadToCloudinary(req.file.buffer, isVideo ? 'video' : 'image');
      mediaUrl = result.secure_url;
    }

    const client = await pool.connect();

    const result = await client.query(`
      UPDATE products 
      SET title = $1, description = $2, price = $3, stock = $4, 
          category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, description, price, stock, category, mediaUrl, id]);

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

// ---------------- Payroll (MTN MoMo Sandbox) ----------------
/**
 * @swagger
 * /api/admin/payroll/payouts:
 *   post:
 *     summary: Initiate bulk payroll payouts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payouts:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MoMoPayout'
 *             required:
 *               - payouts
 *     responses:
 *       200:
 *         description: Payouts initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       referenceId:
 *                         type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/payroll/payouts', async (req, res) => {
  const { payouts } = req.body; // [{phone, amount, note}]
  if (!Array.isArray(payouts) || payouts.length === 0) {
    return res.status(400).json({ message: 'No payouts supplied' });
  }
  try {
    const results = [];
    for (const p of payouts) {
      const referenceId = await createTransfer({ amount: p.amount, phone: p.phone, payeeNote: p.note });
      results.push({ phone: p.phone, amount: p.amount, referenceId });
    }
    res.json({ success: true, results });
  } catch (err) {
    console.error('Payroll payout error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to initiate payouts' });
  }
});

router.get('/payroll/status/:referenceId', async (req, res) => {
  try {
    const data = await getTransferStatus(req.params.referenceId);
    res.json(data);
  } catch (err) {
    console.error('Payroll status error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch payout status' });
  }
});

// ---------------- Customer Payment (MTN MoMo Collection) ----------------
/**
 * @swagger
 * /api/admin/payment/initiate:
 *   post:
 *     summary: Initiate MTN MoMo payment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoMoPayment'
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 referenceId:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/payment/initiate', async (req, res) => {
  const { amount, phone, orderId } = req.body;
  if (!amount || !phone || !orderId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const referenceId = await requestToPay({ 
      amount, 
      phone, 
      externalId: orderId,
      payerMessage: `Payment for order #${orderId}`,
      payeeNote: 'Kapee Shop'
    });
    res.json({ success: true, referenceId });
  } catch (err) {
    console.error('Payment initiation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
});

/**
 * @swagger
 * /api/admin/payment/status/{referenceId}:
 *   get:
 *     summary: Get payment status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference ID
 *     responses:
 *       200:
 *         description: Payment status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [PENDING, SUCCESSFUL, FAILED]
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 financialTransactionId:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/payment/status/:referenceId', async (req, res) => {
  try {
    const data = await getRequestToPayStatus(req.params.referenceId);
    res.json(data);
  } catch (err) {
    console.error('Payment status error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch payment status' });
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