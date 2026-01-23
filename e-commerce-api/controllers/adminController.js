const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get overview statistics
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByMonth,
    lowStockProducts
  ] = await Promise.all([
    // Total users
    pool.query('SELECT COUNT(*) as count FROM users'),
    
    // Total products
    pool.query('SELECT COUNT(*) as count FROM products'),
    
    // Total orders
    pool.query('SELECT COUNT(*) as count FROM orders'),
    
    // Total revenue (excluding cancelled orders)
    pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(*) as completed_orders
      FROM orders 
      WHERE status NOT IN ('cancelled')
    `),
    
    // Recent orders (last 10)
    pool.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `),
    
    // Top selling products
    pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled')
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY total_sold DESC
      LIMIT 5
    `),
    
    // Orders by status
    pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `),
    
    // Revenue by month (last 12 months)
    pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status NOT IN ('cancelled')
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `),
    
    // Low stock products (stock < 10)
    pool.query(`
      SELECT id, name, stock_quantity, category
      FROM products
      WHERE stock_quantity < 10
      ORDER BY stock_quantity ASC
      LIMIT 10
    `)
  ]);

  // Calculate growth metrics (comparing last 30 days vs previous 30 days)
  const growthMetrics = await pool.query(`
    WITH current_period AS (
      SELECT 
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND status NOT IN ('cancelled')
    ),
    previous_period AS (
      SELECT 
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
        AND created_at < CURRENT_DATE - INTERVAL '30 days'
        AND status NOT IN ('cancelled')
    )
    SELECT 
      cp.orders_count as current_orders,
      pp.orders_count as previous_orders,
      cp.revenue as current_revenue,
      pp.revenue as previous_revenue,
      CASE 
        WHEN pp.orders_count > 0 
        THEN ROUND(((cp.orders_count - pp.orders_count) * 100.0 / pp.orders_count), 2)
        ELSE 0 
      END as orders_growth,
      CASE 
        WHEN pp.revenue > 0 
        THEN ROUND(((cp.revenue - pp.revenue) * 100.0 / pp.revenue), 2)
        ELSE 0 
      END as revenue_growth
    FROM current_period cp, previous_period pp
  `);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalProducts: parseInt(totalProducts.rows[0].count),
        totalOrders: parseInt(totalOrders.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].total_revenue),
        avgOrderValue: parseFloat(totalRevenue.rows[0].avg_order_value),
        completedOrders: parseInt(totalRevenue.rows[0].completed_orders)
      },
      growth: growthMetrics.rows[0] || {
        current_orders: 0,
        previous_orders: 0,
        current_revenue: 0,
        previous_revenue: 0,
        orders_growth: 0,
        revenue_growth: 0
      },
      recentOrders: recentOrders.rows,
      topProducts: topProducts.rows,
      ordersByStatus: ordersByStatus.rows,
      revenueByMonth: revenueByMonth.rows,
      lowStockProducts: lowStockProducts.rows
    }
  });
});

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.status NOT IN ('cancelled')
    WHERE 1=1
  `;
  
  let params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    query += ` AND u.role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  query += ` 
    GROUP BY u.id, u.name, u.email, u.role, u.created_at
    ORDER BY u.created_at DESC 
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const users = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    data: users.rows
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'admin'];
  
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      status: 'error',
      message: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  // Prevent admin from changing their own role
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot change your own role'
    });
  }

  const updatedUser = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
    [role, id]
  );

  if (updatedUser.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User role updated successfully',
    data: updatedUser.rows[0]
  });
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days

  const [
    salesTrend,
    categoryPerformance,
    customerSegments,
    productPerformance
  ] = await Promise.all([
    // Sales trend over time
    pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${parseInt(period)} days'
        AND status NOT IN ('cancelled')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `),
    
    // Category performance
    pool.query(`
      SELECT 
        p.category,
        COUNT(oi.id) as items_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled')
      WHERE p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY revenue DESC
    `),
    
    // Customer segments
    pool.query(`
      SELECT 
        CASE 
          WHEN total_spent >= 1000 THEN 'VIP'
          WHEN total_spent >= 500 THEN 'Premium'
          WHEN total_spent >= 100 THEN 'Regular'
          ELSE 'New'
        END as segment,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spent
      FROM (
        SELECT 
          u.id,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.status NOT IN ('cancelled')
        GROUP BY u.id
      ) customer_totals
      GROUP BY segment
      ORDER BY avg_spent DESC
    `),
    
    // Product performance
    pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock_quantity,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled')
      GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity
      ORDER BY revenue DESC
      LIMIT 20
    `)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      salesTrend: salesTrend.rows,
      categoryPerformance: categoryPerformance.rows,
      customerSegments: customerSegments.rows,
      productPerformance: productPerformance.rows
    }
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAnalytics
};