const { validationResult } = require('express-validator');
const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
  try {
    // Kullanıcı ID'si JWT middleware'den alınır
    const userId = req.user.id;
    
    // Kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Şifre hariç kullanıcı bilgilerini gönder
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { name, email, phone, role } = req.body;
    
    // Only update fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    
    // Check if any field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Güncellenecek alan belirtilmedi' });
    }
    
    // Email kullanımda mı kontrol et (sadece email güncelleniyorsa)
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }
    
    // Kullanıcı bilgilerini güncelle
    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      return res.status(400).json({ message: 'Profil güncellenemedi' });
    }
    
    // Güncellenmiş kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    
    res.json({
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user info
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await User.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // New password must not be same as current
    const isSamePassword = await User.verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current password' });
    }
    
    // Update password
    const updated = await User.updatePassword(userId, newPassword);
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update password' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
