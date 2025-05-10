// backend/config/dbInit.js
const pool = require('./db');

// SQL statements to create tables if they don't exist
const createTablesQueries = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      bilkent_id VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role ENUM('ta', 'staff', 'department_chair', 'dean', 'admin') NOT NULL,
      status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
      department VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY bilkent_id (bilkent_id),
      UNIQUE KEY email (email)
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
  `,
  
  tasks: `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      task_type ENUM('grading', 'office_hours', 'proctoring', 'lab_session', 'other') NOT NULL,
      course_id VARCHAR(10) DEFAULT NULL,
      due_date DATE NOT NULL,
      duration INT NOT NULL COMMENT 'Duration in minutes',
      status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
      created_by INT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
  
  task_assignments: `
    CREATE TABLE IF NOT EXISTS task_assignments (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id INT NOT NULL,
      assigned_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY task_user_unique (task_id, user_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
  
  exams: `
    CREATE TABLE IF NOT EXISTS exams (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      course_id VARCHAR(20) NOT NULL,
      exam_name VARCHAR(100) NOT NULL,
      exam_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      duration_minutes INT NOT NULL,
      number_of_students INT NOT NULL,
      number_of_proctors_needed INT NOT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `,
  
  exam_rooms: `
    CREATE TABLE IF NOT EXISTS exam_rooms (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      room_number VARCHAR(20) NOT NULL,
      capacity INT NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    )
  `,
  
  leave_requests: `
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      leave_type ENUM('conference', 'medical', 'family_emergency', 'personal', 'other') NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration INT NOT NULL COMMENT 'Duration in days',
      reason TEXT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      supporting_document_url VARCHAR(255) DEFAULT NULL,
      reviewer_id INT DEFAULT NULL,
      reviewer_notes TEXT,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
      KEY idx_leave_status (status),
      KEY idx_leave_dates (start_date, end_date)
    )
  `,
  
  swap_requests: `
    CREATE TABLE IF NOT EXISTS swap_requests (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      requester_id INT NOT NULL,
      target_id INT NOT NULL,
      assignment_type ENUM('task', 'exam') NOT NULL,
      original_assignment_id INT NOT NULL,
      proposed_assignment_id INT DEFAULT NULL,
      reason TEXT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewer_id INT DEFAULT NULL,
      reviewer_notes TEXT,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
      KEY idx_swap_status (status)
    )
  `,
  
  system_logs: `
    CREATE TABLE IF NOT EXISTS system_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45) DEFAULT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
  
  system_config: `
    CREATE TABLE IF NOT EXISTS system_config (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      config_key VARCHAR(50) NOT NULL,
      config_value TEXT NOT NULL,
      description TEXT,
      updated_by INT DEFAULT NULL,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY config_key (config_key),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `
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