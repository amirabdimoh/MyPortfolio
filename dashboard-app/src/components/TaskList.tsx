import React from 'react';
import { Task } from '../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onRefresh }) => {
  return (
    <div className="task-list">
      <div className="list-header">
        <h2>Tasks</h2>
        <button onClick={onRefresh} className="btn-refresh">Refresh</button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Project</th>
              <th>Assigned To</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  {task.description && <p className="description">{task.description}</p>}
                </td>
                <td>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                </td>
                <td>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </td>
                <td>{task.project_name || 'No Project'}</td>
                <td>{task.assigned_to_name || 'Unassigned'}</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
