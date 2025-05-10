const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const User = require('../models/User');
const loggingService = require('../services/LoggingService');
const { getPermissionsForRole } = require('../config/roles');

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

    // Get permissions for the user's role
    const permissions = getPermissionsForRole(user.role);
    
    // Add user to request object
    req.user = {
      id: user.id,
      bilkentId: user.bilkent_id,
      email: user.email,
      role: user.role,
      permissions: permissions
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

// Role-based authorization middleware (legacy approach)
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

// Get current user profile with permissions
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get full user profile with permissions
    const user = await User.findByIdWithPermissions(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without sensitive information
    res.json({
      user: {
        id: user.id,
        bilkentId: user.bilkent_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// For backward compatibility
exports.protect = exports.authenticate;

// Export available roles
exports.getRoles = () => User.getRoles();
