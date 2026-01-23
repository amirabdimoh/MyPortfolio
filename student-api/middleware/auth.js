const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { AppError, asyncHandler } = require('./errorHandler');

// =====================================
// Protect routes – verify JWT
// =====================================
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Token from cookies (optional)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. No token
  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    );

    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User no longer exists.', 401));
    }

    // Attach user
    req.user = result.rows[0];
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
});

// =====================================
// Admin only middleware
// =====================================
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return next(
    new AppError('Access denied. Admin privileges required.', 403)
  );
});

// =====================================
// Admin OR Staff middleware
// =====================================
const adminOrStaff = asyncHandler(async (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.role === 'staff')
  ) {
    return next();
  }

  return next(
    new AppError('Access denied. Admin or staff privileges required.', 403)
  );
});

module.exports = {
  protect,
  adminOnly,
  adminOrStaff
};
