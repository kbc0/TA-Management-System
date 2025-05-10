// src/pages/ta/TasksPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskList from '../../components/tasks/TaskList';
import { useAuth } from '../../context/AuthContext';
import './TasksPage.css';

const TasksPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h1>My Tasks</h1>
        
        {/* Show create button only for staff, department chair, and admin */}
        {user && ['staff', 'department_chair', 'admin'].includes(user.role) && (
          <button 
            className="create-task-btn"
            onClick={handleCreateTask}
          >
            Create New Task
          </button>
        )}
      </div>
      
      <div className="tasks-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Tasks
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          Active Tasks
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed Tasks
        </button>
      </div>
      
      <TaskList filter={activeFilter} />
    </div>
  );
};

export default TasksPage;