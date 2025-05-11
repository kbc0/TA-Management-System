// Script to create an admin user with a plaintext password
const db = require('../config/db');

async function createAdmin() {
  try {
    // Check if admin user already exists
    const [existingAdmin] = await db.query(
      'SELECT * FROM users WHERE bilkent_id = ?',
      ['admin']
    );

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create new admin with plaintext password
    const [result] = await db.query(
      'INSERT INTO users (bilkent_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@bilkent.edu.tr', 'admin123', 'System Administrator', 'admin']
    );

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
