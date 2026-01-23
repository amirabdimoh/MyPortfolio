import React, { useState, useEffect } from 'react';
import { Task, Project, User } from '../types';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import './TaskManagement.css';

interface TaskManagementProps {
  onRefresh: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string;
  assigned_to: string;
  due_date: string;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ onRefresh }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project_id: '',
    assigned_to: '',
    due_date: ''
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, sortBy, sortOrder]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (projectFilter) params.append('project_id', projectFilter);
      if (assigneeFilter) params.append('assigned_to', assigneeFilter);

      const response = await tasksAPI.getAll(params.toString());
      setTasks(response.data.tasks || response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...formData,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
      };

      if (editingTask) {
        await tasksAPI.update(editingTask.id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }

      resetForm();
      fetchTasks();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      project_id: task.project_id?.toString() || '',
      assigned_to: task.assigned_to?.toString() || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      fetchTasks();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project_id: '',
      assigned_to: '',
      due_date: ''
    });
    setShowForm(false);
    setEditingTask(null);
  };

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

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="task-management">
      <div className="management-header">
        <h1>Task Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Assignees</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="filter-select"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="due_date-ASC">Due Date (Earliest)</option>
            <option value="due_date-DESC">Due Date (Latest)</option>
            <option value="priority-DESC">Priority (High-Low)</option>
            <option value="title-ASC">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project_id">Project</label>
                  <select
                    id="project_id"
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assigned_to">Assign To</label>
                  <select
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="due_date">Due Date</label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Project</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className={task.due_date && isOverdue(task.due_date) ? 'overdue' : ''}>
                <td>
                  <div className="task-info">
                    <strong>{task.title}</strong>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`status-select status-${getStatusColor(task.status)}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.project_name || 'No project'}</td>
                <td>{task.assigned_to_name || 'Unassigned'}</td>
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
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="no-tasks">
            <p>No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;