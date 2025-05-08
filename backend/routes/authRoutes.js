const express = require('express');
const router = express.Router();
const { login, recoverPassword, resetPassword, logout, signup } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);
router.post('/signup', signup);


module.exports = router;
