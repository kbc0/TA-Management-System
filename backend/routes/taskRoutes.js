// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllTasks, 
  getTaskById, 
  getUpcomingTasks,
  createTask, 
  updateTask, 
  completeTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and require authentication
router.use(protect);

// Get upcoming tasks
router.get('/upcoming', getUpcomingTasks);

// Get all tasks (filtered by user role & id)
router.get('/', getAllTasks);

// Get a specific task
router.get('/:id', getTaskById);

// Create a new task - only instructors, department chair, and admin can create tasks
router.post('/', authorize('staff', 'department_chair', 'admin'), createTask);

// Update a task
router.put('/:id', updateTask);

// Mark a task as completed
router.put('/:id/complete', completeTask);

// Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
