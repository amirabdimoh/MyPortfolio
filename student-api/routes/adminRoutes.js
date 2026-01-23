const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllStudentsAdmin,
  updateStudentStatus,
  bulkUpdateStudentStatus,
  getStudentDetails
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);

// Student management
router.get('/students', getAllStudentsAdmin);
router.get('/students/:id/details', getStudentDetails);
router.put('/students/:id/status', updateStudentStatus);
router.put('/students/bulk-status', bulkUpdateStudentStatus);

module.exports = router;