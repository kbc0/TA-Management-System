// src/components/tasks/TaskDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Task, getTaskById, completeTask, deleteTask } from '../../api/tasks';
import './TaskDetail.css';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const taskData = await getTaskById(parseInt(id));
        setTask(taskData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching task details:', err);
        setError(err.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const handleCompleteTask = async () => {
    if (!id) return;

    try {
      await completeTask(parseInt(id));
      
      // Update the task in the local state
      setTask(prevTask => 
        prevTask ? { 
          ...prevTask, 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        } : null
      );
    } catch (err: any) {
      console.error('Error completing task:', err);
      setError(err.message || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(parseInt(id));
        navigate('/tasks');
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
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Convert minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`;
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
    return <div className="loading">Loading task details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!task) {
    return <div className="not-found">Task not found.</div>;
  }

  return (
    <div className="task-detail-container">
      <div className="task-detail-header">
        <h2>{task.title}</h2>
        <div className="task-badge-container">
          <span className={`status-badge ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
          <span className="type-badge">{task.task_type.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-row">
          <div className="task-detail-label">Course</div>
          <div className="task-detail-value">{task.course_id}</div>
        </div>

        <div className="task-detail-row">
          <div className="task-detail-label">Due Date</div>
          <div className="task-detail-value">{formatDate(task.due_date)}</div>
        </div>

        <div className="task-detail-row">
          <div className="task-detail-label">Duration</div>
          <div className="task-detail-value">{formatDuration(task.duration)}</div>
        </div>

        {task.assigned_to_name && (
          <div className="task-detail-row">
            <div className="task-detail-label">Assigned To</div>
            <div className="task-detail-value">{task.assigned_to_name}</div>
          </div>
        )}

        {task.completed_at && (
          <div className="task-detail-row">
            <div className="task-detail-label">Completed At</div>
            <div className="task-detail-value">{formatDate(task.completed_at)}</div>
          </div>
        )}

        <div className="task-detail-description">
          <h3>Description</h3>
          <p>{task.description || 'No description available.'}</p>
        </div>
      </div>

      <div className="task-detail-actions">
        <button 
          className="back-btn"
          onClick={() => navigate('/tasks')}
        >
          Back to Tasks
        </button>

        {task.status === 'active' && (
          <>
            <button 
              className="complete-btn"
              onClick={handleCompleteTask}
            >
              Mark as Complete
            </button>
            
            <button 
              className="edit-btn"
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
            >
              Edit Task
            </button>
          </>
        )}
        
        <button 
          className="delete-btn"
          onClick={handleDeleteTask}
        >
          Delete Task
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;