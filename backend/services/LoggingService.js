// backend/services/LoggingService.js
const AuditLog = require('../models/AuditLog');

/**
 * Logging service for creating audit logs across the application
 */
class LoggingService {
  /**
   * Initialize the logging service
   * @param {Object} options - Configuration options
   * @param {boolean} options.enabled - Whether logging is enabled
   * @param {boolean} options.consoleOutput - Whether to also log to console
   */
  constructor(options = {}) {
    this.enabled = options.enabled !== false; // Enabled by default
    this.consoleOutput = options.consoleOutput !== false; // Console output enabled by default
  }

  /**
   * Log an action
   * @param {Object} logData - The log data
   * @param {string} logData.action - The action performed (e.g., 'login', 'signup', 'update_profile')
   * @param {string} logData.entity - The entity affected (e.g., 'user', 'course', 'application')
   * @param {string} logData.entity_id - The ID of the affected entity
   * @param {string} logData.user_id - The ID of the user who performed the action (if available)
   * @param {string} logData.description - A description of the action
   * @param {Object} logData.metadata - Additional metadata about the action
   * @param {Object} req - Express request object (optional, used to extract IP and user agent)
   * @returns {Promise<Object>} The created log entry
   */
  async log(logData, req = null) {
    if (!this.enabled) return null;

    try {
      // Extract IP and user agent from request if available
      if (req) {
        logData.ip_address = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        logData.user_agent = req.headers['user-agent'] || 'unknown';
      }

      // Log to console if enabled
      if (this.consoleOutput) {
        console.log(`[AUDIT] ${new Date().toISOString()} | ${logData.action} | ${logData.entity} | ${logData.entity_id || 'N/A'} | ${logData.user_id || 'anonymous'} | ${logData.description || ''}`);
      }

      // Create log entry in database
      return await AuditLog.create(logData);
    } catch (error) {
      console.error('Error in LoggingService.log:', error);
      return null;
    }
  }

  /**
   * Log user authentication events
   * @param {string} action - The authentication action (login, logout, signup, etc.)
   * @param {Object} user - User data
   * @param {string} description - Description of the event
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} The created log entry
   */
  async logAuth(action, user, description, metadata = {}, req = null) {
    return this.log({
      action,
      entity: 'user',
      entity_id: user?.bilkent_id || user?.id || 'unknown',
      user_id: user?.bilkent_id || user?.id || 'unknown',
      description,
      metadata
    }, req);
  }

  /**
   * Log data access events
   * @param {string} entity - The entity being accessed (user, course, etc.)
   * @param {string} entityId - ID of the entity
   * @param {string} action - The access action (view, list, etc.)
   * @param {Object} user - User performing the action
   * @param {string} description - Description of the access
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} The created log entry
   */
  async logAccess(entity, entityId, action, user, description, metadata = {}, req = null) {
    return this.log({
      action: `${action}_${entity}`,
      entity,
      entity_id: entityId,
      user_id: user?.bilkent_id || user?.id || 'unknown',
      description,
      metadata
    }, req);
  }

  /**
   * Log data modification events
   * @param {string} entity - The entity being modified (user, course, etc.)
   * @param {string} entityId - ID of the entity
   * @param {string} action - The modification action (create, update, delete)
   * @param {Object} user - User performing the action
   * @param {string} description - Description of the modification
   * @param {Object} metadata - Additional metadata (e.g., before/after values)
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} The created log entry
   */
  async logModification(entity, entityId, action, user, description, metadata = {}, req = null) {
    return this.log({
      action: `${action}_${entity}`,
      entity,
      entity_id: entityId,
      user_id: user?.bilkent_id || user?.id || 'unknown',
      description,
      metadata
    }, req);
  }

  /**
   * Log system events
   * @param {string} action - The system action
   * @param {string} description - Description of the event
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} The created log entry
   */
  async logSystem(action, description, metadata = {}) {
    return this.log({
      action,
      entity: 'system',
      entity_id: 'system',
      description,
      metadata
    });
  }

  /**
   * Log errors
   * @param {string} entity - The entity related to the error
   * @param {Error} error - The error object
   * @param {Object} user - User related to the error (if applicable)
   * @param {string} description - Description of the error context
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} The created log entry
   */
  async logError(entity, error, user = null, description = 'An error occurred', req = null) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    };

    return this.log({
      action: 'error',
      entity,
      entity_id: user?.bilkent_id || user?.id || 'unknown',
      user_id: user?.bilkent_id || user?.id || 'unknown',
      description,
      metadata: { error: errorData }
    }, req);
  }

  /**
   * Initialize the audit_logs table
   * @returns {Promise<void>}
   */
  async initTable() {
    return AuditLog.initTable();
  }

  /**
   * Search logs with filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async search(filters, options) {
    return AuditLog.search(filters, options);
  }

  /**
   * Find logs by entity and entity_id
   * @param {string} entity - The entity type
   * @param {string} entityId - The entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByEntity(entity, entityId, options) {
    return AuditLog.findByEntity(entity, entityId, options);
  }

  /**
   * Find logs by user ID
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByUserId(userId, options) {
    return AuditLog.findByUserId(userId, options);
  }

  /**
   * Find logs by action type
   * @param {string} action - The action type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByAction(action, options) {
    return AuditLog.findByAction(action, options);
  }
}

// Create a singleton instance
const loggingService = new LoggingService();

module.exports = loggingService;
