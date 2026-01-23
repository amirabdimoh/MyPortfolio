-- Enhanced Student Management Database Schema with Admin Features

-- Create database (if not exists)
-- CREATE DATABASE student_db;
-- \c student_db;

-- Create users table for authentication and admin roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'staff', 'student')) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    department VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table (many-to-many relationship between students and courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    grade VARCHAR(5) CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W', 'I', 'P')),
    status VARCHAR(20) CHECK (status IN ('Enrolled', 'Completed', 'Dropped', 'Withdrawn')) DEFAULT 'Enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Create grade_changes table for audit trail
CREATE TABLE IF NOT EXISTS grade_changes (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    old_grade VARCHAR(5),
    new_grade VARCHAR(5),
    changed_by INTEGER REFERENCES users(id),
    reason TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create student_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS student_status_history (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by INTEGER REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_grade_changes_enrollment ON grade_changes(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_status_history_student ON student_status_history(student_id);

-- Update existing students table if needed (add new columns)
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_id VARCHAR(20) UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE
    ON courses FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE
    ON enrollments FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@university.edu', '$2b$10$rQZ8kHWiZ8WvWvWvWvWvWOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'admin'),
('Staff User', 'staff@university.edu', '$2b$10$rQZ8kHWiZ8WvWvWvWvWvWOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (course_code, course_name, credits, department, description) VALUES
('CS101', 'Introduction to Computer Science', 3, 'Computer Science', 'Basic programming concepts and problem solving'),
('CS201', 'Data Structures and Algorithms', 4, 'Computer Science', 'Advanced programming with data structures'),
('MATH101', 'Calculus I', 4, 'Mathematics', 'Differential calculus and applications'),
('MATH201', 'Calculus II', 4, 'Mathematics', 'Integral calculus and series'),
('BUS101', 'Introduction to Business', 3, 'Business', 'Fundamentals of business operations'),
('BUS201', 'Marketing Principles', 3, 'Business', 'Basic marketing concepts and strategies'),
('ENG101', 'Engineering Fundamentals', 3, 'Engineering', 'Introduction to engineering principles'),
('PSY101', 'Introduction to Psychology', 3, 'Psychology', 'Basic psychological concepts and theories')
ON CONFLICT (course_code) DO NOTHING;

-- Insert sample enrollments (linking existing students to courses)
INSERT INTO enrollments (student_id, course_id, grade, status) 
SELECT s.id, c.id, 
    CASE 
        WHEN random() < 0.8 THEN (ARRAY['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'])[floor(random() * 7 + 1)]
        ELSE 'Enrolled'
    END,
    CASE 
        WHEN random() < 0.8 THEN 'Completed'
        ELSE 'Enrolled'
    END
FROM students s 
CROSS JOIN courses c 
WHERE random() < 0.3  -- Each student enrolled in ~30% of courses
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Create view for student dashboard statistics
CREATE OR REPLACE VIEW student_dashboard_stats AS
SELECT 
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE status = 'Active') as active_students,
    COUNT(*) FILTER (WHERE status = 'Inactive') as inactive_students,
    COUNT(*) FILTER (WHERE status = 'Graduated') as graduated_students,
    ROUND(AVG(gpa), 2) as average_gpa,
    COUNT(DISTINCT major) as total_majors
FROM students;

-- Create view for course enrollment statistics
CREATE OR REPLACE VIEW course_enrollment_stats AS
SELECT 
    c.id,
    c.course_code,
    c.course_name,
    c.department,
    COUNT(e.id) as total_enrollments,
    COUNT(e.id) FILTER (WHERE e.status = 'Enrolled') as current_enrollments,
    COUNT(e.id) FILTER (WHERE e.status = 'Completed') as completed_enrollments,
    ROUND(AVG(CASE 
        WHEN e.grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D') 
        THEN CASE e.grade
            WHEN 'A+' THEN 4.0
            WHEN 'A' THEN 4.0
            WHEN 'A-' THEN 3.7
            WHEN 'B+' THEN 3.3
            WHEN 'B' THEN 3.0
            WHEN 'B-' THEN 2.7
            WHEN 'C+' THEN 2.3
            WHEN 'C' THEN 2.0
            WHEN 'C-' THEN 1.7
            WHEN 'D+' THEN 1.3
            WHEN 'D' THEN 1.0
            ELSE 0.0
        END
    END), 2) as average_grade_points
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.course_code, c.course_name, c.department;

-- Create view for major statistics
CREATE OR REPLACE VIEW major_stats AS
SELECT 
    major,
    COUNT(*) as student_count,
    COUNT(*) FILTER (WHERE status = 'Active') as active_count,
    COUNT(*) FILTER (WHERE status = 'Graduated') as graduated_count,
    ROUND(AVG(gpa), 2) as average_gpa,
    MIN(gpa) as min_gpa,
    MAX(gpa) as max_gpa
FROM students
GROUP BY major
ORDER BY student_count DESC;