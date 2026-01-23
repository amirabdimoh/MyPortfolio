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

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Admin/Staff
const enrollStudent = asyncHandler(async (req, res, next) => {
  const { student_id, course_id, enrollment_date } = req.body;

  // Check if student exists
  const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
  if (studentCheck.rows.length === 0) {
    return next(new AppError('Student not found', 404));
  }

  // Check if course exists and is active
  const courseCheck = await pool.query('SELECT id, is_active FROM courses WHERE id = $1', [course_id]);
  if (courseCheck.rows.length === 0) {
    return next(new AppError('Course not found', 404));
  }
  if (!courseCheck.rows[0].is_active) {
    return next(new AppError('Cannot enroll in inactive course', 400));
  }

  // Check if already enrolled
  const existingEnrollment = await pool.query(
    'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [student_id, course_id]
  );

  if (existingEnrollment.rows.length > 0) {
    return next(new AppError('Student is already enrolled in this course', 400));
  }

  const result = await pool.query(
    `INSERT INTO enrollments (student_id, course_id, enrollment_date, status)
     VALUES ($1, $2, $3, 'Enrolled') RETURNING *`,
    [student_id, course_id, enrollment_date || new Date().toISOString().split('T')[0]]
  );

  // Get enrollment with student and course details
  const enrollmentDetails = await pool.query(`
    SELECT e.*, s.first_name, s.last_name, s.email, c.course_code, c.course_name
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN courses c ON e.course_id = c.id
    WHERE e.id = $1
  `, [result.rows[0].id]);

  res.status(201).json({
    status: 'success',
    message: 'Student enrolled successfully',
    data: {
      enrollment: toCamelCase(enrollmentDetails.rows[0])
    }
  });
});

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id/status
// @access  Admin/Staff
const updateEnrollmentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Enrolled', 'Completed', 'Dropped', 'Withdrawn'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const result = await pool.query(
    'UPDATE enrollments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Enrollment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Enrollment status updated successfully',
    data: {
      enrollment: toCamelCase(result.rows[0])
    }
  });
});

// @desc    Update enrollment grade
// @route   PUT /api/enrollments/:id/grade
// @access  Admin/Staff
const updateEnrollmentGrade = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { grade, reason } = req.body;
  const adminId = req.user?.id;

  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W', 'I', 'P'];
  
  if (grade && !validGrades.includes(grade)) {
    return next(new AppError(`Grade must be one of: ${validGrades.join(', ')}`, 400));
  }

  // Get current enrollment
  const currentEnrollment = await pool.query('SELECT * FROM enrollments WHERE id = $1', [id]);
  
  if (currentEnrollment.rows.length === 0) {
    return next(new AppError('Enrollment not found', 404));
  }

  const oldGrade = currentEnrollment.rows[0].grade;

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update grade
    const updatedEnrollment = await client.query(
      'UPDATE enrollments SET grade = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [grade, id]
    );

    // Record grade change if different
    if (oldGrade !== grade) {
      await client.query(
        'INSERT INTO grade_changes (enrollment_id, old_grade, new_grade, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
        [id, oldGrade, grade, adminId, reason || 'Grade updated by admin']
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Grade updated successfully',
      data: {
        enrollment: toCamelCase(updatedEnrollment.rows[0])
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// @desc    Bulk enroll students in course
// @route   POST /api/enrollments/bulk
// @access  Admin
const bulkEnrollStudents = asyncHandler(async (req, res, next) => {
  const { student_ids, course_id, enrollment_date } = req.body;

  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return next(new AppError('Student IDs array is required', 400));
  }

  // Check if course exists and is active
  const courseCheck = await pool.query('SELECT id, is_active FROM courses WHERE id = $1', [course_id]);
  if (courseCheck.rows.length === 0) {
    return next(new AppError('Course not found', 404));
  }
  if (!courseCheck.rows[0].is_active) {
    return next(new AppError('Cannot enroll in inactive course', 400));
  }

  // Check which students exist
  const studentsCheck = await pool.query(
    'SELECT id FROM students WHERE id = ANY($1)',
    [student_ids]
  );

  const existingStudentIds = studentsCheck.rows.map(row => row.id);
  const missingStudentIds = student_ids.filter(id => !existingStudentIds.includes(id));

  if (missingStudentIds.length > 0) {
    return next(new AppError(`Students not found: ${missingStudentIds.join(', ')}`, 404));
  }

  // Check for existing enrollments
  const existingEnrollments = await pool.query(
    'SELECT student_id FROM enrollments WHERE student_id = ANY($1) AND course_id = $2',
    [student_ids, course_id]
  );

  const alreadyEnrolledIds = existingEnrollments.rows.map(row => row.student_id);
  const newEnrollmentIds = student_ids.filter(id => !alreadyEnrolledIds.includes(id));

  if (newEnrollmentIds.length === 0) {
    return next(new AppError('All students are already enrolled in this course', 400));
  }

  // Create enrollments
  const enrollmentValues = newEnrollmentIds.map((studentId, index) => 
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}, 'Enrolled')`
  ).join(', ');

  const enrollmentParams = [];
  newEnrollmentIds.forEach(studentId => {
    enrollmentParams.push(studentId, course_id, enrollment_date || new Date().toISOString().split('T')[0]);
  });

  const result = await pool.query(
    `INSERT INTO enrollments (student_id, course_id, enrollment_date, status) 
     VALUES ${enrollmentValues} RETURNING *`,
    enrollmentParams
  );

  res.status(201).json({
    status: 'success',
    message: `${result.rows.length} students enrolled successfully`,
    data: {
      enrolledCount: result.rows.length,
      alreadyEnrolledCount: alreadyEnrolledIds.length,
      enrollments: toCamelCase(result.rows)
    }
  });
});

// @desc    Get student's enrollments
// @route   GET /api/enrollments/student/:studentId
// @access  Public
const getStudentEnrollments = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { status } = req.query;

  let query = `
    SELECT e.*, c.course_code, c.course_name, c.credits, c.department
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = $1
  `;
  
  const params = [studentId];
  let paramCount = 2;

  if (status && status !== 'all') {
    query += ` AND e.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ' ORDER BY e.enrollment_date DESC';

  const result = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      enrollments: toCamelCase(result.rows)
    }
  });
});

// @desc    Get enrollment details with history
// @route   GET /api/enrollments/:id
// @access  Admin/Staff
const getEnrollmentDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [enrollmentResult, gradeHistoryResult] = await Promise.all([
    // Enrollment with student and course details
    pool.query(`
      SELECT e.*, s.first_name, s.last_name, s.email, s.student_id,
             c.course_code, c.course_name, c.credits, c.department
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = $1
    `, [id]),
    
    // Grade change history
    pool.query(`
      SELECT gc.*, u.name as changed_by_name, u2.name as approved_by_name
      FROM grade_changes gc
      LEFT JOIN users u ON gc.changed_by = u.id
      LEFT JOIN users u2 ON gc.approved_by = u2.id
      WHERE gc.enrollment_id = $1
      ORDER BY gc.created_at DESC
    `, [id])
  ]);

  if (enrollmentResult.rows.length === 0) {
    return next(new AppError('Enrollment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment: toCamelCase(enrollmentResult.rows[0]),
      gradeHistory: toCamelCase(gradeHistoryResult.rows)
    }
  });
});

module.exports = {
  enrollStudent,
  updateEnrollmentStatus,
  updateEnrollmentGrade,
  bulkEnrollStudents,
  getStudentEnrollments,
  getEnrollmentDetails
};