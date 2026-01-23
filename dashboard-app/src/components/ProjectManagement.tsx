import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { projectsAPI, usersAPI } from '../services/api';
import './ProjectManagement.css';

interface ProjectManagementProps {
  onRefresh: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  priority: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  budget: string;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ onRefresh }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    owner_id: '',
    start_date: '',
    end_date: '',
    budget: ''
  });

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await projectsAPI.getAll(params.toString());
      setProjects(response.data.projects || response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
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
      const projectData = {
        ...formData,
        owner_id: parseInt(formData.owner_id),
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      if (editingProject) {
        await projectsAPI.update(editingProject.id, projectData);
      } else {
        await projectsAPI.create(projectData);
      }

      resetForm();
      fetchProjects();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      owner_id: project.owner_id?.toString() || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      budget: project.budget?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      fetchProjects();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      owner_id: '',
      start_date: '',
      end_date: '',
      budget: ''
    });
    setShowForm(false);
    setEditingProject(null);
  };

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

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="project-management">
      <div className="management-header">
        <h1>Project Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Project
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
            placeholder="Search projects..."
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
            <option value="name-ASC">Name A-Z</option>
            <option value="name-DESC">Name Z-A</option>
            <option value="end_date-ASC">Due Date (Earliest)</option>
            <option value="end_date-DESC">Due Date (Latest)</option>
            <option value="priority-DESC">Priority (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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

              <div className="form-group">
                <label htmlFor="owner_id">Project Owner</label>
                <select
                  id="owner_id"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
                >
                  <option value="">Select Owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget ($)</label>
                <input
                  type="number"
                  id="budget"
                  step="0.01"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>
                  <div className="project-info">
                    <strong>{project.name}</strong>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
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
                        {(project.completed_tasks || 0)}/{project.task_count}
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
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No due date'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="no-projects">
            <p>No projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;