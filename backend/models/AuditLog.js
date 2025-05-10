// backend/models/AuditLog.js
const db = require('../config/db');

class AuditLog {
  /**
   * Create a new audit log entry
   * @param {Object} logData - The log data
   * @param {string} logData.action - The action performed (e.g., 'login', 'signup', 'update_profile')
   * @param {string} logData.entity - The entity affected (e.g., 'user', 'course', 'application')
   * @param {string} logData.entity_id - The ID of the affected entity
   * @param {string} logData.user_id - The ID of the user who performed the action (if available)
   * @param {string} logData.description - A description of the action
   * @param {Object} logData.metadata - Additional metadata about the action (will be stored as JSON)
   * @param {string} logData.ip_address - The IP address of the request
   * @param {string} logData.user_agent - The user agent of the request
   * @returns {Promise<Object>} The created log entry
   */
  static async create(logData) {
    try {
      const metadata = logData.metadata ? JSON.stringify(logData.metadata) : null;
      
      const [result] = await db.query(
        `INSERT INTO audit_logs 
         (action, entity, entity_id, user_id, description, metadata, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logData.action,
          logData.entity,
          logData.entity_id,
          logData.user_id,
          logData.description,
          metadata,
          logData.ip_address,
          logData.user_agent
        ]
      );
      
      return {
        id: result.insertId,
        ...logData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw the error - logging should never break the application
      return null;
    }
  }

  /**
   * Find logs by entity and entity_id
   * @param {string} entity - The entity type
   * @param {string} entityId - The entity ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of logs to return
   * @param {number} options.offset - Number of logs to skip
   * @returns {Promise<Array>} Array of log entries
   */
  static async findByEntity(entity, entityId, options = {}) {
    try {
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      
      const [rows] = await db.query(
        `SELECT * FROM audit_logs 
         WHERE entity = ? AND entity_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [entity, entityId, limit, offset]
      );
      
      return rows.map(row => {
        let parsedMetadata = null;
        if (row.metadata) {
          try {
            parsedMetadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (e) {
            console.error(`Error parsing metadata for log ID ${row.id}:`, e);
            // Keep metadata as is if it can't be parsed
            parsedMetadata = row.metadata;
          }
        }
        return {
          ...row,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error('Error finding audit logs by entity:', error);
      throw error;
    }
  }

  /**
   * Find logs by user ID
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of logs to return
   * @param {number} options.offset - Number of logs to skip
   * @returns {Promise<Array>} Array of log entries
   */
  static async findByUserId(userId, options = {}) {
    try {
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      
      const [rows] = await db.query(
        `SELECT * FROM audit_logs 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      return rows.map(row => {
        let parsedMetadata = null;
        if (row.metadata) {
          try {
            parsedMetadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (e) {
            console.error(`Error parsing metadata for log ID ${row.id}:`, e);
            // Keep metadata as is if it can't be parsed
            parsedMetadata = row.metadata;
          }
        }
        return {
          ...row,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error('Error finding audit logs by user ID:', error);
      throw error;
    }
  }

  /**
   * Find logs by action type
   * @param {string} action - The action type
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of logs to return
   * @param {number} options.offset - Number of logs to skip
   * @returns {Promise<Array>} Array of log entries
   */
  static async findByAction(action, options = {}) {
    try {
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      
      const [rows] = await db.query(
        `SELECT * FROM audit_logs 
         WHERE action = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [action, limit, offset]
      );
      
      return rows.map(row => {
        let parsedMetadata = null;
        if (row.metadata) {
          try {
            parsedMetadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (e) {
            console.error(`Error parsing metadata for log ID ${row.id}:`, e);
            // Keep metadata as is if it can't be parsed
            parsedMetadata = row.metadata;
          }
        }
        return {
          ...row,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error('Error finding audit logs by action:', error);
      throw error;
    }
  }

  /**
   * Search logs with filters
   * @param {Object} filters - Search filters
   * @param {string} filters.action - Filter by action
   * @param {string} filters.entity - Filter by entity
   * @param {string} filters.entity_id - Filter by entity ID
   * @param {string} filters.user_id - Filter by user ID
   * @param {string} filters.description - Search in description
   * @param {Date} filters.start_date - Start date range
   * @param {Date} filters.end_date - End date range
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of logs to return
   * @param {number} options.offset - Number of logs to skip
   * @returns {Promise<Array>} Array of log entries
   */
  static async search(filters = {}, options = {}) {
    try {
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];
      
      if (filters.action) {
        query += ' AND action = ?';
        params.push(filters.action);
      }
      
      if (filters.entity) {
        query += ' AND entity = ?';
        params.push(filters.entity);
      }
      
      if (filters.entity_id) {
        query += ' AND entity_id = ?';
        params.push(filters.entity_id);
      }
      
      if (filters.user_id) {
        query += ' AND user_id = ?';
        params.push(filters.user_id);
      }
      
      if (filters.description) {
        query += ' AND description LIKE ?';
        params.push(`%${filters.description}%`);
      }
      
      if (filters.start_date) {
        query += ' AND created_at >= ?';
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        query += ' AND created_at <= ?';
        params.push(filters.end_date);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await db.query(query, params);
      
      return rows.map(row => {
        let parsedMetadata = null;
        if (row.metadata) {
          try {
            parsedMetadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (e) {
            console.error(`Error parsing metadata for log ID ${row.id}:`, e);
            // Keep metadata as is if it can't be parsed
            parsedMetadata = row.metadata;
          }
        }
        return {
          ...row,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error('Error searching audit logs:', error);
      throw error;
    }
  }

  /**
   * Initialize the audit_logs table if it doesn't exist
   */
  static async initTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          entity VARCHAR(100) NOT NULL,
          entity_id VARCHAR(100),
          user_id VARCHAR(100),
          description TEXT,
          metadata JSON,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_action (action),
          INDEX idx_entity (entity),
          INDEX idx_entity_id (entity_id),
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        )
      `);
      console.log('Audit logs table initialized successfully');
    } catch (error) {
      console.error('Error initializing audit logs table:', error);
      throw error;
    }
  }
}

module.exports = AuditLog;
