# Dashboard API Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
cd dashboard-api
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashboard_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5002
NODE_ENV=development
```

### 3. Database Setup

#### Create Database
First, create the PostgreSQL database:
```sql
CREATE DATABASE dashboard_db;
```

#### Initialize Schema and Sample Data
Run the setup script to create tables and insert sample data:
```bash
node setup-database.js
```

This will:
- Create all required tables (users, projects, tasks)
- Set up indexes for optimal performance
- Insert sample data for testing
- Create database triggers for automatic timestamp updates

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5002`

## Default Accounts

### Admin Account
- **Email**: admin@dashboard.com
- **Password**: admin123
- **Role**: admin
- **Access**: Full admin dashboard with all management features

### Sample User Accounts
- **Email**: john@dashboard.com
- **Password**: password123
- **Role**: user
- **Department**: Development

- **Email**: jane@dashboard.com
- **Password**: password123
- **Role**: user
- **Department**: Design

- **Email**: bob@dashboard.com
- **Password**: password123
- **Role**: user
- **Department**: Marketing

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Dashboard Analytics (Admin Only)
- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics
- `GET /api/dashboard/my-dashboard` - Get user-specific dashboard data

### User Management (Admin Only)
- `GET /api/users` - Get all users with filtering
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin only)
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task (Admin only)
- `DELETE /api/tasks/:id` - Delete task (Admin only)

## Admin Dashboard Features

### 1. Project Management
- Create, edit, and delete projects
- Set project status, priority, and deadlines
- Assign project owners
- Track project budgets
- Monitor project progress

### 2. Task Management
- Create, edit, and delete tasks
- Assign tasks to team members
- Set task priorities and due dates
- Track task status and completion
- Link tasks to projects

### 3. User Management
- View all users with filtering options
- Create new user accounts
- Update user roles (admin/user)
- Manage user status (active/inactive)
- Update user profiles and departments
- Delete user accounts

### 4. Team Analytics
- Team performance metrics
- Task completion rates
- Project status distribution
- Priority-based task analysis
- Upcoming deadline tracking
- Department-wise analytics

### 5. Dashboard Statistics
- Real-time overview metrics
- Recent projects and tasks
- Team performance rankings
- Deadline alerts and notifications
- Growth tracking and trends

## Database Schema

### Users Table
- User authentication and profile information
- Role-based access control (admin/user)
- Department and position tracking
- Account status management

### Projects Table
- Project information and metadata
- Status tracking (planning, in-progress, completed, on-hold, cancelled)
- Priority levels (low, medium, high, urgent)
- Budget and timeline management
- Owner assignment

### Tasks Table
- Task details and descriptions
- Status workflow (todo, in-progress, review, completed, cancelled)
- Priority management
- Project association
- User assignment (assigned_to, created_by)
- Due date tracking

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation and sanitization
- SQL injection prevention

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Reset
To reset the database with fresh sample data:
```bash
node setup-database.js
```

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Verify network connectivity

### Authentication Issues
1. Check JWT_SECRET in `.env`
2. Verify user credentials
3. Check token expiration
4. Clear browser localStorage

### Permission Errors
1. Verify user role (admin/user)
2. Check route protection middleware
3. Ensure proper authentication headers

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong JWT_SECRET
3. Configure proper database credentials
4. Set up SSL/TLS encryption
5. Configure reverse proxy (nginx/Apache)
6. Set up monitoring and logging
7. Configure backup strategies

For production deployment, consider using environment variables or a secure configuration management system instead of `.env` files.