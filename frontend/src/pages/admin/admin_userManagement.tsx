import React from 'react';
import './admin_userManagement.css';

interface User {
  name: string;
  email: string;
  lastLogin: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

interface AccountStatus {
  active: number;
  pending: number;
  inactive: number;
}

interface UserStats {
  userDistribution: string[];
  accountStatus: AccountStatus;
  recentActivity: string[];
}

const UserManagement = () => {
  // User data with type annotation
  const users: User[] = [
    {
      name: 'John Smith',
      email: 'John.smith@bilkent.edu.tr',
      lastLogin: '2025-03-16 21:15',
      status: 'Active'
    },
    {
      name: 'Jane Doe',
      email: 'Jane.doe@bilkent.edu.tr',
      lastLogin: '2025-03-16 20:45',
      status: 'Active'
    },
    {
      name: 'Ali Yilmaz',
      email: 'ali.yilmaz@bilkent.edu.tr',
      lastLogin: '',
      status: 'Pending'
    }
  ];

  // Statistics data with type annotation
  const stats: UserStats = {
    userDistribution: ['Microsoft', 'Android', 'Java'],
    accountStatus: {
      active: 42,
      pending: 3,
      inactive: 5
    },
    recentActivity: [
      'New User Registration',
      'Ali Yilmaz registered as TA',
      'Role Update',
      'Jane Doe promoted to Instructor'
    ]
  };

  return (
    <div className="user-management-container">
      <header>
        <h1>User Management</h1>
      </header>

      <section className="user-list-section">
        <h2>User List</h2>
        
        <div className="user-list-header">
          <span className="header-name">Name</span>
          <span className="header-role">Role</span>
          <span className="header-email">Email</span>
          <span className="header-status">Status</span>
          <span className="header-login">Last Login</span>
          <span className="header-actions">Actions</span>
        </div>
        
        <div className="user-list">
          {users.map((user, index) => (
            <div key={index} className="user-row">
              <div className="user-name">
                <div className="name">{user.name}</div>
                <div className="email-mobile">{user.email}</div>
              </div>
              <div className="user-role">-</div>
              <div className="user-email">{user.email}</div>
              <div className={`user-status ${user.status.toLowerCase()}`}>
                {user.status}
              </div>
              <div className="user-login">{user.lastLogin || '-'}</div>
              <div className="user-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pagination">
          <button className="page-btn">Previous</button>
          <button className="page-btn">Next</button>
        </div>
      </section>

      <section className="user-stats-section">
        <h2>User Statistics</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>User Distribution</h3>
            <p className="source">(Source: {stats.userDistribution.join(', ')})</p>
          </div>
          
          <div className="stat-card">
            <h3>Account Status</h3>
            <ul>
              <li>Active Users: {stats.accountStatus.active}</li>
              <li>Pending Activation: {stats.accountStatus.pending}</li>
              <li>Inactive Users: {stats.accountStatus.inactive}</li>
            </ul>
          </div>
          
          <div className="stat-card">
            <h3>Recent Activity</h3>
            <ul>
              {stats.recentActivity.map((activity, i) => (
                <li key={i}>{activity}</li>
              ))}
            </ul>
          </div>
          
          <div className="stat-card">
            <h3>Age User</h3>
            <div className="age-buttons">
              <button>Expert Users</button>
              <button>No users</button>
              <button>3m ago</button>
              <button>1h ago</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;