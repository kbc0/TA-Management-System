// backend/routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllLeaves, 
  getLeaveById, 
  getMyLeaves,
  createLeave, 
  updateLeaveStatus, 
  deleteLeave,
  getLeaveStatistics
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and require authentication
router.use(protect);

/**
 * @route GET /api/leaves
 * @desc Get all leave requests (filtered by user role)
 * @access Private
 */
router.get('/', getAllLeaves);

/**
 * @route GET /api/leaves/my-leaves
 * @desc Get all leave requests for the current user
 * @access Private
 */
router.get('/my-leaves', getMyLeaves);

/**
 * @route GET /api/leaves/statistics
 * @desc Get leave request statistics
 * @access Private
 */
router.get('/statistics', getLeaveStatistics);

/**
 * @route GET /api/leaves/:id
 * @desc Get a specific leave request
 * @access Private
 */
router.get('/:id', getLeaveById);

/**
 * @route POST /api/leaves
 * @desc Create a new leave request
 * @access Private
 */
router.post('/', createLeave);

/**
 * @route PUT /api/leaves/:id/status
 * @desc Update a leave request status (approve/reject)
 * @access Private (department_chair, admin, staff)
 */
router.put('/:id/status', authorize('department_chair', 'admin', 'staff'), updateLeaveStatus);

/**
 * @route DELETE /api/leaves/:id
 * @desc Delete a leave request
 * @access Private
 */
router.delete('/:id', deleteLeave);

module.exports = router;