import React, { useState, useEffect } from 'react';
import { User, Project, Task, DashboardStats } from '../types';
import { dashboardAPI, projectsAPI, tasksAPI } from '../services/api';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import Stats from './Stats';
import ProjectManagement from './ProjectManagement';
import TaskManagement from './TaskManagement';
import UserManagement from './UserManagement';
import TeamAnalytics from './TeamAnalytics';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'overview' | 'projects' | 'tasks' | 'project-management' | 'task-management' | 'users' | 'analytics';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const response = isAdmin 
          ? await dashboardAPI.getStats()
          : await dashboardAPI.getMyDashboard();
        setStats(response.data);
      } else if (activeTab === 'projects') {
        const response = await projectsAPI.getAll();
        setProjects(response.data.projects || response.data);
      } else if (activeTab === 'tasks') {
        const response = await tasksAPI.getAll();
        setTasks(response.data.tasks || response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserTabs = () => (
    <div className="tabs">
      <button
        className={activeTab === 'overview' ? 'active' : ''}
        onClick={() => setActiveTab('overview')}
      >
        📊 Overview
      </button>
      <button
        className={activeTab === 'projects' ? 'active' : ''}
        onClick={() => setActiveTab('projects')}
      >
        📁 My Projects
      </button>
      <button
        className={activeTab === 'tasks' ? 'active' : ''}
        onClick={() => setActiveTab('tasks')}
      >
        ✅ My Tasks
      </button>
    </div>
  );

  const renderAdminTabs = () => (
    <div className="tabs admin-tabs">
      <button
        className={activeTab === 'overview' ? 'active' : ''}
        onClick={() => setActiveTab('overview')}
      >
        📊 Dashboard
      </button>
      <button
        className={activeTab === 'projects' ? 'active' : ''}
        onClick={() => setActiveTab('projects')}
      >
        📁 Projects
      </button>
      <button
        className={activeTab === 'tasks' ? 'active' : ''}
        onClick={() => setActiveTab('tasks')}
      >
        ✅ Tasks
      </button>
      <button
        className={activeTab === 'project-management' ? 'active' : ''}
        onClick={() => setActiveTab('project-management')}
      >
        🛠️ Manage Projects
      </button>
      <button
        className={activeTab === 'task-management' ? 'active' : ''}
        onClick={() => setActiveTab('task-management')}
      >
        📋 Manage Tasks
      </button>
      <button
        className={activeTab === 'users' ? 'active' : ''}
        onClick={() => setActiveTab('users')}
      >
        👥 Users
      </button>
      <button
        className={activeTab === 'analytics' ? 'active' : ''}
        onClick={() => setActiveTab('analytics')}
      >
        📈 Analytics
      </button>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;

    switch (activeTab) {
      case 'overview':
        return stats ? <Stats stats={stats} user={user} /> : <div>No data available</div>;
      case 'projects':
        return <ProjectList projects={projects} onRefresh={loadData} user={user} />;
      case 'tasks':
        return <TaskList tasks={tasks} onRefresh={loadData} user={user} />;
      case 'project-management':
        return isAdmin ? <ProjectManagement onRefresh={loadData} /> : <div>Access denied</div>;
      case 'task-management':
        return isAdmin ? <TaskManagement onRefresh={loadData} /> : <div>Access denied</div>;
      case 'users':
        return isAdmin ? <UserManagement /> : <div>Access denied</div>;
      case 'analytics':
        return isAdmin ? <TeamAnalytics /> : <div>Access denied</div>;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>📊 {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
        </div>
        <div className="nav-user">
          <span>{user.name}</span>
          <span className={`user-role role-${user.role}`}>{user.role}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {isAdmin ? renderAdminTabs() : renderUserTabs()}

        <div className="tab-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
