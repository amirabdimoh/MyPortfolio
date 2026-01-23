const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrStaff } = require('../middleware/auth');
const {
  enrollStudent,
  updateEnrollmentStatus,
  updateEnrollmentGrade,
  bulkEnrollStudents,
  getStudentEnrollments,
  getEnrollmentDetails
} = require('../controllers/enrollmentController');

// Public routes
router.get('/student/:studentId', getStudentEnrollments);

// Admin/Staff routes
router.use(protect, adminOrStaff);

router.post('/', enrollStudent);
router.post('/bulk', bulkEnrollStudents);
router.get('/:id', getEnrollmentDetails);
router.put('/:id/status', updateEnrollmentStatus);
router.put('/:id/grade', updateEnrollmentGrade);

module.exports = router;