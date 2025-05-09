const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const User = require('../models/User');
const loggingService = require('../services/LoggingService');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user by ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      bilkentId: user.bilkent_id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Log authentication failure
    await loggingService.log({
      action: 'authentication_failure',
      entity: 'user',
      description: `Authentication failed: ${error.name || 'Unknown error'}`,
      metadata: {
        error: error.message,
        errorType: error.name,
        path: req.originalUrl,
        method: req.method
      }
    }, req);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Log authorization failure
      await loggingService.log({
        action: 'authorization_failure',
        entity: 'user',
        entity_id: req.user?.bilkentId || 'unknown',
        user_id: req.user?.bilkentId || 'unknown',
        description: `Authorization failed: User role ${req.user?.role || 'unknown'} not in allowed roles [${roles.join(', ')}]`,
        metadata: {
          requiredRoles: roles,
          userRole: req.user?.role || 'unknown',
          path: req.originalUrl,
          method: req.method
        }
      }, req);
      
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    
    // Log successful authorization (optional, can be commented out if too verbose)
    await loggingService.log({
      action: 'authorization_success',
      entity: 'user',
      entity_id: req.user.bilkentId,
      user_id: req.user.bilkentId,
      description: `User authorized for ${req.method} ${req.originalUrl}`,
      metadata: {
        userRole: req.user.role,
        allowedRoles: roles
      }
    }, req);
    
    next();
  };
};

// For backward compatibility
exports.protect = exports.authenticate;
