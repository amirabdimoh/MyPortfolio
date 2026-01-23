const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

// User routes
router.get('/', getUserOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;