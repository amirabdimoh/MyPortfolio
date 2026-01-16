const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  getMajors
} = require('../controllers/studentController');
const { validateStudent, validateStudentId } = require('../middleware/validator');

// Stats and majors routes (must be before /:id route)
router.get('/stats', getStudentStats);
router.get('/majors', getMajors);

// CRUD routes
router.route('/')
  .get(getAllStudents)
  .post(validateStudent, createStudent);

router.route('/:id')
  .get(validateStudentId, getStudentById)
  .put(validateStudentId, validateStudent, updateStudent)
  .delete(validateStudentId, deleteStudent);

module.exports = router;