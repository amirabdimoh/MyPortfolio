const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, name, email, role, is_active, email_verified, last_login, created_at 
    FROM users 
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (role) {
    query += ` AND role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
  const countParams = [];
  let countParamCount = 1;

  if (search) {
    countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
    countParamCount++;
  }

  if (role) {
    countQuery += ` AND role = $${countParamCount}`;
    countParams.push(role);
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users: result.rows
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT id, name, email, role, is_active, email_verified, last_login, created_at FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, is_active } = req.body;

  // Check if user exists
  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);

  if (userCheck.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  // Check if email is being changed and if it already exists
  if (email) {
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return next(new AppError('Email already in use', 400));
    }
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
     RETURNING id, name, email, role, is_active, email_verified, created_at`,
    values
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user.id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

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

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser
};
