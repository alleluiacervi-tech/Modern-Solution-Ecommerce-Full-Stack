const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const pool = require('../db/connection');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// -------------------- REGISTER --------------------
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully. Please check your email for verification.
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const client = await pool.connect();

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await client.query(
      `INSERT INTO users (name, email, password, is_verified, role, provider) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email`,
      [name, email, hashedPassword, false, 'user', 'local']
    );

    const user = newUser.rows[0];

    // Generate verification token
    const token = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await client.query(
      'INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, token, 'verification', expiresAt]
    );

    client.release();

    // Send verification email
    try {
      await sendVerificationEmail(email, name, token);
      res.status(201).json({
        message: 'Registration successful! Check your email for a verification code.',
        userId: user.id
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(201).json({
        message: 'Registration successful, but verification email could not be sent.',
        userId: user.id
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await pool.connect();
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      client.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userData = user.rows[0];

    // Google OAuth check
    if (userData.provider === 'google' && !userData.password) {
      client.release();
      return res.status(401).json({ message: 'Please login with Google or set a password first' });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      client.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!userData.is_verified) {
      client.release();
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    client.release();

    const token = jwt.sign(
      { userId: userData.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        is_verified: userData.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// -------------------- EMAIL VERIFICATION --------------------
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const client = await pool.connect();

    const tokenData = await client.query(
      `SELECT et.*, u.name, u.email FROM email_tokens et
       JOIN users u ON et.user_id = u.id
       WHERE et.token = $1 AND et.type = 'verification' AND et.used = false AND et.expires_at > NOW()`,
      [token]
    );

    if (tokenData.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const { user_id } = tokenData.rows[0];

    await client.query('UPDATE users SET is_verified = true WHERE id = $1', [user_id]);
    await client.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);

    client.release();
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    const client = await pool.connect();
    const tokenData = await client.query(
      `SELECT et.*, u.name, u.email FROM email_tokens et
       JOIN users u ON et.user_id = u.id
       WHERE et.token = $1 AND et.type = 'verification' AND et.used = false AND et.expires_at > NOW()`,
      [token]
    );

    if (tokenData.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const { user_id } = tokenData.rows[0];
    await client.query('UPDATE users SET is_verified = true WHERE id = $1', [user_id]);
    await client.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);

    client.release();
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

// -------------------- RESEND VERIFICATION --------------------
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const client = await pool.connect();
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.rows[0];
    if (userData.is_verified) {
      client.release();
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const token = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query('DELETE FROM email_tokens WHERE user_id = $1 AND type = $2', [userData.id, 'verification']);
    await client.query('INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)', [userData.id, token, 'verification', expiresAt]);

    client.release();
    await sendVerificationEmail(userData.email, userData.name, token);

    res.json({ message: 'New verification code sent to your email' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
});

// -------------------- FORGOT PASSWORD --------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const client = await pool.connect();
    const userResult = await client.query('SELECT id, name FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await client.query('INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)', [user.id, resetToken, 'reset', expiresAt]);
    client.release();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// -------------------- RESET PASSWORD --------------------
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const client = await pool.connect();
    const tokenResult = await client.query(
      `SELECT * FROM email_tokens WHERE token = $1 AND type = 'reset' AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const { user_id } = tokenResult.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);
    await client.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);

    client.release();
    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

// -------------------- GOOGLE OAUTH --------------------
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&success=true`);
  }
);

// -------------------- PROFILE & LOGOUT --------------------
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, is_verified: req.user.is_verified });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
