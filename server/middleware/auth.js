const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await pool.connect();
    
    const user = await client.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    client.release();

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const requireVerification = (req, res, next) => {
  if (req.user && req.user.is_verified) {
    next();
  } else {
    res.status(403).json({ message: 'Email verification required' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireVerification
};