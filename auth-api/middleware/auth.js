const pool = require('../config/database');
const { verifyToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');
const { asyncHandler } = require('./errorHandler');

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError('Invalid or expired token', 401));
  }

  // Check if user still exists
  const result = await pool.query(
    'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User no longer exists', 401));
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // Grant access to protected route
  req.user = user;
  next();
});

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};