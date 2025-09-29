const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        is_verified BOOLEAN DEFAULT false,
        role VARCHAR(50) DEFAULT 'user',
        provider VARCHAR(50) DEFAULT 'local',
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create email_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'verification',
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user if it doesn't exist
    const adminEmail = 'alleluiacervi@gmail.com';
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      await client.query(`
        INSERT INTO users (name, email, password, is_verified, role, provider)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Admin User', adminEmail, hashedPassword, true, 'admin', 'local']);
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Insert sample products
    const sampleProducts = [
      {
        title: 'Wireless Bluetooth Headphones',
        description: 'Premium quality wireless headphones with noise cancellation and long battery life.',
        price: 99.99,
        stock: 50,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
      },
      {
        title: 'Smart Fitness Watch',
        description: 'Advanced fitness tracking with heart rate monitor and GPS functionality.',
        price: 199.99,
        stock: 30,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'
      },
      {
        title: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable organic cotton t-shirt in multiple colors.',
        price: 29.99,
        stock: 100,
        category: 'clothing',
        image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'
      },
      {
        title: 'Leather Wallet',
        description: 'Handcrafted genuine leather wallet with multiple card slots and coin pocket.',
        price: 49.99,
        stock: 75,
        category: 'accessories',
        image_url: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'
      },
      {
        title: 'Portable Phone Charger',
        description: 'High-capacity portable battery pack for smartphones and tablets.',
        price: 39.99,
        stock: 60,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/163125/phone-mobile-smartphone-163125.jpeg'
      },
      {
        title: 'Running Shoes',
        description: 'Professional running shoes with advanced cushioning and breathable material.',
        price: 129.99,
        stock: 40,
        category: 'footwear',
        image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
      }
    ];

    for (const product of sampleProducts) {
      const existing = await client.query(
        'SELECT id FROM products WHERE title = $1',
        [product.title]
      );

      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO products (title, description, price, stock, category, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [product.title, product.description, product.price, product.stock, product.category, product.image_url]);
      }
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };