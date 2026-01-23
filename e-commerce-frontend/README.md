# E-Commerce Frontend 🛍️

Modern e-commerce web application built with React 18 and TypeScript, delivering comprehensive online shopping experience with product catalog, shopping cart management, order processing, and administrative dashboard.

## 🚀 What This Application Delivers

### Complete Shopping Experience
- **Product Catalog Interface** - Browse, search, and filter products with advanced pagination
- **Shopping Cart Management** - Add, update, remove items with real-time price calculations
- **Secure Checkout Process** - Streamlined order placement with validation and confirmation
- **Order Tracking System** - View order history with real-time status updates
- **User Account Dashboard** - Manage profile, preferences, and order history

### Advanced Customer Features
- **Intelligent Product Search** - Multi-criteria search with category and price filtering
- **Wishlist Management** - Save favorite products for future purchase
- **Product Reviews & Ratings** - Customer feedback system with rating display
- **Responsive Shopping Cart** - Persistent cart across sessions with stock validation
- **Order Management** - Complete order lifecycle tracking from placement to delivery

### Administrative Interface
- **Sales Analytics Dashboard** - Real-time revenue tracking and performance metrics
- **Product Management Console** - Add, edit, delete products with inventory control
- **Order Processing Center** - Manage orders, update status, and handle fulfillment
- **Customer Management System** - User administration with order statistics and support tools
- **Business Intelligence** - Sales trends, customer insights, and growth analytics

### Modern Technical Architecture
- **React 18 with TypeScript** - Latest React features with full type safety and concurrent rendering
- **State Management** - Efficient state handling with React hooks and context API
- **API Integration** - Seamless backend communication with comprehensive error handling
- **Responsive Design** - Mobile-first approach optimized for all devices and screen sizes
- **Performance Optimization** - Code splitting, lazy loading, and efficient re-rendering strategies

## 📋 Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: CSS3 (Custom)
- **State Management**: React Hooks
- **API Client**: Fetch API
- **Authentication**: JWT tokens
- **Build Tool**: Create React App

## 🛠 Installation

1. **Install Dependencies**
```bash
cd e-commerce-frontend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with API URL
```

3. **Start Development Server**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

```env
REACT_APP_API_URL=http://localhost:5002/api
```

## 📚 Project Structure

```
dashboard-app/
├── src/
│   ├── components/
│   │   ├── Login.tsx          # Authentication component
│   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   ├── Stats.tsx          # Statistics display
│   │   ├── ProjectList.tsx    # Project listing
│   │   └── TaskList.tsx       # Task listing
│   ├── services/
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx                # Main app component
│   └── App.css                # Global styles
├── public/
└── package.json
```

## 🎯 Usage

### Login
1. Open the app
2. Use demo credentials:
   - Email: admin@dashboard.com
   - Password: password123
3. Or register a new account

### Dashboard Navigation
- **Overview**: View statistics and recent activity
- **Projects**: Manage all projects
- **Tasks**: View and manage tasks

### User Roles
- **User**: Can view own tasks and projects
- **Admin**: Full system access with analytics

## 🔐 Authentication Flow

1. User logs in with email/password
2. Server returns JWT token
3. Token stored in localStorage
4. Token sent with each API request
5. Protected routes require valid token

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Testing

**Demo Credentials:**
- **Admin Account**
  - Email: admin@dashboard.com
  - Password: password123
  
- **User Account**
  - Email: john@dashboard.com
  - Password: password123

## 🚀 Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## 📊 Features Breakdown

### Overview Tab
- Total statistics cards
- Recent projects list
- Recent tasks list
- Upcoming deadlines (Admin)
- Team performance (Admin)

### Projects Tab
- Project listing table
- Status badges
- Priority indicators
- Task progress
- Budget information

### Tasks Tab
- Task listing table
- Status and priority badges
- Project association
- Assignment information
- Due dates

## 🎨 UI Components

- **Login Card**: Authentication form
- **Navigation Bar**: User info and logout
- **Tabs**: Content navigation
- **Stats Cards**: Metric display
- **Tables**: Data listing
- **Badges**: Status indicators

## 🔗 API Integration

The app connects to the Dashboard API for:
- Authentication
- Project data
- Task data
- Dashboard statistics

See [dashboard-api/README.md](../dashboard-api/README.md) for API documentation.

## 📸 Screenshots

[Add screenshots of your dashboard]

## 🎓 Learning Outcomes

- React with TypeScript
- JWT authentication
- API integration
- State management
- Protected routes
- Responsive design
- Modern UI/UX patterns

## 🔗 Related Projects

- [Dashboard API](../dashboard-api) - Backend API
- [Auth API](../auth-api) - Authentication reference
- [Student API](../student-api) - REST API reference

## 📄 License

MIT

## 👤 Author

Built as part of a professional portfolio project demonstrating full-stack development skills.
