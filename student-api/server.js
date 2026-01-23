const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
// app.use(helmet({ hsts: false, contentSecurityPolicy: false }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Management API is running',
    timestamp: new Date().toISOString(),
    features: [
      'Student Management (CRUD)',
      'Course Management',
      'Enrollment System',
      'Admin Dashboard',
      'Authentication & Authorization',
      'Role-based Access Control'
    ]
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Student Management API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔐 Admin features enabled with role-based access control`);
  console.log(`📚 Endpoints:`);
  console.log(`   - Students: /api/students`);
  console.log(`   - Auth: /api/auth`);
  console.log(`   - Admin: /api/admin`);
  console.log(`   - Courses: /api/courses`);
  console.log(`   - Enrollments: /api/enrollments`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = app;