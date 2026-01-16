const express = require('express');
const { getStats, getMyDashboard } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', restrictTo('admin'), getStats);
router.get('/my-dashboard', getMyDashboard);

module.exports = router;
