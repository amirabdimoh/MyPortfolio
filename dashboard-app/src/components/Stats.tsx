import React from 'react';
import { User } from '../types';
import './Stats.css';

interface StatsProps {
  stats: any;
  user: User;
}

const Stats: React.FC<StatsProps> = ({ stats, user }) => {
  if (!stats) return <div>No data available</div>;

  if (user.role === 'admin') {
    return (
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p className="stat-number">{stats.overview.totalProjects}</p>
          </div>
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.overview.totalTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.overview.totalUsers}</p>
          </div>
        </div>

        <div className="stats-section">
          <h2>Recent Projects</h2>
          <div className="list">
            {stats.recentProjects.map((project: any) => (
              <div key={project.id} className="list-item">
                <h4>{project.name}</h4>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h2>Upcoming Deadlines</h2>
          <div className="list">
            {stats.upcomingDeadlines.map((task: any) => (
              <div key={task.id} className="list-item">
                <h4>{task.title}</h4>
                <span>{task.due_date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Tasks</h3>
          <p className="stat-number">{stats.myTaskStats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{stats.myTaskStats.completed}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.myTaskStats.in_progress}</p>
        </div>
      </div>

      <div className="stats-section">
        <h2>My Projects</h2>
        <div className="list">
          {stats.myProjects.map((project: any) => (
            <div key={project.id} className="list-item">
              <h4>{project.name}</h4>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2>My Tasks</h2>
        <div className="list">
          {stats.myTasks.slice(0, 10).map((task: any) => (
            <div key={task.id} className="list-item">
              <h4>{task.title}</h4>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
