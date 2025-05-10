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
    return location.pathname === path ? 'active' : '';
  };

  // Helper to check if user has one of the specified roles
  const hasRole = (roles: string[]) => roles.includes(user.role);

  // Navigation links based on the exact paths shown in the screenshot
  const navLinks = [
    { path: '/home', label: 'Home', roles: ['ta', 'staff', 'department_chair', 'admin', 'dean'] },
    { path: '/tasks', label: 'Tasks', roles: ['ta', 'staff', 'department_chair', 'admin', 'dean'] },
    { path: '/request-leave', label: 'Request Leave', roles: ['ta'] },
    { path: '/initiate-swap', label: 'Initiate Swap', roles: ['ta'] },
    { path: '/my-swap-requests', label: 'My Swap Requests', roles: ['ta'] },
    { path: '/leave-statistics', label: 'Leave Statistics', roles: ['ta', 'staff', 'department_chair', 'admin', 'dean'] },
    { path: '/admin/audit-logs', label: 'System Logs', roles: ['admin'] },
    { path: '/profile', label: 'Profile', roles: ['ta', 'staff', 'department_chair', 'admin', 'dean'] },
  ];

  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        {navLinks.map((link) => {
          // Only show links relevant to the user's role
          if (link.roles.includes(user.role)) {
            return (
              <li key={link.path}>
                <Link to={link.path} className={isActive(link.path)}>
                  {link.label}
                </Link>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
};

export default Navigation;