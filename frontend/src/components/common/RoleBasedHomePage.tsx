// src/components/common/RoleBasedHomePage.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import HomePageForTA from '../../pages/ta/HomePageForTA';
import TADashboard from '../../pages/ta/Dashboard';
import AdminHomePage from '../../pages/admin/AdminHomePage';

/**
 * Component that renders the appropriate homepage based on the user's role
 */
const RoleBasedHomePage: React.FC = () => {
  const { user } = useAuth();

  // Render the appropriate homepage based on the user's role
  switch (user?.role) {
    case 'ta':
      return <HomePageForTA />;
    case 'admin':
      return <AdminHomePage />;
    case 'staff':
    case 'department_chair':
    case 'dean':
    default:
      return <TADashboard />;
  }
};

export default RoleBasedHomePage;
