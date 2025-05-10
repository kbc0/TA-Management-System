// src/components/common/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return null;
  }

  const isActive = (path: string): string => {
    if (path === '/dashboard') {
      // Updated to correctly check specific role dashboard paths
      const roleDashboardPath = `/${user.role}/dashboard`;
      return location.pathname === roleDashboardPath ? 'active' : '';
    }
    if (path === '/admin' && user.role ==='admin') { // For the generic /admin section link for admin
        return location.pathname.startsWith('/admin') ? 'active' : '';
    }
    // For parent exam routes, check if current path starts with /exams or /swaps
    if ((path === '/exams' || path === '/swaps') && location.pathname.startsWith(path)) {
        return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  // Helper to check if user has one of the specified roles
  const hasRole = (roles: string[]) => roles.includes(user.role);

  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        <li>
          <Link 
            to={`/${user.role}/dashboard`} // Simplified dynamic dashboard link
            className={isActive('/dashboard')}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/tasks" 
            className={isActive('/tasks')}
          >
            Tasks
          </Link>
        </li>
        
        {/* TA Specific Links */}
        {hasRole(['ta']) && (
          <>
            <li>
                <Link to="/leave/request" className={isActive('/leave/request')}>
                Request Leave
                </Link>
            </li>
            <li>
                <Link to="/swaps/demo" className={isActive('/swaps/demo')}>
                    Initiate Swap
                </Link>
            </li>
            <li>
                <Link to="/swaps/requests" className={isActive('/swaps/requests')}>
                    My Swap Requests
                </Link>
            </li>
          </>
        )}
        
        {/* Leave Management (Common) */}
        <li>
          <Link 
            to="/leave/statistics" 
            className={isActive('/leave/statistics')}
          >
            Leave Statistics
          </Link>
        </li>
        
        {/* Only show approval for non-TA roles */}
        {hasRole(['staff', 'department_chair', 'admin']) && (
          <li>
            <Link 
              to="/leave/approval" 
              className={isActive('/leave/approval')}
            >
              Leave Approval
            </Link>
          </li>
        )}
        
        {/* Exam Management Links - Grouped if multiple */}
        {hasRole(['staff', 'department_chair', 'admin']) && (
            <>
                <li>
                    <Link to="/exams/define" className={isActive('/exams/define')}>
                        Define Exam
                    </Link>
                </li>
                <li>
                    <Link to="/exams/classroom-lists" className={isActive('/exams/classroom-lists')}>
                        Classroom Lists
                    </Link>
                </li>
            </>
        )}
        
        {/* Staff Swap Approval Link */}
        {hasRole(['staff', 'department_chair', 'admin']) && (
            <li>
                <Link to="/swaps/approve" className={isActive('/swaps/approve')}>
                    Approve Swaps
                </Link>
            </li>
        )}
        
        {/* Reporting */}
        {hasRole(['staff', 'department_chair', 'admin', 'dean']) && (
          <li>
            <Link 
              to="/reports/users" 
              className={isActive('/reports/users')}
            >
              Reports
            </Link>
          </li>
        )}
        
        <li>
          <Link 
            to="/profile"
            className={isActive('/profile')}
          >
            Profile
          </Link>
        </li>

        {hasRole(['admin']) && (
          <li>
            <Link 
              to="/admin"
              className={isActive('/admin')}
            >
              Admin Section
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;