// backend/routes/auditLogRoutes.js
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { auditLogger } = require('../middleware/auditLogger');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
// Allow users with admin role to access audit logs
router.use(authMiddleware.authenticate);
// Fix: use lowercase 'admin' to match the actual role name in the system
router.use((req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
});

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
