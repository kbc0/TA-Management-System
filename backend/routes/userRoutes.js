// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserRole, deactivateUser, createUser, getAllTAs, updateUser, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { PERMISSIONS } = require('../config/roles');

// User management routes - all require authentication
router.use(protect);

// Get all users - requires VIEW_USERS permission
router.get('/', requirePermission(PERMISSIONS.VIEW_USERS), getUsers);

// Get all TAs - requires VIEW_USERS permission
router.get('/tas', requirePermission(PERMISSIONS.VIEW_USERS), getAllTAs);

// Create new user - requires CREATE_USER permission
router.post('/', requirePermission(PERMISSIONS.CREATE_USER), createUser);

// Get user by ID - requires VIEW_USERS permission
router.get('/:id', requirePermission(PERMISSIONS.VIEW_USERS), getUserById);

// Update user role - requires UPDATE_USER permission
router.patch('/:id/role', requirePermission(PERMISSIONS.UPDATE_USER), updateUserRole);

// Deactivate user - requires DELETE_USER permission
router.patch('/:id/deactivate', requirePermission(PERMISSIONS.DELETE_USER), deactivateUser);

// Update user profile - no special permission required as there are checks in the controller
router.patch('/:id', updateUser);

// Change user password - no special permission required as there are checks in the controller
router.patch('/:id/password', changePassword);

module.exports = router;
