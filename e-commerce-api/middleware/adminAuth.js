const { asyncHandler } = require('./errorHandler');

// @desc    Admin only middleware
// @access  Private/Admin
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
});

// @desc    Admin or owner middleware (for accessing own resources)
// @access  Private
const adminOrOwner = (resourceUserIdField = 'user_id') => {
  return asyncHandler(async (req, res, next) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && (
      req.user.id === parseInt(req.params.id) || 
      req.user.id === parseInt(req.params.userId) ||
      req.user.id === parseInt(req.body[resourceUserIdField])
    );

    if (isAdmin || isOwner) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges or resource ownership required.'
      });
    }
  });
};

module.exports = {
  adminOnly,
  adminOrOwner
};