import React from 'react';
import { Project } from '../types';
import './ProjectList.css';

interface ProjectListProps {
  projects: Project[];
  onRefresh: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onRefresh }) => {
  return (
    <div className="project-list">
      <div className="list-header">
        <h2>Projects</h2>
        <button onClick={onRefresh} className="btn-refresh">Refresh</button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Tasks</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  <strong>{project.name}</strong>
                  {project.description && <p className="description">{project.description}</p>}
                </td>
                <td>
                  <span className={`badge badge-${project.status}`}>{project.status}</span>
                </td>
                <td>
                  <span className={`badge badge-${project.priority}`}>{project.priority}</span>
                </td>
                <td>{project.owner_name || 'Unassigned'}</td>
                <td>{project.completed_tasks || 0} / {project.task_count || 0}</td>
                <td>${project.budget?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
