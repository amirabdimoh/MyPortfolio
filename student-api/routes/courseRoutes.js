const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrStaff } = require('../middleware/auth');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getDepartments
} = require('../controllers/courseController');

// Public routes
router.get('/', getAllCourses);
router.get('/departments', getDepartments);
router.get('/:id', getCourseById);

// Admin/Staff routes
router.get('/:id/enrollments', protect, adminOrStaff, getCourseEnrollments);

// Admin only routes
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

module.exports = router;