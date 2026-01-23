const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  delete user.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: { user }
    });
};

module.exports = { generateToken, verifyToken, sendTokenResponse };
