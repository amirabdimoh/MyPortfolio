-- Create database
CREATE DATABASE student_db;

-- Connect to the database
\c student_db;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    enrollment_date DATE NOT NULL,
    major VARCHAR(100) NOT NULL,
    gpa DECIMAL(3, 2) CHECK (gpa >= 0 AND gpa <= 4),
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Graduated')) DEFAULT 'Active',
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_students_email ON students(email);

-- Create index on status for filtering
CREATE INDEX idx_students_status ON students(status);

-- Create index on major for filtering
CREATE INDEX idx_students_major ON students(major);

-- Insert sample data
INSERT INTO students (first_name, last_name, email, phone, date_of_birth, enrollment_date, major, gpa, status, address) VALUES
('John', 'Doe', 'john.doe@university.edu', '+1 (555) 123-4567', '2002-05-15', '2020-09-01', 'Computer Science', 3.8, 'Active', '123 Main St, City, State 12345'),
('Jane', 'Smith', 'jane.smith@university.edu', '+1 (555) 234-5678', '2001-08-22', '2019-09-01', 'Business Administration', 3.9, 'Active', '456 Oak Ave, City, State 12345'),
('Michael', 'Johnson', 'michael.j@university.edu', '+1 (555) 345-6789', '2000-12-10', '2018-09-01', 'Engineering', 3.7, 'Graduated', '789 Pine Rd, City, State 12345'),
('Emily', 'Davis', 'emily.davis@university.edu', '+1 (555) 456-7890', '2003-03-18', '2021-09-01', 'Psychology', 3.6, 'Active', '321 Elm St, City, State 12345'),
('David', 'Wilson', 'david.wilson@university.edu', '+1 (555) 567-8901', '2002-11-25', '2020-09-01', 'Mathematics', 3.95, 'Active', '654 Maple Dr, City, State 12345');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE
    ON students FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();