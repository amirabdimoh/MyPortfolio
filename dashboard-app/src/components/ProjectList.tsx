import React from 'react';
import { Project, User } from '../types';
import './ProjectList.css';

interface ProjectListProps {
  projects: Project[];
  onRefresh: () => void;
  user: User;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onRefresh, user }) => {
  const isAdmin = user.role === 'admin';
  
  // Filter projects based on user role
  const userProjects = isAdmin ? projects : projects.filter(p => p.owner_id === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'planning': return 'info';
      case 'on-hold': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="project-list">
      <div className="list-header">
        <h2>{isAdmin ? 'All Projects' : 'My Projects'}</h2>
        <div className="header-actions">
          <span className="project-count">{userProjects.length} projects</span>
          <button onClick={onRefresh} className="btn-refresh">Refresh</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {userProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="project-name">
                    <strong>{project.name}</strong>
                    {project.description && <div className="project-description">{project.description}</div>}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${getStatusColor(project.status)}`}>{project.status}</span>
                </td>
                <td>
                  <span className={`badge badge-${getPriorityColor(project.priority)}`}>{project.priority}</span>
                </td>
                <td>{project.owner_name || 'Unassigned'}</td>
                <td>
                  {project.task_count ? (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(project.completed_tasks || 0) / project.task_count * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {(project.completed_tasks || 0)}/{project.task_count} tasks
                      </span>
                    </div>
                  ) : (
                    <span className="no-tasks">No tasks</span>
                  )}
                </td>
                <td>
                  {project.budget ? formatCurrency(project.budget) : 'No budget'}
                </td>
                <td>
                  {project.end_date ? (
                    <span className={new Date(project.end_date) < new Date() ? 'overdue-date' : ''}>
                      {new Date(project.end_date).toLocaleDateString()}
                      {new Date(project.end_date) < new Date() && ' ⚠️'}
                    </span>
                  ) : (
                    'No due date'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userProjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects found</h3>
          <p>{isAdmin ? 'No projects have been created yet.' : 'You are not assigned to any projects yet.'}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
