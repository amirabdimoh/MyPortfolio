-- Dashboard Database Schema

-- Drop existing tables
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- Sample data
INSERT INTO users (name, email, password, role, department, position) VALUES
('Admin User', 'admin@dashboard.com', '$2b$12$27jV6rPGvtbr8mJOExdeoui2NaOTAjAY8GoCL1b52NN3h/.bs/.HK', 'admin', 'Management', 'CEO'),
('John Doe', 'john@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Development', 'Senior Developer'),
('Jane Smith', 'jane@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Design', 'UI/UX Designer'),
('Bob Johnson', 'bob@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Marketing', 'Marketing Manager');

INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, owner_id) VALUES
('Website Redesign', 'Complete overhaul of company website with modern design and improved UX', 'in-progress', 'high', '2024-01-15', '2024-03-30', 50000.00, 1),
('Mobile App Development', 'Native mobile application for iOS and Android platforms', 'planning', 'urgent', '2024-02-01', '2024-06-30', 120000.00, 1),
('Database Migration', 'Migrate legacy database to modern cloud infrastructure', 'completed', 'medium', '2023-11-01', '2024-01-15', 25000.00, 2),
('API Integration', 'Integrate third-party APIs for enhanced functionality', 'in-progress', 'medium', '2024-01-20', '2024-02-28', 15000.00, 2);

INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date) VALUES
('Design homepage mockups', 'Create wireframes and high-fidelity mockups for the new homepage', 'completed', 'high', 1, 3, 1, '2024-02-15'),
('Implement responsive design', 'Ensure website works perfectly on all device sizes', 'in-progress', 'high', 1, 2, 1, '2024-03-15'),
('Set up development environment', 'Configure development tools and environment for mobile app', 'completed', 'urgent', 2, 2, 1, '2024-02-10'),
('Create user authentication', 'Implement secure user login and registration system', 'todo', 'high', 2, 2, 1, '2024-03-01'),
('Data migration script', 'Write migration scripts for database transfer', 'completed', 'urgent', 3, 2, 1, '2024-01-10'),
('Testing and validation', 'Test migrated data integrity and performance', 'completed', 'high', 3, 2, 1, '2024-01-14'),
('Research API providers', 'Evaluate and select appropriate third-party APIs', 'in-progress', 'medium', 4, 2, 1, '2024-02-20'),
('Implement API endpoints', 'Develop backend integration for selected APIs', 'todo', 'medium', 4, 2, 1, '2024-02-28');

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
