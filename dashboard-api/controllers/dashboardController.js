const pool = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  // Total counts
  const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
  const tasksCount = await pool.query('SELECT COUNT(*) FROM tasks');
  const usersCount = await pool.query('SELECT COUNT(*) FROM users');
  
  // Project stats by status
  const projectsByStatus = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM projects
    GROUP BY status
  `);

  // Task stats by status
  const tasksByStatus = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM tasks
    GROUP BY status
  `);

  // Task stats by priority
  const tasksByPriority = await pool.query(`
    SELECT priority, COUNT(*) as count
    FROM tasks
    GROUP BY priority
  `);

  // Recent projects
  const recentProjects = await pool.query(`
    SELECT p.*, u.name as owner_name
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 5
  `);

  // Recent tasks
  const recentTasks = await pool.query(`
    SELECT t.*, p.name as project_name, u.name as assigned_to_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    ORDER BY t.created_at DESC
    LIMIT 10
  `);

  // Upcoming deadlines
  const upcomingDeadlines = await pool.query(`
    SELECT t.*, p.name as project_name, u.name as assigned_to_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.due_date >= CURRENT_DATE
      AND t.status != 'completed'
      AND t.status != 'cancelled'
    ORDER BY t.due_date ASC
    LIMIT 10
  `);

  // Team performance
  const teamPerformance = await pool.query(`
    SELECT 
      u.id,
      u.name,
      u.department,
      COUNT(t.id) as total_tasks,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
      COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks
    FROM users u
    LEFT JOIN tasks t ON u.id = t.assigned_to
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.department
    ORDER BY completed_tasks DESC
    LIMIT 10
  `);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalProjects: parseInt(projectsCount.rows[0].count),
        totalTasks: parseInt(tasksCount.rows[0].count),
        totalUsers: parseInt(usersCount.rows[0].count)
      },
      projectsByStatus: projectsByStatus.rows,
      tasksByStatus: tasksByStatus.rows,
      tasksByPriority: tasksByPriority.rows,
      recentProjects: recentProjects.rows,
      recentTasks: recentTasks.rows,
      upcomingDeadlines: upcomingDeadlines.rows,
      teamPerformance: teamPerformance.rows
    }
  });
});

// @desc    Get user dashboard
// @route   GET /api/dashboard/my-dashboard
// @access  Private
exports.getMyDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // My tasks
  const myTasks = await pool.query(`
    SELECT t.*, p.name as project_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.assigned_to = $1
    ORDER BY t.due_date ASC
  `, [userId]);

  // My projects
  const myProjects = await pool.query(`
    SELECT p.*,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
    FROM projects p
    WHERE p.owner_id = $1
    ORDER BY p.created_at DESC
  `, [userId]);

  // My task stats
  const myTaskStats = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo
    FROM tasks
    WHERE assigned_to = $1
  `, [userId]);

  res.status(200).json({
    status: 'success',
    data: {
      myTasks: myTasks.rows,
      myProjects: myProjects.rows,
      myTaskStats: myTaskStats.rows[0]
    }
  });
});
