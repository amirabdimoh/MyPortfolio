const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const passwords = {
    admin123: await bcrypt.hash('admin123', 10),
    staff123: await bcrypt.hash('staff123', 10)
  };

  console.log('Generated password hashes:');
  console.log('admin123:', passwords.admin123);
  console.log('staff123:', passwords.staff123);
  
  console.log('\nSQL to update users:');
  console.log(`UPDATE users SET password = '${passwords.admin123}' WHERE email = 'admin@university.edu';`);
  console.log(`UPDATE users SET password = '${passwords.staff123}' WHERE email = 'staff@university.edu';`);
}

generatePasswords().catch(console.error);