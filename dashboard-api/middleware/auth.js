const pool = require('../config/database');
const { verifyToken } = require('../utils/jwt');
const { AppError, asyncHandler } = require('./errorHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError('Invalid or expired token', 401));
  }

  const result = await pool.query(
    'SELECT id, name, email, role, is_active, department, position FROM users WHERE id = $1',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User no longer exists', 401));
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  req.user = user;
  next();
});

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

module.exports = { protect, restrictTo };
