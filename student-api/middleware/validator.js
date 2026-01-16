const { AppError } = require('./errorHandler');

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

// Validate date format
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Validate student data
const validateStudent = (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    enrollment_date,
    major,
    gpa,
    status,
    address
  } = req.body;

  // Required fields validation
  if (!first_name || !first_name.trim()) {
    return next(new AppError('First name is required', 400));
  }

  if (!last_name || !last_name.trim()) {
    return next(new AppError('Last name is required', 400));
  }

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Valid email is required', 400));
  }

  if (!phone || !isValidPhone(phone)) {
    return next(new AppError('Valid phone number is required', 400));
  }

  if (!date_of_birth || !isValidDate(date_of_birth)) {
    return next(new AppError('Valid date of birth is required', 400));
  }

  if (!enrollment_date || !isValidDate(enrollment_date)) {
    return next(new AppError('Valid enrollment date is required', 400));
  }

  if (!major || !major.trim()) {
    return next(new AppError('Major is required', 400));
  }

  if (gpa === undefined || gpa === null || gpa < 0 || gpa > 4) {
    return next(new AppError('GPA must be between 0 and 4', 400));
  }

  if (status && !['Active', 'Inactive', 'Graduated'].includes(status)) {
    return next(new AppError('Status must be Active, Inactive, or Graduated', 400));
  }

  if (!address || !address.trim()) {
    return next(new AppError('Address is required', 400));
  }

  next();
};

// Validate student ID parameter
const validateStudentId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return next(new AppError('Invalid student ID', 400));
  }

  next();
};

module.exports = {
  validateStudent,
  validateStudentId
};