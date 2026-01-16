const pool = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const { status, priority, project_id, assigned_to, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT t.*, 
           p.name as project_name,
           u.name as assigned_to_name,
           c.name as created_by_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN users c ON t.created_by = c.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (status) {
    query += ` AND t.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (priority) {
    query += ` AND t.priority = $${paramCount}`;
    params.push(priority);
    paramCount++;
  }

  if (project_id) {
    query += ` AND t.project_id = $${paramCount}`;
    params.push(project_id);
    paramCount++;
  }

  if (assigned_to) {
    query += ` AND t.assigned_to = $${paramCount}`;
    params.push(assigned_to);
    paramCount++;
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: { tasks: result.rows }
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT t.*, 
            p.name as project_name,
            u.name as assigned_to_name,
            c.name as created_by_name
     FROM tasks t
     LEFT JOIN projects p ON t.project_id = p.id
     LEFT JOIN users u ON t.assigned_to = u.id
     LEFT JOIN users c ON t.created_by = c.id
     WHERE t.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { task: result.rows[0] }
  });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;

  if (!title) {
    return next(new AppError('Please provide task title', 400));
  }

  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, status || 'todo', priority || 'medium', project_id, assigned_to, req.user.id, due_date]
  );

  res.status(201).json({
    status: 'success',
    data: { task: result.rows[0] }
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;

  const checkTask = await pool.query('SELECT id FROM tasks WHERE id = $1', [id]);

  if (checkTask.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  const fieldsToUpdate = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    fieldsToUpdate.push(`title = $${paramCount}`);
    values.push(title);
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
    if (status === 'completed') {
      fieldsToUpdate.push(`completed_at = CURRENT_TIMESTAMP`);
    }
  }
  if (priority !== undefined) {
    fieldsToUpdate.push(`priority = $${paramCount}`);
    values.push(priority);
    paramCount++;
  }
  if (project_id !== undefined) {
    fieldsToUpdate.push(`project_id = $${paramCount}`);
    values.push(project_id);
    paramCount++;
  }
  if (assigned_to !== undefined) {
    fieldsToUpdate.push(`assigned_to = $${paramCount}`);
    values.push(assigned_to);
    paramCount++;
  }
  if (due_date !== undefined) {
    fieldsToUpdate.push(`due_date = $${paramCount}`);
    values.push(due_date);
    paramCount++;
  }

  if (fieldsToUpdate.length === 0) {
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  res.status(200).json({
    status: 'success',
    data: { task: result.rows[0] }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
    data: null
  });
});
