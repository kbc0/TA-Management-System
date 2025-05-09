// backend/config/dbInit.js
const pool = require('./db');

// SQL statements to create tables if they don't exist
const createTablesQueries = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bilkent_id VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role ENUM('ta', 'staff', 'department_chair', 'dean', 'admin') NOT NULL DEFAULT 'ta',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  // Add other tables as needed
  // For example:
  // courses: `CREATE TABLE IF NOT EXISTS courses (...)`
};

/**
 * Initialize database tables
 */
async function initDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create each table if it doesn't exist
    for (const [tableName, query] of Object.entries(createTablesQueries)) {
      await pool.query(query);
      console.log(`Table '${tableName}' checked/created successfully`);
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { initDatabase };
