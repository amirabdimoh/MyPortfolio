require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// --------------------
// Security middleware
// --------------------
// app.use(helmet({ hsts: false, contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// --------------------
// Body parsers
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------
// Logging
// --------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --------------------
// Rate limiting
// --------------------
app.use('/api', generalLimiter);

// --------------------
// Routes
// --------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// --------------------
// Health check
// --------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// --------------------
// 404 handler (FIXED ✅)
// MUST be after all routes
// --------------------
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// --------------------
// Global error handler
// --------------------
app.use(errorHandler);

// --------------------
// Server
// --------------------
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Dashboard API server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
