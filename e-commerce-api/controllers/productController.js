const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products with pagination and filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, search, sort = 'created_at', order = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
  let params = [];
  let paramIndex = 1;

  // Add filters
  if (category) {
    query += ` AND category ILIKE $${paramIndex}`;
    countQuery += ` AND category ILIKE $${paramIndex}`;
    params.push(`%${category}%`);
    paramIndex++;
  }

  if (search) {
    query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Add sorting and pagination
  const validSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const [products, totalCount] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
  ]);

  const totalPages = Math.ceil(totalCount.rows[0].count / limit);

  res.status(200).json({
    status: 'success',
    data: {
      products: products.rows.map(product => ({
        ...product,
        price: parseFloat(product.price),
        stock_quantity: parseInt(product.stock_quantity)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

  if (product.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...product.rows[0],
      price: parseFloat(product.rows[0].price),
      stock_quantity: parseInt(product.rows[0].stock_quantity)
    }
  });
});

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, image_url, stock_quantity } = req.body;

  // Validation
  if (!name || !price || !category) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, price, and category are required'
    });
  }

  if (price < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Price must be a positive number'
    });
  }

  const newProduct = await pool.query(
    `INSERT INTO products (name, description, price, category, image_url, stock_quantity) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, description, price, category, image_url || null, stock_quantity || 0]
  );

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: newProduct.rows[0]
  });
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url, stock_quantity } = req.body;

  // Check if product exists
  const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  
  if (existingProduct.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found'
    });
  }

  // Validation
  if (price && price < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Price must be a positive number'
    });
  }

  if (stock_quantity && stock_quantity < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Stock quantity must be a positive number'
    });
  }

  const updatedProduct = await pool.query(
    `UPDATE products 
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         category = COALESCE($4, category),
         image_url = COALESCE($5, image_url),
         stock_quantity = COALESCE($6, stock_quantity),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7 RETURNING *`,
    [name, description, price, category, image_url, stock_quantity, id]
  );

  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully',
    data: updatedProduct.rows[0]
  });
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedProduct = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

  if (deletedProduct.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully'
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await pool.query(
    'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
  );

  res.status(200).json({
    status: 'success',
    data: categories.rows.map(row => row.category)
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};