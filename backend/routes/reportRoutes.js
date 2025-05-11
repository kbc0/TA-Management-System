// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getTAPerformanceReport,
  getCourseUtilizationReport,
  getSemesterSummaryReport,
  exportData
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// All routes are protected and require authentication
router.use(protect);

/**
 * @route GET /api/reports/ta-performance
 * @desc Generate a TA performance report
 * @access Private (admin, department_chair, staff)
 */
router.get('/ta-performance', requirePermission(PERMISSIONS.VIEW_REPORTS), getTAPerformanceReport);

/**
 * @route GET /api/reports/course-utilization
 * @desc Generate a course utilization report
 * @access Private (admin, department_chair)
 */
router.get('/course-utilization', requirePermission(PERMISSIONS.VIEW_REPORTS), getCourseUtilizationReport);

/**
 * @route GET /api/reports/semester-summary
 * @desc Generate a semester summary report
 * @access Private (admin, department_chair)
 */
router.get('/semester-summary', requirePermission(PERMISSIONS.VIEW_REPORTS), getSemesterSummaryReport);

/**
 * @route GET /api/reports/export/:type
 * @desc Export data to CSV format
 * @access Private (admin, department_chair)
 */
router.get('/export/:type', requirePermission(PERMISSIONS.VIEW_REPORTS), exportData);

module.exports = router;
