const bcrypt = require('bcryptjs');

const password = 'admin2026';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
  }
});