// backend/routes/swapRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllSwaps, 
  getSwapById, 
  getMySwaps,
  createSwap, 
  updateSwapStatus, 
  deleteSwap,
  getEligibleTargets,
  getSwapStatistics
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected and require authentication
router.use(protect);

/**
 * @route GET /api/swaps
 * @desc Get all swap requests (filtered by user role)
 * @access Private
 */
router.get('/', getAllSwaps);

/**
 * @route GET /api/swaps/my-swaps
 * @desc Get all swap requests involving the current user
 * @access Private
 */
router.get('/my-swaps', getMySwaps);

/**
 * @route GET /api/swaps/statistics
 * @desc Get swap request statistics
 * @access Private
 */
router.get('/statistics', getSwapStatistics);

/**
 * @route GET /api/swaps/eligible-targets/:assignmentId/:type
 * @desc Get eligible target users for a swap
 * @access Private
 */
router.get('/eligible-targets/:assignmentId/:type', getEligibleTargets);

/**
 * @route GET /api/swaps/:id
 * @desc Get a specific swap request
 * @access Private
 */
router.get('/:id', getSwapById);

/**
 * @route POST /api/swaps
 * @desc Create a new swap request
 * @access Private
 */
router.post('/', createSwap);

/**
 * @route PUT /api/swaps/:id/status
 * @desc Update a swap request status (approve/reject)
 * @access Private (requires being target user or a staff/admin)
 */
router.put('/:id/status', updateSwapStatus);

/**
 * @route DELETE /api/swaps/:id
 * @desc Delete a swap request
 * @access Private
 */
router.delete('/:id', deleteSwap);

module.exports = router;