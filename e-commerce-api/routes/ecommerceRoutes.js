const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

// @desc    Get e-commerce statistics
// @route   GET /api/ecommerce/stats
// @access  Private (Admin only)
router.get('/stats', protect, asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin only.'
    });
  }

  // Total counts
  const productsCount = await pool.query('SELECT COUNT(*) FROM products');
  const ordersCount = await pool.query('SELECT COUNT(*) FROM orders');
  const usersCount = await pool.query('SELECT COUNT(*) FROM users');

  // Order stats by status
  const ordersByStatus = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM orders
    GROUP BY status
  `);

  // Revenue stats
  const revenueStats = await pool.query(`
    SELECT
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as average_order_value,
      COUNT(*) as total_orders
    FROM orders
    WHERE status != 'cancelled'
  `);

  // Top products
  const topProducts = await pool.query(`
    SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  // Recent orders
  const recentOrders = await pool.query(`
    SELECT o.*, u.name as customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalProducts: parseInt(productsCount.rows[0].count),
        totalOrders: parseInt(ordersCount.rows[0].count),
        totalUsers: parseInt(usersCount.rows[0].count),
        totalRevenue: parseFloat(revenueStats.rows[0].total_revenue || 0),
        averageOrderValue: parseFloat(revenueStats.rows[0].average_order_value || 0)
      },
      ordersByStatus: ordersByStatus.rows,
      topProducts: topProducts.rows,
      recentOrders: recentOrders.rows
    }
  });
}));

// @desc    Get user's e-commerce dashboard
// @route   GET /api/ecommerce/my-ecommerce
// @access  Private
router.get('/my-ecommerce', protect, asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // User's order stats
  const userOrders = await pool.query(`
    SELECT
      COUNT(*) as total_orders,
      SUM(total_amount) as total_spent,
      AVG(total_amount) as average_order_value
    FROM orders
    WHERE user_id = $1 AND status != 'cancelled'
  `, [userId]);

  // User's recent orders
  const recentOrders = await pool.query(`
    SELECT o.*, json_agg(json_build_object(
      'product_name', p.name,
      'quantity', oi.quantity,
      'price', oi.price
    )) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 5
  `, [userId]);

  // User's cart count
  const cartCount = await pool.query(
    'SELECT SUM(quantity) as cart_items FROM cart_items WHERE user_id = $1',
    [userId]
  );

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalOrders: parseInt(userOrders.rows[0].total_orders || 0),
        totalSpent: parseFloat(userOrders.rows[0].total_spent || 0),
        averageOrderValue: parseFloat(userOrders.rows[0].average_order_value || 0),
        cartItems: parseInt(cartCount.rows[0].cart_items || 0)
      },
      recentOrders: recentOrders.rows
    }
  });
}));

module.exports = router;