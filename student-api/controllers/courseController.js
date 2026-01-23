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

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = asyncHandler(async (req, res, next) => {
  const { department, active = 'true', search } = req.query;

  let query = 'SELECT * FROM courses WHERE 1=1';
  const params = [];
  let paramCount = 1;

  // Active filter
  if (active !== 'all') {
    query += ` AND is_active = $${paramCount}`;
    params.push(active === 'true');
    paramCount++;
  }

  // Department filter
  if (department && department !== 'all') {
    query += ` AND department = $${paramCount}`;
    params.push(department);
    paramCount++;
  }

  // Search filter
  if (search) {
    query += ` AND (
      course_code ILIKE $${paramCount} OR 
      course_name ILIKE $${paramCount} OR 
      department ILIKE $${paramCount}
    )`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ' ORDER BY department, course_code';

  const result = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      courses: toCamelCase(result.rows)
    }
  });
});

// @desc    Get single course with enrollment stats
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [courseResult, enrollmentStats] = await Promise.all([
    pool.query('SELECT * FROM courses WHERE id = $1', [id]),
    pool.query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(*) FILTER (WHERE status = 'Enrolled') as current_enrollments,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_enrollments,
        COUNT(*) FILTER (WHERE status = 'Dropped') as dropped_enrollments
      FROM enrollments WHERE course_id = $1
    `, [id])
  ]);

  if (courseResult.rows.length === 0) {
    return next(new AppError('Course not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course: toCamelCase(courseResult.rows[0]),
      enrollmentStats: toCamelCase(enrollmentStats.rows[0])
    }
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Admin
const createCourse = asyncHandler(async (req, res, next) => {
  const {
    course_code,
    course_name,
    credits,
    department,
    description,
    is_active = true
  } = req.body;

  // Check if course code already exists
  const existingCourse = await pool.query(
    'SELECT id FROM courses WHERE course_code = $1',
    [course_code]
  );

  if (existingCourse.rows.length > 0) {
    return next(new AppError('Course code already exists', 400));
  }

  const result = await pool.query(
    `INSERT INTO courses (course_code, course_name, credits, department, description, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [course_code, course_name, credits, department, description, is_active]
  );

  res.status(201).json({
    status: 'success',
    data: {
      course: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    course_code,
    course_name,
    credits,
    department,
    description,
    is_active
  } = req.body;

  // Check if course exists
  const existingCourse = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
  
  if (existingCourse.rows.length === 0) {
    return next(new AppError('Course not found', 404));
  }

  // Check if course code is being changed and if it already exists
  if (course_code && course_code !== existingCourse.rows[0].course_code) {
    const codeCheck = await pool.query(
      'SELECT id FROM courses WHERE course_code = $1 AND id != $2',
      [course_code, id]
    );
    
    if (codeCheck.rows.length > 0) {
      return next(new AppError('Course code already exists', 400));
    }
  }

  const result = await pool.query(
    `UPDATE courses 
     SET course_code = COALESCE($1, course_code),
         course_name = COALESCE($2, course_name),
         credits = COALESCE($3, credits),
         department = COALESCE($4, department),
         description = COALESCE($5, description),
         is_active = COALESCE($6, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7 RETURNING *`,
    [course_code, course_name, credits, department, description, is_active, id]
  );

  res.status(200).json({
    status: 'success',
    data: {
      course: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if course has enrollments
  const enrollmentCheck = await pool.query(
    'SELECT COUNT(*) FROM enrollments WHERE course_id = $1',
    [id]
  );

  if (parseInt(enrollmentCheck.rows[0].count) > 0) {
    return next(new AppError('Cannot delete course with existing enrollments. Set to inactive instead.', 400));
  }

  const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('Course not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Course deleted successfully'
  });
});

// @desc    Get course enrollments
// @route   GET /api/courses/:id/enrollments
// @access  Admin
const getCourseEnrollments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.query;

  let query = `
    SELECT e.*, s.first_name, s.last_name, s.email, s.student_id
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    WHERE e.course_id = $1
  `;
  
  const params = [id];
  let paramCount = 2;

  if (status && status !== 'all') {
    query += ` AND e.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ' ORDER BY s.last_name, s.first_name';

  const result = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      enrollments: toCamelCase(result.rows)
    }
  });
});

// @desc    Get departments
// @route   GET /api/courses/departments
// @access  Public
const getDepartments = asyncHandler(async (req, res, next) => {
  const result = await pool.query(
    'SELECT DISTINCT department FROM courses WHERE is_active = true ORDER BY department'
  );

  const departments = result.rows.map(row => row.department);

  res.status(200).json({
    status: 'success',
    data: {
      departments
    }
  });
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  getDepartments
};