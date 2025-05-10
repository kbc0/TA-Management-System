// backend/controllers/auditLogController.js
const loggingService = require('../services/LoggingService');

/**
 * Get audit logs with filtering options
 */
exports.getLogs = async (req, res) => {
  try {
    const { 
      action, entity, entity_id, user_id, description, 
      start_date, end_date, limit, offset 
    } = req.query;
    
    // Build filters object
    const filters = {};
    if (action) filters.action = action;
    if (entity) filters.entity = entity;
    if (entity_id) filters.entity_id = entity_id;
    if (user_id) filters.user_id = user_id;
    if (description) filters.description = description;
    
    // Handle date filters
    if (start_date) filters.start_date = new Date(start_date);
    if (end_date) filters.end_date = new Date(end_date);
    
    // Build options object
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    const logs = await loggingService.search(filters, options);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit logs for a specific entity
 */
exports.getEntityLogs = async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const { limit, offset } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    const logs = await loggingService.findByEntity(entity, entityId, options);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error getting entity audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve entity audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit logs for a specific user
 */
exports.getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    const logs = await loggingService.findByUserId(userId, options);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve user audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit logs for a specific action
 */
exports.getActionLogs = async (req, res) => {
  try {
    const { action } = req.params;
    const { limit, offset } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    const logs = await loggingService.findByAction(action, options);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error getting action audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve action audit logs',
      error: error.message
    });
  }
};

/**
 * Get summary statistics for audit logs
 */
exports.getLogStats = async (req, res) => {
  try {
    // This would typically involve more complex queries
    // For now, we'll implement a simplified version
    
    // Get counts by entity
    const [entityCounts] = await loggingService.search({}, { limit: 1000 });
    
    // Count by entity
    const entityStats = {};
    entityCounts.forEach(log => {
      if (!entityStats[log.entity]) {
        entityStats[log.entity] = 0;
      }
      entityStats[log.entity]++;
    });
    
    // Count by action
    const actionStats = {};
    entityCounts.forEach(log => {
      if (!actionStats[log.action]) {
        actionStats[log.action] = 0;
      }
      actionStats[log.action]++;
    });
    
    res.json({
      success: true,
      data: {
        entityStats,
        actionStats,
        totalLogs: entityCounts.length
      }
    });
  } catch (error) {
    console.error('Error getting audit log stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve audit log statistics',
      error: error.message
    });
  }
};
