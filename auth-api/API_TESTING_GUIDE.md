# Authentication API Testing Guide

Quick guide to test all authentication endpoints using Thunder Client, Postman, or curl.

## 🚀 Setup

1. **Start PostgreSQL** and create database:
```bash
createdb auth_db
psql auth_db < config/database.sql
```

2. **Configure Environment**:
```bash
# Make sure .env file has correct settings
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5001
```

3. **Start Server**:
```bash
npm run dev
```

## 📝 Test Endpoints

### 1. Health Check
```http
GET http://localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Auth API is running",
  "timestamp": "2026-01-17T..."
}
```

---

### 2. Register User
```http
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2026-01-17T..."
    }
  }
}
```

**Save the token for next requests!**

---

### 3. Login
```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### 4. Get Current User (Protected)
```http
GET http://localhost:5001/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "is_active": true,
      "email_verified": false,
      "last_login": "2026-01-17T...",
      "created_at": "2026-01-17T..."
    }
  }
}
```

---

### 5. Update User Details (Protected)
```http
PUT http://localhost:5001/api/auth/updatedetails
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Updated",
      "email": "john.new@example.com",
      "role": "user"
    }
  }
}
```

---

### 6. Update Password (Protected)
```http
PUT http://localhost:5001/api/auth/updatepassword
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "new_token_here...",
  "data": {
    "user": { ... }
  }
}
```

---

### 7. Forgot Password
```http
POST http://localhost:5001/api/auth/forgotpassword
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Password reset token generated",
  "resetToken": "abc123def456..."
}
```

**Save the resetToken for next step!**

---

### 8. Reset Password
```http
PUT http://localhost:5001/api/auth/resetpassword/abc123def456
Content-Type: application/json

{
  "password": "brandnewpassword123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "new_token_here...",
  "data": {
    "user": { ... }
  }
}
```

---

### 9. Logout (Protected)
```http
POST http://localhost:5001/api/auth/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}
```

---

## 👑 Admin Endpoints

First, manually update a user to admin role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'john@example.com';
```

### 10. Get All Users (Admin Only)
```http
GET http://localhost:5001/api/users?page=1&limit=10&search=john&role=user
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "results": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "is_active": true,
        "email_verified": false,
        "last_login": "2026-01-17T...",
        "created_at": "2026-01-17T..."
      }
    ]
  }
}
```

---

### 11. Get Single User (Admin Only)
```http
GET http://localhost:5001/api/users/1
Authorization: Bearer ADMIN_TOKEN_HERE
```

---

### 12. Update User (Admin Only)
```http
PUT http://localhost:5001/api/users/1
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated by Admin",
  "role": "admin",
  "is_active": false
}
```

---

### 13. Delete User (Admin Only)
```http
DELETE http://localhost:5001/api/users/2
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": null
}
```

---

## 🧪 Testing Scenarios

### Test 1: Rate Limiting
Make 6+ requests to `/api/auth/login` within 15 minutes:

**Expected:** 429 Too Many Requests after 5 attempts

---

### Test 2: Invalid Token
Use an invalid or expired token:

**Expected:** 401 Unauthorized

---

### Test 3: Non-Admin Access
Try to access `/api/users` with a regular user token:

**Expected:** 403 Forbidden

---

### Test 4: Validation Errors
Register with invalid data:
```json
{
  "name": "",
  "email": "invalid-email",
  "password": "123"
}
```

**Expected:** 400 Bad Request with validation messages

---

## 🔧 Thunder Client Collection

Create a new collection with these requests and use environment variables:

**Environment Variables:**
```json
{
  "baseUrl": "http://localhost:5001",
  "token": "",
  "adminToken": ""
}
```

**Usage:**
- After login/register, copy the token
- Set it in environment: `{{token}}`
- Use in Authorization header: `Bearer {{token}}`

---

## 📊 Database Queries

Check users:
```sql
SELECT id, name, email, role, is_active FROM users;
```

Check password reset tokens:
```sql
SELECT * FROM password_reset_tokens WHERE used = false;
```

Make user admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## ✅ Success Checklist

- [ ] Health check returns 200
- [ ] User can register
- [ ] User can login
- [ ] Protected routes require token
- [ ] User can update details
- [ ] User can change password
- [ ] Password reset flow works
- [ ] Rate limiting works
- [ ] Admin can manage users
- [ ] Non-admin gets 403 on admin routes
- [ ] Invalid tokens return 401
- [ ] Validation errors return 400

---

## 🐛 Common Issues

**Issue:** Cannot connect to database  
**Solution:** Check PostgreSQL is running and .env credentials are correct

**Issue:** Token expired  
**Solution:** Login again to get a new token

**Issue:** Rate limit exceeded  
**Solution:** Wait 15 minutes or restart server

**Issue:** 403 Forbidden on admin routes  
**Solution:** Update user role to 'admin' in database

---

## 📝 Notes

- Tokens expire after 7 days (configurable in .env)
- Rate limit: 5 requests per 15 minutes for auth endpoints
- Rate limit: 100 requests per 15 minutes for general endpoints
- Passwords are hashed with bcrypt (12 rounds)
- HTTP-only cookies are set for additional security
