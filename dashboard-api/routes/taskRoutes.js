const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(restrictTo('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(restrictTo('admin'), updateTask)
  .delete(restrictTo('admin'), deleteTask);

module.exports = router;
