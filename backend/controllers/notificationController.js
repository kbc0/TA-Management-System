// backend/controllers/notificationController.js
const Notification = require('../models/Notification');
const loggingService = require('../services/loggingService');

/**
 * Get all notifications for the current user
 * @route GET /api/notifications
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const { unread_only, limit } = req.query;
    const unreadOnly = unread_only === 'true';
    const limitNum = limit ? parseInt(limit) : 50;
    
    const notifications = await Notification.findByUserId(req.user.id, unreadOnly, limitNum);
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      notifications,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications', error: error.message });
  }
};

/**
 * Get unread notification count for the current user
 * @route GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error while fetching unread count', error: error.message });
  }
};

/**
 * Mark a notification as read
 * @route PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Check if notification exists and belongs to the user
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to access this notification' });
    }
    
    // Mark as read
    const success = await Notification.markAsRead(notificationId, req.user.id);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to mark notification as read' });
    }
    
    res.json({ message: 'Notification marked as read' });
    
    // Log the action
    await loggingService.log({
      action: 'notification_marked_read',
      entity: 'notification',
      entity_id: notificationId,
      user_id: req.user?.bilkentId,
      description: 'User marked notification as read',
      metadata: { user_role: req.user?.role }
    }, req);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while marking notification as read', error: error.message });
  }
};

/**
 * Mark all notifications as read for the current user
 * @route PATCH /api/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const count = await Notification.markAllAsRead(req.user.id);
    
    res.json({
      message: 'All notifications marked as read',
      count
    });
    
    // Log the action
    await loggingService.log({
      action: 'all_notifications_marked_read',
      entity: 'notification',
      user_id: req.user?.bilkentId,
      description: `User marked ${count} notifications as read`,
      metadata: { 
        user_role: req.user?.role,
        count
      }
    }, req);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error while marking all notifications as read', error: error.message });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Check if notification exists and belongs to the user
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this notification' });
    }
    
    // Delete notification
    const success = await Notification.delete(notificationId, req.user.id);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to delete notification' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
    
    // Log the action
    await loggingService.log({
      action: 'notification_deleted',
      entity: 'notification',
      entity_id: notificationId,
      user_id: req.user?.bilkentId,
      description: 'User deleted notification',
      metadata: { user_role: req.user?.role }
    }, req);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification', error: error.message });
  }
};

/**
 * Delete all notifications for the current user
 * @route DELETE /api/notifications/delete-all
 */
exports.deleteAllNotifications = async (req, res) => {
  try {
    const count = await Notification.deleteAll(req.user.id);
    
    res.json({
      message: 'All notifications deleted successfully',
      count
    });
    
    // Log the action
    await loggingService.log({
      action: 'all_notifications_deleted',
      entity: 'notification',
      user_id: req.user?.bilkentId,
      description: `User deleted ${count} notifications`,
      metadata: { 
        user_role: req.user?.role,
        count
      }
    }, req);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Server error while deleting all notifications', error: error.message });
  }
};

/**
 * Create a notification (admin only)
 * @route POST /api/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    // Only admins, department chairs, and staff can create notifications for other users
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized to create notifications' });
    }
    
    const { user_id, type, title, message, link, data } = req.body;
    
    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['user_id', 'type', 'title', 'message']
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      link,
      data
    });
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
    
    // Log the action
    await loggingService.log({
      action: 'notification_created',
      entity: 'notification',
      entity_id: notification.id,
      user_id: req.user?.bilkentId,
      description: `User created notification for user ID ${user_id}`,
      metadata: { 
        user_role: req.user?.role,
        notification_type: type,
        target_user_id: user_id
      }
    }, req);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error while creating notification', error: error.message });
  }
};

/**
 * Create notifications for multiple users (admin only)
 * @route POST /api/notifications/bulk
 */
exports.createBulkNotifications = async (req, res) => {
  try {
    // Only admins, department chairs, and staff can create notifications for other users
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized to create bulk notifications' });
    }
    
    const { user_ids, type, title, message, link, data } = req.body;
    
    // Validate required fields
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required and must not be empty' });
    }
    
    if (!type || !title || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['type', 'title', 'message']
      });
    }
    
    // Create notifications for multiple users
    const count = await Notification.createForMultipleUsers(user_ids, {
      type,
      title,
      message,
      link,
      data
    });
    
    res.status(201).json({
      message: 'Bulk notifications created successfully',
      count
    });
    
    // Log the action
    await loggingService.log({
      action: 'bulk_notifications_created',
      entity: 'notification',
      user_id: req.user?.bilkentId,
      description: `User created ${count} notifications for ${user_ids.length} users`,
      metadata: { 
        user_role: req.user?.role,
        notification_type: type,
        target_user_count: user_ids.length
      }
    }, req);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({ message: 'Server error while creating bulk notifications', error: error.message });
  }
};

/**
 * Create test notifications for the current user
 * @route POST /api/notifications/test
 */
exports.createTestNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create test notifications
    const notifications = await Notification.createTestNotifications(userId);
    
    res.status(201).json({
      message: 'Test notifications created successfully',
      count: notifications.length,
      notifications
    });
    
    // Log the action
    await loggingService.log({
      action: 'test_notifications_created',
      entity: 'notification',
      user_id: req.user?.bilkentId,
      description: `User created ${notifications.length} test notifications`,
      metadata: { 
        user_role: req.user?.role,
        count: notifications.length
      }
    }, req);
  } catch (error) {
    console.error('Error creating test notifications:', error);
    res.status(500).json({ message: 'Server error while creating test notifications', error: error.message });
  }
};

module.exports = exports;
