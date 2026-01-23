# E-Commerce API 🛒

Comprehensive e-commerce REST API powering complete online shopping experiences with advanced product management, intelligent shopping cart system, order processing, and real-time analytics dashboard for modern retail operations.

## 🚀 What This API Powers

### Complete E-Commerce Engine
- **Advanced Product Catalog** - Full CRUD operations with categories, inventory tracking, and stock validation
- **Intelligent Shopping Cart** - Real-time cart management with stock validation and quantity controls
- **Order Processing System** - Complete order lifecycle from creation to delivery with status tracking
- **User Authentication** - JWT-based secure registration and login with role-based access control
- **Inventory Management** - Real-time stock tracking with low-stock alerts and automatic deduction

### Customer Shopping Experience
- **Product Discovery** - Advanced search, filtering, and pagination across product catalog
- **Smart Cart Management** - Add, update, remove items with real-time stock validation
- **Order Tracking** - Complete order history with status updates and delivery tracking
- **Account Management** - User profiles with order history and preferences
- **Wishlist Functionality** - Save products for future purchase consideration

### Administrative Command Center
- **Real-Time Analytics Dashboard** - Comprehensive statistics with revenue tracking and growth metrics
- **Product Management Suite** - Bulk operations, inventory control, and category management
- **Order Management System** - Process orders, update status, and handle fulfillment workflow
- **Customer Relationship Management** - User administration with order statistics and role management
- **Business Intelligence** - Sales trends, customer segmentation, and performance analytics

### Enterprise-Grade Features
- **Advanced Analytics Engine** - 30-day growth comparisons, top-selling products, and revenue trends
- **Customer Segmentation** - VIP, Premium, Regular, and New customer classification
- **Stock Management System** - Automatic stock deduction, overselling prevention, and low-stock alerts
- **Transaction Processing** - Atomic database transactions ensuring data integrity
- **Performance Optimization** - Database indexing, connection pooling, and efficient queries

## 🚀 Features

### Customer Features
- **Product Browsing**: Search, filter, and paginate products
- **Shopping Cart**: Add/remove items, manage quantities with stock validation
- **Order Management**: Create orders, track status, view history
- **User Authentication**: JWT-based registration and login

### Admin Features
- **Product Management (CRUD)**
  - Create, update, delete products
  - Manage inventory and stock levels
  - Category management
  - Image URL support
  
- **Order Oversight**
  - Update order status (pending → processing → shipped → delivered)
  - View all orders with filtering
  - Order analytics and reporting
  
- **User Management**
  - View all users with order statistics
  - Update user roles (user/admin)
  - Role-based access control
  
- **Dashboard & Analytics**
  - Real-time statistics (users, products, orders, revenue)
  - Growth metrics (30-day comparisons)
  - Top-selling products analysis
  - Revenue trends and category performance
  - Low stock alerts
  - Customer segmentation

### Technical Features
- **Security**: JWT authentication with role-based authorization
- **Database**: PostgreSQL with proper relationships and constraints
- **API Design**: RESTful endpoints with comprehensive error handling
- **Validation**: Input validation and stock management
- **Transactions**: Database transactions for order processing

## 📋 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, rate limiting, error handling

## 🛠 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```bash
   # Run the e-commerce schema (includes sample data)
   npm run setup
   ```

4. **Start Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🔧 Environment Variables

```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products (Public + Admin)
- `GET /api/products` - Get all products (pagination, search, filter)
- `GET /api/products/categories` - Get all categories
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Shopping Cart (Authenticated)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders (Authenticated + Admin)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order (processes cart)
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Admin Dashboard & Analytics
- `GET /api/admin/dashboard` - Get comprehensive dashboard stats
- `GET /api/admin/analytics` - Get detailed analytics data
- `GET /api/admin/users` - Get all users with order statistics
- `PUT /api/admin/users/:id/role` - Update user role

### E-commerce Dashboard
- `GET /api/ecommerce/stats` - Get admin e-commerce statistics
- `GET /api/ecommerce/my-ecommerce` - Get user's e-commerce data

## 🔐 Authentication & Authorization

### User Roles
- **User**: Can browse products, manage cart, place orders
- **Admin**: Full access to all endpoints plus management capabilities

### Protected Routes
- All `/api/cart/*` routes require authentication
- All `/api/orders/*` routes require authentication  
- All `/api/admin/*` routes require admin role
- Product CUD operations require admin role

### JWT Token Usage
```javascript
// Include in request headers
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **products** - Product catalog with categories and stock
- **cart_items** - Shopping cart items linked to users
- **orders** - Order records with status tracking
- **order_items** - Individual items within orders

### Key Relationships
- Users have many cart_items and orders
- Products have many cart_items and order_items
- Orders have many order_items
- Foreign key constraints ensure data integrity

### Sample Data
The setup script includes:
- 10 sample products across various categories
- Proper indexes for performance
- Constraints for data validation

## 📊 Admin Dashboard Features

### Overview Statistics
- Total users, products, orders, revenue
- Average order value and completion rates
- 30-day growth metrics with percentage changes

### Real-time Analytics
- Sales trends over customizable periods
- Category performance analysis
- Customer segmentation (VIP, Premium, Regular, New)
- Product performance rankings

### Management Tools
- Low stock alerts (products < 10 units)
- Recent order monitoring
- Order status distribution
- Revenue tracking by month

### User Management
- User listing with search and filtering
- Order statistics per user
- Role management (promote/demote users)
- Account creation tracking

## 🚀 Advanced Features

### Stock Management
- Real-time stock validation during cart operations
- Automatic stock deduction on order completion
- Low stock alerts in admin dashboard
- Prevents overselling with database constraints

### Order Processing
- Atomic transactions for order creation
- Automatic cart clearing after successful orders
- Stock validation before order completion
- Comprehensive order status workflow

### Search & Filtering
- Full-text search across product names and descriptions
- Category-based filtering
- Price range filtering
- Sorting by multiple criteria (name, price, date, stock)

### Performance Optimizations
- Database indexes on frequently queried fields
- Pagination for large datasets
- Efficient JOIN queries for related data
- Connection pooling for database operations

## 🧪 Testing

### Demo Admin Account
```
Email: admin@ecommerce.com
Password: admin123
Role: admin
```

### Demo User Account
```
Email: user@ecommerce.com  
Password: user123
Role: user
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Login to get token
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'

# Use token for protected routes
curl -X GET http://localhost:5002/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔗 Related Projects

- **E-Commerce Frontend** - React TypeScript frontend application
- **Dashboard API** - Separate project management system
- **Auth API** - Standalone authentication service

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Built as part of a comprehensive full-stack portfolio demonstrating:
- RESTful API design and implementation
- Database design and optimization
- Authentication and authorization
- Role-based access control
- Real-time analytics and reporting
- E-commerce business logic
- Admin dashboard development