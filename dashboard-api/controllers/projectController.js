const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, 
           u.name as owner_name,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (status) {
    query += ` AND p.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (priority) {
    query += ` AND p.priority = $${paramCount}`;
    params.push(priority);
    paramCount++;
  }

  if (search) {
    query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const countQuery = 'SELECT COUNT(*) FROM projects WHERE 1=1' + 
    (status ? ` AND status = '${status}'` : '') +
    (priority ? ` AND priority = '${priority}'` : '');
  const countResult = await pool.query(countQuery);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(countResult.rows[0].count / limit)
    },
    data: { projects: result.rows }
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT p.*, 
            u.name as owner_name,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
     FROM projects p
     LEFT JOIN users u ON p.owner_id = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { project: result.rows[0] }
  });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
  const { name, description, status, priority, start_date, end_date, budget, owner_id } = req.body;

  if (!name) {
    return next(new AppError('Please provide project name', 400));
  }

  const result = await pool.query(
    `INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, owner_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, description, status || 'planning', priority || 'medium', start_date, end_date, budget, owner_id, req.user.id]
  );

  res.status(201).json({
    status: 'success',
    data: { project: result.rows[0] }
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, status, priority, start_date, end_date, budget, owner_id } = req.body;

  const checkProject = await pool.query('SELECT id FROM projects WHERE id = $1', [id]);

  if (checkProject.rows.length === 0) {
    return next(new AppError('Project not found', 404));
  }

  const fieldsToUpdate = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    fieldsToUpdate.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (description !== undefined) {
    fieldsToUpdate.push(`description = $${paramCount}`);
    values.push(description);
    paramCount++;
  }
  if (status !== undefined) {
    fieldsToUpdate.push(`status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }
  if (priority !== undefined) {
    fieldsToUpdate.push(`priority = $${paramCount}`);
    values.push(priority);
    paramCount++;
  }
  if (start_date !== undefined) {
    fieldsToUpdate.push(`start_date = $${paramCount}`);
    values.push(start_date);
    paramCount++;
  }
  if (end_date !== undefined) {
    fieldsToUpdate.push(`end_date = $${paramCount}`);
    values.push(end_date);
    paramCount++;
  }
  if (budget !== undefined) {
    fieldsToUpdate.push(`budget = $${paramCount}`);
    values.push(budget);
    paramCount++;
  }
  if (owner_id !== undefined) {
    fieldsToUpdate.push(`owner_id = $${paramCount}`);
    values.push(owner_id);
    paramCount++;
  }

  if (fieldsToUpdate.length === 0) {
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE projects SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  res.status(200).json({
    status: 'success',
    data: { project: result.rows[0] }
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully',
    data: null
  });
});
