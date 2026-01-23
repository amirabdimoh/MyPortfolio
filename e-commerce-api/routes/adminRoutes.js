const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAnalytics
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;