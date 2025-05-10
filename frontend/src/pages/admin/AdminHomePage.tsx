// src/pages/admin/AdminHomePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStats, 
  getRecentActivity, 
  getPendingApprovals, 
  getRecentUsers,
  getUrgentTasks,
  ActivityItem,
  DashboardStats,
  AdminTask
} from '../../api/dashboard';
import { User } from '../../api/users';
import { Task } from '../../api/tasks';
import './AdminHomePage.css';

// Icons for the dashboard
const Icons = {
  users: <i className="fas fa-users"></i>,
  tasks: <i className="fas fa-tasks"></i>,
  leaves: <i className="fas fa-calendar-minus"></i>,
  swaps: <i className="fas fa-exchange-alt"></i>,
  courses: <i className="fas fa-book"></i>,
  dashboard: <i className="fas fa-tachometer-alt"></i>,
  notifications: <i className="fas fa-bell"></i>,
  settings: <i className="fas fa-cog"></i>,
  logout: <i className="fas fa-sign-out-alt"></i>,
  pending: <i className="fas fa-clock"></i>,
  approved: <i className="fas fa-check-circle"></i>,
  rejected: <i className="fas fa-times-circle"></i>,
  completed: <i className="fas fa-check-double"></i>,
  inProgress: <i className="fas fa-spinner"></i>,
  overdue: <i className="fas fa-exclamation-circle"></i>,
  activity: <i className="fas fa-history"></i>,
  user: <i className="fas fa-user"></i>,
  task: <i className="fas fa-clipboard-list"></i>,
  leave: <i className="fas fa-calendar-alt"></i>,
  swap: <i className="fas fa-sync-alt"></i>,
  course: <i className="fas fa-graduation-cap"></i>,
  created: <i className="fas fa-plus-circle"></i>,
  updated: <i className="fas fa-edit"></i>,
  deleted: <i className="fas fa-trash-alt"></i>,
  requested: <i className="fas fa-paper-plane"></i>,
  high: <i className="fas fa-arrow-up"></i>,
  medium: <i className="fas fa-equals"></i>,
  low: <i className="fas fa-arrow-down"></i>,
};

const AdminHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<{
    leaves: number;
    swaps: number;
    tasks: number;
    users: number;
  } | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [
          dashboardStats,
          recentActivity,
          pendingApprovalsData,
          recentUsersData,
          urgentTasksData
        ] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(5),
          getPendingApprovals(),
          getRecentUsers(5),
          getUrgentTasks(5)
        ]);
        
        // Update state with fetched data
        setStats(dashboardStats);
        setActivity(recentActivity);
        setPendingApprovals(pendingApprovalsData);
        setRecentUsers(recentUsersData);
        setUrgentTasks(urgentTasksData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'recently';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'just now';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  };

  // Get icon for activity type
  const getActivityIcon = (entity: string, action: string) => {
    if (entity === 'user') return Icons.user;
    if (entity === 'task') return Icons.task;
    if (entity === 'leave') return Icons.leave;
    if (entity === 'swap') return Icons.swap;
    if (entity === 'course') return Icons.course;
    return Icons.activity;
  };

  // Get color class for activity type
  const getActivityColorClass = (entity: string) => {
    if (entity === 'user') return 'activity-user';
    if (entity === 'task') return 'activity-task';
    if (entity === 'leave') return 'activity-leave';
    if (entity === 'swap') return 'activity-swap';
    if (entity === 'course') return 'activity-course';
    return '';
  };

  // Get task priority based on due date
  const getTaskPriority = (dueDate: string): 'high' | 'medium' | 'low' => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 2) return 'high';
    if (diffInDays <= 5) return 'medium';
    return 'low';
  };
  
  // Get icon for task priority
  const getTaskPriorityIcon = (dueDate: string) => {
    const priority = getTaskPriority(dueDate);
    if (priority === 'high') return Icons.high;
    if (priority === 'medium') return Icons.medium;
    if (priority === 'low') return Icons.low;
    return null;
  };

  // Get color class for task priority
  const getTaskPriorityClass = (dueDate: string) => {
    const priority = getTaskPriority(dueDate);
    if (priority === 'high') return 'priority-high';
    if (priority === 'medium') return 'priority-medium';
    if (priority === 'low') return 'priority-low';
    return '';
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    if (status === 'pending') return 'status-pending';
    if (status === 'approved' || status === 'completed') return 'status-approved';
    if (status === 'rejected') return 'status-rejected';
    if (status === 'in_progress') return 'status-in-progress';
    if (status === 'overdue') return 'status-overdue';
    return '';
  };

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  // Get class for days until due
  const getDaysUntilDueClass = (dueDate: string): string => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    if (days <= 2) return 'due-soon';
    return '';
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span className="welcome-message">Welcome, {user?.fullName}</span>
            <div className="user-avatar">
              {user?.fullName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Overview */}
        <section className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon users">{Icons.users}</div>
            <div className="stat-content">
              <h3>Users</h3>
              <div className="stat-value">{stats?.userStats.total || 0}</div>
              <div className="stat-details">
                <span>{stats?.userStats.byRole?.ta || 0} TAs</span>
                <span>{stats?.userStats.byRole?.staff || 0} Staff</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tasks">{Icons.tasks}</div>
            <div className="stat-content">
              <h3>Tasks</h3>
              <div className="stat-value">{stats?.taskStats.total || 0}</div>
              <div className="stat-details">
                <span className="status-pending">{stats?.taskStats.byStatus.active || 0} Active</span>
                <span className="status-completed">{stats?.taskStats.byStatus.completed || 0} Completed</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon leaves">{Icons.leaves}</div>
            <div className="stat-content">
              <h3>Leave Requests</h3>
              <div className="stat-value">{stats?.leaveStats.total || 0}</div>
              <div className="stat-details">
                <span className="status-pending">{stats?.leaveStats.byStatus.pending || 0} Pending</span>
                <span className="status-approved">{stats?.leaveStats.byStatus.approved || 0} Approved</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon swaps">{Icons.swaps}</div>
            <div className="stat-content">
              <h3>Swap Requests</h3>
              <div className="stat-value">{stats?.swapStats.total || 0}</div>
              <div className="stat-details">
                <span className="status-pending">{stats?.swapStats.byStatus.pending || 0} Pending</span>
                <span className="status-approved">{stats?.swapStats.byStatus.approved || 0} Approved</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon courses">{Icons.courses}</div>
            <div className="stat-content">
              <h3>Courses</h3>
              <div className="stat-value">{stats?.courseStats.total || 0}</div>
              <div className="stat-details">
                <span>{stats?.courseStats.activeCourses || 0} Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Pending Approvals */}
          <section className="dashboard-card pending-approvals">
            <div className="card-header">
              <h2>Pending Approvals</h2>
              <button className="view-all-btn" onClick={() => navigate('/admin/approvals')}>View All</button>
            </div>
            <div className="card-content">
              <div className="approval-item" onClick={() => navigate('/leave/approval')}>
                <div className="approval-icon leaves">{Icons.leaves}</div>
                <div className="approval-details">
                  <h3>Leave Requests</h3>
                  <p>{pendingApprovals?.leaves || 0} pending</p>
                </div>
                <div className="approval-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="approval-item" onClick={() => navigate('/swaps/approve')}>
                <div className="approval-icon swaps">{Icons.swaps}</div>
                <div className="approval-details">
                  <h3>Swap Requests</h3>
                  <p>{pendingApprovals?.swaps || 0} pending</p>
                </div>
                <div className="approval-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="approval-item" onClick={() => navigate('/tasks')}>
                <div className="approval-icon tasks">{Icons.tasks}</div>
                <div className="approval-details">
                  <h3>Task Assignments</h3>
                  <p>{pendingApprovals?.tasks || 0} pending</p>
                </div>
                <div className="approval-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="approval-item" onClick={() => navigate('/admin/users')}>
                <div className="approval-icon users">{Icons.users}</div>
                <div className="approval-details">
                  <h3>User Accounts</h3>
                  <p>{pendingApprovals?.users || 0} pending</p>
                </div>
                <div className="approval-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-card recent-activity">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <button className="view-all-btn" onClick={() => navigate('/admin/activity')}>View All</button>
            </div>
            <div className="card-content">
              {activity && activity.length > 0 ? (
                activity.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-icon ${getActivityColorClass(item.entity)}`}>
                      {getActivityIcon(item.entity, item.action)}
                    </div>
                    <div className="activity-details">
                      <p className="activity-description">
                        <strong>{item.user_name || `User ${item.user_id}`}</strong> {item.action} {item.entity}
                      </p>
                      <p className="activity-info">{item.description}</p>
                      <p className="activity-time">{item.timestamp ? formatRelativeTime(item.timestamp) : 'recently'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <i className="fas fa-info-circle"></i>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Users */}
          <section className="dashboard-card recent-users">
            <div className="card-header">
              <h2>Recent Users</h2>
              <button className="view-all-btn" onClick={() => navigate('/admin/users')}>View All</button>
            </div>
            <div className="card-content">
              <div className="users-list">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <div key={user.id} className="user-item" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <div className="user-avatar">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="user-details">
                        <h3>{user.fullName || 'Unknown User'}</h3>
                        <p className="user-role">{user.role ? user.role.replace('_', ' ') : 'No Role'}</p>
                        <p className="user-email">{user.email || 'No Email'}</p>
                      </div>
                      <div className="user-joined">
                        <p>Joined</p>
                        <p>{user.createdAt ? formatDate(user.createdAt).split(',')[0] : 'Recently'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i>
                    <p>No recent users to display</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Urgent Tasks */}
          <section className="dashboard-card urgent-tasks">
            <div className="card-header">
              <h2>Urgent Tasks</h2>
              <button className="view-all-btn" onClick={() => navigate('/tasks')}>View All</button>
            </div>
            <div className="card-content">
              <div className="tasks-list">
                {urgentTasks && urgentTasks.length > 0 ? (
                  urgentTasks.map(task => (
                    <div key={task.id} className="task-item" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div className="task-status">
                        <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                          {task.status === 'active' ? 'Active' : task.status ? task.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                      <div className="task-details">
                        <h3>{task.title || 'Untitled Task'}</h3>
                        <p className="task-course">Course: {task.course_name || task.course_id || 'N/A'}</p>
                        <div className="task-meta">
                          {task.due_date && (
                            <>
                              <span className={`task-priority ${getTaskPriorityClass(task.due_date)}`}>
                                {getTaskPriorityIcon(task.due_date)} {getTaskPriority(task.due_date)}
                              </span>
                              <span className={`task-due ${getDaysUntilDueClass(task.due_date)}`}>
                                {Icons.pending} Due: {formatDate(task.due_date).split(',')[0]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i>
                    <p>No urgent tasks to display</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <footer className="dashboard-footer">
        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate('/admin/users/create')}>
            <i className="fas fa-user-plus"></i>
            <span>Add User</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/courses/create')}>
            <i className="fas fa-book-medical"></i>
            <span>Add Course</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/tasks/create')}>
            <i className="fas fa-clipboard-check"></i>
            <span>Create Task</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/reports')}>
            <i className="fas fa-chart-bar"></i>
            <span>Reports</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/settings')}>
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
          <button className="action-btn logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AdminHomePage;
