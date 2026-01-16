# Dashboard API

Enterprise-grade REST API for project and task management dashboard built with Node.js, Express, PostgreSQL, and JWT authentication.

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt
- HTTP-only cookies

### Project Management
- Full CRUD operations for projects
- Project status tracking (planning, in-progress, completed, on-hold, cancelled)
- Priority levels (low, medium, high, urgent)
- Budget tracking
- Project ownership
- Task count per project

### Task Management
- Full CRUD operations for tasks
- Task assignment to users
- Status tracking (todo, in-progress, review, completed, cancelled)
- Priority levels
- Due date tracking
- Project association

### Dashboard Analytics
- Admin dashboard with system-wide statistics
- User dashboard with personal statistics
- Project and task metrics
- Team performance tracking
- Upcoming deadlines
- Recent activity

### Security
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation
- SQL injection prevention
- Error handling middleware

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## 🛠 Installation

1. **Install Dependencies**
```bash
cd dashboard-api
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb dashboard_db

# Run database schema
psql dashboard_db < config/database.sql
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashboard_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication

```http
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user (Protected)
POST /api/auth/logout - Logout user (Protected)
```

### Projects

```http
GET /api/projects - Get all projects (Protected)
GET /api/projects/:id - Get single project (Protected)
POST /api/projects - Create project (Protected)
PUT /api/projects/:id - Update project (Protected)
DELETE /api/projects/:id - Delete project (Protected, Admin)
```

### Tasks

```http
GET /api/tasks - Get all tasks (Protected)
GET /api/tasks/:id - Get single task (Protected)
POST /api/tasks - Create task (Protected)
PUT /api/tasks/:id - Update task (Protected)
DELETE /api/tasks/:id - Delete task (Protected)
```

### Dashboard

```http
GET /api/dashboard/stats - Get admin dashboard stats (Protected, Admin)
GET /api/dashboard/my-dashboard - Get user dashboard (Protected)
```

## 🧪 Testing

**Demo Credentials:**
- Email: admin@dashboard.com
- Password: password123
- Role: Admin

## 📊 Database Schema

- **users** - User accounts with roles
- **projects** - Project information
- **tasks** - Task details with assignments

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests/15min general, 5 requests/15min auth)
- CORS protection
- Helmet.js security headers
- SQL injection prevention
- Input validation

## 📝 Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🚀 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment instructions.

## 📄 License

MIT
