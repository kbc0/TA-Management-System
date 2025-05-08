// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, bilkent_id, email, full_name, role FROM users WHERE id = ?',
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
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;