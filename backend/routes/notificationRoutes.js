// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  createBulkNotifications,
  createTestNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// All routes are protected and require authentication
router.use(protect);

/**
 * @route GET /api/notifications
 * @desc Get all notifications for the current user
 * @access Private
 */
router.get('/', getMyNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notification count for the current user
 * @access Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.patch('/:id/read', markAsRead);

/**
 * @route PATCH /api/notifications/mark-all-read
 * @desc Mark all notifications as read for the current user
 * @access Private
 */
router.patch('/mark-all-read', markAllAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', deleteNotification);

/**
 * @route DELETE /api/notifications/delete-all
 * @desc Delete all notifications for the current user
 * @access Private
 */
router.delete('/delete-all', deleteAllNotifications);

/**
 * @route POST /api/notifications
 * @desc Create a notification (admin only)
 * @access Private (admin, department_chair, staff)
 */
router.post('/', requirePermission(PERMISSIONS.MANAGE_USERS), createNotification);

/**
 * @route POST /api/notifications/bulk
 * @desc Create notifications for multiple users (admin only)
 * @access Private (admin, department_chair, staff)
 */
router.post('/bulk', requirePermission(PERMISSIONS.MANAGE_USERS), createBulkNotifications);

/**
 * @route POST /api/notifications/test
 * @desc Create test notifications for the current user
 * @access Private
 */
router.post('/test', createTestNotifications);

module.exports = router;
