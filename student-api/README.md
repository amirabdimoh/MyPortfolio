# Student Management REST API 🎓

A professional-grade RESTful API built with Node.js, Express, and PostgreSQL for managing student records. Features complete CRUD operations, advanced filtering, sorting, validation, and error handling.

![REST API](https://via.placeholder.com/800x400/667eea/ffffff?text=Student+Management+REST+API)

## ✨ Features

### Core Functionality
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete students
- 🔍 **Advanced Search** - Search across multiple fields
- 🎯 **Filtering** - Filter by status and major
- 📊 **Sorting** - Sort by any field (ascending/descending)
- 📈 **Statistics** - Get real-time student statistics
- ✅ **Validation** - Comprehensive input validation
- 🛡️ **Error Handling** - Robust error handling middleware
- 🔒 **Security** - Helmet, CORS, input sanitization

### Technical Features
- 🏗️ **MVC Architecture** - Clean, maintainable code structure
- 🗄️ **PostgreSQL** - Relational database with indexes
- 🔄 **RESTful Standards** - Proper HTTP methods and status codes
- 📝 **Logging** - Morgan for request logging
- 🌍 **CORS** - Cross-Origin Resource Sharing enabled
- ⚡ **Performance** - Database indexing and query optimization

## 🛠 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Environment variable management
- **cors** - CORS middleware
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **nodemon** - Development auto-reload

## 📂 Project Structure

```
student-api/
│
├── config/
│   ├── database.js          # Database connection
│   └── database.sql         # Database schema & seed data
├── controllers/
│   └── studentController.js # Business logic
├── middleware/
│   ├── errorHandler.js      # Error handling
│   └── validator.js         # Input validation
├── routes/
│   └── studentRoutes.js     # API routes
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore file
├── server.js               # Entry point
├── package.json            # Dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
cd student-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL database:**

First, make sure PostgreSQL is installed and running.

```bash
# Login to PostgreSQL
psql -U postgres

# Run the SQL script
\i config/database.sql

# Or manually:
CREATE DATABASE student_db;
\c student_db;
# Then copy and paste the contents of database.sql
```

4. **Configure environment variables:**

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_db
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=http://localhost:3000
```

5. **Start the server:**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/students
```

### Endpoints

#### 1. Get All Students
```http
GET /api/students
```

**Query Parameters:**
- `search` - Search across name, email, phone, major
- `status` - Filter by status (Active, Inactive, Graduated)
- `major` - Filter by major
- `sortBy` - Sort field (id, first_name, last_name, email, major, gpa, status, enrollment_date)
- `order` - Sort order (ASC, DESC)

**Example:**
```bash
GET /api/students?search=john&status=Active&sortBy=gpa&order=DESC
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "students": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@university.edu",
        "phone": "+1 (555) 123-4567",
        "date_of_birth": "2002-05-15",
        "enrollment_date": "2020-09-01",
        "major": "Computer Science",
        "gpa": 3.8,
        "status": "Active",
        "address": "123 Main St, City, State 12345",
        "created_at": "2026-01-16T...",
        "updated_at": "2026-01-16T..."
      }
    ]
  }
}
```

#### 2. Get Student by ID
```http
GET /api/students/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "student": { ... }
  }
}
```

#### 3. Create Student
```http
POST /api/students
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@university.edu",
  "phone": "+1 (555) 123-4567",
  "date_of_birth": "2002-05-15",
  "enrollment_date": "2020-09-01",
  "major": "Computer Science",
  "gpa": 3.8,
  "status": "Active",
  "address": "123 Main St, City, State 12345"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "student": { ... }
  }
}
```

#### 4. Update Student
```http
PUT /api/students/:id
```

**Request Body:** Same as Create Student

**Response:**
```json
{
  "status": "success",
  "data": {
    "student": { ... }
  }
}
```

#### 5. Delete Student
```http
DELETE /api/students/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Student deleted successfully",
  "data": null
}
```

#### 6. Get Statistics
```http
GET /api/students/stats
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "total": "10",
      "active": "7",
      "inactive": "1",
      "graduated": "2",
      "average_gpa": "3.75"
    }
  }
}
```

#### 7. Get Majors
```http
GET /api/students/majors
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "majors": [
      "Business Administration",
      "Computer Science",
      "Engineering",
      "Mathematics",
      "Psychology"
    ]
  }
}
```

## 🧪 Testing with Postman/cURL

### Create a Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice.j@university.edu",
    "phone": "+1 (555) 999-8888",
    "date_of_birth": "2003-07-20",
    "enrollment_date": "2021-09-01",
    "major": "Computer Science",
    "gpa": 3.9,
    "status": "Active",
    "address": "789 Oak St, City, State 12345"
  }'
```

### Get All Students
```bash
curl http://localhost:5000/api/students
```

### Get Student by ID
```bash
curl http://localhost:5000/api/students/1
```

### Update Student
```bash
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@university.edu",
    "phone": "+1 (555) 123-4567",
    "date_of_birth": "2002-05-15",
    "enrollment_date": "2020-09-01",
    "major": "Computer Science",
    "gpa": 3.9,
    "status": "Active",
    "address": "123 Main St, City, State 12345"
  }'
```

### Delete Student
```bash
curl -X DELETE http://localhost:5000/api/students/1
```

## 🔒 Error Handling

The API uses consistent error responses:

```json
{
  "status": "fail",
  "message": "Error description here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## ✅ Validation Rules

- **first_name**: Required, non-empty string
- **last_name**: Required, non-empty string
- **email**: Required, valid email format, unique
- **phone**: Required, valid phone format
- **date_of_birth**: Required, valid date
- **enrollment_date**: Required, valid date
- **major**: Required, non-empty string
- **gpa**: Required, number between 0 and 4
- **status**: Must be 'Active', 'Inactive', or 'Graduated'
- **address**: Required, non-empty string

## 🗄️ Database Schema

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    enrollment_date DATE NOT NULL,
    major VARCHAR(100) NOT NULL,
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4),
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Graduated')),
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Key Features Explained

### 1. MVC Architecture
```
Routes → Controllers → Database
```

### 2. Error Handling
```javascript
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 3. Input Validation
```javascript
const validateStudent = (req, res, next) => {
  // Validation logic
  if (!first_name || !first_name.trim()) {
    return next(new AppError('First name is required', 400));
  }
  next();
};
```

### 4. Database Connection Pooling
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | student_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| CORS_ORIGIN | Allowed origin | http://localhost:3000 |

## 🚀 Deployment

### Heroku

1. Create Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
```

4. Deploy:
```bash
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection
psql -U postgres -d student_db
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📚 Learning Outcomes

This project demonstrates:
- ✅ RESTful API design principles
- ✅ Express.js middleware
- ✅ PostgreSQL database operations
- ✅ SQL queries and joins
- ✅ Error handling patterns
- ✅ Input validation
- ✅ Security best practices
- ✅ Environment configuration
- ✅ MVC architecture
- ✅ Async/await patterns

## 🚀 Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Pagination
- [ ] File upload (student photos)
- [ ] Email notifications
- [ ] Audit logging
- [ ] Database migrations
- [ ] Docker containerization

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourusername)

---

⭐ If you found this helpful, please give it a star on GitHub!

**Built with ❤️ using Node.js, Express, and PostgreSQL**