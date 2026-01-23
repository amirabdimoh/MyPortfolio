import React from 'react';
import { Task, User } from '../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
  user: User;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onRefresh, user }) => {
  const isAdmin = user.role === 'admin';
  
  // Filter tasks based on user role
  const userTasks = isAdmin ? tasks : tasks.filter(t => t.assigned_to === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'info';
      case 'todo': return 'secondary';
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getTasksByStatus = () => {
    const statusCounts = {
      todo: userTasks.filter(t => t.status === 'todo').length,
      'in-progress': userTasks.filter(t => t.status === 'in-progress').length,
      review: userTasks.filter(t => t.status === 'review').length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      cancelled: userTasks.filter(t => t.status === 'cancelled').length
    };
    return statusCounts;
  };

  const statusCounts = getTasksByStatus();

  return (
    <div className="task-list">
      <div className="list-header">
        <h2>{isAdmin ? 'All Tasks' : 'My Tasks'}</h2>
        <div className="header-actions">
          <div className="task-summary">
            <span className="summary-item">
              <span className="badge badge-secondary">{statusCounts.todo}</span> To Do
            </span>
            <span className="summary-item">
              <span className="badge badge-primary">{statusCounts['in-progress']}</span> In Progress
            </span>
            <span className="summary-item">
              <span className="badge badge-info">{statusCounts.review}</span> Review
            </span>
            <span className="summary-item">
              <span className="badge badge-success">{statusCounts.completed}</span> Completed
            </span>
          </div>
          <button onClick={onRefresh} className="btn-refresh">Refresh</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Project</th>
              {isAdmin && <th>Assigned To</th>}
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {userTasks.map((task) => (
              <tr key={task.id} className={task.due_date && isOverdue(task.due_date) ? 'overdue-row' : ''}>
                <td>
                  <div className="task-name">
                    <strong>{task.title}</strong>
                    {task.description && <div className="task-description">{task.description}</div>}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${getStatusColor(task.status)}`}>{task.status}</span>
                </td>
                <td>
                  <span className={`badge badge-${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </td>
                <td>{task.project_name || 'No project'}</td>
                {isAdmin && <td>{task.assigned_to_name || 'Unassigned'}</td>}
                <td>
                  {task.due_date ? (
                    <span className={isOverdue(task.due_date) ? 'overdue-date' : ''}>
                      {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue(task.due_date) && ' ⚠️'}
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

      {userTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No tasks found</h3>
          <p>{isAdmin ? 'No tasks have been created yet.' : 'You have no tasks assigned to you yet.'}</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
