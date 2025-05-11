// Script to create a new admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createNewAdmin() {
  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ta_management'
  });

  try {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('123', 10);
    console.log('New hashed password:', hashedPassword);

    // First, check if a user with bilkent_id 'admin' already exists
    const [existingAdminUsers] = await connection.execute(
      'SELECT id FROM users WHERE bilkent_id = ?',
      ['admin']
    );

    if (existingAdminUsers.length > 0) {
      // Update existing admin user
      const [updateResult] = await connection.execute(
        'UPDATE users SET password = ?, role = ?, full_name = ? WHERE bilkent_id = ?',
        [hashedPassword, 'admin', 'System Administrator', 'admin']
      );
      
      console.log('Update result:', updateResult);
      console.log(`Updated existing user with bilkent_id 'admin' to have the new password`);
    } else {
      // Create a completely new admin user
      try {
        const [insertResult] = await connection.execute(
          'INSERT INTO users (bilkent_id, email, password, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          ['admin', 'admin_new@bilkent.edu.tr', hashedPassword, 'System Administrator', 'admin']
        );
        console.log('Insert result:', insertResult);
        console.log(`Created new admin user with bilkent_id 'admin'`);
      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.log('Email already exists, trying with a unique email');
          // Try with a unique email if the first attempt fails
          const uniqueEmail = `admin_${Date.now()}@bilkent.edu.tr`;
          const [retryResult] = await connection.execute(
            'INSERT INTO users (bilkent_id, email, password, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            ['admin', uniqueEmail, hashedPassword, 'System Administrator', 'admin']
          );
          console.log('Insert result (with unique email):', retryResult);
          console.log(`Created new admin user with bilkent_id 'admin' and email ${uniqueEmail}`);
        } else {
          throw insertError; // Re-throw if it's not a duplicate entry error
        }
      }
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the function
createNewAdmin();
