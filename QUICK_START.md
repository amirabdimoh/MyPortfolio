# 🚀 Quick Start Guide - Student Management System

## 📋 Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
# Backend dependencies
cd student-api
npm install

# Frontend dependencies  
cd ../student-management-system
npm install
cd ..
```

### 2. Database Setup
```bash
# Create database
createdb student_db

# Run schema
psql -U postgres -d student_db -f student-api/config/enhanced-database.sql

# Create admin users
cd student-api
node setup-users.js
cd ..
```

### 3. Configure Environment
```bash
# Copy environment template
cp student-api/.env.example student-api/.env

# Edit student-api/.env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=student_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
```

### 4. Start Applications
```bash
# Terminal 1: Start backend
cd student-api
npm start

# Terminal 2: Start frontend
cd student-management-system
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Demo Login
- **Admin**: admin@university.edu / admin123
- **Staff**: staff@university.edu / staff123

## ✅ Verify Setup
```bash
# Test complete system
node student-management-system/test-complete-system.js
```

## 🎯 Key Features to Demo

### Admin Dashboard
- Real-time student statistics
- Major performance analysis  
- Course enrollment tracking
- Recent activity monitoring

### Student Management
- Complete CRUD operations
- Advanced search & filtering
- Bulk status updates
- Individual student details

### Authentication
- Role-based access (Admin/Staff)
- JWT token security
- Protected routes

## 🏗️ Project Structure
```
├── student-api/              # Backend Express API
│   ├── controllers/          # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth & validation
│   └── config/              # Database setup
├── student-management-system/ # Frontend React app
│   ├── src/components/      # React components
│   ├── src/contexts/        # State management
│   └── src/hooks/           # Custom hooks
└── Documentation/           # Comprehensive docs
```

## 🎓 Portfolio Highlights
- **Full-stack** React/Node.js application
- **PostgreSQL** database with optimized queries
- **JWT authentication** with role-based access
- **Admin dashboard** with real-time analytics
- **TypeScript** for type safety
- **Responsive design** for all devices
- **Production-ready** with comprehensive documentation

---
**🌟 Your portfolio project is ready to impress!**