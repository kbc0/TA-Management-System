// backend/models/Course.js
const db = require('../config/db');

class Course {
  /**
   * Find a course by ID
   * @param {number} id - The course ID
   * @returns {Promise<Object|null>} The course object or null if not found
   */
  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT c.*, u.full_name as instructor_name 
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE c.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding course by ID:', error);
      throw error;
    }
  }

  /**
   * Find a course by course code
   * @param {string} courseCode - The course code
   * @returns {Promise<Object|null>} The course object or null if not found
   */
  static async findByCourseCode(courseCode) {
    try {
      const [rows] = await db.query(
        `SELECT c.*, u.full_name as instructor_name 
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE c.course_code = ?`,
        [courseCode]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding course by code:', error);
      throw error;
    }
  }

  /**
   * Get all courses with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.semester - Filter by semester
   * @param {string} filters.department - Filter by department
   * @param {number} filters.instructorId - Filter by instructor ID
   * @param {boolean} filters.isActive - Filter by active status
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of courses to return
   * @param {number} options.offset - Number of courses to skip
   * @returns {Promise<Array>} Array of course objects
   */
  static async findAll(filters = {}, options = {}) {
    try {
      let query = `
        SELECT c.*, u.full_name as instructor_name 
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Apply filters
      if (filters.semester) {
        query += ' AND c.semester = ?';
        queryParams.push(filters.semester);
      }
      
      if (filters.department) {
        query += ' AND c.department = ?';
        queryParams.push(filters.department);
      }
      
      if (filters.instructorId) {
        query += ' AND c.instructor_id = ?';
        queryParams.push(filters.instructorId);
      }
      
      if (filters.isActive !== undefined) {
        query += ' AND c.is_active = ?';
        queryParams.push(filters.isActive);
      }
      
      // Apply sorting
      query += ' ORDER BY c.course_code ASC';
      
      // Apply pagination
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await db.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error finding courses:', error);
      throw error;
    }
  }

  /**
   * Create a new course
   * @param {Object} courseData - The course data
   * @param {string} courseData.course_code - The course code
   * @param {string} courseData.course_name - The course name
   * @param {string} courseData.description - The course description
   * @param {string} courseData.semester - The semester (e.g., 'Fall 2025')
   * @param {number} courseData.credits - The number of credits
   * @param {string} courseData.department - The department
   * @param {number} courseData.instructor_id - The instructor ID
   * @param {boolean} courseData.is_active - Whether the course is active
   * @returns {Promise<Object>} The created course object
   */
  static async create(courseData) {
    try {
      const [result] = await db.query(
        `INSERT INTO courses 
         (course_code, course_name, description, semester, credits, department, instructor_id, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseData.course_code,
          courseData.course_name,
          courseData.description || null,
          courseData.semester,
          courseData.credits || 3,
          courseData.department || null,
          courseData.instructor_id || null,
          courseData.is_active !== undefined ? courseData.is_active : true
        ]
      );
      
      return {
        id: result.insertId,
        ...courseData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update a course
   * @param {number} id - The course ID
   * @param {Object} courseData - The updated course data
   * @returns {Promise<boolean>} Whether the update was successful
   */
  static async update(id, courseData) {
    try {
      // Build dynamic update query
      const allowedFields = [
        'course_code', 'course_name', 'description', 'semester', 
        'credits', 'department', 'instructor_id', 'is_active'
      ];
      
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(courseData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return false; // Nothing to update
      }
      
      values.push(id); // Add ID for WHERE clause
      
      const query = `
        UPDATE courses 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete a course
   * @param {number} id - The course ID
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Assign a TA to a course
   * @param {Object} assignmentData - The assignment data
   * @param {number} assignmentData.course_id - The course ID
   * @param {number} assignmentData.ta_id - The TA's user ID
   * @param {number} assignmentData.hours_per_week - Hours per week
   * @param {string} assignmentData.start_date - Start date (YYYY-MM-DD)
   * @param {string} assignmentData.end_date - End date (YYYY-MM-DD)
   * @param {string} assignmentData.status - Status (active, inactive, pending)
   * @returns {Promise<Object>} The created assignment
   */
  static async assignTA(assignmentData) {
    try {
      const [result] = await db.query(
        `INSERT INTO course_tas 
         (course_id, ta_id, hours_per_week, start_date, end_date, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          assignmentData.course_id,
          assignmentData.ta_id,
          assignmentData.hours_per_week || 10,
          assignmentData.start_date,
          assignmentData.end_date,
          assignmentData.status || 'active'
        ]
      );
      
      return {
        id: result.insertId,
        ...assignmentData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error assigning TA to course:', error);
      throw error;
    }
  }

  /**
   * Update a TA assignment
   * @param {number} id - The assignment ID
   * @param {Object} assignmentData - The updated assignment data
   * @returns {Promise<boolean>} Whether the update was successful
   */
  static async updateTAAssignment(id, assignmentData) {
    try {
      // Build dynamic update query
      const allowedFields = [
        'hours_per_week', 'start_date', 'end_date', 'status'
      ];
      
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(assignmentData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return false; // Nothing to update
      }
      
      values.push(id); // Add ID for WHERE clause
      
      const query = `
        UPDATE course_tas 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating TA assignment:', error);
      throw error;
    }
  }

  /**
   * Remove a TA from a course
   * @param {number} courseId - The course ID
   * @param {number} taId - The TA's user ID
   * @returns {Promise<boolean>} Whether the removal was successful
   */
  static async removeTA(courseId, taId) {
    try {
      const [result] = await db.query(
        'DELETE FROM course_tas WHERE course_id = ? AND ta_id = ?',
        [courseId, taId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing TA from course:', error);
      throw error;
    }
  }

  /**
   * Get all TAs for a course
   * @param {number} courseId - The course ID
   * @returns {Promise<Array>} Array of TA assignments with user details
   */
  static async getTAs(courseId) {
    try {
      const [rows] = await db.query(
        `SELECT ct.*, u.full_name, u.email, u.bilkent_id
         FROM course_tas ct
         JOIN users u ON ct.ta_id = u.id
         WHERE ct.course_id = ?
         ORDER BY u.full_name`,
        [courseId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting TAs for course:', error);
      throw error;
    }
  }

  /**
   * Get all courses for a TA
   * @param {number} taId - The TA's user ID
   * @returns {Promise<Array>} Array of course assignments with course details
   */
  static async getCoursesForTA(taId) {
    try {
      const [rows] = await db.query(
        `SELECT ct.*, c.course_code, c.course_name, c.semester
         FROM course_tas ct
         JOIN courses c ON ct.course_id = c.id
         WHERE ct.ta_id = ?
         ORDER BY c.semester DESC, c.course_code`,
        [taId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting courses for TA:', error);
      throw error;
    }
  }
}

module.exports = Course;
