// backend/models/Notification.js
const db = require('../config/db');

class Notification {
  /**
   * Find all notifications for a user
   * @param {number} userId - The user ID
   * @param {boolean} unreadOnly - Whether to return only unread notifications
   * @param {number} limit - Maximum number of notifications to return
   * @returns {Promise<Array>} Array of notification objects
   */
  static async findByUserId(userId, unreadOnly = false, limit = 50) {
    try {
      let query = `
        SELECT * FROM notifications
        WHERE user_id = ?
      `;
      
      if (unreadOnly) {
        query += ' AND is_read = 0';
      }
      
      query += ' ORDER BY created_at DESC LIMIT ?';
      
      const [rows] = await db.query(query, [userId, limit]);
      return rows;
    } catch (error) {
      console.error('Error finding notifications:', error);
      throw error;
    }
  }

  /**
   * Find a notification by ID
   * @param {number} id - The notification ID
   * @returns {Promise<Object|null>} The notification object or null if not found
   */
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding notification by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - The notification data
   * @param {number} notificationData.user_id - The user ID
   * @param {string} notificationData.type - The notification type
   * @param {string} notificationData.title - The notification title
   * @param {string} notificationData.message - The notification message
   * @param {string} notificationData.link - Optional link to relevant resource
   * @param {Object} notificationData.data - Optional additional data (stored as JSON)
   * @returns {Promise<Object>} The created notification object
   */
  static async create(notificationData) {
    try {
      const { user_id, type, title, message, link = null, data = null } = notificationData;
      
      // Validate required fields
      if (!user_id || !type || !title || !message) {
        throw new Error('Missing required notification fields');
      }
      
      const [result] = await db.query(
        `INSERT INTO notifications 
         (user_id, type, title, message, link, data, is_read, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
        [
          user_id,
          type,
          title,
          message,
          link,
          data ? JSON.stringify(data) : null
        ]
      );
      
      return {
        id: result.insertId,
        ...notificationData,
        is_read: 0,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {number} id - The notification ID
   * @param {number} userId - The user ID (for security check)
   * @returns {Promise<boolean>} Whether the update was successful
   */
  static async markAsRead(id, userId) {
    try {
      const [result] = await db.query(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications for a user as read
   * @param {number} userId - The user ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  static async markAllAsRead(userId) {
    try {
      const [result] = await db.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {number} id - The notification ID
   * @param {number} userId - The user ID (for security check)
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  static async delete(id, userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   * @param {number} userId - The user ID
   * @returns {Promise<number>} Number of notifications deleted
   */
  static async deleteAll(userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM notifications WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - The user ID
   * @returns {Promise<number>} The number of unread notifications
   */
  static async getUnreadCount(userId) {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }

  /**
   * Create test notifications for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} Array of created notification objects
   */
  static async createTestNotifications(userId) {
    try {
      const notificationTemplates = [
        {
          type: 'task',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task: Grading Midterm Exams'
        },
        {
          type: 'info',
          title: 'Course Schedule Updated',
          message: 'The schedule for CS201 has been updated. Please check the course page.'
        },
        {
          type: 'warning',
          title: 'Deadline Approaching',
          message: 'You have a task due in 2 days. Please complete it on time.'
        },
        {
          type: 'event',
          title: 'Department Meeting',
          message: 'There will be a department meeting on Friday at 2:00 PM.'
        },
        {
          type: 'task',
          title: 'Task Status Updated',
          message: 'Your task "Prepare Lab Materials" has been marked as completed.'
        }
      ];
      
      const createdNotifications = [];
      
      // Create one of each notification type
      for (const template of notificationTemplates) {
        const notification = await this.create({
          user_id: userId,
          ...template,
          is_read: Math.random() > 0.7 // 30% chance of being read
        });
        
        createdNotifications.push(notification);
      }
      
      return createdNotifications;
    } catch (error) {
      console.error('Error creating test notifications:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {Object} notificationData - The notification data (without user_id)
   * @returns {Promise<number>} Number of notifications created
   */
  static async createForMultipleUsers(userIds, notificationData) {
    try {
      if (!userIds.length) {
        return 0;
      }
      
      const { type, title, message, link = null, data = null } = notificationData;
      
      // Validate required fields
      if (!type || !title || !message) {
        throw new Error('Missing required notification fields');
      }
      
      // Prepare values for bulk insert
      const values = userIds.map(userId => [
        userId,
        type,
        title,
        message,
        link,
        data ? JSON.stringify(data) : null,
        0, // is_read
        new Date() // created_at
      ]);
      
      const [result] = await db.query(
        `INSERT INTO notifications 
         (user_id, type, title, message, link, data, is_read, created_at) 
         VALUES ?`,
        [values]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error creating notifications for multiple users:', error);
      throw error;
    }
  }
}

module.exports = Notification;
