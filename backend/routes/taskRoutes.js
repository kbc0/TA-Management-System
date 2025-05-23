// routes/taskRoutes.js - Example of updating route registration

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// All routes are protected
router.use(protect);

// Protect using permission-based checks (from D1)
router.get('/', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getAllTasks);
router.get('/statistics', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getTaskStatistics);
router.get('/upcoming', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getUpcomingTasks);
router.get('/my-tasks', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getMyTasks);
router.get('/course/:courseId', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getTasksByCourse);
router.get('/:id', requirePermission(PERMISSIONS.VIEW_ASSIGNMENTS), taskController.getTaskById);
router.post('/', requirePermission(PERMISSIONS.CREATE_ASSIGNMENT), taskController.createTask);
router.put('/:id', requirePermission(PERMISSIONS.UPDATE_ASSIGNMENT), taskController.updateTask);
router.put('/:id/complete', requirePermission(PERMISSIONS.UPDATE_ASSIGNMENT), taskController.completeTask);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_ASSIGNMENT), taskController.deleteTask);

module.exports = router;