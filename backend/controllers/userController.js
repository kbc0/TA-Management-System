// backend/controllers/userController.js
const User = require('../models/User');
const { isValidRole } = require('../config/roles');
const loggingService = require('../services/LoggingService');

/**
 * Get all users
 */
exports.getUsers = async (req, res) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // TODO: Implement database query with pagination
    // For now, we'll return a placeholder response
    res.json({
      message: 'User list functionality will be implemented here',
      pagination: { page, limit, offset }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user by ID with permissions
    const user = await User.findByIdWithPermissions(userId);
    
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
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Validate role
    if (!role || !isValidRole(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    // Find user first to ensure they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user role
    const updated = await User.updateRole(userId, role);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update user role' });
    }
    
    // Log the role update
    await loggingService.log({
      action: 'user_role_update',
      entity: 'user',
      entity_id: user.bilkent_id,
      user_id: req.user.bilkentId,
      description: `User role updated from ${user.role} to ${role}`,
      metadata: {
        previousRole: user.role,
        newRole: role,
        updatedBy: req.user.bilkentId
      }
    }, req);
    
    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user.id,
        bilkentId: user.bilkent_id,
        role: role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deactivate user
 */
exports.deactivateUser = async (req, res) => {
  try {
    // This is a placeholder for future implementation
    // You would typically set an 'active' flag to false in the database
    
    res.json({ 
      message: 'User deactivation functionality will be implemented here'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
