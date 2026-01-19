const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Utility function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const camelObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelObj;
};

// @desc    Get all students with optional filtering and sorting
// @route   GET /api/students
// @access  Public
const getAllStudents = asyncHandler(async (req, res, next) => {
  const { search, status, major, sortBy = 'id', order = 'ASC' } = req.query;

  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  let paramCount = 1;

  // Search filter
  if (search) {
    query += ` AND (
      first_name ILIKE $${paramCount} OR 
      last_name ILIKE $${paramCount} OR 
      email ILIKE $${paramCount} OR 
      phone ILIKE $${paramCount} OR 
      major ILIKE $${paramCount}
    )`;
    params.push(`%${search}%`);
    paramCount++;
  }

  // Status filter
  if (status && status !== 'all') {
    query += ` AND status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  // Major filter
  if (major && major !== 'all') {
    query += ` AND major = $${paramCount}`;
    params.push(major);
    paramCount++;
  }

  // Sorting
  const validSortFields = ['id', 'first_name', 'last_name', 'email', 'major', 'gpa', 'status', 'enrollment_date'];
  const validOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
  const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
  
  query += ` ORDER BY ${sortField} ${sortOrder}`;

  const result = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      students: toCamelCase(result.rows)
    }
  });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
const getStudentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      student: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Public
const createStudent = asyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    enrollment_date,
    major,
    gpa,
    status = 'Active',
    address
  } = req.body;

  // Check if email already exists
  const emailCheck = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
  
  if (emailCheck.rows.length > 0) {
    return next(new AppError('Email already exists', 400));
  }

  const result = await pool.query(
    `INSERT INTO students 
    (first_name, last_name, email, phone, date_of_birth, enrollment_date, major, gpa, status, address) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *`,
    [first_name, last_name, email, phone, date_of_birth, enrollment_date, major, gpa, status, address]
  );

  res.status(201).json({
    status: 'success',
    data: {
      student: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    enrollment_date,
    major,
    gpa,
    status,
    address
  } = req.body;

  // Check if student exists
  const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [id]);
  
  if (studentCheck.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  // Check if email is being changed and if it already exists
  if (email) {
    const emailCheck = await pool.query(
      'SELECT id FROM students WHERE email = $1 AND id != $2',
      [email, id]
    );
    
    if (emailCheck.rows.length > 0) {
      return next(new AppError('Email already exists', 400));
    }
  }

  const result = await pool.query(
    `UPDATE students 
    SET first_name = $1, last_name = $2, email = $3, phone = $4, 
        date_of_birth = $5, enrollment_date = $6, major = $7, gpa = $8, 
        status = $9, address = $10
    WHERE id = $11 
    RETURNING *`,
    [first_name, last_name, email, phone, date_of_birth, enrollment_date, major, gpa, status, address, id]
  );

  res.status(200).json({
    status: 'success',
    data: {
      student: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Student deleted successfully',
    data: null
  });
});

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Public
const getStudentStats = asyncHandler(async (req, res, next) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'Active') as active,
      COUNT(*) FILTER (WHERE status = 'Inactive') as inactive,
      COUNT(*) FILTER (WHERE status = 'Graduated') as graduated,
      ROUND(AVG(gpa)::numeric, 2) as average_gpa
    FROM students
  `;

  const result = await pool.query(statsQuery);

  res.status(200).json({
    status: 'success',
    data: {
      stats: result.rows[0]
    }
  });
});

// @desc    Get unique majors
// @route   GET /api/students/majors
// @access  Public
const getMajors = asyncHandler(async (req, res, next) => {
  const result = await pool.query(
    'SELECT DISTINCT major FROM students ORDER BY major'
  );

  const majors = result.rows.map(row => row.major);

  res.status(200).json({
    status: 'success',
    data: {
      majors
    }
  });
});

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  getMajors
};