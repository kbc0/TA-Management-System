// Script to update admin password
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function updateAdminPassword() {
  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ta_management'
  });

  try {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    console.log('New hashed password:', hashedPassword);

    // Update the admin user's password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE bilkent_id = ?',
      [hashedPassword, 'admin123']
    );

    console.log('Update result:', result);
    console.log(`Affected rows: ${result.affectedRows}`);
    
    if (result.affectedRows > 0) {
      console.log('Admin password updated successfully!');
    } else {
      console.log('No admin user found with bilkent_id "admin123"');
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the function
updateAdminPassword();
