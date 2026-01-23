# Dashboard App Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Dashboard API running (see dashboard-api/SETUP_GUIDE.md)

## Installation Steps

### 1. Install Dependencies
```bash
cd dashboard-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the dashboard-app directory:
```env
REACT_APP_API_URL=http://localhost:5002/api
```

### 3. Start the Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

### Admin Account (Full Access)
- **Email**: admin@dashboard.com
- **Password**: admin123
- **Features**: Complete admin dashboard with all management capabilities

### User Account (Limited Access)
- **Email**: john@dashboard.com
- **Password**: password123
- **Features**: Personal dashboard with assigned tasks and projects

## Dashboard Features

### User Dashboard (All Users)
- **Personal Overview**: View assigned tasks and owned projects
- **Task Management**: Track personal task progress and deadlines
- **Project Participation**: View projects you're involved in
- **Activity Timeline**: Recent activities and updates

### Admin Dashboard (Admin Users Only)

#### 1. Project Management
- **Create Projects**: Add new projects with details, budgets, and timelines
- **Edit Projects**: Update project information, status, and assignments
- **Delete Projects**: Remove completed or cancelled projects
- **Status Tracking**: Monitor project progress through different phases
- **Budget Management**: Track project costs and financial planning
- **Owner Assignment**: Assign project ownership to team members

#### 2. Task Management
- **Create Tasks**: Add new tasks with descriptions and requirements
- **Edit Tasks**: Update task details, priorities, and assignments
- **Delete Tasks**: Remove completed or obsolete tasks
- **Assignment Management**: Assign tasks to specific team members
- **Priority Setting**: Set task priorities (low, medium, high, urgent)
- **Due Date Tracking**: Monitor task deadlines and overdue items
- **Status Workflow**: Track tasks through todo → in-progress → review → completed

#### 3. User Management
- **View All Users**: Browse complete user directory with filtering
- **Create Users**: Add new team members with roles and departments
- **Edit User Profiles**: Update user information and settings
- **Role Management**: Promote users to admin or change to regular user
- **Status Control**: Activate or deactivate user accounts
- **Department Organization**: Organize users by departments and positions
- **Delete Users**: Remove users from the system

#### 4. Team Analytics
- **Performance Metrics**: Individual and team performance tracking
- **Completion Rates**: Task and project completion statistics
- **Workload Distribution**: Analyze task distribution across team members
- **Department Analytics**: Performance breakdown by departments
- **Trend Analysis**: Track performance trends over time
- **Productivity Insights**: Identify high and low performers

#### 5. Dashboard Statistics
- **Real-time Overview**: Live statistics and key performance indicators
- **Project Distribution**: Visual breakdown of projects by status
- **Task Analytics**: Task distribution by status and priority
- **Team Performance**: Rankings and completion rates
- **Upcoming Deadlines**: Critical deadline tracking and alerts
- **Growth Metrics**: Progress tracking and trend analysis

## User Interface Components

### Navigation
- **Role-based Menu**: Different navigation options for admin vs regular users
- **Quick Actions**: Fast access to common tasks
- **User Profile**: Account settings and logout functionality

### Dashboard Views
- **Admin Dashboard**: Comprehensive management interface with all admin tools
- **User Dashboard**: Personal workspace with relevant tasks and projects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Data Management
- **Real-time Updates**: Live data synchronization with the backend
- **Filtering and Search**: Advanced filtering options for all data views
- **Pagination**: Efficient handling of large datasets
- **Sorting**: Customizable sorting options for tables and lists

### Visual Elements
- **Charts and Graphs**: Visual representation of analytics data
- **Status Indicators**: Color-coded status badges and progress bars
- **Priority Badges**: Visual priority indicators for tasks and projects
- **Avatar System**: User profile pictures and initials

## Admin Workflow Examples

### Daily Admin Tasks
1. **Morning Review**:
   - Check dashboard statistics for overnight updates
   - Review upcoming deadlines and overdue tasks
   - Monitor team performance metrics

2. **Project Management**:
   - Update project statuses based on team progress
   - Create new projects for upcoming initiatives
   - Assign project ownership and update budgets

3. **Task Coordination**:
   - Create and assign new tasks to team members
   - Update task priorities based on business needs
   - Review completed tasks and provide feedback

4. **Team Management**:
   - Review user performance and completion rates
   - Update user roles and permissions as needed
   - Onboard new team members and set up accounts

### Weekly Admin Activities
1. **Analytics Review**:
   - Analyze team performance trends
   - Identify bottlenecks and improvement opportunities
   - Generate reports for stakeholders

2. **Resource Planning**:
   - Review project budgets and resource allocation
   - Plan upcoming projects and resource requirements
   - Adjust team assignments based on workload

3. **System Maintenance**:
   - Clean up completed projects and archived tasks
   - Update user information and department changes
   - Review and update system settings

## User Workflow Examples

### Daily User Tasks
1. **Dashboard Check**:
   - Review assigned tasks and priorities
   - Check upcoming deadlines
   - Update task progress and status

2. **Task Management**:
   - Work on assigned tasks
   - Update task status as work progresses
   - Communicate with project owners about blockers

3. **Project Participation**:
   - Contribute to assigned projects
   - Collaborate with team members
   - Report progress to project owners

## Technical Features

### Authentication
- JWT-based secure authentication
- Role-based access control
- Automatic token refresh
- Secure logout functionality

### Data Management
- RESTful API integration
- Real-time data synchronization
- Optimistic UI updates
- Error handling and retry logic

### Performance
- Lazy loading for large datasets
- Efficient state management
- Optimized rendering
- Responsive design patterns

### Security
- Protected routes based on user roles
- Secure API communication
- Input validation and sanitization
- XSS and CSRF protection

## Development

### Available Scripts
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure
```
dashboard-app/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard component
│   │   ├── ProjectManagement.tsx
│   │   ├── TaskManagement.tsx
│   │   ├── UserManagement.tsx
│   │   └── TeamAnalytics.tsx
│   ├── services/           # API services
│   │   └── api.ts         # API client configuration
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── styles/            # CSS and styling
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## Troubleshooting

### Common Issues

#### Login Problems
1. Verify API is running on correct port (5002)
2. Check network connectivity to backend
3. Verify credentials match database users
4. Clear browser localStorage and cookies

#### Data Loading Issues
1. Check API endpoint URLs in environment variables
2. Verify authentication token is valid
3. Check browser network tab for API errors
4. Ensure user has proper permissions

#### Permission Errors
1. Verify user role (admin vs user)
2. Check if user account is active
3. Ensure proper authentication
4. Contact admin to verify permissions

### Performance Issues
1. Clear browser cache
2. Check network connection speed
3. Verify API response times
4. Monitor browser console for errors

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set production environment variables:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

### Deployment Options
1. **Static Hosting**: Deploy build folder to services like Netlify, Vercel, or AWS S3
2. **Docker**: Use provided Dockerfile for containerized deployment
3. **Traditional Hosting**: Deploy to Apache/Nginx web servers
4. **CDN**: Use content delivery networks for global distribution

### Security Considerations
1. Use HTTPS in production
2. Configure proper CORS settings
3. Implement CSP headers
4. Regular security updates
5. Monitor for vulnerabilities

For detailed API documentation, refer to `dashboard-api/SETUP_GUIDE.md`.