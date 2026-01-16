import React, { useState, useEffect } from 'react';
import { User, Project, Task } from '../types';
import { dashboardAPI, projectsAPI, tasksAPI } from '../services/api';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import Stats from './Stats';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        if (user.role === 'admin') {
          const response = await dashboardAPI.getStats();
          setStats(response.data);
        } else {
          const response = await dashboardAPI.getMyDashboard();
          setStats(response.data);
        }
      } else if (activeTab === 'projects') {
        const response = await projectsAPI.getAll();
        setProjects(response.data.projects);
      } else if (activeTab === 'tasks') {
        const response = await tasksAPI.getAll();
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>📊 Dashboard</h1>
        </div>
        <div className="nav-user">
          <span>{user.name}</span>
          <span className="user-role">{user.role}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === 'overview' && <Stats stats={stats} user={user} />}
              {activeTab === 'projects' && <ProjectList projects={projects} onRefresh={loadData} />}
              {activeTab === 'tasks' && <TaskList tasks={tasks} onRefresh={loadData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
