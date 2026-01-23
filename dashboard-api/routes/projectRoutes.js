const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(restrictTo('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(restrictTo('admin'), updateProject)
  .delete(restrictTo('admin'), deleteProject);

module.exports = router;
