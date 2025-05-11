// backend/services/NotificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Send a notification to a user
   * @param {number} userId - The user ID
   * @param {string} type - The notification type
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} link - Optional link to relevant resource
   * @param {Object} data - Optional additional data
   * @returns {Promise<Object>} The created notification
   */
  static async sendToUser(userId, type, title, message, link = null, data = null) {
    try {
      return await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        link,
        data
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notifications to multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} type - The notification type
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} link - Optional link to relevant resource
   * @param {Object} data - Optional additional data
   * @returns {Promise<number>} Number of notifications created
   */
  static async sendToMultipleUsers(userIds, type, title, message, link = null, data = null) {
    try {
      return await Notification.createForMultipleUsers(userIds, {
        type,
        title,
        message,
        link,
        data
      });
    } catch (error) {
      console.error('Error sending notifications to multiple users:', error);
      throw error;
    }
  }

  /**
   * Send notifications to users with a specific role
   * @param {string} role - The user role
   * @param {string} type - The notification type
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} link - Optional link to relevant resource
   * @param {Object} data - Optional additional data
   * @returns {Promise<number>} Number of notifications created
   */
  static async sendToRole(role, type, title, message, link = null, data = null) {
    try {
      // Get all users with the specified role
      const users = await User.findByRole(role);
      const userIds = users.map(user => user.id);
      
      return await this.sendToMultipleUsers(userIds, type, title, message, link, data);
    } catch (error) {
      console.error(`Error sending notifications to role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Send a task assignment notification
   * @param {number} userId - The user ID
   * @param {Object} task - The task object
   * @returns {Promise<Object>} The created notification
   */
  static async sendTaskAssignment(userId, task) {
    try {
      return await this.sendToUser(
        userId,
        'task_assignment',
        'New Task Assignment',
        `You have been assigned a new ${task.task_type} task: ${task.title}`,
        `/tasks/${task.id}`,
        { task_id: task.id, task_type: task.task_type, due_date: task.due_date }
      );
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      throw error;
    }
  }

  /**
   * Send a task reminder notification
   * @param {number} userId - The user ID
   * @param {Object} task - The task object
   * @returns {Promise<Object>} The created notification
   */
  static async sendTaskReminder(userId, task) {
    try {
      // Calculate days remaining
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      let message;
      if (daysRemaining <= 0) {
        message = `Task "${task.title}" is due today!`;
      } else if (daysRemaining === 1) {
        message = `Task "${task.title}" is due tomorrow!`;
      } else {
        message = `Task "${task.title}" is due in ${daysRemaining} days.`;
      }
      
      return await this.sendToUser(
        userId,
        'task_reminder',
        'Task Reminder',
        message,
        `/tasks/${task.id}`,
        { task_id: task.id, task_type: task.task_type, due_date: task.due_date, days_remaining: daysRemaining }
      );
    } catch (error) {
      console.error('Error sending task reminder notification:', error);
      throw error;
    }
  }

  /**
   * Send a leave request status notification
   * @param {number} userId - The user ID
   * @param {Object} leave - The leave request object
   * @returns {Promise<Object>} The created notification
   */
  static async sendLeaveStatusUpdate(userId, leave) {
    try {
      const statusText = leave.status.charAt(0).toUpperCase() + leave.status.slice(1);
      
      return await this.sendToUser(
        userId,
        'leave_status',
        `Leave Request ${statusText}`,
        `Your leave request from ${new Date(leave.start_date).toLocaleDateString()} to ${new Date(leave.end_date).toLocaleDateString()} has been ${leave.status}.`,
        `/leaves/${leave.id}`,
        { leave_id: leave.id, status: leave.status, reviewer_notes: leave.reviewer_notes }
      );
    } catch (error) {
      console.error('Error sending leave status notification:', error);
      throw error;
    }
  }

  /**
   * Send a swap request notification
   * @param {number} userId - The user ID
   * @param {Object} swap - The swap request object
   * @returns {Promise<Object>} The created notification
   */
  static async sendSwapRequest(userId, swap) {
    try {
      return await this.sendToUser(
        userId,
        'swap_request',
        'New Swap Request',
        `${swap.requester_name} has requested to swap ${swap.assignment_type === 'task' ? 'task' : 'exam'} with you.`,
        `/swaps/${swap.id}`,
        { swap_id: swap.id, requester_id: swap.requester_id, assignment_type: swap.assignment_type }
      );
    } catch (error) {
      console.error('Error sending swap request notification:', error);
      throw error;
    }
  }

  /**
   * Send a swap status notification
   * @param {number} userId - The user ID
   * @param {Object} swap - The swap request object
   * @returns {Promise<Object>} The created notification
   */
  static async sendSwapStatusUpdate(userId, swap) {
    try {
      const statusText = swap.status.charAt(0).toUpperCase() + swap.status.slice(1);
      
      return await this.sendToUser(
        userId,
        'swap_status',
        `Swap Request ${statusText}`,
        `Your swap request with ${swap.target_name} has been ${swap.status}.`,
        `/swaps/${swap.id}`,
        { swap_id: swap.id, status: swap.status, reviewer_notes: swap.reviewer_notes }
      );
    } catch (error) {
      console.error('Error sending swap status notification:', error);
      throw error;
    }
  }

  /**
   * Send a course assignment notification
   * @param {number} userId - The user ID
   * @param {Object} course - The course object
   * @param {Object} assignment - The assignment object
   * @returns {Promise<Object>} The created notification
   */
  static async sendCourseAssignment(userId, course, assignment) {
    try {
      return await this.sendToUser(
        userId,
        'course_assignment',
        'New Course Assignment',
        `You have been assigned as a TA for ${course.course_code}: ${course.course_name}.`,
        `/courses/${course.id}`,
        { 
          course_id: course.id, 
          course_code: course.course_code,
          hours_per_week: assignment.hours_per_week,
          start_date: assignment.start_date,
          end_date: assignment.end_date
        }
      );
    } catch (error) {
      console.error('Error sending course assignment notification:', error);
      throw error;
    }
  }

  /**
   * Send a system announcement
   * @param {string} title - The announcement title
   * @param {string} message - The announcement message
   * @param {string} link - Optional link to relevant resource
   * @param {Array<string>} roles - Optional array of roles to target (defaults to all)
   * @returns {Promise<number>} Number of notifications created
   */
  static async sendSystemAnnouncement(title, message, link = null, roles = null) {
    try {
      let userIds = [];
      
      if (roles && Array.isArray(roles) && roles.length > 0) {
        // Get users with the specified roles
        for (const role of roles) {
          const users = await User.findByRole(role);
          userIds.push(...users.map(user => user.id));
        }
      } else {
        // Get all active users
        const users = await User.findAll({ status: 'active' });
        userIds = users.map(user => user.id);
      }
      
      // Remove duplicates
      userIds = [...new Set(userIds)];
      
      return await this.sendToMultipleUsers(
        userIds,
        'system_announcement',
        title,
        message,
        link,
        { announcement_date: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Error sending system announcement:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
