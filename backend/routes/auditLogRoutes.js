// backend/routes/auditLogRoutes.js
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { auditLogger } = require('../middleware/auditLogger');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
// Assuming you have a middleware to check for admin role
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin']));

// Apply audit logging middleware
router.use(auditLogger({
  entity: 'audit_log',
  action: 'access',
  getDescription: (req) => `Admin accessed audit logs: ${req.method} ${req.originalUrl}`
}));

// Get all logs with filtering
router.get('/', auditLogController.getLogs);

// Get logs by entity
router.get('/entity/:entity/:entityId', auditLogController.getEntityLogs);

// Get logs by user
router.get('/user/:userId', auditLogController.getUserLogs);

// Get logs by action
router.get('/action/:action', auditLogController.getActionLogs);

// Get log statistics
router.get('/stats', auditLogController.getLogStats);

module.exports = router;
