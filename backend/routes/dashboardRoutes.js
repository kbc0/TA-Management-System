// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardData,
  getSystemStatistics,
  getWorkloadReport
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// All routes are protected and require authentication
router.use(protect);

/**
 * @route GET /api/dashboard
 * @desc Get dashboard data for the current user
 * @access Private
 */
router.get('/', getDashboardData);

/**
 * @route GET /api/dashboard/statistics
 * @desc Get system statistics
 * @access Private (admin, department_chair)
 */
router.get('/statistics', requirePermission(PERMISSIONS.VIEW_REPORTS), getSystemStatistics);

/**
 * @route GET /api/dashboard/workload
 * @desc Get workload report for TAs
 * @access Private (admin, department_chair, staff)
 */
router.get('/workload', requirePermission(PERMISSIONS.VIEW_REPORTS), getWorkloadReport);

module.exports = router;
