# Dashboard App - Quick Start Guide

Get the full-stack dashboard running in 5 minutes!

## 🚀 Quick Setup

### 1. Setup Database

```bash
# Create PostgreSQL database
createdb dashboard_db

# Run database schema
cd dashboard-api
psql dashboard_db < config/database.sql
```

### 2. Start Backend API

```bash
# Terminal 1 - Backend
cd dashboard-api
npm install
npm run dev
```

Backend will run on [http://localhost:5002](http://localhost:5002)

### 3. Start Frontend App

```bash
# Terminal 2 - Frontend
cd dashboard-app
npm install
npm start
```

Frontend will open at [http://localhost:3000](http://localhost:3000)

## 🔐 Login

Use these demo credentials:

**Admin Account:**
- Email: `admin@dashboard.com`
- Password: `password123`

**User Account:**
- Email: `john@dashboard.com`
- Password: `password123`

## ✅ Verify Setup

1. Backend health check: [http://localhost:5002/health](http://localhost:5002/health)
2. Frontend login page: [http://localhost:3000](http://localhost:3000)
3. Login with demo credentials
4. Explore the dashboard!

## 📊 Features to Try

### As Admin:
- View system-wide statistics
- See all projects and tasks
- Check team performance
- View upcoming deadlines

### As User:
- View personal dashboard
- See assigned tasks
- View owned projects
- Track task progress

## 🐛 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running
- Verify credentials in `dashboard-api/.env`

**API connection error:**
- Ensure backend is running on port 5002
- Check `dashboard-app/.env` has correct API_URL

**Port already in use:**
- Backend: Change PORT in `dashboard-api/.env`
- Frontend: Set PORT=3001 before `npm start`

## 📝 Environment Files

**dashboard-api/.env:**
```env
NODE_ENV=development
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashboard_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
```

**dashboard-app/.env:**
```env
REACT_APP_API_URL=http://localhost:5002/api
```

## 🎯 Next Steps

1. Explore the codebase
2. Try creating new projects
3. Add tasks and assign them
4. Test different user roles
5. Check the API documentation

## 📚 Documentation

- [Frontend README](./README.md)
- [Backend README](../dashboard-api/README.md)
- [Main Portfolio README](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)

Happy coding! 🚀
