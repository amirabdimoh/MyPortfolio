const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function setupUsers() {
  try {
    console.log('Setting up database tables...');

    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Users table created or already exists.');

    console.log('Setting up admin and demo users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Insert or update admin user
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['Admin User', 'admin@university.edu', adminPassword, 'admin']);

    // Insert or update regular user
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role = $4
    `, ['Demo User', 'user@university.edu', userPassword, 'user']);

    console.log('✅ Users created successfully!');
    console.log('📧 Admin: admin@university.edu / admin123');
    console.log('📧 User: user@university.edu / user123');

  } catch (error) {
    console.error('❌ Error setting up users:', error);
  } finally {
    await pool.end();
  }
}

setupUsers();