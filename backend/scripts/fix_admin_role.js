// Script to fix admin user role to ensure it exactly matches what's expected
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function fixAdminRole() {
  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ta_management'
  });

  try {
    // Update both admin users to ensure their role is exactly 'admin'
    const [result] = await connection.execute(
      'UPDATE users SET role = ? WHERE bilkent_id = ? OR bilkent_id = ?',
      ['admin', 'admin', 'admin123']
    );

    console.log('Update result:', result);
    console.log(`Updated ${result.affectedRows} admin users to have exact 'admin' role`);

    // Now get all admin users to verify
    const [adminUsers] = await connection.execute(
      'SELECT id, bilkent_id, email, role FROM users WHERE role = ?',
      ['admin']
    );

    console.log('Admin users in database:');
    console.table(adminUsers);
  } catch (error) {
    console.error('Error fixing admin role:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the function
fixAdminRole();
