// backend/controllers/userController.js
const User = require('../models/User');
const { isValidRole, ROLES } = require('../config/roles');
const loggingService = require('../services/LoggingService');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Get all users
 */
exports.getUsers = async (req, res) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    
    // Check if role filter is provided
    let roleFilter = req.query.role;
    let query = 'SELECT id, bilkent_id, email, full_name, role, created_at, updated_at FROM users';
    let queryParams = [];
    
    // If role filter is provided, add WHERE clause
    if (roleFilter) {
      // Handle multiple roles (comma-separated)
      if (roleFilter.includes(',')) {
        const roles = roleFilter.split(',');
        query += ' WHERE role IN (' + roles.map(() => '?').join(',') + ')';
        queryParams = [...roles];
      } else {
        query += ' WHERE role = ?';
        queryParams = [roleFilter];
      }
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Execute query
    const [rows] = await db.query(query, queryParams);
    
    // Get total count for pagination with the same filter
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let countParams = [];
    
    if (roleFilter) {
      if (roleFilter.includes(',')) {
        const roles = roleFilter.split(',');
        countQuery += ' WHERE role IN (' + roles.map(() => '?').join(',') + ')';
        countParams = [...roles];
      } else {
        countQuery += ' WHERE role = ?';
        countParams = [roleFilter];
      }
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    // Format the response to match what the frontend expects
    const users = rows.map(user => ({
      id: user.id,
      bilkent_id: user.bilkent_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
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
        bilkent_id: user.bilkent_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
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

/**
 * Create a new user
 */
/**
 * Get all teaching assistants
 */
exports.getAllTAs = async (req, res) => {
  try {
    // Query to get all users with role 'ta'
    const [rows] = await db.query(
      'SELECT id, bilkent_id, email, full_name, created_at FROM users WHERE role = ?',
      [ROLES.TEACHING_ASSISTANT]
    );
    
    // Format the response with field names matching the frontend expectations
    const tas = rows.map(ta => ({
      id: ta.id,
      bilkentId: ta.bilkent_id,  // Changed to match frontend interface
      fullName: ta.full_name,    // Changed to match frontend interface
      email: ta.email,
      created_at: ta.created_at
    }));
    
    res.json(tas);
  } catch (error) {
    console.error('Get all TAs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new user
 */
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, bilkent_id, role, department, password, max_hours } = req.body;
    
    // Validate required fields
    if (!full_name || !email || !bilkent_id || !role || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Validate role
    if (!isValidRole(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR bilkent_id = ?',
      [email, bilkent_id]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email or Bilkent ID already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await db.query(
      `INSERT INTO users 
      (full_name, email, bilkent_id, role, department, password, max_hours) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, bilkent_id, role, department, hashedPassword, max_hours || null]
    );
    
    if (!result.insertId) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
    
    // Log the user creation
    await loggingService.log({
      action: 'user_create',
      entity: 'user',
      entity_id: bilkent_id,
      user_id: req.user.bilkentId,
      description: `New user created with role ${role}`,
      metadata: {
        fullName: full_name,
        email,
        role,
        department,
        createdBy: req.user.bilkentId
      }
    }, req);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: result.insertId,
        full_name,
        email,
        bilkent_id,
        role,
        department
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email } = req.body;
    
    // Validate that the user is updating their own profile or has admin permissions
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this user profile' });
    }
    
    // Find user first to ensure they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update fields
    const updateFields = {};
    if (full_name) updateFields.full_name = full_name;
    if (email) updateFields.email = email;
    
    // If no fields to update, return early
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }
    
    // Update user profile
    const updated = await User.updateProfile(userId, updateFields);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update user profile' });
    }
    
    // Get updated user data
    const updatedUser = await User.findById(userId);
    
    // Log the profile update
    await loggingService.log({
      action: 'user_profile_update',
      entity: 'user',
      entity_id: user.bilkent_id,
      user_id: req.user.bilkentId,
      description: `User profile updated`,
      metadata: {
        updatedFields: Object.keys(updateFields),
        updatedBy: req.user.bilkentId
      }
    }, req);
    
    res.json({ 
      message: 'User profile updated successfully',
      user: {
        id: updatedUser.id,
        bilkent_id: updatedUser.bilkent_id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // Validate that the user is changing their own password or has admin permissions
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to change this user\'s password' });
    }
    
    // Find user first to ensure they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    const updated = await User.updatePassword(userId, hashedPassword);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update password' });
    }
    
    // Log the password change
    await loggingService.log({
      action: 'user_password_change',
      entity: 'user',
      entity_id: user.bilkent_id,
      user_id: req.user.bilkentId,
      description: `User password changed`,
      metadata: {
        updatedBy: req.user.bilkentId
      }
    }, req);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
