// backend/scripts/add-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    
    // Admin user details
    const bilkentId = 'admin123';
    const email = 'admin@bilkent.edu.tr';
    const password = 'Admin123!';
    const fullName = 'System Administrator';
    const role = 'admin';
    
    console.log('Checking if admin user already exists...');
    
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE bilkent_id = ?',
      [bilkentId]
    );
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists.');
      return;
    }
    
    console.log('Creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the admin user
    const [result] = await db.query(
      'INSERT INTO users (bilkent_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [bilkentId, email, hashedPassword, fullName, role]
    );
    
    console.log('Admin user created successfully:');
    console.log(`- ID: ${result.insertId}`);
    console.log(`- Bilkent ID: ${bilkentId}`);
    console.log(`- Email: ${email}`);
    console.log(`- Role: ${role}`);
    console.log('\nYou can now login with:');
    console.log(`- Bilkent ID: ${bilkentId}`);
    console.log(`- Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection pool
    await db.end();
    process.exit(0);
  }
}

// Run the function
createAdminUser();
