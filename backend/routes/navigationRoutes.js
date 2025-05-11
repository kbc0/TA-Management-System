// backend/routes/navigationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const swapController = require('../controllers/swapController');
const leaveController = require('../controllers/leaveController');
const taskController = require('../controllers/taskController');

// All routes are protected and require authentication
router.use(protect);

/**
 * Routes that match the exact navigation bar links
 */

// Dashboard route - redirects to home
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard route' });
});

// Request Leave route
router.get('/request-leave', (req, res) => {
  res.json({ message: 'Request Leave form' });
});

// Initiate Swap route
router.get('/initiate-swap', (req, res) => {
  res.json({ message: 'Initiate Swap form' });
});

// My Swap Requests route
router.get('/my-swap-requests', (req, res) => {
  // Redirect to the existing my-swaps endpoint
  swapController.getMySwaps(req, res);
});

// Leave Statistics route
router.get('/leave-statistics', (req, res) => {
  // Redirect to the existing statistics endpoint
  leaveController.getLeaveStatistics(req, res);
});

module.exports = router;
