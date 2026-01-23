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

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    studentStats,
    majorStats,
    courseStats,
    recentEnrollments,
    gradeDistribution,
    statusChanges
  ] = await Promise.all([
    // Student statistics
    pool.query('SELECT * FROM student_dashboard_stats'),
    
    // Major statistics
    pool.query('SELECT * FROM major_stats LIMIT 10'),
    
    // Course statistics
    pool.query('SELECT * FROM course_enrollment_stats WHERE total_enrollments > 0 ORDER BY total_enrollments DESC LIMIT 10'),
    
    // Recent enrollments
    pool.query(`
      SELECT e.*, s.first_name, s.last_name, c.course_code, c.course_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `),
    
    // Grade distribution
    pool.query(`
      SELECT 
        grade,
        COUNT(*) as count
      FROM enrollments 
      WHERE grade IS NOT NULL
      GROUP BY grade
      ORDER BY grade
    `),
    
    // Recent status changes
    pool.query(`
      SELECT sh.*, s.first_name, s.last_name, u.name as changed_by_name
      FROM student_status_history sh
      JOIN students s ON sh.student_id = s.id
      LEFT JOIN users u ON sh.changed_by = u.id
      ORDER BY sh.created_at DESC
      LIMIT 10
    `)
  ]);

  // Calculate trends (last 30 days vs previous 30 days)
  const trendsQuery = await pool.query(`
    WITH current_period AS (
      SELECT 
        COUNT(*) as new_students,
        COUNT(*) FILTER (WHERE status = 'Active') as new_active
      FROM students
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    previous_period AS (
      SELECT 
        COUNT(*) as prev_students,
        COUNT(*) FILTER (WHERE status = 'Active') as prev_active
      FROM students
      WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
        AND created_at < CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
      cp.new_students,
      cp.new_active,
      pp.prev_students,
      pp.prev_active,
      CASE 
        WHEN pp.prev_students > 0 
        THEN ROUND(((cp.new_students - pp.prev_students) * 100.0 / pp.prev_students), 2)
        ELSE 0 
      END as student_growth
    FROM current_period cp, previous_period pp
  `);

  res.status(200).json({
    status: 'success',
    data: {
      overview: toCamelCase(studentStats.rows[0] || {}),
      trends: toCamelCase(trendsQuery.rows[0] || {}),
      majorStats: toCamelCase(majorStats.rows),
      courseStats: toCamelCase(courseStats.rows),
      recentEnrollments: toCamelCase(recentEnrollments.rows),
      gradeDistribution: toCamelCase(gradeDistribution.rows),
      recentStatusChanges: toCamelCase(statusChanges.rows)
    }
  });
});

// @desc    Get all students with admin details
// @route   GET /api/admin/students
// @access  Admin
const getAllStudentsAdmin = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search, status, major, sortBy = 'id', order = 'ASC' } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT s.*, 
           COUNT(e.id) as total_enrollments,
           COUNT(e.id) FILTER (WHERE e.status = 'Enrolled') as active_enrollments,
           COUNT(e.id) FILTER (WHERE e.status = 'Completed') as completed_courses
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;

  // Search filter
  if (search) {
    query += ` AND (
      s.first_name ILIKE $${paramCount} OR 
      s.last_name ILIKE $${paramCount} OR 
      s.email ILIKE $${paramCount} OR 
      s.phone ILIKE $${paramCount} OR 
      s.major ILIKE $${paramCount}
    )`;
    params.push(`%${search}%`);
    paramCount++;
  }

  // Status filter
  if (status && status !== 'all') {
    query += ` AND s.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  // Major filter
  if (major && major !== 'all') {
    query += ` AND s.major = $${paramCount}`;
    params.push(major);
    paramCount++;
  }

  query += ` GROUP BY s.id`;

  // Sorting
  const validSortFields = ['id', 'first_name', 'last_name', 'email', 'major', 'gpa', 'status', 'enrollment_date'];
  const validOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? `s.${sortBy}` : 's.id';
  const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
  
  query += ` ORDER BY ${sortField} ${sortOrder}`;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) FROM students s WHERE 1=1';
  const countParams = [];
  let countParamCount = 1;

  if (search) {
    countQuery += ` AND (
      s.first_name ILIKE $${countParamCount} OR 
      s.last_name ILIKE $${countParamCount} OR 
      s.email ILIKE $${countParamCount} OR 
      s.phone ILIKE $${countParamCount} OR 
      s.major ILIKE $${countParamCount}
    )`;
    countParams.push(`%${search}%`);
    countParamCount++;
  }

  if (status && status !== 'all') {
    countQuery += ` AND s.status = $${countParamCount}`;
    countParams.push(status);
    countParamCount++;
  }

  if (major && major !== 'all') {
    countQuery += ` AND s.major = $${countParamCount}`;
    countParams.push(major);
    countParamCount++;
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: {
      students: toCamelCase(result.rows)
    }
  });
});

// @desc    Update student status with history tracking
// @route   PUT /api/admin/students/:id/status
// @access  Admin
const updateStudentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const adminId = req.user?.id; // Assuming auth middleware sets req.user

  const validStatuses = ['Active', 'Inactive', 'Graduated'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  // Get current student data
  const currentStudent = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  
  if (currentStudent.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  const oldStatus = currentStudent.rows[0].status;

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update student status
    const updatedStudent = await client.query(
      'UPDATE students SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Record status change in history
    if (oldStatus !== status) {
      await client.query(
        'INSERT INTO student_status_history (student_id, old_status, new_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
        [id, oldStatus, status, adminId, reason || 'Status updated by admin']
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Student status updated successfully',
      data: {
        student: toCamelCase(updatedStudent.rows[0])
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Bulk update student statuses
// @route   PUT /api/admin/students/bulk-status
// @access  Admin
const bulkUpdateStudentStatus = asyncHandler(async (req, res, next) => {
  const { studentIds, status, reason } = req.body;
  const adminId = req.user?.id;

  const validStatuses = ['Active', 'Inactive', 'Graduated'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return next(new AppError('Student IDs array is required', 400));
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get current student data
    const currentStudents = await client.query(
      'SELECT id, status FROM students WHERE id = ANY($1)',
      [studentIds]
    );

    // Update all students
    const updatedStudents = await client.query(
      'UPDATE students SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) RETURNING *',
      [status, studentIds]
    );

    // Record status changes in history
    for (const currentStudent of currentStudents.rows) {
      if (currentStudent.status !== status) {
        await client.query(
          'INSERT INTO student_status_history (student_id, old_status, new_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
          [currentStudent.id, currentStudent.status, status, adminId, reason || 'Bulk status update by admin']
        );
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: `${updatedStudents.rows.length} students updated successfully`,
      data: {
        updatedCount: updatedStudents.rows.length,
        students: toCamelCase(updatedStudents.rows)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Get student details with enrollments
// @route   GET /api/admin/students/:id/details
// @access  Admin
const getStudentDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [studentResult, enrollmentsResult, statusHistoryResult] = await Promise.all([
    // Student basic info
    pool.query('SELECT * FROM students WHERE id = $1', [id]),
    
    // Student enrollments with course details
    pool.query(`
      SELECT e.*, c.course_code, c.course_name, c.credits, c.department
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
      ORDER BY e.enrollment_date DESC
    `, [id]),
    
    // Status change history
    pool.query(`
      SELECT sh.*, u.name as changed_by_name
      FROM student_status_history sh
      LEFT JOIN users u ON sh.changed_by = u.id
      WHERE sh.student_id = $1
      ORDER BY sh.created_at DESC
    `, [id])
  ]);

  if (studentResult.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      student: toCamelCase(studentResult.rows[0]),
      enrollments: toCamelCase(enrollmentsResult.rows),
      statusHistory: toCamelCase(statusHistoryResult.rows)
    }
  });
});

module.exports = {
  getDashboardStats,
  getAllStudentsAdmin,
  updateStudentStatus,
  bulkUpdateStudentStatus,
  getStudentDetails
};