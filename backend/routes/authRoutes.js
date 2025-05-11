// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  login, 
  recoverPassword, 
  resetPassword, 
  logout, 
  signup 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { 
  validate, 
  authValidation, 
  normalizeParams 
} = require('../middleware/validationMiddleware');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', normalizeParams, validate(authValidation.login), login);

/**
 * @route POST /api/auth/recover-password
 * @desc Send password recovery email
 * @access Public
 */
router.post('/recover-password', normalizeParams, validate(authValidation.recoverPassword), recoverPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password
 * @access Public
 */
router.post('/reset-password', normalizeParams, validate(authValidation.resetPassword), resetPassword);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side implementation)
 * @access Private
 */
router.post('/logout', protect, logout);

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', normalizeParams, validate(authValidation.signup), signup);

module.exports = router;