const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role = 'staff' } = req.body;

  // Validation
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Check if user already exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (existingUser.rows.length > 0) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );

  const user = result.rows[0];

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (result.rows.length === 0) {
    return next(new AppError('Invalid credentials', 401));
  }

  const user = result.rows[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  // Check if email is being changed and if it already exists
  if (email && email !== req.user.email) {
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    
    if (emailCheck.rows.length > 0) {
      return next(new AppError('Email already exists', 400));
    }
  }

  const result = await pool.query(
    'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, role',
    [name, email, userId]
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  // Get user with password
  const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};