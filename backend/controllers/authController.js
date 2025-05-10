// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const loggingService = require('../services/LoggingService');
const { ROLES, isValidRole, getPermissionsForRole } = require('../config/roles');

// Store reset tokens temporarily (In production, use a database)
const resetTokens = {};

// Set up transporter for email
let transporter;

// Check if we're in development mode
if (process.env.NODE_ENV === 'development' || !process.env.MAIL_HOST) {
  console.log('Using mock email transport for development');
  // Create a mock transporter that logs emails instead of sending them
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('Mock email sent:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html || mailOptions.text);
      return { messageId: 'mock-email-id-' + Date.now() };
    }
  };
} else {
  // Use real nodemailer transport for production
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
}

/**
 * Validates request parameters and returns missing or invalid fields
 * @param {Object} params - The parameters to validate
 * @param {Array} required - List of required field names
 * @returns {Object} - Object containing validation results
 */
const validateParams = (params, required) => {
  const missingFields = [];
  const errors = {};
  
  // Check for missing required fields
  required.forEach(field => {
    if (!params[field] && params[field] !== 0) {
      missingFields.push(field);
    }
  });
  
  // Email format validation (if email is provided)
  if (params.email && !params.email.endsWith('@bilkent.edu.tr')) {
    errors.email = 'Must use a Bilkent email address ending with @bilkent.edu.tr';
  }
  
  // Password strength validation (if password is provided)
  if (params.password && params.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  return {
    isValid: missingFields.length === 0 && Object.keys(errors).length === 0,
    missingFields,
    errors
  };
};

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @param {string} bilkentId - User's Bilkent ID
 * @param {string} email - User's email (must be @bilkent.edu.tr)
 * @param {string} fullName - User's full name
 * @param {string} password - User's password (min 6 characters)
 * @param {string} [role] - User's role (defaults to 'ta')
 */
exports.signup = async (req, res) => {
  try {
    // Normalize parameters - accept both camelCase and snake_case
    const bilkentId = req.body.bilkentId || req.body.bilkent_id;
    const email = req.body.email;
    const fullName = req.body.fullName || req.body.full_name;
    const password = req.body.password;
    const role = req.body.role;

    // Validate input
    const validation = validateParams(
      { bilkentId, email, fullName, password },
      ['bilkentId', 'email', 'fullName', 'password']
    );

    if (!validation.isValid) {
      const errorResponse = {
        message: 'Validation failed',
        details: {}
      };
      
      if (validation.missingFields.length > 0) {
        errorResponse.details.missingFields = validation.missingFields;
      }
      
      if (Object.keys(validation.errors).length > 0) {
        errorResponse.details.errors = validation.errors;
      }
      
      return res.status(400).json(errorResponse);
    }

    // Check if user already exists
    const existingUser = await User.findByBilkentId(bilkentId);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this Bilkent ID already exists' });
    }

    // Check if email is already in use
    const emailExists = await User.findByEmail(email);
    if (emailExists) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    // Validate role using our role configuration
    if (role && !isValidRole(role)) {
      // Get the list of valid roles for better error reporting
      const validRoles = Object.values(ROLES);
      return res.status(400).json({ 
        message: 'Invalid role specified',
        validRoles
      });
    }

    // Create new user
    const newUser = await User.create({
      bilkent_id: bilkentId,
      email,
      full_name: fullName,
      password, // The User model should handle password hashing
      role: role || ROLES.TEACHING_ASSISTANT // Default role if not specified
    });

    // Get permissions for the user's role
    const permissions = getPermissionsForRole(newUser.role);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        bilkentId: newUser.bilkent_id, 
        role: newUser.role,
        permissions: permissions
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        bilkentId: newUser.bilkent_id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        permissions: permissions
      }
    });
    
    // Log the signup event
    await loggingService.logAuth(
      'signup',
      newUser,
      `User ${newUser.bilkent_id} registered successfully`,
      { role: newUser.role, email: newUser.email },
      req
    );
  } catch (error) {
    console.error('Signup error:', error);
    
    // Log the error
    await loggingService.logError(
      'user',
      error,
      null,
      'Error during user signup',
      req
    );
    
    // Only include detailed errors in development
    const errorResponse = { message: 'Server error during signup' };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
    }
    res.status(500).json(errorResponse);
  }
};

/**
 * Log in a user
 * @route POST /api/auth/login
 * @param {string} bilkentId - User's Bilkent ID
 * @param {string} password - User's password
 */
exports.login = async (req, res) => {
  try {
    // Normalize parameters - accept both camelCase and snake_case
    const bilkentId = req.body.bilkentId || req.body.bilkent_id;
    const password = req.body.password;

    // Validate input
    const validation = validateParams(
      { bilkentId, password },
      ['bilkentId', 'password']
    );

    if (!validation.isValid) {
      const errorResponse = {
        message: 'Validation failed',
        details: {}
      };
      
      if (validation.missingFields.length > 0) {
        errorResponse.details.missingFields = validation.missingFields;
      }
      
      return res.status(400).json(errorResponse);
    }

    // Find user by BilkentID
    const user = await User.findByBilkentId(bilkentId);

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get permissions for the user's role
    const permissions = getPermissionsForRole(user.role);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        bilkentId: user.bilkent_id, 
        role: user.role,
        permissions: permissions
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        bilkentId: user.bilkent_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        permissions: permissions
      }
    });
    
    // Log the login event
    await loggingService.logAuth(
      'login',
      user,
      `User ${user.bilkent_id} logged in successfully`,
      { role: user.role },
      req
    );
  } catch (error) {
    console.error('Login error:', error);
    
    // Log the error
    await loggingService.logError(
      'user',
      error,
      null,
      'Error during user login',
      req
    );
    
    // Only include detailed errors in development
    const errorResponse = { message: 'Server error during login' };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
    }
    res.status(500).json(errorResponse);
  }
};

/**
 * Send password recovery email
 * @route POST /api/auth/recover-password
 * @param {string} bilkentId - User's Bilkent ID
 */
exports.recoverPassword = async (req, res) => {
  try {
    // Normalize parameters
    const bilkentId = req.body.bilkentId || req.body.bilkent_id;

    // Validate input
    const validation = validateParams({ bilkentId }, ['bilkentId']);
    
    if (!validation.isValid) {
      const errorResponse = {
        message: 'Validation failed',
        details: {}
      };
      
      if (validation.missingFields.length > 0) {
        errorResponse.details.missingFields = validation.missingFields;
      }
      
      return res.status(400).json(errorResponse);
    }

    // Find user by BilkentID
    const user = await User.findByBilkentId(bilkentId);

    // If user doesn't exist, still show success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If your ID exists, a password reset link has been sent to your email' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    resetTokens[bilkentId] = {
      token: resetToken,
      expiresAt: Date.now() + 3600000 // Token expires in 1 hour
    };

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}?id=${bilkentId}`;

    try {
      // Send email
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset for TA Management System',
        html: `
          <p>Hello ${user.full_name},</p>
          <p>You requested a password reset for the TA Management System.</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>The link will expire in 1 hour.</p>
        `
      });
      
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with the process even if email fails
      // In production, you might want to log this to a monitoring system
    }

    res.json({ message: 'If your ID exists, a password reset link has been sent to your email' });
    
    // Only log if user exists
    if (user) {
      await loggingService.logAuth(
        'password_recovery_request',
        user,
        `Password recovery requested for user ${user.bilkent_id}`,
        { email: user.email },
        req
      );
    }
  } catch (error) {
    console.error('Password recovery error:', error);
    
    // Log the error
    await loggingService.logError(
      'user',
      error,
      null,
      'Error during password recovery',
      req
    );
    
    // Only include detailed errors in development
    const errorResponse = { message: 'Server error during password recovery' };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
    }
    res.status(500).json(errorResponse);
  }
};

/**
 * Reset user password
 * @route POST /api/auth/reset-password
 * @param {string} token - Reset token
 * @param {string} bilkentId - User's Bilkent ID
 * @param {string} newPassword - New password
 */
exports.resetPassword = async (req, res) => {
  try {
    // Normalize parameters
    const token = req.body.token;
    const bilkentId = req.body.bilkentId || req.body.bilkent_id;
    const newPassword = req.body.newPassword || req.body.new_password;

    // Validate input
    const validation = validateParams(
      { token, bilkentId, newPassword },
      ['token', 'bilkentId', 'newPassword']
    );
    
    if (!validation.isValid) {
      const errorResponse = {
        message: 'Validation failed',
        details: {}
      };
      
      if (validation.missingFields.length > 0) {
        errorResponse.details.missingFields = validation.missingFields;
      }
      
      if (Object.keys(validation.errors).length > 0) {
        errorResponse.details.errors = validation.errors;
      }
      
      return res.status(400).json(errorResponse);
    }

    // Check if token exists and is valid
    if (!resetTokens[bilkentId] || 
        resetTokens[bilkentId].token !== token || 
        resetTokens[bilkentId].expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    const updated = await User.updatePassword(bilkentId, newPassword);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove used token
    delete resetTokens[bilkentId];

    res.json({ message: 'Password has been reset successfully' });
    
    // Log the password reset event
    const user = await User.findByBilkentId(bilkentId);
    if (user) {
      await loggingService.logAuth(
        'password_reset',
        user,
        `Password reset successful for user ${bilkentId}`,
        { timestamp: new Date().toISOString() },
        req
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    
    // Log the error
    await loggingService.logError(
      'user',
      error,
      null,
      'Error during password reset',
      req
    );
    
    // Only include detailed errors in development
    const errorResponse = { message: 'Server error during password reset' };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
    }
    res.status(500).json(errorResponse);
  }
};

/**
 * Log out a user (client-side implementation)
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  // JWT tokens are stateless, so we can't invalidate them on the server
  // The client should remove the token from storage
  res.json({ message: 'Logged out successfully' });
  
  // Log the logout event if we have user info
  if (req.user) {
    await loggingService.logAuth(
      'logout',
      req.user,
      `User ${req.user.bilkent_id} logged out`,
      { timestamp: new Date().toISOString() },
      req
    );
  }
};