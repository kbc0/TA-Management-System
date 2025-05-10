// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  assignTA,
  updateTAAssignment,
  removeTA,
  getCourseTAs,
  getTACourses
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// All course routes require authentication
router.use(authenticate);

// Course management routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Course creation/modification routes with permission-based access control
router.post('/', requirePermission(PERMISSIONS.CREATE_COURSE), createCourse);
router.put('/:id', requirePermission(PERMISSIONS.UPDATE_COURSE), updateCourse);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_COURSE), deleteCourse);

// TA assignment routes with permission-based access control
router.post('/:id/tas', requirePermission(PERMISSIONS.CREATE_ASSIGNMENT), assignTA);
router.put('/:courseId/tas/:assignmentId', requirePermission(PERMISSIONS.UPDATE_ASSIGNMENT), updateTAAssignment);
router.delete('/:courseId/tas/:taId', requirePermission(PERMISSIONS.DELETE_ASSIGNMENT), removeTA);
router.get('/:id/tas', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), getCourseTAs);

// Get courses for a specific TA
router.get('/ta/:id', requirePermission(PERMISSIONS.VIEW_COURSES), getTACourses);

module.exports = router;
