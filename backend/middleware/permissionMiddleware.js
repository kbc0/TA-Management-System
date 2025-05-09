// backend/middleware/permissionMiddleware.js
const { hasPermission, isValidRole } = require('../config/roles');
const loggingService = require('../services/LoggingService');

/**
 * Permission-based authorization middleware
 * Checks if the authenticated user has the required permission
 * 
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions (any one is sufficient)
 * @returns {Function} Express middleware
 */
const requirePermission = (requiredPermissions) => {
  // Convert single permission to array for consistent handling
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }
      
      // Check if user role is valid
      if (!isValidRole(req.user.role)) {
        await logAuthorizationFailure(req, permissions, 'Invalid role');
        return res.status(403).json({ 
          message: 'Invalid user role' 
        });
      }
      
      // Check if user has any of the required permissions
      const hasRequiredPermission = permissions.some(permission => 
        hasPermission(req.user.role, permission)
      );
      
      if (!hasRequiredPermission) {
        await logAuthorizationFailure(req, permissions, 'Insufficient permissions');
        return res.status(403).json({ 
          message: 'Forbidden: insufficient permissions' 
        });
      }
      
      // Optional: Log successful authorization
      await logAuthorizationSuccess(req, permissions);
      
      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        message: 'Server error in permission middleware' 
      });
    }
  };
};

/**
 * Log authorization failure
 */
async function logAuthorizationFailure(req, permissions, reason) {
  await loggingService.log({
    action: 'authorization_failure',
    entity: 'user',
    entity_id: req.user?.bilkentId || 'unknown',
    user_id: req.user?.bilkentId || 'unknown',
    description: `Authorization failed: ${reason}. Required permissions: [${permissions.join(', ')}]`,
    metadata: {
      requiredPermissions: permissions,
      userRole: req.user?.role || 'unknown',
      path: req.originalUrl,
      method: req.method,
      reason
    }
  }, req);
}

/**
 * Log authorization success
 */
async function logAuthorizationSuccess(req, permissions) {
  await loggingService.log({
    action: 'authorization_success',
    entity: 'user',
    entity_id: req.user.bilkentId,
    user_id: req.user.bilkentId,
    description: `User authorized for ${req.method} ${req.originalUrl}`,
    metadata: {
      userRole: req.user.role,
      requiredPermissions: permissions
    }
  }, req);
}

module.exports = {
  requirePermission
};
