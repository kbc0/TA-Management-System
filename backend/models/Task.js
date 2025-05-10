// models/Task.js
const db = require('../config/db');

class Task {
  static async findAll(userId = null, role = null) {
    try {
      // If userId is provided, return tasks assigned to that user (for TAs)
      if (userId && role === 'ta') {
        const [rows] = await db.query(
          `SELECT t.*, u.full_name as assigned_to_name
          FROM tasks t
          JOIN task_assignments ta ON t.id = ta.task_id
          JOIN users u ON u.id = ta.user_id
          WHERE ta.user_id = ?
          ORDER BY t.due_date ASC`,
          [userId]
        );
        return rows;
      }
      
      // If user is staff/instructor, return all tasks created by them
      if (userId && (role === 'staff' || role === 'department_chair')) {
        const [rows] = await db.query(
          `SELECT t.*, u.full_name as assigned_to_name
          FROM tasks t
          LEFT JOIN task_assignments ta ON t.id = ta.task_id
          LEFT JOIN users u ON u.id = ta.user_id
          WHERE t.created_by = ?
          ORDER BY t.due_date ASC`,
          [userId]
        );
        return rows;
      }
      
      // If no userId or admin role, return all tasks
      const [rows] = await db.query(
        `SELECT t.*, u.full_name as assigned_to_name, c.full_name as creator_name
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.id = ta.task_id
        LEFT JOIN users u ON u.id = ta.user_id
        LEFT JOIN users c ON c.id = t.created_by
        ORDER BY t.due_date ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(taskId) {
    try {
      const [rows] = await db.query(
        `SELECT t.*, u.full_name as assigned_to_name, c.full_name as creator_name
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.id = ta.task_id
        LEFT JOIN users u ON u.id = ta.user_id
        LEFT JOIN users c ON c.id = t.created_by
        WHERE t.id = ?`,
        [taskId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findUpcoming(userId, limit = 5) {
    try {
      // First check if the user has any task assignments
      const [assignmentCheck] = await db.query(
        `SELECT COUNT(*) as count FROM task_assignments WHERE user_id = ?`,
        [userId]
      );
      
      // If no assignments exist, return an empty array instead of failing
      if (assignmentCheck[0].count === 0) {
        return [];
      }
      
      // Get upcoming tasks for the user
      const [rows] = await db.query(
        `SELECT t.*, u.full_name as assigned_to_name
        FROM tasks t
        JOIN task_assignments ta ON t.id = ta.task_id
        JOIN users u ON u.id = ta.user_id
        WHERE ta.user_id = ? AND t.status = 'active' AND t.due_date >= CURDATE()
        ORDER BY t.due_date ASC
        LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in findUpcoming:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  static async getTasksForCourse(courseId) {
    try {
      // Handle both numeric and string course IDs
      const isNumeric = !isNaN(courseId);
      
      let query;
      if (isNumeric) {
        // Use course.id for D1 style
        query = `
          SELECT t.*, u.full_name as assigned_to_name
          FROM tasks t
          LEFT JOIN task_assignments ta ON t.id = ta.task_id
          LEFT JOIN users u ON u.id = ta.user_id
          JOIN courses c ON c.id = ?
          WHERE t.course_id = c.course_code
          ORDER BY t.due_date ASC
        `;
      } else {
        // Use direct course_id for D2 style
        query = `
          SELECT t.*, u.full_name as assigned_to_name
          FROM tasks t
          LEFT JOIN task_assignments ta ON t.id = ta.task_id
          LEFT JOIN users u ON u.id = ta.user_id
          WHERE t.course_id = ?
          ORDER BY t.due_date ASC
        `;
      }
      
      const [rows] = await db.query(query, [courseId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(taskData) {
    try {
      const { title, description, task_type, course_id, due_date, duration, created_by } = taskData;
      
      // Check if course_id is a numeric ID or course code
      let actualCourseId = course_id;
      if (course_id && !isNaN(course_id)) {
        // If numeric, look up the course code
        const [courseResult] = await db.query(
          'SELECT course_code FROM courses WHERE id = ?',
          [course_id]
        );
        
        if (courseResult.length > 0) {
          actualCourseId = courseResult[0].course_code;
        }
      }
      
      const [result] = await db.query(
        `INSERT INTO tasks (title, description, task_type, course_id, due_date, duration, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
        [title, description, task_type, actualCourseId, due_date, duration, created_by]
      );
      
      const taskId = result.insertId;
      
      // If there are assignees, create task assignments
      if (taskData.assignees && taskData.assignees.length > 0) {
        for (const userId of taskData.assignees) {
          await db.query(
            `INSERT INTO task_assignments (task_id, user_id)
            VALUES (?, ?)`,
            [taskId, userId]
          );
        }
      }
      
      return await this.findById(taskId);
    } catch (error) {
      throw error;
    }
  }

  static async update(taskId, taskData) {
    try {
      // Fields allowed for direct update from taskData (excluding id, created_at, updated_at, etc.)
      const allowedFields = ['title', 'description', 'task_type', 'course_id', 'due_date', 'duration', 'status'];
      const updates = {};
      const queryParams = [];
      let setClause = '';

      for (const field of allowedFields) {
        if (taskData.hasOwnProperty(field)) {
          // Special handling for course_id
          if (field === 'course_id' && !isNaN(taskData[field])) {
            // Convert numeric course_id to course_code
            const [courseResult] = await db.query(
              'SELECT course_code FROM courses WHERE id = ?',
              [taskData[field]]
            );
            
            if (courseResult.length > 0) {
              updates[field] = courseResult[0].course_code;
            } else {
              updates[field] = taskData[field];
            }
          } else {
            updates[field] = taskData[field];
          }
          
          if (setClause !== '') setClause += ', ';
          setClause += `${field} = ?`;
          queryParams.push(updates[field]);
        }
      }

      // Always update the updated_at timestamp
      if (setClause !== '') setClause += ', ';
      setClause += 'updated_at = CURRENT_TIMESTAMP';
      
      if (queryParams.length === 0) {
        console.log('[Task.update] No fields to update for task:', taskId);
        return false;
      }
      
      queryParams.push(taskId); // Add taskId for the WHERE clause

      const sql = `UPDATE tasks SET ${setClause} WHERE id = ?`;
      
      const [result] = await db.query(sql, queryParams);
      
      // Update task assignments if 'assignees' is provided
      if (taskData.hasOwnProperty('assignees') && Array.isArray(taskData.assignees)) {
        // Remove existing assignments
        await db.query('DELETE FROM task_assignments WHERE task_id = ?', [taskId]);
        
        // Add new assignments (only if assignees array is not empty)
        if (taskData.assignees.length > 0) {
          for (const userId of taskData.assignees) {
            await db.query(
              `INSERT INTO task_assignments (task_id, user_id)
              VALUES (?, ?)`,
              [taskId, userId]
            );
          }
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[Task.update] Error:', error);
      throw error;
    }
  }

  static async complete(taskId, userId, userRole) {
    try {
      // Get the task to check if the user is assigned to it or created it
      const task = await this.findById(taskId);
      if (!task) {
        return { success: false, message: 'Task not found' };
      }
      
      // Allow task creator (instructors/staff) to complete the task
      if ((userRole === 'staff' || userRole === 'department_chair') && task.created_by === userId) {
        const [result] = await db.query(
          'UPDATE tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
          [taskId]
        );
        
        return { 
          success: result.affectedRows > 0, 
          message: result.affectedRows > 0 ? 'Task marked as completed' : 'Failed to update task'
        };
      }
      
      // For other users, check if they are assigned to this task
      const [assignment] = await db.query(
        'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
        [taskId, userId]
      );
      
      if (assignment.length === 0) {
        return { success: false, message: 'You are not assigned to this task' };
      }
      
      // Update the task status to completed
      const [result] = await db.query(
        'UPDATE tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [taskId]
      );
      
      return { 
        success: result.affectedRows > 0, 
        message: result.affectedRows > 0 ? 'Task marked as completed' : 'Failed to update task'
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(taskId) {
    try {
      // First delete task assignments
      await db.query('DELETE FROM task_assignments WHERE task_id = ?', [taskId]);
      
      // Then delete the task
      const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;