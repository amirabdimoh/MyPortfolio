import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { usersAPI } from '../services/api';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, departmentFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (departmentFilter) params.append('department', departmentFilter);

      const response = await usersAPI.getAll(params.toString());
      setUsers(response.data.users || response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await usersAPI.updateStatus(userId, !isActive);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueValues = (field: keyof User): string[] => {
    const values = users.map(user => user[field]).filter(Boolean);
    return Array.from(new Set(values)) as string[];
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>User Management</h1>
        <div className="user-stats">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.is_active).length}</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {getUniqueValues('department').map(dept => (
              <option key={dept} value={dept as string}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <strong>{user.name}</strong>
                      <div className="user-email">{user.email}</div>
                      {user.position && (
                        <div className="user-position">{user.position}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className={`role-select role-${user.role}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className="department-badge">
                    {user.department || 'No Department'}
                  </span>
                </td>
                <td>
                  <div className="status-container">
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.email_verified && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </div>
                </td>
                <td>
                  {user.last_login ? formatDate(user.last_login) : 'Never'}
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;