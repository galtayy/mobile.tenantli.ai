const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }

  // Kullanıcı oluşturma
  static async create(newUser) {
    try {
      // Şifreyi hash'le
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUser.password, salt);

      // SQL sorgusu
      const query = `
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newUser.name,
        newUser.email,
        hashedPassword
      ]);

      // Yeni kullanıcının id'sini döndür
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Email ile kullanıcı bulma
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // ID ile kullanıcı bulma
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı güncelleme
  static async update(id, userData) {
    try {
      // Build dynamic query based on provided fields
      const updates = [];
      const values = [];
      
      if (userData.name !== undefined) {
        updates.push('name = ?');
        values.push(userData.name);
      }
      
      if (userData.email !== undefined) {
        updates.push('email = ?');
        values.push(userData.email);
      }
      
      if (userData.phone !== undefined) {
        updates.push('phone = ?');
        values.push(userData.phone);
      }
      
      if (userData.role !== undefined) {
        updates.push('role = ?');
        values.push(userData.role);
      }
      
      // Always update the timestamp
      updates.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add the id parameter at the end
      values.push(id);
      
      // If no fields to update, return false
      if (updates.length === 1) { // Only timestamp update
        return false;
      }
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Şifre güncelleme
  static async updatePassword(id, newPassword) {
    try {
      // Şifreyi hash'le
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const query = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [hashedPassword, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı silme (genellikle sadece admin için)
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Şifre doğrulama
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
