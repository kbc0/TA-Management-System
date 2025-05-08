import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        <li>
          <a 
            className={isActive('/ta/dashboard')} 
            onClick={() => handleNavigation('/ta/dashboard')}
          >
            Dashboard
          </a>
        </li>
        <li>
          <a 
            className={isActive('/tasks')} 
            onClick={() => handleNavigation('/tasks')}
          >
            Tasks
          </a>
        </li>
        <li>
          <a 
            className={isActive('/profile')} 
            onClick={() => handleNavigation('/profile')}
          >
            Profile
          </a>
        </li>
        
        {user.role === 'admin' && (
          <li>
            <a 
              className={isActive('/admin')} 
              onClick={() => handleNavigation('/admin')}
            >
              Admin
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation; 