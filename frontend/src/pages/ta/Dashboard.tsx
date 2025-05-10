// src/pages/ta/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Task, getUpcomingTasks } from '../../api/tasks';
import { handleApiError } from '../../api/apiUtils';

const TADashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        setLoading(true);
        const tasks = await getUpcomingTasks(3); // Get 3 upcoming tasks
        setUpcomingTasks(tasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching upcoming tasks:', err);
        setError(handleApiError(err, 'Failed to load upcoming tasks'));
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
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

  return (
    <div style={{ padding: '20px' }}>
      <h1>TA Dashboard</h1>
      <p>Welcome, {user?.fullName}</p>
      <p>Bilkent ID: {user?.bilkentId}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>My Upcoming Tasks</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : upcomingTasks.length === 0 ? (
          <p>No upcoming tasks available.</p>
        ) : (
          <div>
            {upcomingTasks.map(task => (
              <div 
                key={task.id} 
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '10px'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0' }}>{task.title}</h3>
                <p style={{ margin: '0 0 5px 0' }}><strong>Course:</strong> {task.course_id}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>Due:</strong> {formatDate(task.due_date)}</p>
                <p style={{ margin: '0' }}><strong>Status:</strong> {task.status}</p>
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={handleViewTasks}
          style={{
            padding: '10px 15px',
            backgroundColor: '#0074e4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          View All Tasks
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>My Schedule</h2>
        <p>No scheduled events yet.</p>
      </div>
      
      <button 
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#3a78c3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default TADashboard;
