import React, { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: ReactNode;
}

/**
 * ProtectedRoute component that checks if the user is authenticated
 * and has the required role to access the route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { authState } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated || !authState.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles && !allowedRoles.includes(authState.user.role)) {
    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    
    switch (authState.user.role) {
      case 'ta':
        redirectPath = '/ta/dashboard';
        break;
      case 'staff':
        redirectPath = '/staff/dashboard';
        break;
      case 'department_chair':
        redirectPath = '/staff/dashboard';
        break;
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      default:
        redirectPath = '/';
    }
    
    return <Navigate to={redirectPath} replace />;
  }
  
  // If authenticated and has required role, render the children or Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
