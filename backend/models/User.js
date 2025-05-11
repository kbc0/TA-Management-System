// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { ROLES, getPermissionsForRole, isValidRole } = require('../config/roles');

class User {
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, bilkent_id, email, full_name, role, password, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByBilkentId(bilkentId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE bilkent_id = ?',
        [bilkentId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await db.query(
        'INSERT INTO users (bilkent_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [userData.bilkent_id, userData.email, hashedPassword, userData.full_name, userData.role]
      );
      return { 
        id: result.insertId,
        bilkent_id: userData.bilkent_id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      };
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(bilkentId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await db.query(
        'UPDATE users SET password = ? WHERE bilkent_id = ?',
        [hashedPassword, bilkentId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    // Check if the stored password is a bcrypt hash (starts with $2a$, $2b$, etc.)
    if (hashedPassword && hashedPassword.startsWith('$2')) {
      // Use bcrypt for hashed passwords
      return await bcrypt.compare(plainPassword, hashedPassword);
    } else {
      // For plain text passwords, do a direct comparison
      return plainPassword === hashedPassword;
    }
  }
}

// Get all available roles
User.getRoles = () => {
  return Object.values(ROLES);
};

// Get user with permissions
User.findByIdWithPermissions = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) return null;
    
    // Add permissions to user object
    user.permissions = getPermissionsForRole(user.role);
    return user;
  } catch (error) {
    throw error;
  }
};

// Update user role
User.updateRole = async (userId, newRole) => {
  try {
    // Validate role
    if (!isValidRole(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }
    
    const [result] = await db.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [newRole, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Update user profile
User.updateProfile = async (userId, updateFields) => {
  try {
    if (Object.keys(updateFields).length === 0) {
      return false;
    }
    
    // Construct the SQL query dynamically based on the fields to update
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const [result] = await db.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Update user password by ID
User.updatePassword = async (userId, newHashedPassword) => {
  try {
    const [result] = await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [newHashedPassword, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = User;