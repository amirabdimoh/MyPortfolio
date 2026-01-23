# Dashboard API 📊

Enterprise-grade project and task management REST API powering comprehensive dashboard analytics, team collaboration, and project tracking with real-time statistics and role-based access control.

## 🚀 What This API Powers

### Project Management Engine
- **Complete Project Lifecycle** - Create, track, and manage projects from planning to completion
- **Status Tracking** - Real-time project status (planning, in-progress, completed, on-hold, cancelled)
- **Priority Management** - Four-tier priority system (low, medium, high, urgent)
- **Budget Monitoring** - Track project budgets and financial metrics
- **Team Assignment** - Project ownership and team member allocation

### Advanced Task System
- **Full Task Management** - Create, assign, update, and track tasks
- **Workflow States** - Complete task lifecycle (todo, in-progress, review, completed, cancelled)
- **Smart Assignment** - Assign tasks to team members with notification system
- **Deadline Tracking** - Due date management with overdue detection
- **Project Integration** - Seamless task-to-project association

### Real-Time Analytics Dashboard
- **Admin Analytics** - System-wide statistics and performance metrics
- **Personal Dashboards** - User-specific task and project insights
- **Team Performance** - Productivity tracking and team metrics
- **Deadline Management** - Upcoming deadlines and overdue alerts
- **Activity Streams** - Recent activity tracking across projects

### Enterprise Security & Performance
- **JWT Authentication** - Secure token-based user authentication
- **Role-Based Access** - Admin and user permission levels
- **Rate Limiting** - API protection (100 requests/15min, 5 auth requests/15min)
- **Security Headers** - Helmet.js protection with CORS configuration
- **Input Validation** - Comprehensive data validation and sanitization

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
