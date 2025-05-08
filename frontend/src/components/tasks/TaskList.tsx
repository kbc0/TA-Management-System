// src/components/tasks/TaskList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Task, getAllTasks, completeTask, deleteTask } from '../../api/tasks';
import './TaskList.css';

interface TaskListProps {
  limit?: number;
  showActions?: boolean;
  filter?: 'all' | 'active' | 'completed';
}

const TaskList: React.FC<TaskListProps> = ({ 
  limit, 
  showActions = true,
  filter = 'all'
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskData = await getAllTasks();

        // Apply filtering
        let filteredTasks = taskData;
        if (filter === 'active') {
          filteredTasks = taskData.filter(task => task.status === 'active');
        } else if (filter === 'completed') {
          filteredTasks = taskData.filter(task => task.status === 'completed');
        }

        // Apply limit if provided
        if (limit && limit > 0) {
          filteredTasks = filteredTasks.slice(0, limit);
        }

        setTasks(filteredTasks);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [limit, filter]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      await completeTask(taskId);
      
      // Update the task in the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() } 
            : task
        )
      );
    } catch (err: any) {
      console.error('Error completing task:', err);
      setError(err.message || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        
        // Remove the task from the local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (err: any) {
        console.error('Error deleting task:', err);
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Convert minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Get appropriate status badge class
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-active';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div className="no-tasks">No tasks found.</div>;
  }

  return (
    <div className="task-list-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="task-list">
        <div className="task-list-header">
          <div className="task-title">Title</div>
          <div className="task-course">Course</div>
          <div className="task-date">Due Date</div>
          <div className="task-duration">Duration</div>
          <div className="task-status">Status</div>
          {showActions && <div className="task-actions">Actions</div>}
        </div>
        
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
          >
            <div className="task-title">
              <Link to={`/tasks/${task.id}`}>{task.title}</Link>
            </div>
            <div className="task-course">{task.course_id}</div>
            <div className="task-date">{formatDate(task.due_date)}</div>
            <div className="task-duration">{formatDuration(task.duration)}</div>
            <div className="task-status">
              <span className={`status-badge ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </div>
            
            {showActions && (
              <div className="task-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  View
                </button>
                
                {task.status === 'active' && (
                  <>
                    <button 
                      className="complete-btn"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </button>
                    
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    >
                      Edit
                    </button>
                  </>
                )}
                
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;