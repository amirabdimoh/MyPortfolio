const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('admin'), getUsers)
  .post(restrictTo('admin'), createUser);

router.route('/:id')
  .get(getUser)
  .put(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

module.exports = router;