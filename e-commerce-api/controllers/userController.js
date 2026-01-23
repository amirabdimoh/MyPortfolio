const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { role, department, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, name, email, role, avatar, department, position, is_active, email_verified, last_login, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  if (department) {
    query += ` AND department = $${paramCount}`;
    params.push(department);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1' +
    (role ? ` AND role = '${role}'` : '') +
    (department ? ` AND department = '${department}'` : '');
  const countResult = await pool.query(countQuery);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(countResult.rows[0].count / limit)
    },
    data: { users: result.rows }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT id, name, email, role, avatar, department, position, is_active, email_verified, last_login, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user: result.rows[0] }
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, department, position } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return next(new AppError('User already exists', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, department, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, avatar, department, position, is_active, email_verified, created_at, updated_at`,
    [name, email, hashedPassword, role || 'user', department, position]
  );

  res.status(201).json({
    status: 'success',
    data: { user: result.rows[0] }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, department, position, is_active } = req.body;

  const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);

  if (checkUser.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const fieldsToUpdate = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    fieldsToUpdate.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (email !== undefined) {
    fieldsToUpdate.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }
  if (role !== undefined) {
    fieldsToUpdate.push(`role = $${paramCount}`);
    values.push(role);
    paramCount++;
  }
  if (department !== undefined) {
    fieldsToUpdate.push(`department = $${paramCount}`);
    values.push(department);
    paramCount++;
  }
  if (position !== undefined) {
    fieldsToUpdate.push(`position = $${paramCount}`);
    values.push(position);
    paramCount++;
  }
  if (is_active !== undefined) {
    fieldsToUpdate.push(`is_active = $${paramCount}`);
    values.push(is_active);
    paramCount++;
  }

  if (fieldsToUpdate.length === 0) {
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramCount}
     RETURNING id, name, email, role, avatar, department, position, is_active, email_verified, created_at, updated_at`,
    values
  );

  res.status(200).json({
    status: 'success',
    data: { user: result.rows[0] }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
    data: null
  });
});