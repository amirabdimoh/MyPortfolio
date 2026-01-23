const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cartItems = await pool.query(`
    SELECT ci.*, p.name, p.price::numeric as price, p.image_url, p.stock_quantity,
           (ci.quantity * p.price::numeric) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at DESC
  `, [userId]);

  const total = cartItems.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const itemCount = cartItems.rows.reduce((sum, item) => sum + item.quantity, 0);

  res.status(200).json({
    status: 'success',
    data: {
      items: cartItems.rows,
      summary: {
        itemCount,
        total: parseFloat(total.toFixed(2))
      }
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Product ID is required'
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Quantity must be greater than 0'
    });
  }

  // Check if product exists and has sufficient stock
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);
  
  if (product.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found'
    });
  }

  if (product.rows[0].stock_quantity < quantity) {
    return res.status(400).json({
      status: 'error',
      message: `Insufficient stock. Available: ${product.rows[0].stock_quantity}`
    });
  }

  // Check if item already exists in cart
  const existingItem = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, product_id]
  );

  let cartItem;

  if (existingItem.rows.length > 0) {
    // Update existing item
    const newQuantity = existingItem.rows[0].quantity + quantity;
    
    if (newQuantity > product.rows[0].stock_quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot add ${quantity} more items. Total would exceed available stock (${product.rows[0].stock_quantity})`
      });
    }

    cartItem = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 AND product_id = $3 RETURNING *`,
      [newQuantity, userId, product_id]
    );
  } else {
    // Create new cart item
    cartItem = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, product_id, quantity]
    );
  }

  // Get the complete cart item with product details
  const completeItem = await pool.query(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity,
           (ci.quantity * p.price) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = $1
  `, [cartItem.rows[0].id]);

  res.status(200).json({
    status: 'success',
    message: 'Item added to cart successfully',
    data: completeItem.rows[0]
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Quantity must be greater than 0'
    });
  }

  // Check if cart item exists and belongs to user
  const cartItem = await pool.query(
    'SELECT ci.*, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1 AND ci.user_id = $2',
    [id, userId]
  );

  if (cartItem.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart item not found'
    });
  }

  if (quantity > cartItem.rows[0].stock_quantity) {
    return res.status(400).json({
      status: 'error',
      message: `Insufficient stock. Available: ${cartItem.rows[0].stock_quantity}`
    });
  }

  const updatedItem = await pool.query(
    `UPDATE cart_items 
     SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [quantity, id, userId]
  );

  // Get the complete updated item with product details
  const completeItem = await pool.query(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity,
           (ci.quantity * p.price) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = $1
  `, [updatedItem.rows[0].id]);

  res.status(200).json({
    status: 'success',
    message: 'Cart item updated successfully',
    data: completeItem.rows[0]
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const deletedItem = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );

  if (deletedItem.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart item not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Item removed from cart successfully'
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully'
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};