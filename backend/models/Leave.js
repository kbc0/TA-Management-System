// backend/models/Leave.js
const db = require('../config/db');

class Leave {
  static async findAll(userId = null, role = null) {
    try {
      // For TAs, return only their own leave requests
      if (userId && role === 'ta') {
        const [rows] = await db.query(
          `SELECT l.*, u.full_name as requester_name, u.bilkent_id as requester_bilkent_id
           FROM leave_requests l
           JOIN users u ON l.user_id = u.id
           WHERE l.user_id = ?
           ORDER BY l.created_at DESC`,
          [userId]
        );
        return rows;
      }

      // For department chairs, admins, and staff - return relevant leave requests
      if (role === 'department_chair' || role === 'admin' || role === 'staff') {
        // Department chairs and admins can see all leave requests
        const [rows] = await db.query(
          `SELECT l.*, u.full_name as requester_name, u.bilkent_id as requester_bilkent_id,
           r.full_name as reviewer_name
           FROM leave_requests l
           JOIN users u ON l.user_id = u.id
           LEFT JOIN users r ON l.reviewer_id = r.id
           ORDER BY l.created_at DESC`
        );
        return rows;
      }

      // Default case - shouldn't normally be reached with proper auth
      const [rows] = await db.query(
        `SELECT l.*, u.full_name as requester_name
         FROM leave_requests l
         JOIN users u ON l.user_id = u.id
         ORDER BY l.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(leaveId) {
    try {
      const [rows] = await db.query(
        `SELECT l.*, u.full_name as requester_name, u.bilkent_id as requester_bilkent_id, 
         u.email as requester_email,
         r.full_name as reviewer_name, r.bilkent_id as reviewer_bilkent_id
         FROM leave_requests l
         JOIN users u ON l.user_id = u.id
         LEFT JOIN users r ON l.reviewer_id = r.id
         WHERE l.id = ?`,
        [leaveId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT l.*, r.full_name as reviewer_name
         FROM leave_requests l
         LEFT JOIN users r ON l.reviewer_id = r.id
         WHERE l.user_id = ? 
         ORDER BY l.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(leaveData) {
    try {
      const { user_id, leave_type, start_date, end_date, reason, supporting_document_url } = leaveData;
      
      // Calculate duration in days
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Check for task conflicts 
      const [taskConflicts] = await db.query(
        `SELECT t.id, t.title, t.task_type, t.due_date, t.course_id 
         FROM tasks t 
         JOIN task_assignments ta ON t.id = ta.task_id 
         WHERE ta.user_id = ? 
         AND t.status = 'active' 
         AND t.due_date BETWEEN ? AND ?`,
        [user_id, start_date, end_date]
      );
      
      // Check for exam conflicts
      const [examConflicts] = await db.query(
        `SELECT e.id, e.exam_name as title, e.course_id, e.exam_date as due_date
         FROM exams e
         JOIN tasks t ON t.course_id = e.course_id AND t.task_type = 'proctoring'
         JOIN task_assignments ta ON t.id = ta.task_id 
         WHERE ta.user_id = ?
         AND e.exam_date BETWEEN ? AND ?`,
        [user_id, start_date, end_date]
      );

      // Insert the leave request
      const [result] = await db.query(
        `INSERT INTO leave_requests 
         (user_id, leave_type, start_date, end_date, duration, reason, supporting_document_url, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [user_id, leave_type, start_date, end_date, duration, reason, supporting_document_url]
      );
      
      // Add a system log entry for the leave request
      await db.query(
        `INSERT INTO system_logs (user_id, action, details, ip_address) 
         VALUES (?, 'leave_requested', ?, NULL)`,
        [
          user_id, 
          JSON.stringify({
            leave_id: result.insertId,
            leave_type,
            start_date,
            end_date,
            has_conflicts: taskConflicts.length > 0 || examConflicts.length > 0
          })
        ]
      );

      // Commit the transaction
      await db.query('COMMIT');
      
      // Return conflicts if any
      return {
        id: result.insertId,
        conflicts: {
          taskConflicts: taskConflicts.length > 0 ? taskConflicts : null,
          examConflicts: examConflicts.length > 0 ? examConflicts : null,
          hasConflicts: taskConflicts.length > 0 || examConflicts.length > 0
        }
      };
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async update(leaveId, status, reviewer_id, reviewer_notes = null) {
    try {
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Get the leave request details
      const [leaveDetails] = await db.query(
        'SELECT * FROM leave_requests WHERE id = ?',
        [leaveId]
      );
      
      if (leaveDetails.length === 0) {
        await db.query('ROLLBACK');
        throw new Error('Leave request not found');
      }
      
      const leave = leaveDetails[0];
      
      // Update the leave request status
      const [result] = await db.query(
        `UPDATE leave_requests 
         SET status = ?, reviewer_id = ?, reviewer_notes = ?, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, reviewer_id, reviewer_notes, leaveId]
      );
      
      // If approved, add a system log entry 
      if (status === 'approved') {
        // Add a system log entry
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'leave_approved', ?, NULL)`,
          [
            reviewer_id, 
            JSON.stringify({
              leave_id: leaveId,
              user_id: leave.user_id,
              start_date: leave.start_date,
              end_date: leave.end_date
            })
          ]
        );
        
        // We don't automatically change user status to 'on_leave' here
        // That should be handled by a separate scheduled job or admin action
      } else if (status === 'rejected') {
        // Add a system log entry for rejection
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'leave_rejected', ?, NULL)`,
          [
            reviewer_id, 
            JSON.stringify({
              leave_id: leaveId,
              user_id: leave.user_id,
              reason: reviewer_notes
            })
          ]
        );
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async delete(leaveId, userId, role) {
    try {
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Only allow deletion of pending leaves by the requester or an admin
      let query = 'DELETE FROM leave_requests WHERE id = ?';
      let params = [leaveId];

      if (role !== 'admin') {
        query += ' AND user_id = ? AND status = "pending"';
        params.push(userId);
      }

      const [result] = await db.query(query, params);
      
      // Log the deletion if successful
      if (result.affectedRows > 0) {
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'leave_deleted', ?, NULL)`,
          [
            userId,
            JSON.stringify({
              leave_id: leaveId
            })
          ]
        );
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async getLeaveStatistics(userId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN duration ELSE 0 END) as total_days_taken
        FROM leave_requests
      `;
      
      let params = [];
      
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      const [rows] = await db.query(query, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkConflicts(userId, startDate, endDate) {
    try {
      // Check for conflicts with tasks
      const [taskConflicts] = await db.query(
        `SELECT t.id, t.title, t.task_type, t.due_date, t.course_id 
         FROM tasks t 
         JOIN task_assignments ta ON t.id = ta.task_id 
         WHERE ta.user_id = ? 
         AND t.status = 'active' 
         AND t.due_date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
      );
      
      // Check for conflicts with exams 
      const [examConflicts] = await db.query(
        `SELECT e.id, e.exam_name as title, e.course_id, e.exam_date as due_date
         FROM exams e
         JOIN tasks t ON t.course_id = e.course_id AND t.task_type = 'proctoring'
         JOIN task_assignments ta ON t.id = ta.task_id 
         WHERE ta.user_id = ?
         AND e.exam_date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
      );
      
      return {
        hasConflicts: taskConflicts.length > 0 || examConflicts.length > 0,
        taskConflicts,
        examConflicts
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Leave;