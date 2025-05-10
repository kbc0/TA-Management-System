// middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');
const { PERMISSIONS } = require('../config/roles');

/**
 * Custom middleware to validate request based on rules
 * @param {Array} validations - Array of validation rules
 * @returns {Function} - Express middleware function
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Get validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for response
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

/**
 * Combines validation with permission checking
 * @param {Array} validations - Validation rules
 * @param {string} requiredPermission - Permission required
 * @returns {Array} Array of middleware functions
 */
exports.validateAndCheckPermission = (validations, requiredPermission) => {
  return [
    // First run validation
    exports.validate(validations),
    // Then check permission
    (req, res, next) => {
      if (!req.user || !req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }
      next();
    }
  ];
};

// Parameter normalization middleware
exports.normalizeParams = (req, res, next) => {
  // Normalize common camelCase/snake_case parameter pairs
  const normalizations = [
    { camel: 'bilkentId', snake: 'bilkent_id' },
    { camel: 'fullName', snake: 'full_name' },
    { camel: 'newPassword', snake: 'new_password' }
  ];
  
  normalizations.forEach(({ camel, snake }) => {
    // If both are provided, prefer camelCase (but keep both for backward compatibility)
    if (req.body[camel] !== undefined && req.body[snake] === undefined) {
      req.body[snake] = req.body[camel];
    } else if (req.body[snake] !== undefined && req.body[camel] === undefined) {
      req.body[camel] = req.body[snake];
    }
  });
  
  next();
};

// Validation rules for authentication
exports.authValidation = {
  signup: [
    body('bilkentId')
      .exists().withMessage('Bilkent ID is required')
      .isString().withMessage('Bilkent ID must be a string')
      .trim().notEmpty().withMessage('Bilkent ID cannot be empty'),
    
    body('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email address')
      .custom(value => {
        if (!value.endsWith('@bilkent.edu.tr')) {
          throw new Error('Must use a Bilkent email address (@bilkent.edu.tr)');
        }
        return true;
      }),
    
    body('fullName')
      .exists().withMessage('Full name is required')
      .isString().withMessage('Full name must be a string')
      .trim().notEmpty().withMessage('Full name cannot be empty'),
    
    body('password')
      .exists().withMessage('Password is required')
      .isString().withMessage('Password must be a string')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('role')
      .optional()
      .isIn(['ta', 'staff', 'department_chair', 'dean', 'admin'])
      .withMessage('Invalid role specified')
  ],
  
  login: [
    body('bilkentId')
      .exists().withMessage('Bilkent ID is required')
      .isString().withMessage('Bilkent ID must be a string')
      .trim().notEmpty().withMessage('Bilkent ID cannot be empty'),
    
    body('password')
      .exists().withMessage('Password is required')
      .isString().withMessage('Password must be a string')
      .notEmpty().withMessage('Password cannot be empty')
  ],
  
  recoverPassword: [
    body('bilkentId')
      .exists().withMessage('Bilkent ID is required')
      .isString().withMessage('Bilkent ID must be a string')
      .trim().notEmpty().withMessage('Bilkent ID cannot be empty')
  ],
  
  resetPassword: [
    body('token')
      .exists().withMessage('Token is required')
      .isString().withMessage('Token must be a string')
      .trim().notEmpty().withMessage('Token cannot be empty'),
    
    body('bilkentId')
      .exists().withMessage('Bilkent ID is required')
      .isString().withMessage('Bilkent ID must be a string')
      .trim().notEmpty().withMessage('Bilkent ID cannot be empty'),
    
    body('newPassword')
      .exists().withMessage('New password is required')
      .isString().withMessage('New password must be a string')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ]
};