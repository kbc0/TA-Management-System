// backend/models/Swap.js
const db = require('../config/db');

class Swap {
  static async findAll(userId = null, role = null) {
    try {
      // For TAs, return swaps they're involved in (either as requester or target)
      if (userId && role === 'ta') {
        const [rows] = await db.query(
          `SELECT s.*, 
            r.full_name as requester_name, r.bilkent_id as requester_bilkent_id,
            t.full_name as target_name, t.bilkent_id as target_bilkent_id,
            CASE 
              WHEN s.assignment_type = 'task' THEN task.title
              WHEN s.assignment_type = 'exam' THEN exam.exam_name
            END as assignment_title,
            CASE 
              WHEN s.assignment_type = 'task' THEN task.task_type
              WHEN s.assignment_type = 'exam' THEN 'exam'
            END as assignment_subtype
          FROM swap_requests s
          JOIN users r ON s.requester_id = r.id
          JOIN users t ON s.target_id = t.id
          LEFT JOIN tasks task ON s.original_assignment_id = task.id AND s.assignment_type = 'task'
          LEFT JOIN exams exam ON s.original_assignment_id = exam.id AND s.assignment_type = 'exam'
          WHERE s.requester_id = ? OR s.target_id = ?
          ORDER BY s.created_at DESC`,
          [userId, userId]
        );
        return rows;
      }
      
      // For staff, department chair, and admin, return all swap requests
      if (role === 'staff' || role === 'department_chair' || role === 'admin') {
        const [rows] = await db.query(
          `SELECT s.*, 
            r.full_name as requester_name, r.bilkent_id as requester_bilkent_id,
            t.full_name as target_name, t.bilkent_id as target_bilkent_id,
            CASE 
              WHEN s.assignment_type = 'task' THEN task.title
              WHEN s.assignment_type = 'exam' THEN exam.exam_name
            END as assignment_title,
            CASE 
              WHEN s.assignment_type = 'task' THEN task.task_type
              WHEN s.assignment_type = 'exam' THEN 'exam'
            END as assignment_subtype
          FROM swap_requests s
          JOIN users r ON s.requester_id = r.id
          JOIN users t ON s.target_id = t.id
          LEFT JOIN tasks task ON s.original_assignment_id = task.id AND s.assignment_type = 'task'
          LEFT JOIN exams exam ON s.original_assignment_id = exam.id AND s.assignment_type = 'exam'
          ORDER BY s.created_at DESC`
        );
        return rows;
      }
      
      // Default fallback
      const [rows] = await db.query(
        `SELECT s.*, 
          r.full_name as requester_name, 
          t.full_name as target_name
        FROM swap_requests s
        JOIN users r ON s.requester_id = r.id
        JOIN users t ON s.target_id = t.id
        ORDER BY s.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(swapId) {
    try {
      const [rows] = await db.query(
        `SELECT s.*, 
          r.full_name as requester_name, r.bilkent_id as requester_bilkent_id, r.email as requester_email,
          t.full_name as target_name, t.bilkent_id as target_bilkent_id, t.email as target_email,
          CASE 
            WHEN s.assignment_type = 'task' THEN task.title
            WHEN s.assignment_type = 'exam' THEN exam.exam_name
          END as assignment_title,
          CASE
            WHEN s.assignment_type = 'task' THEN task.task_type
            WHEN s.assignment_type = 'exam' THEN 'exam'
          END as assignment_subtype,
          CASE
            WHEN s.assignment_type = 'task' THEN task.course_id
            WHEN s.assignment_type = 'exam' THEN exam.course_id
          END as course_id,
          rev.full_name as reviewer_name
        FROM swap_requests s
        JOIN users r ON s.requester_id = r.id
        JOIN users t ON s.target_id = t.id
        LEFT JOIN tasks task ON s.original_assignment_id = task.id AND s.assignment_type = 'task'
        LEFT JOIN exams exam ON s.original_assignment_id = exam.id AND s.assignment_type = 'exam'
        LEFT JOIN users rev ON s.reviewer_id = rev.id
        WHERE s.id = ?`,
        [swapId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT s.*, 
          r.full_name as requester_name,
          t.full_name as target_name,
          CASE 
            WHEN s.assignment_type = 'task' THEN task.title
            WHEN s.assignment_type = 'exam' THEN exam.exam_name
          END as assignment_title,
          CASE 
            WHEN s.assignment_type = 'task' THEN task.task_type
            WHEN s.assignment_type = 'exam' THEN 'exam'
          END as assignment_subtype
        FROM swap_requests s
        JOIN users r ON s.requester_id = r.id
        JOIN users t ON s.target_id = t.id
        LEFT JOIN tasks task ON s.original_assignment_id = task.id AND s.assignment_type = 'task'
        LEFT JOIN exams exam ON s.original_assignment_id = exam.id AND s.assignment_type = 'exam'
        WHERE s.requester_id = ? OR s.target_id = ?
        ORDER BY s.created_at DESC`,
        [userId, userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(swapData) {
    try {
      const { 
        requester_id, 
        target_id, 
        assignment_type, 
        original_assignment_id, 
        proposed_assignment_id,
        reason 
      } = swapData;
      
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Check if the requester is eligible for the swap
      if (assignment_type === 'task') {
        // Check if the requester is assigned to the original task
        const [requesterAssignment] = await db.query(
          'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
          [original_assignment_id, requester_id]
        );
        
        if (requesterAssignment.length === 0) {
          await db.query('ROLLBACK');
          throw new Error('Requester is not assigned to the original task');
        }
        
        // If proposed assignment is specified, check if target is assigned to it
        if (proposed_assignment_id) {
          const [targetAssignment] = await db.query(
            'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
            [proposed_assignment_id, target_id]
          );
          
          if (targetAssignment.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Target is not assigned to the proposed task');
          }
        }
      } else if (assignment_type === 'exam') {
        // For exams, find the related proctoring task
        const [examInfo] = await db.query('SELECT * FROM exams WHERE id = ?', [original_assignment_id]);
        
        if (examInfo.length === 0) {
          await db.query('ROLLBACK');
          throw new Error('Exam not found');
        }
        
        const exam = examInfo[0];
        
        // Find proctoring task related to this exam for the requester
        const [requesterTask] = await db.query(
          `SELECT t.id, ta.id as assignment_id 
           FROM tasks t 
           JOIN task_assignments ta ON t.id = ta.task_id 
           WHERE t.task_type = 'proctoring' 
           AND ta.user_id = ? 
           AND t.course_id = ?
           AND t.due_date = ?`,
          [requester_id, exam.course_id, exam.exam_date]
        );
        
        if (requesterTask.length === 0) {
          await db.query('ROLLBACK');
          throw new Error('Requester is not assigned to proctor this exam');
        }
        
        // If proposed assignment is specified, also check target's eligibility
        if (proposed_assignment_id) {
          const [proposedExamInfo] = await db.query('SELECT * FROM exams WHERE id = ?', [proposed_assignment_id]);
          
          if (proposedExamInfo.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Proposed exam not found');
          }
          
          const proposedExam = proposedExamInfo[0];
          
          // Find proctoring task related to this exam for the target
          const [targetTask] = await db.query(
            `SELECT t.id, ta.id as assignment_id 
             FROM tasks t 
             JOIN task_assignments ta ON t.id = ta.task_id 
             WHERE t.task_type = 'proctoring' 
             AND ta.user_id = ? 
             AND t.course_id = ?
             AND t.due_date = ?`,
            [target_id, proposedExam.course_id, proposedExam.exam_date]
          );
          
          if (targetTask.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Target is not assigned to proctor the proposed exam');
          }
        }
      }
      
      // Insert the swap request
      const [result] = await db.query(
        `INSERT INTO swap_requests 
         (requester_id, target_id, assignment_type, original_assignment_id, proposed_assignment_id, reason, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [requester_id, target_id, assignment_type, original_assignment_id, proposed_assignment_id, reason]
      );
      
      // Add a system log entry
      await db.query(
        `INSERT INTO system_logs (user_id, action, details, ip_address) 
         VALUES (?, 'swap_requested', ?, NULL)`,
        [
          requester_id, 
          JSON.stringify({
            swap_id: result.insertId,
            target_id,
            assignment_type,
            original_assignment_id
          })
        ]
      );
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return {
        id: result.insertId,
        status: 'pending'
      };
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async updateStatus(swapId, status, reviewerId, reviewerNotes = null) {
    try {
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Get swap details
      const [swapDetails] = await db.query(
        'SELECT * FROM swap_requests WHERE id = ?',
        [swapId]
      );
      
      if (swapDetails.length === 0) {
        await db.query('ROLLBACK');
        throw new Error('Swap request not found');
      }
      
      const swap = swapDetails[0];
      
      // Update the swap request status
      const [updateResult] = await db.query(
        `UPDATE swap_requests 
         SET status = ?, reviewer_id = ?, reviewer_notes = ?, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, reviewerId, reviewerNotes, swapId]
      );
      
      // If approved, perform the swap
      if (status === 'approved') {
        if (swap.assignment_type === 'task') {
          // Get the task assignments that need to be swapped
          const [requesterAssignment] = await db.query(
            'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
            [swap.original_assignment_id, swap.requester_id]
          );
          
          if (requesterAssignment.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Requester task assignment not found');
          }
          
          if (swap.proposed_assignment_id) {
            // Two-way swap - get target's assignment
            const [targetAssignment] = await db.query(
              'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
              [swap.proposed_assignment_id, swap.target_id]
            );
            
            if (targetAssignment.length === 0) {
              await db.query('ROLLBACK');
              throw new Error('Target task assignment not found');
            }
            
            // Update both assignments
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.target_id, requesterAssignment[0].id]
            );
            
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.requester_id, targetAssignment[0].id]
            );
          } else {
            // One-way swap - target takes over requester's task
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.target_id, requesterAssignment[0].id]
            );
          }
        } else if (swap.assignment_type === 'exam') {
          // For exam swaps, we need to find the associated proctoring tasks
          
          // Get exam details
          const [examInfo] = await db.query('SELECT * FROM exams WHERE id = ?', [swap.original_assignment_id]);
          if (examInfo.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Exam not found');
          }
          const exam = examInfo[0];
          
          // Find the proctoring task for the requester
          const [requesterTask] = await db.query(
            `SELECT t.id, ta.id as assignment_id 
             FROM tasks t 
             JOIN task_assignments ta ON t.id = ta.task_id 
             WHERE t.task_type = 'proctoring' 
             AND ta.user_id = ? 
             AND t.course_id = ?
             AND t.due_date = ?`,
            [swap.requester_id, exam.course_id, exam.exam_date]
          );
          
          if (requesterTask.length === 0) {
            await db.query('ROLLBACK');
            throw new Error('Requester proctoring task not found');
          }
          
          if (swap.proposed_assignment_id) {
            // Two-way swap
            const [proposedExamInfo] = await db.query('SELECT * FROM exams WHERE id = ?', [swap.proposed_assignment_id]);
            if (proposedExamInfo.length === 0) {
              await db.query('ROLLBACK');
              throw new Error('Proposed exam not found');
            }
            const proposedExam = proposedExamInfo[0];
            
            // Find proctoring task for the target
            const [targetTask] = await db.query(
              `SELECT t.id, ta.id as assignment_id 
               FROM tasks t 
               JOIN task_assignments ta ON t.id = ta.task_id 
               WHERE t.task_type = 'proctoring' 
               AND ta.user_id = ? 
               AND t.course_id = ?
               AND t.due_date = ?`,
              [swap.target_id, proposedExam.course_id, proposedExam.exam_date]
            );
            
            if (targetTask.length === 0) {
              await db.query('ROLLBACK');
              throw new Error('Target proctoring task not found');
            }
            
            // Update both assignments
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.target_id, requesterTask[0].assignment_id]
            );
            
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.requester_id, targetTask[0].assignment_id]
            );
          } else {
            // One-way swap
            await db.query(
              'UPDATE task_assignments SET user_id = ? WHERE id = ?',
              [swap.target_id, requesterTask[0].assignment_id]
            );
          }
        }
        
        // Add system log for the approved swap
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'swap_approved', ?, NULL)`,
          [
            reviewerId, 
            JSON.stringify({
              swap_id: swapId,
              requester_id: swap.requester_id,
              target_id: swap.target_id
            })
          ]
        );
      } else if (status === 'rejected') {
        // Add system log for the rejected swap
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'swap_rejected', ?, NULL)`,
          [
            reviewerId, 
            JSON.stringify({
              swap_id: swapId,
              requester_id: swap.requester_id,
              target_id: swap.target_id,
              reason: reviewerNotes
            })
          ]
        );
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return {
        success: updateResult.affectedRows > 0,
        status
      };
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async delete(swapId, userId, role) {
    try {
      // Only allow deletion of pending swaps by the requester or an admin
      let query = 'DELETE FROM swap_requests WHERE id = ?';
      let params = [swapId];

      if (role !== 'admin') {
        query += ' AND requester_id = ? AND status = "pending"';
        params.push(userId);
      }

      const [result] = await db.query(query, params);
      
      if (result.affectedRows > 0) {
        // Log the deletion
        await db.query(
          `INSERT INTO system_logs (user_id, action, details, ip_address) 
           VALUES (?, 'swap_deleted', ?, NULL)`,
          [userId, JSON.stringify({ swap_id: swapId })]
        );
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getEligibleTargets(requesterId, assignmentId, type) {
    try {
      let eligibleUsers = [];
      
      if (type === 'task') {
        // Get task details
        const [taskDetails] = await db.query(
          'SELECT * FROM tasks WHERE id = ?', 
          [assignmentId]
        );
        
        if (taskDetails.length === 0) {
          throw new Error('Task not found');
        }
        
        const task = taskDetails[0];
        
        // Find TAs not on leave who have appropriate skills
        const [users] = await db.query(
          `SELECT u.id, u.full_name, u.bilkent_id, u.email
           FROM users u
           WHERE u.role = 'ta'
           AND u.status = 'active'
           AND u.id != ?
           AND NOT EXISTS (
             SELECT 1 FROM leave_requests lr
             WHERE lr.user_id = u.id
             AND lr.status = 'approved'
             AND ? BETWEEN lr.start_date AND lr.end_date
           )
           ORDER BY u.full_name`,
          [requesterId, task.due_date]
        );
        
        eligibleUsers = users;
      } else if (type === 'exam') {
        // Get exam details
        const [examDetails] = await db.query(
          'SELECT * FROM exams WHERE id = ?', 
          [assignmentId]
        );
        
        if (examDetails.length === 0) {
          throw new Error('Exam not found');
        }
        
        const exam = examDetails[0];
        
        // Find TAs not on leave during the exam date
        const [users] = await db.query(
          `SELECT u.id, u.full_name, u.bilkent_id, u.email
           FROM users u
           WHERE u.role = 'ta'
           AND u.status = 'active'
           AND u.id != ?
           AND NOT EXISTS (
             SELECT 1 FROM leave_requests lr
             WHERE lr.user_id = u.id
             AND lr.status = 'approved'
             AND ? BETWEEN lr.start_date AND lr.end_date
           )
           ORDER BY u.full_name`,
          [requesterId, exam.exam_date]
        );
        
        eligibleUsers = users;
      }
      
      return eligibleUsers;
    } catch (error) {
      throw error;
    }
  }

  static async getSwapStatistics(userId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_swaps,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN assignment_type = 'task' THEN 1 ELSE 0 END) as task_swaps,
          SUM(CASE WHEN assignment_type = 'exam' THEN 1 ELSE 0 END) as exam_swaps
        FROM swap_requests
      `;
      
      let params = [];
      
      if (userId) {
        query += ' WHERE requester_id = ? OR target_id = ?';
        params.push(userId, userId);
      }
      
      const [rows] = await db.query(query, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Swap;