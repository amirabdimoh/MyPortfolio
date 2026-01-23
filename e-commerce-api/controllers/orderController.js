const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT o.id, o.user_id, o.total_amount::numeric as total, o.shipping_address, o.payment_method, o.status, o.created_at, o.updated_at, json_agg(
      json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', p.name,
        'quantity', oi.quantity,
        'price', oi.price::numeric,
        'image_url', p.image_url
      )
    ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = $1
  `;
  
  let params = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const orders = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    data: orders.rows
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  let query = `
    SELECT o.*, u.name as customer_name, u.email as customer_email,
           json_agg(
             json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'product_name', p.name,
               'quantity', oi.quantity,
               'price', oi.price,
               'image_url', p.image_url
             )
           ) as items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = $1
  `;

  let params = [id];

  // Non-admin users can only see their own orders
  if (!isAdmin) {
    query += ` AND o.user_id = $2`;
    params.push(userId);
  }

  query += ` GROUP BY o.id, u.name, u.email`;

  const order = await pool.query(query, params);

  if (order.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: order.rows[0]
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shipping_address, payment_method } = req.body;

  if (!shipping_address || !payment_method) {
    return res.status(400).json({
      status: 'error',
      message: 'Shipping address and payment method are required'
    });
  }

  // Get user's cart items
  const cartItems = await pool.query(`
    SELECT ci.*, p.name, p.price, p.stock_quantity
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
  `, [userId]);

  if (cartItems.rows.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cart is empty'
    });
  }

  // Check stock availability
  for (const item of cartItems.rows) {
    if (item.quantity > item.stock_quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}`
      });
    }
  }

  // Calculate total amount
  const totalAmount = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create order
    const newOrder = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [userId, totalAmount, shipping_address, payment_method]
    );

    const orderId = newOrder.rows[0].id;

    // Create order items and update stock
    for (const item of cartItems.rows) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Update product stock
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Clear user's cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Get the complete order with items
    const completeOrder = await pool.query(`
      SELECT o.*, json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id
    `, [orderId]);

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: completeOrder.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  const updatedOrder = await pool.query(
    `UPDATE orders 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 RETURNING *`,
    [status, id]
  );

  if (updatedOrder.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Order status updated successfully',
    data: updatedOrder.rows[0]
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, user_id } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  
  let params = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND o.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (user_id) {
    query += ` AND o.user_id = $${paramIndex}`;
    params.push(user_id);
    paramIndex++;
  }

  query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const orders = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    data: orders.rows
  });
});

module.exports = {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getAllOrders
};