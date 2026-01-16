const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { sendTokenResponse } = require('../utils/jwt');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Check if user exists
  const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (userExists.rows.length > 0) {
    return next(new AppError('Email already registered', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
    [name, email, hashedPassword]
  );

  const user = result.rows[0];

  // Send token response
  sendTokenResponse(user, 201, res);
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
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid credentials', 401));
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // Check password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const result = await pool.query(
    'SELECT id, name, email, role, is_active, email_verified, last_login, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return next(new AppError('Please provide name or email to update', 400));
  }

  // Check if email is being changed and if it already exists
  if (email) {
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );

    if (emailCheck.rows.length > 0) {
      return next(new AppError('Email already in use', 400));
    }
  }

  const fieldsToUpdate = [];
  const values = [];
  let paramCount = 1;

  if (name) {
    fieldsToUpdate.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }

  if (email) {
    fieldsToUpdate.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }

  values.push(req.user.id);

  const result = await pool.query(
    `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role`,
    values
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  // Get user with password
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];

  // Check current password
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, req.user.id]
  );

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email', 400));
  }

  // Check if user exists
  const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return next(new AppError('No user found with that email', 404));
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save token to database (expires in 10 minutes)
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, hashedToken, new Date(Date.now() + 10 * 60 * 1000)]
  );

  // In production, send email with reset link
  // For now, just return the token
  res.status(200).json({
    status: 'success',
    message: 'Password reset token generated',
    resetToken // In production, this would be sent via email
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide new password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find valid token
  const result = await pool.query(
    `SELECT user_id FROM password_reset_tokens 
     WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP AND used = false`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid or expired token', 400));
  }

  const userId = result.rows[0].user_id;

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update password
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

  // Mark token as used
  await pool.query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [hashedToken]);

  // Get user
  const userResult = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [userId]
  );

  // Send token response
  sendTokenResponse(userResult.rows[0], 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
};