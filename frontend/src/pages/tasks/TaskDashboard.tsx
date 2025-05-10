import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TaskDashboard.css';

const TaskDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="task-dashboard">
      <h1>Task Dashboard</h1>
      <p>Welcome to the Task Management Dashboard</p>
      
      <div className="task-actions">
        <button
          onClick={() => navigate('/tasks')}
          className="view-tasks-btn"
        >
          View All Tasks
        </button>
        
        {user && ['staff', 'department_chair', 'admin'].includes(user.role) && (
          <button
            onClick={() => navigate('/tasks/create')}
            className="create-task-btn"
          >
            Create New Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;
