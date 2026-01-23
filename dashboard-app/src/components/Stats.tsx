import React from 'react';
import { DashboardStats, User, Task, Project } from '../types';
import './Stats.css';

interface StatsProps {
  stats: DashboardStats;
  user: User;
}

const Stats: React.FC<StatsProps> = ({ stats, user }) => {
  const isAdmin = user.role === 'admin';

  const renderAdminStats = () => (
    <div className="stats-container">
      <div className="stats-header">
        <h2>Admin Dashboard Overview</h2>
        <p>System-wide statistics and insights</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.overview?.totalProjects || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.overview?.totalTasks || 0}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.overview?.totalUsers || 0}</h3>
            <p>Team Members</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Projects by Status</h3>
          <div className="chart-placeholder">
            {stats.projectsByStatus?.map((item, index) => (
              <div key={index} className="chart-item">
                <span className={`status-badge status-${item.status}`}>{item.status}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Tasks by Status</h3>
          <div className="chart-placeholder">
            {stats.tasksByStatus?.map((item, index) => (
              <div key={index} className="chart-item">
                <span className={`status-badge status-${item.status}`}>{item.status}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Tasks by Priority</h3>
          <div className="chart-placeholder">
            {stats.tasksByPriority?.map((item, index) => (
              <div key={index} className="chart-item">
                <span className={`priority-badge priority-${item.priority}`}>{item.priority}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-section">
          <h3>Recent Projects</h3>
          <div className="activity-list">
            {stats.recentProjects?.slice(0, 5).map((project) => (
              <div key={project.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">{project.name}</div>
                  <div className="activity-meta">
                    Status: <span className={`status-badge status-${project.status}`}>{project.status}</span> • 
                    Owner: {project.owner_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h3>Upcoming Deadlines</h3>
          <div className="activity-list">
            {stats.upcomingDeadlines?.slice(0, 5).map((task) => (
              <div key={task.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">{task.title}</div>
                  <div className="activity-meta">
                    Project: {task.project_name} • 
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'} • 
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserStats = () => (
    <div className="stats-container user-dashboard">
      <div className="stats-header">
        <h2>Welcome back, {user.name}! 👋</h2>
        <p>Here's your personal dashboard overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{stats.myProjects?.length || 0}</h3>
            <p>My Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.myTaskStats?.total || 0}</h3>
            <p>My Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats.myTaskStats?.completed || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>{stats.myTaskStats?.in_progress || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>My Task Status</h3>
          <div className="chart-placeholder">
            <div className="chart-item">
              <span className="status-badge status-todo">To Do</span>
              <span className="count">{stats.myTaskStats?.todo || 0}</span>
            </div>
            <div className="chart-item">
              <span className="status-badge status-in-progress">In Progress</span>
              <span className="count">{stats.myTaskStats?.in_progress || 0}</span>
            </div>
            <div className="chart-item">
              <span className="status-badge status-completed">Completed</span>
              <span className="count">{stats.myTaskStats?.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-section">
          <h3>My Recent Tasks</h3>
          <div className="activity-list">
            {stats.myTasks?.slice(0, 5).map((task: Task) => (
              <div key={task.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">{task.title}</div>
                  <div className="activity-meta">
                    Project: {task.project_name || 'No project'} • 
                    Status: <span className={`status-badge status-${task.status}`}>{task.status}</span>
                    {task.due_date && (
                      <> • Due: {new Date(task.due_date).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h3>My Projects</h3>
          <div className="activity-list">
            {stats.myProjects?.slice(0, 3).map((project: Project) => (
              <div key={project.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">{project.name}</div>
                  <div className="activity-meta">
                    Status: <span className={`status-badge status-${project.status}`}>{project.status}</span> • 
                    Progress: {project.completed_tasks || 0}/{project.task_count || 0} tasks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="stats">
      {isAdmin ? renderAdminStats() : renderUserStats()}
    </div>
  );
};

export default Stats;
