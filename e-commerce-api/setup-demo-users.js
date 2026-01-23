const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function setupDemoUsers() {
  try {
    console.log('Setting up demo users for e-commerce...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Insert or update admin user
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['Admin User', 'admin@ecommerce.com', adminPassword, 'admin']);

    // Insert or update regular user
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['Demo Customer', 'user@ecommerce.com', userPassword, 'user']);

    // Insert additional demo customers
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['John Smith', 'john@example.com', userPassword, 'user']);

    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['Sarah Johnson', 'sarah@example.com', userPassword, 'user']);

    console.log('✅ Demo users created successfully!');
    console.log('📧 Admin: admin@ecommerce.com / admin123');
    console.log('📧 Customer: user@ecommerce.com / user123');
    console.log('📧 Customer: john@example.com / user123');
    console.log('📧 Customer: sarah@example.com / user123');

    // Create some demo orders for analytics
    console.log('Creating demo orders...');
    
    // Get user IDs
    const users = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 3', ['user']);
    const products = await pool.query('SELECT id, price FROM products LIMIT 5');

    for (let i = 0; i < 10; i++) {
      const userId = users.rows[Math.floor(Math.random() * users.rows.length)].id;
      const product = products.rows[Math.floor(Math.random() * products.rows.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalAmount = product.price * quantity;
      
      const statuses = ['pending', 'processing', 'shipped', 'delivered'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Create order
      const orderResult = await pool.query(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
        RETURNING id
      `, [
        userId, 
        totalAmount, 
        '123 Demo Street, Demo City, DC 12345',
        'Credit Card',
        status
      ]);

      // Create order item
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
      `, [orderResult.rows[0].id, product.id, quantity, product.price]);
    }

    console.log('✅ Demo orders created successfully!');

  } catch (error) {
    console.error('❌ Error setting up demo users:', error);
  } finally {
    process.exit();
  }
}

setupDemoUsers();