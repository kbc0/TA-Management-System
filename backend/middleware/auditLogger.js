// backend/middleware/auditLogger.js
const loggingService = require('../services/LoggingService');

/**
 * Middleware to log API requests
 * @param {Object} options - Configuration options
 * @param {string} options.entity - The entity being accessed
 * @param {Function} options.getEntityId - Function to extract entity ID from request
 * @param {string} options.action - The action being performed
 * @param {Function} options.getDescription - Function to generate description
 * @param {Function} options.getMetadata - Function to extract metadata
 * @returns {Function} Express middleware function
 */
const auditLogger = (options = {}) => {
  return async (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Get user from request (assuming auth middleware sets req.user)
    const user = req.user;
    
    // Extract entity information
    const entity = options.entity || req.baseUrl.split('/').pop() || 'unknown';
    const entityId = options.getEntityId ? options.getEntityId(req) : 'unknown';
    
    // Determine action based on HTTP method if not provided
    const action = options.action || req.method.toLowerCase();
    
    // Generate description
    const description = options.getDescription 
      ? options.getDescription(req) 
      : `${req.method} ${req.originalUrl}`;
    
    // Extract metadata
    const metadata = options.getMetadata 
      ? options.getMetadata(req) 
      : {
          params: req.params,
          query: req.query,
          body: req.method !== 'GET' ? req.body : undefined
        };
    
    // Override the res.end method to capture response
    res.end = function(chunk, encoding) {
      // Call the original end method
      originalEnd.call(this, chunk, encoding);
      
      // Add response status to metadata
      metadata.responseStatus = res.statusCode;
      
      // Log the request after it completes
      loggingService.log({
        action: `${action}_${entity}`,
        entity,
        entity_id: entityId,
        user_id: user?.bilkent_id || user?.id || 'anonymous',
        description,
        metadata
      }, req).catch(err => console.error('Error in audit logging middleware:', err));
    };
    
    next();
  };
};

/**
 * Middleware to log authentication events
 * @param {string} action - The authentication action (login, logout, signup)
 * @returns {Function} Express middleware function
 */
const authLogger = (action) => {
  return async (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    res.end = function(chunk, encoding) {
      // Call the original end method
      originalEnd.call(this, chunk, encoding);
      
      // Only log successful authentication events
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // For login/signup, the user info is in the response
        // For logout, the user info should be in req.user
        let user;
        let responseData;
        
        try {
          if (chunk) {
            responseData = JSON.parse(chunk.toString());
            user = responseData.user || req.user;
          } else {
            user = req.user;
          }
        } catch (e) {
          user = req.user;
        }
        
        if (user) {
          loggingService.logAuth(
            action,
            user,
            `User ${action} successful`,
            { responseStatus: res.statusCode },
            req
          ).catch(err => console.error('Error in auth logging middleware:', err));
        }
      }
    };
    
    next();
  };
};

/**
 * Middleware to log errors
 */
const errorLogger = (err, req, res, next) => {
  const entity = req.baseUrl.split('/').pop() || 'api';
  
  loggingService.logError(
    entity,
    err,
    req.user,
    `Error processing ${req.method} ${req.originalUrl}`,
    req
  ).catch(error => console.error('Error in error logging middleware:', error));
  
  next(err);
};

module.exports = {
  auditLogger,
  authLogger,
  errorLogger
};
