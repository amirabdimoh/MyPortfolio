import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './TeamAnalytics.css';

interface AnalyticsData {
  teamPerformance: Array<{
    id: number;
    name: string;
    department: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
  }>;
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
  tasksByStatus: Array<{
    status: string;
    count: number;
  }>;
  tasksByPriority: Array<{
    priority: string;
    count: number;
  }>;
  upcomingDeadlines: Array<{
    id: number;
    title: string;
    due_date: string;
    project_name: string;
    assigned_to_name: string;
    priority: string;
  }>;
}

const TeamAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setAnalytics(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'planning': return '#17a2b8';
      case 'on-hold': return '#ffc107';
      case 'cancelled': return '#dc3545';
      case 'todo': return '#6c757d';
      case 'review': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  if (!analytics) return <div className="error">No analytics data available</div>;

  return (
    <div className="team-analytics">
      <div className="analytics-header">
        <h1>Team Analytics & Performance</h1>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="analytics-grid">
        {/* Team Performance */}
        <div className="analytics-section team-performance">
          <h2>Team Performance</h2>
          <div className="performance-list">
            {analytics.teamPerformance.map(member => (
              <div key={member.id} className="performance-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <h3>{member.name}</h3>
                    <p>{member.department || 'No Department'}</p>
                  </div>
                </div>
                <div className="performance-stats">
                  <div className="stat">
                    <span className="stat-number">{member.total_tasks}</span>
                    <span className="stat-label">Total Tasks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{member.completed_tasks}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{member.in_progress_tasks}</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                  <div className="completion-rate">
                    <div className="rate-bar">
                      <div 
                        className="rate-fill"
                        style={{ 
                          width: `${calculateCompletionRate(member.completed_tasks, member.total_tasks)}%`,
                          backgroundColor: calculateCompletionRate(member.completed_tasks, member.total_tasks) > 70 ? '#28a745' : '#ffc107'
                        }}
                      ></div>
                    </div>
                    <span className="rate-text">
                      {calculateCompletionRate(member.completed_tasks, member.total_tasks)}% Complete
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="analytics-section status-charts">
          <h2>Project Status Distribution</h2>
          <div className="chart-container">
            {analytics.projectsByStatus.map(item => (
              <div key={item.status} className="chart-item">
                <div className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(item.count / Math.max(...analytics.projectsByStatus.map(p => p.count))) * 100}%`,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  ></div>
                </div>
                <div className="chart-label">
                  <span className="status-name">{item.status}</span>
                  <span className="status-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="analytics-section status-charts">
          <h2>Task Status Distribution</h2>
          <div className="chart-container">
            {analytics.tasksByStatus.map(item => (
              <div key={item.status} className="chart-item">
                <div className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(item.count / Math.max(...analytics.tasksByStatus.map(t => t.count))) * 100}%`,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  ></div>
                </div>
                <div className="chart-label">
                  <span className="status-name">{item.status}</span>
                  <span className="status-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="analytics-section priority-charts">
          <h2>Task Priority Distribution</h2>
          <div className="priority-grid">
            {analytics.tasksByPriority.map(item => (
              <div key={item.priority} className="priority-card">
                <div 
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                ></div>
                <div className="priority-info">
                  <h3>{item.priority}</h3>
                  <p>{item.count} tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="analytics-section upcoming-deadlines">
          <h2>Upcoming Deadlines</h2>
          <div className="deadlines-list">
            {analytics.upcomingDeadlines.length > 0 ? (
              analytics.upcomingDeadlines.map(task => (
                <div 
                  key={task.id} 
                  className={`deadline-item ${isOverdue(task.due_date) ? 'overdue' : ''}`}
                >
                  <div className="deadline-info">
                    <h4>{task.title}</h4>
                    <p>{task.project_name || 'No Project'}</p>
                    <span className="assignee">Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                  </div>
                  <div className="deadline-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span className={`due-date ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
                      {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue(task.due_date) && ' ⚠️'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-deadlines">
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="analytics-section summary-stats">
          <h2>Summary Statistics</h2>
          <div className="stats-grid">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <h3>{analytics.projectsByStatus.reduce((sum, item) => sum + item.count, 0)}</h3>
                <p>Total Projects</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-info">
                <h3>{analytics.tasksByStatus.reduce((sum, item) => sum + item.count, 0)}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-info">
                <h3>{analytics.teamPerformance.length}</h3>
                <p>Team Members</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⚡</div>
              <div className="summary-info">
                <h3>
                  {Math.round(
                    analytics.teamPerformance.reduce((sum, member) => 
                      sum + calculateCompletionRate(member.completed_tasks, member.total_tasks), 0
                    ) / analytics.teamPerformance.length
                  )}%
                </h3>
                <p>Avg Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;