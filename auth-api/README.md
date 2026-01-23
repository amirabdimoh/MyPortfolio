# Authentication API 🔐

Professional authentication and user management REST API delivering secure, scalable user authentication with JWT tokens, role-based access control, and comprehensive security features.

## 🚀 What This API Delivers

### Complete Authentication System
- **User Registration** - Secure account creation with email validation
- **JWT Authentication** - Token-based login with automatic refresh
- **Password Security** - bcrypt hashing with forgot/reset functionality
- **Profile Management** - Update user details and preferences
- **Session Management** - Secure logout with token invalidation

### Enterprise Security
- **Rate Limiting** - Prevents brute force attacks (configurable limits)
- **CORS Protection** - Secure cross-origin resource sharing
- **Helmet Security** - Production-ready security headers
- **Input Sanitization** - SQL injection and XSS prevention
- **HTTP-Only Cookies** - Secure token storage mechanism

### Admin User Management
- **User Directory** - Paginated user listing with search
- **Role Management** - Assign and modify user roles
- **Account Control** - Activate, deactivate, or remove users
- **Bulk Operations** - Efficient multi-user management

### Role-Based Access Control
- **User Permissions** - Standard user access and operations
- **Admin Privileges** - Full system administration capabilities
- **Route Protection** - Middleware-based access control

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
cd auth-api
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb auth_db

# Run database schema
psql auth_db < config/database.sql
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
# Server
NODE_ENV=development
PORT=5001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Client
CLIENT_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Details
```http
PUT /api/auth/updatedetails
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

#### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Forgot Password
```http
POST /api/auth/forgotpassword
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PUT /api/auth/resetpassword/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Management Routes (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john&role=user
Authorization: Bearer <admin_token>
```

#### Get Single User
```http
GET /api/users/:id
Authorization: Bearer <admin_token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "is_active": true
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

## 🔐 Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Store Token** → Save in HTTP-only cookie or Authorization header
3. **Protected Requests** → Include token in requests
4. **Token Verification** → Server validates token
5. **Access Granted** → Return requested data

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (user/admin)
- `is_active` - Account status
- `email_verified` - Email verification status
- `last_login` - Last login timestamp
- `created_at` - Account creation date

### Password Reset Tokens Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - Hashed reset token
- `expires_at` - Token expiration
- `used` - Token usage status
- `created_at` - Token creation date

## 🧪 Testing with Postman/Thunder Client

1. **Register a new user**
2. **Login to get JWT token**
3. **Copy token from response**
4. **Add to Authorization header**: `Bearer <token>`
5. **Test protected routes**

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ HTTP-only cookies prevent XSS
- ✅ Rate limiting prevents brute force
- ✅ CORS configured for specific origins
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ SQL injection prevention with parameterized queries
- ✅ Role-based access control

## 📝 Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
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

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure PostgreSQL connection
4. Set up SSL/TLS
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up monitoring and logging

## 📸 Screenshots

[Add screenshots of API testing in Postman/Thunder Client]

## 🎯 Learning Outcomes

- JWT authentication implementation
- Password hashing and security
- Role-based access control
- Rate limiting and security middleware
- PostgreSQL with Node.js
- RESTful API design
- Error handling patterns
- Token-based authentication flow

## 🔗 Related Projects

- [Student Management API](../student-api) - CRUD API example
- [Full-Stack Dashboard](../dashboard-app) - Frontend integration

## 📄 License

MIT

## 👤 Author

Built as part of a professional portfolio project demonstrating backend development skills.
