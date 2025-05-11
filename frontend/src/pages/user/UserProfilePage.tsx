import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserProfilePage.css';

interface UserActivity {
  id: number;
  action: string;
  entity: string;
  description: string;
  created_at: string;
}

interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  maxHours: number;
}

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('activity');
  const [userStats, setUserStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalHours: 0,
    maxHours: 80, // Default max hours
  });
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editing profile
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    bio: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize form data with user info
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      bio: user?.bio || ''
    });

    // Fetch user stats and activity
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        navigate('/login');
        return;
      }

      // Fetch user stats
      const statsResponse = await axios.get(`http://localhost:5001/api/users/${user.id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        setUserStats(statsResponse.data.data);
      }
      
      // Fetch recent activity (audit logs for this user)
      const activityResponse = await axios.get(`http://localhost:5001/api/audit-logs?user_id=${user.id}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        navigate('/login');
        return;
      }
      
      const response = await axios.put(`http://localhost:5001/api/users/${user.id}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update local user data
        await refreshUserData();
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // This assumes your AuthContext has a refreshUserData method
      // If not, you'd need to implement a way to refresh the user data in context
      const refreshedUser = await axios.get('http://localhost:5001/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (refreshedUser.data.success) {
        // Update form data with refreshed user info
        const userData = refreshedUser.data.data;
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          bio: userData.bio || ''
        });
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('login')) return 'fas fa-sign-in-alt';
    if (action.includes('create')) return 'fas fa-plus-circle';
    if (action.includes('update')) return 'fas fa-edit';
    if (action.includes('delete')) return 'fas fa-trash-alt';
    if (action.includes('complete')) return 'fas fa-check-circle';
    return 'fas fa-history';
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="card-body">
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={user.profileImage || "https://via.placeholder.com/150"} 
            alt={user.fullName} 
            className="profile-avatar" 
          />
          <div className="avatar-upload">
            <i className="fas fa-camera"></i>
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{user.fullName}</h1>
          <div className="profile-role">{user.role}</div>
          
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
          
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{userStats.completedTasks}/{userStats.totalTasks}</div>
              <div className="stat-label">Tasks</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{userStats.totalHours}/{userStats.maxHours}</div>
              <div className="stat-label">Hours</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
            </div>
            <div className="card-body">
              <ul className="info-list">
                <li className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">Bilkent ID</div>
                  <div className="info-value">{user.bilkentId}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">Department</div>
                  <div className="info-value">{user.department || 'Not specified'}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">Phone</div>
                  <div className="info-value">{user.phone || 'Not specified'}</div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Skills & Qualifications</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h4 className="mb-2">Skills</h4>
                <div>
                  {user.skills ? (
                    user.skills.map((skill: string, index: number) => (
                      <span key={index} className="badge badge-primary">{skill}</span>
                    ))
                  ) : (
                    <p>No skills specified</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="mb-2">Qualifications</h4>
                <div>
                  {user.qualifications ? (
                    user.qualifications.map((qual: string, index: number) => (
                      <span key={index} className="badge badge-secondary">{qual}</span>
                    ))
                  ) : (
                    <p>No qualifications specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Work Progress</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Tasks Completed</span>
                  <span>{userStats.completedTasks}/{userStats.totalTasks}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${userStats.totalTasks ? (userStats.completedTasks / userStats.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Hours Used</span>
                  <span>{userStats.totalHours}/{userStats.maxHours}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(userStats.totalHours / userStats.maxHours) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="profile-main">
          <div className="profile-card">
            <div className="card-header">
              <div className="tab-container">
                <div 
                  className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Recent Activity
                </div>
                <div 
                  className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('courses')}
                >
                  Assigned Courses
                </div>
                <div 
                  className={`tab ${activeTab === 'leave' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leave')}
                >
                  Leave Requests
                </div>
              </div>
            </div>
            
            <div className="card-body">
              {/* Activity Tab */}
              <div className={`tab-content ${activeTab === 'activity' ? 'active' : ''}`}>
                {loading ? (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p className="mt-2">Loading activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <ul className="activity-list">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          <i className={getActivityIcon(activity.action)}></i>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {activity.description}
                          </div>
                          <div className="activity-time">
                            {formatDate(activity.created_at)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-4">No recent activity found.</p>
                )}
              </div>
              
              {/* Courses Tab */}
              <div className={`tab-content ${activeTab === 'courses' ? 'active' : ''}`}>
                {user.courses && user.courses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Hours</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.courses.map((course: string, index: number) => (
                          <tr key={index}>
                            <td>{course}</td>
                            <td>Course Name</td>
                            <td>0</td>
                            <td>
                              <span className="badge badge-success">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4">No courses assigned.</p>
                )}
              </div>
              
              {/* Leave Requests Tab */}
              <div className={`tab-content ${activeTab === 'leave' ? 'active' : ''}`}>
                {user.leaveRequests && user.leaveRequests.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.leaveRequests.map((request: { start: string; end: string; reason: string; status: string }, index: number) => (
                          <tr key={index}>
                            <td>{request.start}</td>
                            <td>{request.end}</td>
                            <td>{request.reason}</td>
                            <td>
                              <span className={`badge ${request.status === 'Approved' ? 'badge-success' : 'badge-secondary'}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline">
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4">No leave requests found.</p>
                )}
                
                <div className="text-center mt-3">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/leave-request')}
                  >
                    <i className="fas fa-plus-circle me-2"></i>
                    New Leave Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="modal-close" onClick={() => setIsEditing(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger mb-3">
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-control"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
