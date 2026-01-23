const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up dashboard database...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'config', 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Sample data has been inserted');
    console.log('\n🔐 Default admin credentials:');
    console.log('   Email: admin@dashboard.com');
    console.log('   Password: admin123');
    console.log('\n👤 Sample user credentials:');
    console.log('   Email: john@dashboard.com');
    console.log('   Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;