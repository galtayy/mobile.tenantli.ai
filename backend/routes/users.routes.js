const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Tüm kullanıcı route'ları için auth middleware
router.use(authMiddleware);

// Profil bilgisi endpoint'i
router.get('/profile', userController.getProfile);

// Profil güncelleme endpoint'i
router.put(
  '/profile',
  [
    check('name', 'Ad Soyad gereklidir').optional().not().isEmpty(),
    check('email', 'Geçerli bir e-posta giriniz').optional().isEmail(),
    check('phone', 'Geçerli bir telefon numarası giriniz').optional().not().isEmpty(),
    check('role', 'Geçerli bir rol giriniz').optional().not().isEmpty()
  ],
  userController.updateProfile
);

// Şifre değiştirme endpoint'i
router.put(
  '/password',
  [
    check('currentPassword', 'Mevcut şifre gereklidir').not().isEmpty(),
    check('newPassword', 'Yeni şifre en az 6 karakter olmalıdır').isLength({ min: 6 })
  ],
  userController.changePassword
);

module.exports = router;
