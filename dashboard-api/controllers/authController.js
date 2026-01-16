const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendTokenResponse } = require('../utils/jwt');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, position } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (userExists.rows.length > 0) {
    return next(new AppError('Email already registered', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, department, position) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department, position, created_at',
    [name, email, hashedPassword, department || null, position || null]
  );

  sendTokenResponse(result.rows[0], 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return next(new AppError('Invalid credentials', 401));
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Invalid credentials', 401));
  }

  await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const result = await pool.query(
    'SELECT id, name, email, role, avatar, department, position, is_active, email_verified, last_login, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  res.status(200).json({
    status: 'success',
    data: { user: result.rows[0] }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
    data: null
  });
});
