const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { signup, login, forgotPassword, resetPassword, getProfile } = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
