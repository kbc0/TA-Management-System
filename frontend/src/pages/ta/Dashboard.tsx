// src/pages/ta/Dashboard.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TADashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>TA Dashboard</h1>
      <p>Welcome, {user?.fullName}</p>
      <p>Bilkent ID: {user?.bilkentId}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>My Tasks</h2>
        <p>No tasks available yet.</p>
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
