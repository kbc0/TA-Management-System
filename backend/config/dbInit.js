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
  courses: `
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_code VARCHAR(20) UNIQUE NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      description TEXT,
      semester VARCHAR(20) NOT NULL,
      credits INT NOT NULL DEFAULT 3,
      department VARCHAR(100),
      instructor_id INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
  course_tas: `
    CREATE TABLE IF NOT EXISTS course_tas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      ta_id INT NOT NULL,
      hours_per_week INT NOT NULL DEFAULT 10,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (ta_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_course_ta (course_id, ta_id)
    )
  `
};

/**
 * Initialize database tables for backend
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
