require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runEcommerceSchema() {
  try {
    console.log('Running e-commerce schema...');

    const sqlFile = path.join(__dirname, 'ecommerce-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL commands and execute them
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

    for (const command of commands) {
      if (command.trim()) {
        console.log('Executing:', command.substring(0, 50) + '...');
        await pool.query(command);
      }
    }

    console.log('✅ E-commerce schema created successfully!');
    console.log('📦 Sample products inserted!');
  } catch (error) {
    console.error('❌ Error creating e-commerce schema:', error);
  } finally {
    await pool.end();
  }
}

runEcommerceSchema();