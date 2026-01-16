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
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- Sample data
INSERT INTO users (name, email, password, role, department, position) VALUES
('Admin User', 'admin@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'admin', 'Management', 'CEO'),
('John Doe', 'john@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Engineering', 'Developer'),
('Jane Smith', 'jane@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Design', 'Designer'),
('Bob Wilson', 'bob@dashboard.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowO4S', 'user', 'Marketing', 'Manager');

INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, owner_id, created_by) VALUES
('Website Redesign', 'Complete redesign of company website with modern UI/UX', 'in-progress', 'high', '2026-01-01', '2026-03-31', 50000.00, 2, 1),
('Mobile App Development', 'Native mobile app for iOS and Android', 'planning', 'urgent', '2026-02-01', '2026-06-30', 100000.00, 2, 1),
('Marketing Campaign', 'Q1 2026 marketing campaign across all channels', 'in-progress', 'medium', '2026-01-15', '2026-04-15', 25000.00, 4, 1),
('Database Migration', 'Migrate from MySQL to PostgreSQL', 'completed', 'high', '2025-11-01', '2025-12-31', 15000.00, 2, 1);

INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date) VALUES
('Design homepage mockup', 'Create high-fidelity mockup for new homepage', 'completed', 'high', 1, 3, 1, '2026-01-15'),
('Implement responsive navigation', 'Build mobile-responsive navigation component', 'in-progress', 'high', 1, 2, 1, '2026-01-25'),
('Setup project repository', 'Initialize Git repo and CI/CD pipeline', 'completed', 'medium', 2, 2, 1, '2026-02-05'),
('Create social media content', 'Design posts for Instagram and Facebook', 'in-progress', 'medium', 3, 3, 1, '2026-01-20'),
('Write blog posts', 'Create 5 SEO-optimized blog posts', 'todo', 'low', 3, 4, 1, '2026-02-01'),
('Database schema design', 'Design new PostgreSQL schema', 'completed', 'high', 4, 2, 1, '2025-11-15'),
('Data migration script', 'Write migration scripts', 'completed', 'urgent', 4, 2, 1, '2025-12-01'),
('Testing and validation', 'Test migrated data integrity', 'completed', 'high', 4, 2, 1, '2025-12-20');

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
